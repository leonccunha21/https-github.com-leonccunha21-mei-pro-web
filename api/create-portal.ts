import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripeKey = process.env.STRIPE_SECRET_KEY || '';
  if (!stripeKey) return res.status(500).json({ error: 'Stripe não configurado' });
  const stripe = new Stripe(stripeKey);

  const { uid } = req.body || {};
  if (!uid) return res.status(400).json({ error: 'uid é obrigatório' });

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

    const customerId = supabase
      ? (await supabase.from('subscriptions').select('stripe_customer_id').eq('user_id', uid).maybeSingle())?.data?.stripe_customer_id
      : null;
    if (!customerId) return res.status(404).json({ error: 'Cliente não encontrado' });

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.origin || 'https://mei-pro.vercel.app'}/`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe portal error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
