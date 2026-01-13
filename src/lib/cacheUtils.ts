import { db } from './firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

/**
 * Generic Cache Retriever with TTL
 * @param key Document ID
 * @param ttlHours Time to live in hours (default 24)
 */
export const getSmartCache = async (key: string, ttlHours: number = 24) => {
    try {
        const docRef = doc(db, 'daily_content_v2', key);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // Validation: Check if exists and has timestamp
            if (!data.updatedAt) return null;

            const now = new Date();
            const cacheTime = data.updatedAt.toDate(); // Firestore Timestamp to JS Date
            const diffHours = (now.getTime() - cacheTime.getTime()) / (1000 * 60 * 60);

            if (diffHours < ttlHours) {
                console.log(`[CACHE HIT] ${key} is fresh (${diffHours.toFixed(2)}h old / limit ${ttlHours}h)`);
                return data.items;
            } else {
                console.log(`[CACHE MISS] ${key} expired (${diffHours.toFixed(2)}h old)`);
                return null;
            }
        }
        console.log(`[CACHE MISS] ${key} not found`);
        return null;
    } catch (error) {
        console.warn(`[CACHE ERROR] Read failed for ${key}:`, error);
        return null;
    }
};

/**
 * Generic Cache Saver
 */
export const setSmartCache = async (key: string, items: any[]) => {
    try {
        const docRef = doc(db, 'daily_content_v2', key);

        await setDoc(docRef, {
            updatedAt: Timestamp.now(),
            date: new Date().toISOString().split('T')[0], // Keep for reference
            items: items
        });
        console.log(`[CACHE SAVE] ${key} updated at ${new Date().toISOString()}`);
    } catch (error) {
        console.warn(`[CACHE ERROR] Write failed for ${key}:`, error);
    }
};

// --- Legacy Wrappers for backward compat if needed, but we will migrate ---
export const getDailyCache = (key: string) => getSmartCache(key, 24);
export const setDailyCache = setSmartCache;
