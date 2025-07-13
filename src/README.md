# LeadsFlow

This is a Next.js application for a lead management system called LeadsFlow. It serves as a high-fidelity prototype that is fully functional using mock data, and is designed to be easily connected to a production backend like Supabase.

## Core Features

- **User Authentication**: A mock login screen to simulate user authentication for different roles.
- **Dashboard Overview**: A dashboard displaying key lead metrics and recent activity, all powered by mock data.
- **Flexible Lead Import**: Import leads from a CSV file. Only `name` and `phone` are required.
- **Campaign Field Mapping**: When importing, optionally select a campaign and map columns from your CSV to campaign-specific custom fields.
- **Lead Filtering & Assignment**: Screens for administrators to filter, view, and assign leads to callers.
- **Caller & Detail Views**: Dedicated views for callers to see their assigned leads and for anyone to view the detailed history of a specific lead.
- **Caller Data Entry**: Callers can input data for predefined custom fields on a lead. This action is tracked with the user's name and a timestamp.
- **User Management**: A section for admins to add, edit, and manage user accounts.
- **AI-Powered Suggestions**: A Genkit flow that suggests appropriate sub-dispositions for a call based on the caller's remarks.

## Tech Stack

- **Framework**: Next.js (App Router)
- **UI**: React, ShadCN UI, Tailwind CSS
- **AI**: Google Genkit

---

## Application Structure & Workflow

The application is designed around two primary user roles: **Admin** and **Caller**.

### User Roles & Access

| Page | Route | Admin Access | Caller Access | Description |
| :--- | :--- | :---: | :---: | :--- |
| **Dashboard** | `/dashboard` | ✅ | ✅ | Overview of lead statistics and recent activity. |
| **All Leads** | `/leads` | ✅ | ❌ | View, filter, and assign all leads in the system. |
| **My Leads** | `/my-leads` | ❌ | ✅ | View only the leads specifically assigned to the logged-in caller. |
| **Lead Detail** | `/leads/[id]` | ✅ | ✅ | View detailed information and history for a single lead. Callers can add info to empty custom fields. |
| **User Management** | `/users` | ✅ | ❌ | Add, edit, approve, and deactivate users. |
| **Login Tracker** | `/tracker` | ✅ | ❌ | View a log of user login/logout activity. |
| **Account/Settings**| `/account` | ✅ | ✅ | Manage personal profile and application-wide settings (e.g., custom fields, dispositions, geofencing). |

### User Flow

1.  **Login**: A user logs in via the `/login` page. The system checks the mock user data to determine their role and status. For example, logging in as `admin@leadsflow.com` grants Admin access, while `jane.doe@leadsflow.com` would be a Caller.
2.  **Dashboard**: After logging in, the user lands on the Dashboard, which shows high-level statistics.
3.  **Lead Import (Admin)**: An Admin can navigate to "All Leads" and use the "Import" button.
    -   They upload a CSV file. The only mandatory columns are `name` and `phone`.
    -   Optionally, they can select a campaign. If they do, the system displays the custom fields defined for that campaign (e.g., "Parent's Name").
    -   The admin can then map the columns from their CSV file to these custom fields.
    -   Upon import, new leads are created with the mapped data.
4.  **Lead Management (Admin)**: An Admin can use filters on the "All Leads" page (`/leads`) to select specific leads and assign them in bulk to an active "Caller" user.
5.  **Caller Workflow (Caller)**: A Caller navigates to "My Leads" (`/my-leads`) to see their queue. They can click on a lead to go to the "Lead Detail" page (`/leads/[id]`).
    -   On the detail page, they can see all lead details. In the "Additional Information" section, they can fill in any custom fields that are currently empty.
    -   Once a field is updated, it becomes read-only, displaying the value, the name of the caller who updated it, and the date of the update.
    -   The caller can then use the "Update Status" form to log the call's outcome. The AI Suggestion feature can help them choose the best sub-disposition.
6.  **System Management (Admin)**: An Admin can go to the "Account" page to configure settings like custom fields, dispositions, and geofencing.

---

## Mock Data Usage

The entire application currently runs on mock data located in **`src/lib/data.ts`**. This file exports arrays of objects that simulate database tables:

-   `users`: A list of all user accounts, including their roles and statuses.
-   `leads`: A list of all lead records. The `customFields` property is an object where each key is a field name and the value is another object containing the `value`, `updatedBy`, and `updatedAt`.
-   `assignmentHistory`: A log of which leads have been assigned to which users and the outcomes of those assignments.
-   `loginActivity`: A log of user login/logout events.
-   `universalCustomFields` & `campaignCustomFields`: Defines the additional data fields that appear on lead detail pages and can be configured on the Account page.

These mock data arrays are imported and manipulated by **Server Actions** located in the **`src/actions/`** directory. For example, when a Caller updates a custom field, the `updateLeadCustomField` function in `src/actions/leads.ts` modifies the corresponding lead object in the `leads` array.

This setup makes the application fully interactive and allows for complete testing of the UI and user flow without any backend dependencies.

---

## How to Make This App Launch-Ready with Supabase

To transition this prototype into a production application, you need to replace the mock data with a real Supabase backend. The application is architected to make this process straightforward.

### Step 1: Set Up a Supabase Project

