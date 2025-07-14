# User Creation Troubleshooting Guide

## 🚨 Issue: "Failed to create user: Database error creating new user"

This guide will help you diagnose and fix the user creation issue step by step.

## 🔍 Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Try creating a user again
4. Look for detailed error messages with prefixes like:
   - `Creating user with data:`
   - `Auth user creation failed:`
   - `Error fetching user record:`
   - `User creation failed:`

## 🔍 Step 2: Verify Supabase Configuration

### Check Environment Variables
Ensure your `.env.local` file has the correct values:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Test Supabase Connection
Run this in your Supabase SQL Editor:
```sql
-- Test if the sync trigger exists
SELECT proname FROM pg_proc WHERE proname = 'sync_user_to_users_table';

-- Test if the trigger is attached
SELECT tgname FROM pg_trigger WHERE tgname = 'sync_user_trigger';

-- Check RLS policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies WHERE tablename = 'users';
```

## 🔍 Step 3: Test Sync Trigger Manually

In Supabase SQL Editor, test the sync trigger:

```sql
-- Test 1: Check if you can insert directly into auth.users
-- (This should trigger the sync function)
-- DON'T RUN THIS - just check if the function exists

-- Test 2: Check if users table accepts manual inserts
INSERT INTO users (
    id, email, name, phone, role, status, created_at
) VALUES (
    gen_random_uuid(),
    'test@example.com',
    'Test User',
    '+1234567890',
    'caller',
    'pending',
    NOW()
);

-- If this works, delete the test record
DELETE FROM users WHERE email = 'test@example.com';
```

## 🔍 Step 4: Check Common Issues

### 1. Phone Field Issues
```sql
-- Check if phone field is nullable
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'phone';
```

If phone is NOT NULL, fix it:
```sql
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
```

### 2. RLS Policy Issues
```sql
-- Check if you can insert as admin
SELECT auth.uid(), current_user;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables WHERE tablename = 'users';
```

### 3. Trigger Function Issues
```sql
-- Check if sync function has proper permissions
SELECT proname, proowner, proacl FROM pg_proc 
WHERE proname = 'sync_user_to_users_table';
```

## 🔍 Step 5: Common Fixes

### Fix 1: Re-create the Sync Function
```sql
CREATE OR REPLACE FUNCTION sync_user_to_users_table()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Insert new user into users table if not exists
        INSERT INTO users (id, email, name, phone, role, status, created_by)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
            NEW.raw_user_meta_data->>'phone',
            COALESCE(NEW.raw_user_meta_data->>'role', 'caller'),
            'pending',
            NEW.raw_user_meta_data->>'created_by'
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Fix 2: Re-create the Trigger
```sql
DROP TRIGGER IF EXISTS sync_user_trigger ON auth.users;

CREATE TRIGGER sync_user_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_to_users_table();
```

### Fix 3: Add Missing RLS Policy
```sql
-- Allow authenticated users to insert their own user record
CREATE POLICY "Allow user self-insert" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);
```

## 🔍 Step 6: Alternative User Creation Method

If the sync trigger approach isn't working, try this manual approach:

```typescript
// Add this temporary function to src/actions/users.ts for testing
export async function addUserManual(newUser: Omit<User, 'id' | 'createdAt' | 'status'>) {
  // ... auth verification code ...

  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: newUser.email,
      password: newUser.password!,
      email_confirm: true
    });

    if (authError || !authData.user) {
      throw new Error(`Auth error: ${authError?.message}`);
    }

    // Manually insert into users table
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || null,
        role: newUser.role,
        status: 'pending' as const,
        created_by: currentUser.name
      }])
      .select()
      .single();

    if (error) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Database error: ${error.message}`);
    }

    return convertDbUserToUser(data);
  } catch (error) {
    throw error;
  }
}
```

## 📞 Step 7: Get Help

If none of the above works, provide these details:

1. **Console Error Messages**: Copy the exact error from browser console
2. **Supabase Project URL**: Your project URL (hide sensitive parts)
3. **Database Schema**: Run `\d users` in SQL Editor and share the output
4. **RLS Policies**: Share the output of the policies query from Step 2
5. **Trigger Status**: Share the output of the trigger queries from Step 2

## ✅ Expected Working Flow

When user creation works correctly, you should see:
1. `Creating user with data: { email: "...", role: "...", hasPhone: true/false }`
2. `Auth user created successfully: uuid-here`
3. `Waiting for sync trigger...`
4. `User created successfully: uuid-here`
5. User appears in both Authentication → Users and Table Editor → users

## 🎯 Quick Test

Try creating a user with minimal data:
- Email: `test@example.com`
- Name: `Test User`
- Role: `caller`
- Password: `TestPassword123!`
- Phone: Leave empty

This should help identify if the issue is with specific fields or the general creation process.