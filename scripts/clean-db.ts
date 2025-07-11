// To run this script, you must first have a .env file with the following variable set:
// FIREBASE_SERVICE_ACCOUNT_KEY='{...}'
// Then, from your terminal, run `npm run clean:db`

import { config } from 'dotenv';
import * as admin from 'firebase-admin';
import type { CollectionReference } from 'firebase-admin/firestore';

// Load environment variables from .env file
config();

// --- Firebase Admin Initialization ---
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountString) {
    console.error('🔴 ERROR: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set.');
    console.error('Please add your Firebase service account key to the .env file.');
    process.exit(1);
}

try {
    const serviceAccount = JSON.parse(serviceAccountString);
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin SDK initialized successfully.');
    }
} catch (error: any) {
    console.error('🔴 ERROR: Failed to parse or initialize Firebase Admin SDK.');
    console.error('Ensure the FIREBASE_SERVICE_ACCOUNT_KEY in your .env file is a valid JSON object.');
    console.error('Original Error:', error.message);
    process.exit(1);
}

const db = admin.firestore();
const ADMIN_USER_ID = 'jwHiUx2XD3dcl3C0x7mobpkGOYy2';

async function deleteCollection(collectionPath: string, batchSize = 500) {
    const collectionRef = db.collection(collectionPath) as CollectionReference;
    let query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(query: admin.firestore.Query, resolve: (value?: unknown) => void) {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
        console.log(`- Collection ${query.path} is empty or all documents have been deleted.`);
        return resolve();
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    console.log(`- Deleted ${snapshot.size} documents from ${query.path}.`);

    // Recurse on the next process tick, to avoid exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(query, resolve);
    });
}

async function deleteNonAdminUsers() {
    const usersRef = db.collection('users') as CollectionReference;
    const q = usersRef.where('uid', '!=', ADMIN_USER_ID);
    const snapshot = await q.get();

    if (snapshot.empty) {
        console.log('- No non-admin users found in Firestore to delete.');
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`- Deleted ${snapshot.size} non-admin users from Firestore.`);
}

async function main() {
    console.log('🚀 Starting database cleanup...');

    const collectionsToDelete = ['requests', 'trips', 'matches', 'conversations'];
    for (const collectionName of collectionsToDelete) {
        console.log(`\n--- Deleting collection: ${collectionName} ---`);
        await deleteCollection(collectionName);
    }

    console.log('\n--- Deleting non-admin users from Firestore ---');
    await deleteNonAdminUsers();

    console.log('\n\n✅ Database cleanup completed successfully!');
    process.exit(0);
}

main().catch(error => {
    console.error('\n❌ An error occurred during database cleanup:');
    console.error(error);
    process.exit(1);
});
