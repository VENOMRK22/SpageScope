import { db } from './firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

/**
 * Checks if we have cached data for today.
 * @param key The document ID (e.g., 'apod', 'epic')
 * @returns The cached data if it exists and is from today (UTC), otherwise null.
 */
export const getDailyCache = async (key: string) => {
    try {
        const docRef = doc(db, 'daily_content', key);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            // If the cached data's date matches today, return it
            if (data.date === today) {
                console.log(`[CACHE] Hit for ${key}`);
                return data.items;
            }
        }
        console.log(`[CACHE] Miss for ${key} (Expired or Missing)`);
        return null; // Expired or doesn't exist
    } catch (error) {
        console.warn(`[CACHE] Read Error for ${key}:`, error);
        return null;
    }
};

/**
 * Saves data to the cache with today's date.
 * @param key The document ID (e.g., 'apod', 'epic')
 * @param items The data array to save
 */
export const setDailyCache = async (key: string, items: any[]) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const docRef = doc(db, 'daily_content', key);

        await setDoc(docRef, {
            date: today,
            updatedAt: Timestamp.now(),
            items: items
        });
        console.log(`[CACHE] Saved ${key} for ${today}`);
    } catch (error) {
        console.warn(`[CACHE] Write Error for ${key}:`, error);
    }
};
