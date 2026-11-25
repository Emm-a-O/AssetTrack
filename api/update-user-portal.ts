import { createClient } from '@supabase/supabase-js';

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
  if (!token) return res.status(401).json({ error: 'Sign in before changing an account portal.' });
  if (!supabaseUrl || !secretKey) return res.status(503).json({ error: 'The server administration key is not configured in Vercel.' });

  const body = req.body as Record<string, unknown> | undefined;
  const userId = typeof body?.userId === 'string' ? body.userId : '';
  const portal = body?.portal === 'household' || body?.portal === 'organisation' ? body.portal : '';
  if (!userId || !portal) return res.status(400).json({ error: 'Choose a valid account and portal.' });

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return res.status(401).json({ error: 'Your session is invalid. Sign in again.' });
  if (authData.user.id === userId) return res.status(400).json({ error: 'You cannot change your own portal assignment.' });

  const { data: caller, error: profileError } = await admin
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .maybeSingle();
  if (profileError) return res.status(500).json({ error: profileError.message });
  if (!caller || !['Platform Administrator', 'Organisation Administrator'].includes(caller.role)) {
    return res.status(403).json({ error: 'Only an administrator can change account portals.' });
  }

  const { data: target, error: targetError } = await admin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  if (targetError) return res.status(500).json({ error: targetError.message });
  if (!target) return res.status(404).json({ error: 'That account was not found.' });
  if (portal === 'household' && target.role !== 'Staff Member') {
    return res.status(400).json({ error: 'Only Staff Member accounts can be assigned to the Household portal.' });
  }

  const { error: updateError } = await admin
    .from('profiles')
    .update({ portal })
    .eq('id', userId);
  if (updateError) return res.status(400).json({ error: updateError.message });

  return res.status(200).json({ success: true });
}
