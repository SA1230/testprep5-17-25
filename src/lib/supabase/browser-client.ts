"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Create a browser client for use in client components
export const createBrowserClient = () => {
  return createClientComponentClient();
};

// Export a singleton instance for convenience
export const browserClient = createBrowserClient();
