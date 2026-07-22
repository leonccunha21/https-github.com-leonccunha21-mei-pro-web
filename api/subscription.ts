import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const uid = req.query.uid as string;
  if (!uid) return res.status(400).json({ error: 'uid é obrigatório' });

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;
    if (!supabase) return res.status(500).json({ error: 'Supabase não configurado' });

    const { data } = await supabase.from('subscriptions').select('*').eq('user_id', uid).maybeSingle();
    res.json(data || null);
  } catch (err: any) {
    console.error('Subscription fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
