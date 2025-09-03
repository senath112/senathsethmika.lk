
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function requestEnrollment(courseId: string, studentId: string, studentName: string) {
  try {
    await addDoc(collection(db, 'enrollmentRequests'), {
      courseId,
      studentId,
      studentName,
      status: 'pending',
      requestedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error requesting enrollment: ", error);
    throw new Error('Failed to request enrollment.');
  }
}
