# LeadsFlow

This is a Next.js application for a lead management system called LeadsFlow. It serves as a high-fidelity prototype that is fully functional using mock data, and is designed to be easily connected to a production backend like Firebase or Supabase.

## Core Features

- **User Authentication**: A mock login screen to simulate user authentication for different roles.
- **Dashboard Overview**: A dashboard displaying key lead metrics and recent activity, all powered by mock data.
- **Flexible Lead Import**: Import leads from a CSV file. Only `name` and `phone` are required.
- **Campaign Field Mapping**: When importing, optionally select a campaign and map columns from your CSV to campaign-specific custom fields.
- **Lead Filtering & Assignment**: Screens for administrators to filter, view, and assign leads to callers.
- **Caller & Detail Views**: Dedicated views for callers to see their assigned leads and for anyone to view the detailed history of a specific lead.
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
| **Lead Detail** | `/leads/[id]` | ✅ | ✅ | View detailed information and history for a single lead. |
| **User Management** | `/users` | ✅ | ❌ | Add, edit, approve, and deactivate users. |
| **Login Tracker** | `/tracker` | ✅ | ❌ | View a log of user login/logout activity. |
| **Account/Settings**| `/account` | ✅ | ✅ | Manage personal profile and application-wide settings (e.g., custom fields). |

### User Flow

1.  **Login**: A user logs in via the `/login` page. The system checks the mock user data to determine their role and status. For example, logging in as `admin@leadsflow.com` grants Admin access, while `jane.doe@leadsflow.com` would be a Caller.
2.  **Dashboard**: After logging in, the user lands on the Dashboard, which shows high-level statistics.
3.  **Lead Import (Admin)**: An Admin can navigate to "All Leads" and use the "Import" button.
    - They upload a CSV file. The only mandatory columns are `name` and `phone`.
    - Optionally, they can select a campaign. If they do, the system displays the custom fields defined for that campaign (e.g., "Parent's Name").
    - The admin can then map the columns from their CSV file to these custom fields.
    - Upon import, new leads are created with the mapped data.
4.  **Lead Management (Admin)**: An Admin can use filters on the "All Leads" page (`/leads`) to select specific leads and assign them in bulk to an active "Caller" user.
5.  **Caller Workflow (Caller)**: A Caller navigates to "My Leads" (`/my-leads`) to see their queue. They can click on a lead to go to the "Lead Detail" page (`/leads/[id]`). Here, they can see all lead details, including any custom fields imported. They can make a call and then use the "Update Status" form to log the call's outcome. The AI Suggestion feature can help them choose the best sub-disposition.
6.  **System Management (Admin)**: An Admin can go to the "Account" page to configure settings like custom fields for campaigns and geofencing.

---

## Mock Data Usage

The entire application currently runs on mock data located in **`src/lib/data.ts`**. This file exports arrays of objects that simulate database tables:

-   `users`: A list of all user accounts, including their roles and statuses.
-   `leads`: A list of all lead records, including custom fields.
-   `assignmentHistory`: A log of which leads have been assigned to which users and the outcomes of those assignments.
-   `loginActivity`: A log of user login/logout events.

These mock data arrays are imported and manipulated by **Server Actions** located in the **`src/actions/`** directory. For example, when an Admin assigns a lead, the `assignLeads` function in `src/actions/leads.ts` adds a new entry to the `assignmentHistory` array.

This setup makes the application fully interactive and allows for complete testing of the UI and user flow without any backend dependencies.

---

## How to Make This App Launch-Ready

To transition this prototype into a production application, you need to replace the mock data with a real backend database. The application is architected to make this process straightforward.

**High-Level Steps:**

1.  **Choose a Backend**: Select a backend service. **Firebase (Firestore)** or **Supabase** are excellent choices that work well with Next.js.

2.  **Set Up Your Backend Project**:
    -   Create a new project in your chosen backend's console (e.g., Firebase Console).
    -   Set up the database. For Firestore, you would create collections for `users`, `leads`, and `settings`.
    -   Obtain your project's credentials (API keys, service account keys, etc.).

3.  **Connect Your App to the Backend**:
    -   Install the necessary SDK package (e.g., `firebase-admin` for Firebase, `@supabase/supabase-js` for Supabase).
    -   Create a connection file (e.g., `src/lib/firebase.ts`) to initialize the connection using your project credentials. Store these credentials securely in an `.env.local` file.

4.  **Rewrite Server Actions**:
    -   Go through each function in the `src/actions/*.ts` files.
    -   Replace the code that manipulates the mock data arrays with asynchronous calls to your backend's SDK.
    -   **Example (replacing mock data with Firestore)**:
        -   *Before*: `leads.find(l => l.refId === id)`
        -   *After*: `await db.collection('leads').doc(id).get()`

5.  **Remove Mock Data**: Once all actions are rewritten, you can delete the mock data arrays from `src/lib/data.ts`.
