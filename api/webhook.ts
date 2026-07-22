import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

async function buffer(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripeKey = process.env.STRIPE_SECRET_KEY || '';
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  if (!stripeKey || !stripeWebhookSecret) return res.status(500).json({ error: 'Stripe não configurado' });

  const stripe = new Stripe(stripeKey);

  const sig = req.headers['stripe-signature'] as string;
  const rawBody = await buffer(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, stripeWebhookSecret);
  } catch (err: any) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

  if (!supabase) return res.status(500).json({ error: 'Supabase não configurado' });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.uid;
        const email = session.customer_email || session.metadata?.email || '';
        const subId = session.subscription as string;
        const customerId = session.customer as string;
        if (uid && subId) {
          const rawSub: any = await stripe.subscriptions.retrieve(subId);
          await supabase.from('subscriptions').upsert({
            user_id: uid, email,
            stripe_customer_id: customerId,
            stripe_subscription_id: subId,
            status: rawSub.status,
            plan_id: rawSub.items?.data?.[0]?.price?.id || 'monthly',
            current_period_end: rawSub.current_period_end ? new Date(rawSub.current_period_end * 1000).toISOString() : null,
          }, { onConflict: 'user_id' });
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const rawSub2: any = event.data.object;
        const customerId = rawSub2.customer as string;
        const { data: existing } = await supabase.from('subscriptions').select('user_id').eq('stripe_customer_id', customerId).maybeSingle();
        if (existing?.user_id) {
          await supabase.from('subscriptions').update({
            status: rawSub2.status,
            stripe_subscription_id: rawSub2.id,
            plan_id: rawSub2.items?.data?.[0]?.price?.id || 'monthly',
            current_period_end: rawSub2.current_period_end ? new Date(rawSub2.current_period_end * 1000).toISOString() : null,
            cancel_at_period_end: rawSub2.cancel_at_period_end,
          }).eq('user_id', existing.user_id);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        await supabase.from('subscriptions').update({ status: 'past_due' }).eq('stripe_customer_id', customerId);
        break;
      }
    }
    res.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook error:', err.message);
    res.status(500).json({ error: 'Internal error' });
  }
}
