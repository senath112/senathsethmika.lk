
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

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

const AskQuestionSchema = z.object({
    question: z.string().min(10, "Your question must be at least 10 characters long."),
    courseId: z.string(),
    studentId: z.string(),
    studentName: z.string(),
});

export async function askQuestion(data: z.infer<typeof AskQuestionSchema>) {
    const validatedData = AskQuestionSchema.parse(data);

    try {
        await addDoc(collection(db, 'questions'), {
            ...validatedData,
            createdAt: serverTimestamp(),
            answered: false,
        });
        return { success: true };
    } catch (error) {
        console.error("Error asking question:", error);
        return { success: false, error: "Failed to submit your question." };
    }
}
