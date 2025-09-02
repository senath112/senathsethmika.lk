
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection, getDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';

export async function handleEnrollmentRequest(requestId: string, status: 'approved' | 'rejected') {
  try {
    const requestRef = doc(db, 'enrollmentRequests', requestId);
    
    if (status === 'approved') {
        const requestSnap = await getDoc(requestRef);
        if(requestSnap.exists()){
            const requestData = requestSnap.data();
            const courseRef = doc(db, 'courses', requestData.courseId);
            const courseSnap = await getDoc(courseRef);

            if(courseSnap.exists()){
                const courseData = courseSnap.data();
                 // Generate a payment record
                await addDoc(collection(db, 'payments'), {
                    studentId: requestData.studentId,
                    courseId: requestData.courseId,
                    course: courseData.title,
                    amount: 'LKR 5000.00', // Placeholder amount
                    status: 'Paid',
                    date: format(new Date(), 'yyyy-MM-dd'),
                    invoice: `INV-${Date.now().toString().slice(-6)}`,
                    paidAt: serverTimestamp()
                });
            }
        }
    }
    
    await updateDoc(requestRef, { status });

  } catch (error) {
    console.error('Error updating enrollment status: ', error);
    throw new Error('Failed to update enrollment status.');
  }
}
