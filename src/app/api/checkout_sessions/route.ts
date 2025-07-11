import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in the environment variables.');
}

// Make sure to add your STRIPE_SECRET_KEY to your .env.local file
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
    try {
        const { amount, customerEmail, matchId, bookTitles } = await req.json();

        // Basic validation
        if (!amount || !customerEmail || !matchId || !bookTitles) {
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
            customer_email: customerEmail,
            success_url: `${req.headers.get('origin')}/dashboard/matches?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/dashboard/matches?status=cancelled`,
            metadata: {
                match_id: matchId,
            }
        });

        return NextResponse.json({ id: session.id });

    } catch (err) {
        const error = err as Error;
        console.error("Stripe API Error:", error.message);
        return NextResponse.json({ error: `Error creating checkout session: ${error.message}` }, { status: 500 });
    }
}
