import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn("STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.");
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
}) : null;

export async function POST(req: NextRequest) {
    if (!stripe) {
        return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 });
    }

    try {
        const { session_id } = await req.json();

        if (!session_id) {
            return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if ((session.payment_status === 'paid' || session.status === 'complete') && session.metadata?.match_id) {
            const matchRef = doc(db, 'matches', session.metadata.match_id);
            await updateDoc(matchRef, {
                status: 'active',
                paymentStatus: 'held',
                stripeCheckoutId: session.id,
                updatedAt: serverTimestamp(),
            });

            return NextResponse.json({ success: true, matchId: session.metadata.match_id });
        } else {
             return NextResponse.json({ success: false, message: 'Payment not successful or match ID missing.' }, { status: 400 });
        }

    } catch (err) {
        const error = err as Error;
        console.error("Stripe session verification error:", error.message);
        return NextResponse.json({ error: `Error verifying session: ${error.message}` }, { status: 500 });
    }
}
