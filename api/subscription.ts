import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return (url && key) ? createClient(url, key) : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabase();
  if (!supabase) return res.status(500).json({ error: 'Supabase não configurado' });

  if (req.method === 'GET') {
    const uid = req.query.uid as string;
    if (!uid) return res.status(400).json({ error: 'uid é obrigatório' });

    try {
      const { data } = await supabase.from('subscriptions').select('*').eq('user_id', uid).maybeSingle();
      return res.json(data || null);
    } catch (err: any) {
      console.error('Subscription fetch error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { uid, email } = req.body || {};
    if (!uid || !email) return res.status(400).json({ error: 'uid e email são obrigatórios' });

    try {
      const { data: existing } = await supabase.from('subscriptions').select('*').eq('user_id', uid).maybeSingle();
      if (existing) return res.json(existing);

      const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: uid, email,
          status: 'trialing',
          plan_id: 'trial',
          trial_end: trialEnd,
          current_period_end: trialEnd,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return res.json(data);
    } catch (err: any) {
      console.error('Start trial error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
