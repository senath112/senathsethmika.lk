
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';

const VIDEO_VIEW_LIMIT = 3;

// This function checks the view count and increments it if the limit is not reached.
export async function checkAndIncrementViewCount(userId: string, courseId: string, videoId: string): Promise<boolean> {
  const viewDocRef = doc(db, 'videoViews', `${userId}_${courseId}_${videoId}`);
  const viewDocSnap = await getDoc(viewDocRef);

  if (viewDocSnap.exists()) {
    const currentViews = viewDocSnap.data().viewCount;
    if (currentViews >= VIDEO_VIEW_LIMIT) {
      return false; // Limit reached
    }
    // Increment view count
    await setDoc(viewDocRef, { viewCount: increment(1) }, { merge: true });
  } else {
    // First view, create the document
    await setDoc(viewDocRef, {
      userId,
      courseId,
      videoId,
      viewCount: 1,
    });
  }
  return true; // Can watch
}


// This function just gets the current view count without incrementing it.
export async function getVideoViewCount(userId: string, courseId: string, videoId: string): Promise<number> {
    const viewDocRef = doc(db, 'videoViews', `${userId}_${courseId}_${videoId}`);
    const viewDocSnap = await getDoc(viewDocRef);

    if (viewDocSnap.exists()) {
        return viewDocSnap.data().viewCount || 0;
    }

    return 0;
}
