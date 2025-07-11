// This is a secure API route for cleaning the database.
// It should only be accessible to administrators.

import { NextResponse, NextRequest } from 'next/server';
import { collection, getDocs, writeBatch, query, where, CollectionReference } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { adminDb, initializeAdminApp } from '@/lib/firebase/admin-config';

const ADMIN_USER_ID = 'jwHiUx2XD3dcl3C0x7mobpkGOYy2';

async function deleteCollection(collectionPath: string, batch: FirebaseFirestore.WriteBatch) {
    const collectionRef = adminDb.collection(collectionPath) as CollectionReference;
    const snapshot = await collectionRef.get();
    
    if (snapshot.empty) {
        console.log(`Collection ${collectionPath} is already empty.`);
        return;
    }

    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    console.log(`Batched deletion for ${snapshot.size} documents in ${collectionPath}.`);
}

async function deleteNonAdminUsers(batch: FirebaseFirestore.WriteBatch) {
    const usersRef = adminDb.collection('users') as CollectionReference;
    const q = usersRef.where('uid', '!=', ADMIN_USER_ID);
    const snapshot = await q.get();
    
    if (snapshot.empty) {
        console.log('No non-admin users to delete.');
        return;
    }

    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    console.log(`Batched deletion for ${snapshot.size} non-admin users from Firestore.`);
}

export async function POST(req: NextRequest) {
    initializeAdminApp();
    const auth = getAuth();

    try {
        const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
        if (!idToken) {
            return NextResponse.json({ error: 'Authorization token not provided.' }, { status: 401 });
        }

        const decodedToken = await auth.verifyIdToken(idToken);
        if (decodedToken.uid !== ADMIN_USER_ID) {
            return NextResponse.json({ error: 'Unauthorized user.' }, { status: 403 });
        }
    
        console.log('Starting database cleanup via API route...');
        const batch = adminDb.batch();

        await deleteCollection('requests', batch);
        await deleteCollection('trips', batch);
        await deleteCollection('matches', batch);
        
        try {
            // This collection might not exist in all versions, so handle potential errors.
            await deleteCollection('conversations', batch);
        } catch (e) {
            console.log('`conversations` collection not found, skipping.');
        }

        await deleteNonAdminUsers(batch);
        
        await batch.commit();

        console.log('Database cleanup completed successfully!');
        return NextResponse.json({ message: 'Database cleaned successfully.' }, { status: 200 });
    } catch (error: any) {
        console.error('Error during database cleanup:', error);
        
        if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
            return NextResponse.json({ error: 'Invalid or expired authorization token.' }, { status: 401 });
        }

        return NextResponse.json({ error: 'Failed to clean database.' }, { status: 500 });
    }
}
