# LeadsFlow

This is a Next.js application for a lead management system called LeadsFlow. It serves as a high-fidelity prototype designed to be fully functional and easily connected to a production Firebase backend.

## Core Features

-   **User Authentication**: A mock login screen to simulate user authentication for different roles.
-   **Role-Based Dashboards**: Separate, tailored dashboards for Admins and Callers.
-   **Flexible Lead Import**: Import leads from a CSV file. Only `name` and `phone` are required.
-   **Campaign Field Mapping**: When importing, optionally select a campaign and map columns from your CSV to campaign-specific custom fields.
-   **Lead Filtering & Assignment**: Screens for administrators to filter, view, and assign leads to callers.
-   **Caller & Detail Views**: Dedicated views for callers to see their assigned leads and for anyone to view the detailed history of a specific lead.
-   **Caller Data Entry**: Callers can input data for predefined custom fields on a lead. This action is tracked with the user's name and a timestamp.
-   **User Management**: A section for admins to add, edit, and manage user accounts.
-   **AI-Powered Suggestions**: A Genkit flow that suggests appropriate sub-dispositions for a call based on the caller's remarks.
-   **Geofencing**: Admins can define an operational area to monitor or restrict user logins.

## Tech Stack

-   **Framework**: Next.js (App Router)
-   **UI**: React, ShadCN UI, Tailwind CSS
-   **AI**: Google Genkit
-   **Backend (Recommended)**: Firebase (Firestore)

---

## Application Structure & Workflow

The application is designed around two primary user roles: **Admin** and **Caller**.

### User Roles & Access

| Page                | Route         | Admin Access | Caller Access | Description                                                                                          |
| :------------------ | :------------ | :----------: | :-----------: | :--------------------------------------------------------------------------------------------------- |
| **Dashboard**       | `/dashboard`  |      ✅      |       ✅      | Role-specific overview of lead statistics and recent activity.                                       |
| **All Leads**       | `/leads`      |      ✅      |       ❌      | View, filter, and assign all leads in the system.                                                    |
| **My Leads**        | `/my-leads`   |      ❌      |       ✅      | View only the leads specifically assigned to the logged-in caller.                                   |
| **Lead Detail**     | `/leads/[id]` |      ✅      |       ✅      | View detailed information and history for a single lead. Callers can add info to empty custom fields. |
| **User Management** | `/users`      |      ✅      |       ❌      | Add, edit, approve, and deactivate users.                                                            |
| **Login Tracker**   | `/tracker`    |      ✅      |       ❌      | View a log of user login/logout activity.                                                            |
| **Account/Settings**| `/account`    |      ✅      |       ✅      | Manage personal profile and application-wide settings (e.g., custom fields, dispositions, geofencing). |

### User Flow

1.  **Login**: A user logs in via the `/login` page. The system checks mock user data to determine their role.
2.  **Dashboard**: After logging in, the user lands on their role-specific Dashboard.
    -   **Admin**: Sees a high-level overview of team performance, total leads, and recent system activity.
    -   **Caller**: Sees their personal statistics, a list of upcoming follow-ups, and a button to start calling leads.
3.  **Lead Import (Admin)**: An Admin can navigate to "All Leads" and use the "Import" button.
    -   They upload a CSV file. The only mandatory columns are `name` and `phone`.
    -   Optionally, they can select a campaign. If they do, the system displays the custom fields defined for that campaign.
    -   The admin can then map columns from their CSV file to these custom fields.
    -   Upon import, new leads are created with the mapped data.
4.  **Lead Management (Admin)**: An Admin can use filters on the "All Leads" page (`/leads`) to select specific leads and assign them in bulk to an active "Caller" user. They can also add campaign tags to multiple leads at once.
5.  **Caller Workflow (Caller)**: A Caller navigates to "My Leads" (`/my-leads`) to see their queue. They can click on a lead to go to the "Lead Detail" page (`/leads/[id]`).
    -   On the detail page, they can see all lead details. In the "Additional Information" section, they can fill in any custom fields that are currently empty.
    -   Once a field is updated, it becomes read-only, displaying the value, the name of the caller who updated it, and the date of the update.
    -   The caller can then use the "Update Status" form to log the call's outcome, with date pickers appearing for follow-ups or scheduled appointments. The AI Suggestion feature can help them choose the best sub-disposition.
6.  **System Management (Admin)**: An Admin can go to the "Account" page to configure settings like universal/campaign custom fields, custom dispositions, and geofencing.

---

