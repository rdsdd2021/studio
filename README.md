# LeadsFlow

This is a Next.js application for a lead management system called LeadsFlow. It serves as a high-fidelity prototype that is fully functional using mock data, and is designed to be easily connected to a production backend like Firebase or Supabase.

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
| **Account/Settings**| `/account` | ✅ | ✅ | Manage personal profile and application-wide settings (e.g., custom fields). |

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
6.  **System Management (Admin)**: An Admin can go to the "Account" page to configure settings like custom fields for campaigns and geofencing.

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

## How to Make This App Launch-Ready

To transition this prototype into a production application, you need to replace the mock data with a real backend database. The application is architected to make this process straightforward. This guide uses **Firebase** as the recommended backend, but the principles apply to any other service like Supabase.

### Step 1: Set Up a Firebase Project

1.  **Create a Firebase Project**:
    -   Go to the [Firebase Console](https://console.firebase.google.com/).
    -   Click "Add project" and follow the on-screen instructions.

2.  **Set Up Firestore Database**:
    -   In your new project's console, go to the "Build" section in the left-hand menu and click on **Firestore Database**.
    -   Click "Create database".
    -   Start in **production mode**. This ensures your data is secure by default.
    -   Choose a location for your database. Pick the one closest to your users.

3.  **Generate Service Account Credentials**:
    -   For your Next.js server to securely communicate with Firebase services, it needs admin credentials.
    -   In the Firebase Console, click the gear icon next to "Project Overview" and go to **Project settings**.
    -   Navigate to the **Service accounts** tab.
    -   Click **Generate new private key**. A JSON file containing your credentials will be downloaded. **Treat this file like a password and never expose it publicly.**

### Step 2: Configure Your Local Environment

1.  **Create an Environment File**:
    -   In the root of your project, rename the existing `.env` file to `.env.local`. This is a special file that Next.js automatically loads for environment variables.
    -   Open the downloaded JSON key file and your new `.env.local` file.

2.  **Add Credentials to `.env.local`**:
    -   Copy the following key-value pairs from your JSON file into `.env.local`:
        ```env
        FIREBASE_PROJECT_ID="<your-project-id>"
        FIREBASE_CLIENT_EMAIL="<your-client-email>"
        ```
    -   For the private key, you need to format it correctly. Copy the entire `private_key` string, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` markers. It will look like this:
        ```env
        FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_VERY_LONG_KEY_HERE\n-----END PRIVATE KEY-----\n"
        ```
        **Important**: The `\n` characters are essential. Make sure they are preserved as part of the string.

### Step 3: Connect the App to Firebase

This app uses a single file to manage the Firebase Admin SDK connection. You just need to uncomment the Firebase-related code.

-   **File to edit**: `src/lib/firebase.ts` (This file might not exist if you haven't set up Firebase yet. If so, create it.)

If you need to create `src/lib/firebase.ts`, use the following code. If it exists, replace its contents with this:
```typescript
import admin from 'firebase-admin';

// This function ensures that Firebase is initialized only once.
function getFirebaseAdminApp() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error("Firebase credentials are not set in the environment variables. Please check your .env.local file.");
    }

    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

// Initialize the app
getFirebaseAdminApp();

// Export the Firestore database instance
export const db = admin.firestore();
```

### Step 4: Rewrite Server Actions

This is the most critical step. You need to replace the functions that manipulate mock data with functions that interact with your Firestore database.

**Location of Actions**: `src/actions/*.ts`

**General Process**:
For each function in `src/actions/leads.ts`, `src/actions/users.ts`, etc., you will:
1.  Import the `db` instance from `src/lib/firebase.ts`.
2.  Replace the array manipulation logic (e.g., `leads.find(...)`, `users.push(...)`) with Firestore SDK calls (e.g., `db.collection('leads').doc(id).get()`, `db.collection('users').add(...)`).

**Example: Rewriting `getLeads()` in `src/actions/leads.ts`**

*   **Before (Mock Data)**:
    ```typescript
    import { leads } from '@/lib/data';
    // ...
    export async function getLeads(): Promise<Lead[]> {
      return JSON.parse(JSON.stringify(leads));
    }
    ```

*   **After (Firestore)**:
    ```typescript
    import { db } from '@/lib/firebase';
    import type { Lead } from "@/lib/types";
    
    export async function getLeads(): Promise<Lead[]> {
        const leadsSnapshot = await db.collection('leads').get();
        const leads: Lead[] = [];
        leadsSnapshot.forEach(doc => {
            leads.push({ refId: doc.id, ...doc.data() } as Lead);
        });
        return leads;
    }
    ```
You will need to repeat this process for **all functions** in the `src/actions/` directory that read from or write to the mock data arrays.

### Step 5: Setting Up Genkit for AI Features

The AI-powered disposition suggestion will work out-of-the-box once your environment is set up.

1.  **Enable the AI API**: Go to the [Google AI Studio](https://aistudio.google.com/) and get an API key.
2.  **Add API Key to Environment**: Add the following line to your `.env.local` file:
    ```env
    GOOGLE_API_KEY="<your-google-ai-api-key>"
    ```

### Step 6: Deploying to Production

A platform like **Vercel** or **Firebase Hosting** is recommended for deploying a Next.js app.

1.  **Choose a Hosting Provider**: Vercel is the easiest option as it's made by the creators of Next.js.
2.  **Import Your Git Repository**: Connect your GitHub, GitLab, or Bitbucket account to your hosting provider and import the project repository.
3.  **Configure Environment Variables**: In your hosting provider's project settings (e.g., Vercel's "Environment Variables" section), add all the variables from your `.env.local` file:
    -   `FIREBASE_PROJECT_ID`
    -   `FIREBASE_CLIENT_EMAIL`
    -   `FIREBEASE_PRIVATE_KEY`
    -   `GOOGLE_API_KEY`
4.  **Deploy**: Push your code to the `main` branch. The hosting provider will automatically build and deploy your application.

After completing these steps, your LeadsFlow application will be fully functional and running on a production-ready infrastructure.
