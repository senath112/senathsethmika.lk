
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection, writeBatch, doc } from 'firebase/firestore';
import { z } from 'zod';

const marksEntrySchema = z.object({
  studentId: z.string().min(1, 'Student is required.'),
  marks: z.coerce.number().min(0, 'Marks cannot be negative.').max(100, 'Marks cannot exceed 100.'),
});

const formSchema = z.object({
  courseId: z.string().min(1, 'Please select a course.'),
  examTitle: z.string().min(3, 'Exam title must be at least 3 characters.'),
  entries: z.array(marksEntrySchema).min(1, 'Please add at least one student entry.'),
});


export async function uploadMainExamMarks(values: z.infer<typeof formSchema>) {
    const validatedData = formSchema.parse(values);

    try {
        const batch = writeBatch(db);
        const resultsCollection = collection(db, 'quizResults');

        validatedData.entries.forEach(entry => {
            const docRef = doc(resultsCollection); // Creates a new doc reference
            batch.set(docRef, {
                studentId: entry.studentId,
                quizTitle: validatedData.examTitle,
                courseId: validatedData.courseId,
                category: 'Main Exam',
                score: entry.marks,
                totalQuestions: 100,
                percentage: entry.marks,
                submittedAt: new Date(),
            });
        });

        await batch.commit();
        return { success: true, message: 'Marks uploaded successfully.' };
    } catch (error) {
        console.error('Error uploading main exam marks:', error);
        return { success: false, error: 'Failed to upload marks.' };
    }
}