## How to Make This App Launch-Ready with Firebase

To transition this prototype into a production application, you need to replace the mock data with a real Firebase backend. The application is architected to make this process straightforward.

### Step 1: Set Up a Firebase Project

1.  **Create a Firebase Project**:
    -   Go to the [Firebase Console](https://console.firebase.google.com/), sign in, and click "Add project".
    -   Follow the on-screen instructions to create your project.

2.  **Set Up Firestore**:
    -   From your project's dashboard, go to the **Firestore Database** section.
    -   Click "Create database" and start in **production mode**.
    -   Choose a location for your database.

3.  **Generate a Service Account Key**:
    -   In your Firebase project, go to **Project Settings** (the gear icon).
    -   Navigate to the **Service accounts** tab.
    -   Click "Generate new private key". A JSON file will be downloaded. This file contains the credentials your Next.js server will use to securely connect to Firebase services.

### Step 2: Configure Your Local Environment

1.  **Create an Environment File**:
    -   In the root of your project, create a file named `.env.local`. This is a special file that Next.js automatically loads for environment variables.

2.  **Add Credentials to `.env.local`**:
    -   Open the JSON key file you downloaded. You will need three values: `project_id`, `client_email`, and `private_key`.
    -   Add these to your `.env.local` file.
        ```env
        FIREBASE_PROJECT_ID="<your-project-id>"
        FIREBASE_CLIENT_EMAIL="<your-client-email>"
        FIREBASE_PRIVATE_KEY="<your-private-key>"
        ```
    -   **Important**: The `private_key` from the JSON file contains newline characters (`\n`). When you paste it into the `.env.local` file, you may need to ensure they are preserved correctly. The provided `src/lib/firebase.ts` file handles replacing `\\n` with `\n`.

### Step 3: Set Up Database Collections

The application is designed to work with the following Firestore collections. Firestore will create these automatically when you first write data to them, but it's good to know the intended structure.

-   **`users`**: Stores user profiles. (e.g., `{ name: 'Jane Doe', role: 'caller', status: 'active', ... }`)
-   **`leads`**: Stores all lead records. (e.g., `{ name: 'Aarav Sharma', phone: '9876543210', customFields: { ... }, ... }`)
-   **`assignmentHistory`**: Logs all dispositions and assignments for each lead. (e.g., `{ mainDataRefId: '...', userId: '...', disposition: 'Interested', ... }`)
-   **`loginActivity`**: Tracks user login/logout events. (e.g., `{ userId: '...', activity: 'login', ... }`)
-   **`settings`**: A key-value store for application settings. Each document in this collection has an ID that represents the setting's key.
    -   `doc('geofence')`: Stores the geofencing configuration.
    -   `doc('universalCustomFields')`: Stores the list of custom fields that apply to all leads.
    -   `doc('campaignCustomFields')`: Stores the map of campaign-specific custom fields.
    -   And so on for other settings like dispositions.

### Step 4: Review Server Actions

The server actions in `src/actions/*.ts` have been rewritten to use the Firebase Admin SDK to communicate with Firestore. They no longer use the mock data from `src/lib/data.ts`. You should review these files to understand how the application interacts with the database.

### Step 5: Setting Up Genkit for AI Features

The AI-powered disposition suggestion will work once your environment is set up for it.

1.  **Enable the AI API**: Go to the [Google AI Studio](https://aistudio.google.com/) and get an API key.
2.  **Add API Key to Environment**: Add the following line to your `.env.local` file:
    ```env
    GOOGLE_API_KEY="<your-google-ai-api-key>"
    ```

### Step 6: Deploying to Production

A platform like **Vercel** or **Netlify** is recommended for deploying a Next.js app.

1.  **Choose a Hosting Provider**: Vercel is the easiest option as it's made by the creators of Next.js.
2.  **Import Your Git Repository**: Connect your GitHub, GitLab, or Bitbucket account to your hosting provider and import the project repository.
3.  **Configure Environment Variables**: In your hosting provider's project settings (e.g., Vercel's "Environment Variables" section), add all the variables from your `.env.local` file:
    -   `FIREBASE_PROJECT_ID`
    -   `FIREBASE_CLIENT_EMAIL`
    -   `FIREBASE_PRIVATE_KEY`
    -   `GOOGLE_API_KEY`
4.  **Deploy**: Push your code to the `main` branch. The hosting provider will automatically build and deploy your application.

After completing these steps, your LeadsFlow application will be fully functional and running on a production-ready Firebase infrastructure.
