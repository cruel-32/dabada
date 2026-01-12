// types/auth.d.ts
// This file augments the types from 'better-auth/react' to include the 'role' field in the User object.

// Declare a module augmentation for 'better-auth/react'
declare module 'better-auth/react' {
  // Extend the existing 'User' interface
  interface User {
    /**
     * The role of the user (e.g., 'user', 'admin').
     * Added via additionalFields in better-auth configuration.
     */
    role?: string;
  }

  // Extend the existing 'Session' interface
  // (optional, as User is usually nested under Session)
  interface Session {
    user?: User;
  }
}