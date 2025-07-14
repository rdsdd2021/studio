
import { getUsers } from "@/actions/users";
import type { User } from "./types";

/**
 * In a real production app, this would be handled by a proper authentication library (like NextAuth.js or Lucia)
 * that would manage session cookies, tokens, and provide a hook like `useSession()`.
 * For this prototype, we simulate this by storing the current user's ID in localStorage on the client
 * and fetching the user's details from the database when needed.
 */

// On the server, we simulate getting the logged-in user.
// In a real app, you would get the user ID from the session cookie.
// Here we default to an active admin or the first active caller for server components.
export async function getCurrentUser(): Promise<User | undefined> {
  const users = await getUsers();
  // Try to find an active admin first
  const admin = users.find(u => u.role === 'admin' && u.status === 'active');
  if (admin) return admin;
  // Fallback to the first active caller
  return users.find(u => u.role === 'caller' && u.status === 'active');
}


// On the client, we can read from our simulated session (localStorage)
export async function getCurrentUserFromClient(): Promise<User | undefined> {
    if (typeof window !== 'undefined') {
        const userId = localStorage.getItem('currentUser');
        if (userId) {
            const users = await getUsers();
            return users.find(u => u.id === userId);
        }
    }
    return undefined;
}