1.  **Create a Supabase Project**:
    -   Go to [supabase.com](https://supabase.com/), sign in, and click "New project".
    -   Give your project a name, generate a secure database password, and choose a region.

2.  **Get API Credentials**:
    -   Once the project is ready, navigate to the **Project Settings** (the gear icon).
    -   Go to the **API** section.
    -   You will need three values from this page:
        -   **Project URL**
        -   **`anon` `public` key**
        -   **`service_role` `secret` key**

### Step 2: Configure Your Local Environment

1.  **Create an Environment File**:
    -   In the root of your project, rename the existing `.env` file to `.env.local`. This is a special file that Next.js automatically loads for environment variables.

2.  **Add Credentials to `.env.local`**:
    -   Add your Supabase credentials to the `.env.local` file. It's important to prefix the client-side keys with `NEXT_PUBLIC_`.
        ```env
        NEXT_PUBLIC_SUPABASE_URL="<your-project-url>"
        NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>"
        SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
        ```

### Step 3: Set Up Database Schema

In your Supabase project dashboard, go to the **SQL Editor** and run the following queries to create the necessary tables and types.

```sql
-- Create custom enum types for roles and statuses
CREATE TYPE user_role AS ENUM ('admin', 'caller');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'inactive');
CREATE TYPE disposition_type AS ENUM ('New', 'Interested', 'Not Interested', 'Follow-up', 'Callback', 'Not Reachable');

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL,
    status user_status NOT NULL DEFAULT 'pending',
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Campaigns Table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Leads Table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    gender TEXT,
    school TEXT,
    locality TEXT,
    district TEXT,
    custom_fields JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Lead Campaigns Junction Table (Many-to-Many)
CREATE TABLE lead_campaigns (
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    PRIMARY KEY (lead_id, campaign_id)
);

-- 5. Assignment History Table
CREATE TABLE assignment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    user_name TEXT NOT NULL,
    assigned_time TIMESTAMPTZ DEFAULT NOW(),
    disposition disposition_type,
    disposition_time TIMESTAMPTZ,
    sub_disposition TEXT,
    remark TEXT,
    follow_up_date DATE,
    schedule_date DATE
);

-- 6. Login Activity Table
CREATE TABLE login_activity (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    activity TEXT NOT NULL, -- 'login' or 'logout'
    ip_address INET,
    device TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. App Settings (Key-Value Store)
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value JSONB
);

-- Insert default geofence settings
INSERT INTO settings (key, value) VALUES ('geofence', '{"centerLocation": "Connaught Place, New Delhi", "radius": 5000}');
```

### Step 4: Create Supabase Clients

Create a file at `src/lib/supabase.ts` to manage your Supabase client instances for server-side and client-side code.

```typescript
import { createClient } from '@supabase/supabase-js';

// Client for use in client-side components and pages
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for use in server actions and route handlers
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
```

### Step 5: Rewrite Server Actions

This is the most critical step. You need to replace the functions that manipulate mock data with functions that interact with your Supabase database.

**Location of Actions**: `src/actions/*.ts`

**General Process**:
For each function, you will:
1.  Import the `supabaseAdmin` instance from `src/lib/supabase.ts`.
2.  Replace the array manipulation logic (e.g., `leads.find(...)`, `users.push(...)`) with Supabase SDK calls (e.g., `supabaseAdmin.from('leads').select()`).

**Example: Rewriting `getLeads()` in `src/actions/leads.ts`**

*   **Before (Mock Data)**:
    ```typescript
    import { leads } from '@/lib/data';
    // ...
    export async function getLeads(): Promise<Lead[]> {
      return JSON.parse(JSON.stringify(leads));
    }
    ```

*   **After (Supabase)**:
    ```typescript
    import { supabaseAdmin } from '@/lib/supabase';
    import type { Lead } from "@/lib/types";
    
    export async function getLeads(): Promise<Lead[]> {
        const { data, error } = await supabaseAdmin.from('leads').select('*');

        if (error) {
            console.error('Error fetching leads:', error);
            throw new Error('Could not fetch leads.');
        }

        // Note: You may need to transform the data to match your `Lead` type exactly.
        // For example, Supabase returns `id`, your type expects `refId`.
        return data.map(lead => ({
            ...lead,
            refId: lead.id,
        })) as Lead[];
    }
    ```
You will need to repeat this process for **all functions** in the `src/actions/` directory.

### Step 6: Setting Up Genkit for AI Features

The AI-powered disposition suggestion will work out-of-the-box once your environment is set up.

1.  **Enable the AI API**: Go to the [Google AI Studio](https://aistudio.google.com/) and get an API key.
2.  **Add API Key to Environment**: Add the following line to your `.env.local` file:
    ```env
    GOOGLE_API_KEY="<your-google-ai-api-key>"
    ```

### Step 7: Deploying to Production

A platform like **Vercel** or **Netlify** is recommended for deploying a Next.js app.

1.  **Choose a Hosting Provider**: Vercel is the easiest option as it's made by the creators of Next.js.
2.  **Import Your Git Repository**: Connect your GitHub, GitLab, or Bitbucket account to your hosting provider and import the project repository.
3.  **Configure Environment Variables**: In your hosting provider's project settings (e.g., Vercel's "Environment Variables" section), add all the variables from your `.env.local` file:
    -   `NEXT_PUBLIC_SUPABASE_URL`
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    -   `SUPABASE_SERVICE_ROLE_KEY`
    -   `GOOGLE_API_KEY`
4.  **Deploy**: Push your code to the `main` branch. The hosting provider will automatically build and deploy your application.

After completing these steps, your LeadsFlow application will be fully functional and running on a production-ready Supabase infrastructure.

    