# Fix: Supabase Auth Dashboard User Creation Error

## 🚨 Issue: "Failed to create user: Database error creating new user"

This error occurs when creating users through the Supabase Auth dashboard because our sync trigger is failing.

## 🔍 **Root Cause Analysis**

When you create a user via Supabase Auth dashboard:
1. User is created in `auth.users` table
2. Our sync trigger `sync_user_trigger` fires automatically  
3. The trigger calls `sync_user_to_users_table()` function
4. This function tries to INSERT into our `users` table
5. **Something fails in this process**, causing the entire user creation to fail

## ✅ **Solution: Fix the Sync Trigger**

### **Step 1: Disable the Problematic Trigger Temporarily**

Run this in your Supabase SQL Editor:

```sql
-- Temporarily disable the trigger to allow manual user creation
DROP TRIGGER IF EXISTS sync_user_trigger ON auth.users;
```

### **Step 2: Create Your Admin User**

Now you can create the admin user through the Auth dashboard:

1. Go to Authentication → Users
2. Click "Add User"  
3. Enter email: `admin@yourcompany.com`
4. Set a secure password
5. Check "Auto Confirm User"
6. Click "Create User"

**This should now work!**

### **Step 3: Manually Add User to Users Table**

After the user is created in Auth, add them to your users table:

```sql
-- Get the user ID from the auth.users table
SELECT id, email FROM auth.users WHERE email = 'admin@yourcompany.com';

-- Insert into users table (replace USER_ID_HERE with actual UUID)
INSERT INTO users (
    id, 
    email, 
    name, 
    phone, 
    role, 
    status, 
    created_at
) VALUES (
    'USER_ID_FROM_ABOVE_QUERY', -- Replace with actual UUID
    'admin@yourcompany.com',
    'System Admin',
    NULL, -- Phone is optional
    'admin',
    'active',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    status = 'active';
```

### **Step 4: Fix and Re-enable the Sync Trigger**

Now let's fix the sync trigger with better error handling:

```sql
-- Create improved sync function
CREATE OR REPLACE FUNCTION sync_user_to_users_table()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process INSERT operations
    IF TG_OP = 'INSERT' THEN
        BEGIN
            -- Insert new user into users table with error handling
            INSERT INTO users (
                id, 
                email, 
                name, 
                phone, 
                role, 
                status, 
                created_by,
                created_at
            )
            VALUES (
                NEW.id,
                NEW.email,
                COALESCE(
                    NEW.raw_user_meta_data->>'name', 
                    NEW.raw_user_meta_data->>'full_name',
                    split_part(NEW.email, '@', 1)
                ),
                NEW.raw_user_meta_data->>'phone',
                COALESCE(NEW.raw_user_meta_data->>'role', 'caller'),
                'pending',
                COALESCE(NEW.raw_user_meta_data->>'created_by', 'system'),
                NOW()
            )
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                updated_at = NOW();
                
        EXCEPTION WHEN OTHERS THEN
            -- Log the error but don't fail the auth user creation
            RAISE NOTICE 'Failed to sync user to users table: %', SQLERRM;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
CREATE TRIGGER sync_user_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_to_users_table();
```

## 🔍 **Alternative: Direct Database Approach**

If the above doesn't work, here's a completely manual approach:

### **Option A: Create User Directly in Database**

```sql
-- Create user in auth.users directly (advanced users only)
-- This bypasses the Auth dashboard entirely

-- 1. Generate a UUID for the user
SELECT gen_random_uuid() as user_id;

-- 2. Insert directly into auth.users (replace UUID and details)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
) VALUES (
    'YOUR_GENERATED_UUID_HERE',
    'admin@yourcompany.com',
    crypt('your-secure-password', gen_salt('bf')), -- Use bcrypt
    NOW(),
    NOW(), 
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "System Admin", "role": "admin"}'
);

-- 3. Insert into users table
INSERT INTO users (
    id, 
    email, 
    name, 
    role, 
    status, 
    created_at
) VALUES (
    'YOUR_GENERATED_UUID_HERE', -- Same UUID as above
    'admin@yourcompany.com',
    'System Admin', 
    'admin',
    'active',
    NOW()
);
```

### **Option B: Use Application's Manual User Creation**

Since we added the `addUserManual` function, you can:

1. Create a temporary admin user using Option A above
2. Log into the application
3. Use the "Add User" functionality to create additional users
4. This bypasses the Auth dashboard entirely

## 🧪 **Testing the Fix**

After applying the fix:

1. **Test Auth Dashboard**: Try creating a test user through Authentication → Users
2. **Check Both Tables**: Verify user appears in both `auth.users` and `users` tables  
3. **Test Login**: Try logging in with the created user
4. **Test App User Creation**: Use the application's "Add User" feature

## 🔍 **Debugging Commands**

If you need to debug further:

```sql
-- Check if trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'sync_user_trigger';

-- Check if function exists  
SELECT proname FROM pg_proc WHERE proname = 'sync_user_to_users_table';

-- Check users table structure
\d users;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies WHERE tablename = 'users';

-- Check existing users
SELECT id, email, role, status FROM users;
SELECT id, email FROM auth.users;
```

## ✅ **Expected Result**

After following these steps:
- ✅ You can create users through Supabase Auth dashboard
- ✅ Users automatically sync to your users table  
- ✅ You can log in with the created admin user
- ✅ Application user creation also works properly

## 🆘 **If Still Having Issues**

1. **Check Supabase Logs**: Go to Logs → Database in Supabase dashboard
2. **Try Manual Approach**: Use the direct database creation method
3. **Simplify First**: Create admin user manually, then fix trigger later
4. **Check Environment**: Ensure your `.env.local` has correct credentials

The key is to **get your admin user created first**, then worry about fixing the automated sync later!