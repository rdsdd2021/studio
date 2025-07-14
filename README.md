
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

## How to Set Up and Deploy with Firebase App Hosting

### Step 1: Set Up Your Firebase Project

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Firebase Services**:
    *   **Authentication**: Go to the "Authentication" section, click "Get started", and enable the **Email/Password** sign-in provider.
    *   **Firestore**: Go to the "Firestore Database" section, click "Create database", start in **production mode**, and choose a location.
3.  **Create a Web App**: In your Firebase project settings, under the "General" tab, scroll down to "Your apps" and click the web icon (`</>`) to create a new web app. Give it a nickname and Firebase will provide you with a `firebaseConfig` object.

### Step 2: Configure Your Local Environment (CRUCIAL)

**To run the app locally, you must provide the Firebase Admin SDK with service account credentials.**

1.  **Generate a Service Account Key:**
    *   In the Firebase Console, go to **Project Settings** (click the gear icon).
    *   Go to the **Service accounts** tab.
    *   Click the **Generate new private key** button. A JSON file will be downloaded. **Keep this file secure and do not commit it to version control.**

2.  **Create `.env.local` file:**
    *   In the root of your project, create a new file named `.env.local`.

3.  **Add Environment Variables:**
    *   **Copy Web App Config**: Copy the entire `firebaseConfig` object from the Firebase console (from Step 1.3) and add it to your `.env.local` file like this:
        ```env
        NEXT_PUBLIC_FIREBASE_CONFIG='{"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"...","measurementId":"..."}'
        ```
        **Important**: The value must be a single line of JSON, enclosed in single quotes.

    *   **Copy Service Account Details**: Open the `service-account.json` file you downloaded. You will need three values from it: `project_id`, `client_email`, and `private_key`. Add them to your `.env.local` file like this:
        ```env
        FIREBASE_PROJECT_ID="your-project-id-from-json"
        FIREBASE_CLIENT_EMAIL="your-client-email@..."
        FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n....your private key...\n-----END PRIVATE KEY-----\n"
        ```
        **Important**: For `FIREBASE_PRIVATE_KEY`, copy the entire key including the `-----BEGIN...` and `-----END...` lines. It must be enclosed in double quotes (`"`) and all newline characters within the key must be represented as `\n`.

    *   **Add AI API Key**: For the AI features to work, go to the [Google AI Studio](https://aistudio.google.com/) and get an API key. Add it to your `.env.local` file:
        ```env
        GOOGLE_API_KEY="<your-google-ai-api-key>"
        ```

    *   Your final `.env.local` file should look similar to this:
        ```env
        NEXT_PUBLIC_FIREBASE_CONFIG='{"apiKey":"...","authDomain":"..."}'
        FIREBASE_PROJECT_ID="my-leadsflow-app"
        FIREBASE_CLIENT_EMAIL="firebase-adminsdk-..."
        FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABC...XYZ\n-----END PRIVATE KEY-----\n"
        GOOGLE_API_KEY="<your-google-ai-api-key>"
        ```

### Step 3: Create Your First Admin User

Since there is no "master admin", you need to create your first user directly in the Firebase console so you can log in.

1.  Go to the **Authentication** section in your Firebase project.
2.  Click "Add user" and create a user with an email and password.
3.  Copy the **User UID** for the user you just created.
4.  Go to the **Firestore Database** section.
5.  Create a new collection called `users`.
6.  Create a new document in the `users` collection. **The Document ID must be the same as the User UID** you copied.
7.  Add the following fields to the document:
    *   `name`: (string) Your name
    *   `email`: (string) The email you used for the user
    *   `phone`: (string) Your phone number (e.g., "1234567890")
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

