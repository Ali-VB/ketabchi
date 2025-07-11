import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn("STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.");
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
}) : null;

export async function POST(req: NextRequest) {
    if (!stripe) {
        return NextResponse.json({ error: 'Stripe is not configured. Missing STRIPE_SECRET_KEY.' }, { status: 500 });
    }

    try {
        const { amount, matchId, bookTitles } = await req.json();

        // Basic validation
        if (!amount || !matchId || !bookTitles) {
            return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Ketabchi Delivery: ${bookTitles}`,
                            description: `Payment for book delivery service. Match ID: ${matchId}`,
                        },
                        unit_amount: Math.round(amount * 100), // Amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/dashboard/matches?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/dashboard/matches?status=cancelled`,
            metadata: {
                match_id: matchId,
            }
        });

        return NextResponse.json({ id: session.id, url: session.url });

    } catch (err) {
        const error = err as Error;
        console.error("Stripe API Error:", error.message);
        return NextResponse.json({ error: `Error creating checkout session: ${error.message}` }, { status: 500 });
    }
}