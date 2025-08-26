
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function handleEnrollmentRequest(requestId: string, status: 'approved' | 'rejected') {
  try {
    const requestRef = doc(db, 'enrollmentRequests', requestId);
    await updateDoc(requestRef, { status });
  } catch (error) {
    console.error('Error updating enrollment status: ', error);
    throw new Error('Failed to update enrollment status.');
  }
}
