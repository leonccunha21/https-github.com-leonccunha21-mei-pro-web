import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripeKey = process.env.STRIPE_SECRET_KEY || '';
  if (!stripeKey) return res.status(500).json({ error: 'Stripe não configurado' });
  const stripe = new Stripe(stripeKey);

  const { uid, email, priceId } = req.body || {};
  if (!uid || !email || !priceId) return res.status(400).json({ error: 'uid, email e priceId são obrigatórios' });

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

    let customerId: string;
    if (supabase) {
      const { data: existing } = await supabase.from('subscriptions').select('stripe_customer_id').eq('user_id', uid).maybeSingle();
      customerId = existing?.stripe_customer_id || '';
    }
    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { uid } });
      customerId = customer.id;
    }

    const coupon = (req.body?.coupon as string)?.trim() || '';

    const sessionParams: any = {
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { uid, email },
      subscription_data: { metadata: { uid } },
      success_url: `${req.headers.origin || 'https://mei-pro.vercel.app'}/?checkout=success`,
      cancel_url: `${req.headers.origin || 'https://mei-pro.vercel.app'}/?checkout=canceled`,
    };
    if (coupon) {
      sessionParams.discounts = [{ coupon }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
