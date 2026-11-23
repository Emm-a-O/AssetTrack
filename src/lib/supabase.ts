import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const mapProfileToUser = (profile: {
  id: string;
  email: string;
  full_name: string;
  role: string;
  title?: string | null;
  department_id?: string | null;
  avatar?: string | null;
}) => ({
  id: profile.id,
  email: profile.email,
  name: profile.full_name || profile.email,
  role: profile.role as import('../types').UserRole,
  title: profile.title || undefined,
  departmentId: profile.department_id || undefined,
  avatar: profile.avatar || undefined,
});
