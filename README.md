# LeadsFlow

This is a NextJS application for a lead management system called LeadsFlow, built in Firebase Studio.

## Core Features:

- **User Authentication**: Mock login screen.
- **Dashboard Overview**: Dashboard displaying key metrics from mock data.
- **Lead Filtering & Assignment**: Screens to filter and assign leads.
- **Caller & Detail Views**: Screens for callers to see their assigned leads and for admins to view lead history.
- **AI-Powered Suggestions**: A Genkit flow suggests sub-dispositions based on call remarks.

## App Workflow

1.  **Login**: A user logs in. The app has two roles: `Admin` and `Caller`.
2.  **Dashboard**: Admins and Callers see an overview of lead statistics.
3.  **Lead Management (Admin)**: Admins can view all leads, filter them by various criteria (school, campaign, etc.), and assign them to `Caller` users.
4.  **My Leads (Caller)**: Callers have a dedicated view showing only the leads assigned to them.
5.  **Lead Interaction (Caller)**: Callers can view lead details and update the lead's status (disposition, sub-disposition, remarks) after a call. An AI feature can suggest a sub-disposition based on the remarks.
6.  **User Management (Admin)**: Admins can add, edit, and manage users.

## Key Functions (Server Actions)

The application logic is handled by server actions located in `src/actions/`.

-   **`src/actions/leads.ts`**: Manages all lead-related data operations, such as fetching all leads, getting details for a single lead, assigning leads to users, and updating lead statuses.
-   **`src/actions/users.ts`**: Handles user management, including adding, updating, and changing user statuses.
-   **`src/actions/settings.ts`**: Manages application-wide settings, like geofencing.
-   **`src/ai/flows/suggest-disposition.ts`**: An AI flow that takes call remarks and suggests an appropriate sub-disposition.

## Database Structure (Mock Data)

The application now uses mock data located in `src/lib/data.ts`. The main data structures are:

-   **`users`**: An array of user objects, each with an `id`, `name`, `role`, `status`, etc.
-   **`leads`**: An array of lead objects, containing details like `refId`, `name`, `phone`, `school`, and `customFields`.
-   **`assignmentHistory`**: An array representing the link between leads and users, tracking who a lead is assigned to and the outcome of the interactions (dispositions).
-   **`loginActivity`**: An array logging user login/logout events.
