// To run this script, you must first have a .env file with the following variable set:
// FIREBASE_SERVICE_ACCOUNT_KEY='{...}'
// Then, from your terminal, run `npm run clean:db`

import { config } from 'dotenv';
config(); // Load environment variables from .env file

import { initializeAdminApp, adminDb } from '../src/lib/firebase/admin-config';
import type { CollectionReference } from 'firebase-admin/firestore';

const ADMIN_USER_ID = 'jwHiUx2XD3dcl3C0x7mobpkGOYy2';

async function deleteCollection(collectionPath: string) {
    if (!adminDb) {
        throw new Error("Admin DB not initialized.");
    }
    const collectionRef = adminDb.collection(collectionPath) as CollectionReference;
    const snapshot = await collectionRef.limit(500).get();

    if (snapshot.empty) {
        console.log(`Collection ${collectionPath} is already empty.`);
        return;
    }

    const batch = adminDb.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${snapshot.size} documents from ${collectionPath}.`);

    // Recurse if there are more documents to delete
    if (snapshot.size > 0) {
        await deleteCollection(collectionPath);
    }
}


async function deleteNonAdminUsers() {
     if (!adminDb) {
        throw new Error("Admin DB not initialized.");
    }
    const usersRef = adminDb.collection('users') as CollectionReference;
    const q = usersRef.where('uid', '!=', ADMIN_USER_ID);
    const snapshot = await q.get();
    
    if (snapshot.empty) {
        console.log('No non-admin users found in Firestore to delete.');
        return;
    }

    const batch = adminDb.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Deleted ${snapshot.size} non-admin users from Firestore.`);
}


async function main() {
    console.log('Starting database cleanup...');
    
    // This function will initialize the admin app using the service account key from .env
    initializeAdminApp(); 

    if (!adminDb) {
        console.error('Failed to initialize Firebase Admin. Make sure your FIREBASE_SERVICE_ACCOUNT_KEY is set in your .env file.');
        process.exit(1);
    }

    try {
        const collectionsToDelete = ['requests', 'trips', 'matches', 'conversations'];
        for (const collectionName of collectionsToDelete) {
            console.log(`\n--- Deleting collection: ${collectionName} ---`);
            await deleteCollection(collectionName);
        }

        console.log('\n--- Deleting non-admin users from Firestore ---');
        await deleteNonAdminUsers();
        
        console.log('\nDatabase cleanup completed successfully!');
    } catch (error) {
        console.error('\nError during database cleanup:', error);
        process.exit(1);
    }
}

main();
