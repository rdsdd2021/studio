
# LeadsFlow - Firebase App Hosting Edition

This is a Next.js application for a lead management system called LeadsFlow. It's a high-fidelity prototype designed to be deployed directly to Firebase App Hosting, leveraging Firebase Authentication and Firestore.

## Core Features

-   **User Authentication**: Secure user login/logout powered by Firebase Authentication.
-   **Role-Based Dashboards**: Separate, tailored dashboards for Admins and Callers, with UI elements dynamically rendered based on user roles.
-   **Secure Server Actions**: All backend operations verify the user's identity via Firebase Auth tokens, ensuring users can only perform actions they are authorized for.
-   **Flexible Lead Import**: Import leads from a CSV file. Only `name` and `phone` are required.
-   **Campaign Field Mapping**: When importing, optionally select a campaign and map columns from your CSV to campaign-specific custom fields.
-   **Lead Filtering & Assignment**: Screens for administrators to filter, view, and assign leads to callers.
-   **Caller & Detail Views**: Dedicated views for callers to see their assigned leads and for anyone to view the detailed history of a specific lead.
-   **Caller Data Entry**: Callers can input data for predefined custom fields on a lead. This action is tracked with the user's name and a timestamp.
-   **User Management**: A section for admins to add, edit, and manage user accounts, with roles and statuses synced with Firebase Authentication.
-   **AI-Powered Suggestions**: A Genkit flow that suggests appropriate sub-dispositions for a call based on the caller's remarks.
-   **Geofencing**: Admins can define an operational area to monitor or restrict user logins.

## Tech Stack

-   **Framework**: Next.js (App Router)
-   **UI**: React, ShadCN UI, Tailwind CSS
-   **AI**: Google Genkit
-   **Backend**: Firebase (App Hosting, Authentication, Firestore)

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

1.  **Login**: A user logs in via the `/login` page using Firebase Authentication (email/password).
2.  **Dashboard**: After logging in, the user lands on their role-specific Dashboard.
    -   **Admin**: Sees a high-level overview of team performance, total leads, and recent system activity.
    -   **Caller**: Sees their personal statistics, a list of upcoming follow-ups, and a button to start calling leads.
3.  **Lead Import (Admin)**: An Admin can navigate to "All Leads" and use the "Import" button.
    -   They upload a CSV file. The only mandatory columns are `name` and `phone`. A sample file is available for download.
    -   Optionally, they can select a campaign. If they do, the system displays the custom fields defined for that campaign.
    -   The admin can then map columns from their CSV file to these custom fields.
    -   Upon import, new leads are created with the mapped data.
4.  **Lead Management (Admin)**: An Admin can use filters on the "All Leads" page (`/leads`) to select specific leads and assign them in bulk to an active "Caller" user. They can also add campaign tags to multiple leads at once.
5.  **Caller Workflow (Caller)**: A Caller navigates to "My Leads" (`/my-leads`) to see their queue. They can click on a lead to go to the "Lead Detail" page (`/leads/[id]`).
    -   On the detail page, they can see all lead details. In the "Additional Information" section, they can fill in any custom fields that are currently empty.
    -   Once a field is updated, it becomes read-only, displaying the value, the name of the caller who updated it, and the date of the update.
    -   The caller can then use the "Update Status" form to log the call's outcome, with date pickers appearing for follow-ups or scheduled appointments. The AI Suggestion feature can help them choose the best sub-disposition.
6.  **System Management (Admin)**: An Admin can go to the "Account" page to configure settings like universal/campaign custom fields, custom dispositions, and geofencing. These settings are saved live to the database.

---

## How to Set Up and Deploy with Firebase App Hosting

### Step 1: Set Up Your Firebase Project

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Firebase Services**:
    *   **Authentication**: Go to the "Authentication" section, click "Get started", and enable the **Email/Password** sign-in provider.
    *   **Firestore**: Go to the "Firestore Database" section, click "Create database", start in **production mode**, and choose a location.
3.  **Create a Web App**: In your Firebase project settings, under the "General" tab, scroll down to "Your apps" and click the web icon (`</>`) to create a new web app. Give it a nickname and Firebase will provide you with a `firebaseConfig` object.

### Step 2: Configure Your Local Environment

1.  **Create `.env.local`**: In the root of your project, create a file named `.env.local`.
2.  **Add `NEXT_PUBLIC_FIREBASE_CONFIG`**: Copy the entire `firebaseConfig` object from the Firebase console and add it to your `.env.local` file like this:
    ```env
    NEXT_PUBLIC_FIREBASE_CONFIG='{"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"...","measurementId":"..."}'
    ```
    **Important**: The value must be a single line of JSON, enclosed in single quotes.
3.  **Add `GOOGLE_API_KEY`**: For the AI features to work, go to the [Google AI Studio](https://aistudio.google.com/) and get an API key. Add it to your `.env.local` file:
    ```env
    GOOGLE_API_KEY="<your-google-ai-api-key>"
    ```

### Step 3: Create Your First Admin User

Since the "master admin" has been removed for better security, you need to create your first user directly in the Firebase console.

1.  Go to the **Authentication** section in your Firebase project.
2.  Click "Add user" and create a user with an email and password.
3.  Go to the **Firestore Database** section. Create a new collection called `users`.
4.  Create a new document in the `users` collection. **The Document ID must be the same as the User UID** from the Authentication tab.
5.  Add the following fields to the document:
    *   `name`: (string) Your name
    *   `email`: (string) The email you just used
    *   `phone`: (string) Your phone number
    *   `role`: (string) Set this to `admin`
    *   `status`: (string) Set this to `active`
    *   `createdAt`: (string) `2024-01-01T00:00:00.000Z` (or any valid ISO date)

You can now log into the application with this user's email and password to manage other users.

### Step 4: Set Up Firestore Security Rules (Crucial for Production)

Go to the **Firestore Database** section and click on the "Rules" tab. Replace the default rules with the following to secure your data:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow admins to read/write all user profiles
    match /users/{userId} {
      allow read, write: if request.auth.token.role == 'admin';
      // Allow users to read their own profile
      allow get: if request.auth.uid == userId;
    }
    
    // Allow any authenticated user to read leads and settings
    match /leads/{leadId} {
      allow read: if request.auth != null;
      // Allow admins to create/delete leads
      allow create, delete: if request.auth.token.role == 'admin';
      // Allow callers to update custom fields
      allow update: if request.auth.token.role == 'caller';
    }
    
    match /assignmentHistory/{docId} {
       // Allow any authenticated user to read history
      allow read: if request.auth != null;
      // Allow admins and callers to create new history records
      allow create: if request.auth.token.role == 'admin' || request.auth.token.role == 'caller';
    }
    
    match /loginActivity/{docId} {
        allow read, create: if request.auth != null;
    }
    
    match /settings/{setting} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role == 'admin';
    }
  }
}
```

### Step 5: Deploy to Firebase App Hosting

1.  **Install Firebase CLI**: If you haven't already, install the Firebase CLI: `npm install -g firebase-tools`.
2.  **Log in to Firebase**: `firebase login`.
3.  **Initialize Firebase**: `firebase init apphosting`. Follow the prompts to connect to your Firebase project.
4.  **Deploy**: Run the deploy command:
    ```bash
    firebase apphosting:backends:deploy
    ```
    The CLI will guide you through creating the backend resource and deploying your app. After it finishes, it will provide you with the URL to your live application.
