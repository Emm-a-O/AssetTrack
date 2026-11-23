import { createClient } from '@supabase/supabase-js';
import type { UserRole } from '../src/types';

const allowedRoles: UserRole[] = [
  'Organisation Administrator',
  'Asset Manager',
  'Department Manager',
  'Staff Member',
  'Auditor',
];

type Request = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type Response = {
  status: (code: number) => Response;
  json: (body: unknown) => void;
};

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const authorization = req.headers.authorization;
  const token = typeof authorization === 'string' ? authorization.replace(/^Bearer\s+/i, '') : '';
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!token) return res.status(401).json({ error: 'Sign in before inviting an official.' });
  if (!supabaseUrl || !secretKey) {
    return res.status(503).json({ error: 'The server invitation key is not configured in Vercel.' });
  }

  const body = req.body as Record<string, unknown> | undefined;
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const role = typeof body?.role === 'string' ? body.role : '';
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const departmentId = typeof body?.departmentId === 'string' ? body.departmentId : '';
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || !allowedRoles.includes(role as UserRole)) {
    return res.status(400).json({ error: 'Enter a name, valid email, and permitted role.' });
  }

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return res.status(401).json({ error: 'Your session is invalid. Sign in again.' });

  const { data: caller, error: profileError } = await admin
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .maybeSingle();
  if (profileError) return res.status(500).json({ error: profileError.message });
  if (!caller || !['Platform Administrator', 'Organisation Administrator'].includes(caller.role)) {
    return res.status(403).json({ error: 'Only an organisation administrator can invite accounts.' });
  }

  const { data: invitation, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: name,
      title: title || null,
      department_id: departmentId || null,
    },
  });
  if (inviteError || !invitation.user) {
    return res.status(400).json({ error: inviteError?.message || 'Could not create the invited account.' });
  }

  const { error: updateError } = await admin
    .from('profiles')
    .update({
      email,
      full_name: name,
      role,
      title: title || null,
      department_id: departmentId || null,
    })
    .eq('id', invitation.user.id);
  if (updateError) return res.status(500).json({ error: `Invitation was sent, but the profile role could not be saved: ${updateError.message}` });

  return res.status(200).json({ success: true, message: `Invitation sent to ${email}.` });
}
