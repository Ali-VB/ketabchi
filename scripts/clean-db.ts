// This is a script to clean the Firestore database.
// It will delete all documents from the 'requests', 'trips', and 'matches' collections.
// It will also delete all users from the 'users' collection except for the admin user.
// To run this script, use the command: npm run clean:db

import 'dotenv/config';
import { collection, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { db } from '../src/lib/firebase/config';

const ADMIN_USER_ID = 'jwHiUx2XD3dcl3C0x7mobpkGOYy2';

async function deleteCollection(collectionPath: string) {
    const collectionRef = collection(db, collectionPath);
    const snapshot = await getDocs(collectionRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Successfully deleted all documents from ${collectionPath}.`);
}

async function deleteNonAdminUsers() {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '!=', ADMIN_USER_ID));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        console.log('No non-admin users to delete.');
        return;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Successfully deleted ${snapshot.size} non-admin users.`);
}


async function cleanDatabase() {
    console.log('Starting database cleanup...');

    try {
        await deleteCollection('requests');
        await deleteCollection('trips');
        await deleteCollection('matches');
        // This collection does not exist in the new structure, but leaving it here to be safe
        // in case old data exists.
        try {
            await deleteCollection('conversations');
        } catch (e) {
            console.log('`conversations` collection not found, skipping.');
        }

        await deleteNonAdminUsers();

        console.log('Database cleanup completed successfully!');
    } catch (error) {
        console.error('Error during database cleanup:', error);
    }
}

cleanDatabase().then(() => {
    process.exit(0);
}).catch(() => {
    process.exit(1);
});
