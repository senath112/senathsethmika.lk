
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const noticeSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  content: z.string().min(10, { message: 'Content must be at least 10 characters.' }),
});

export async function addNotice(prevState: any, formData: FormData) {
  const validatedFields = noticeSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await addDoc(collection(db, "notices"), {
      ...validatedFields.data,
      createdAt: serverTimestamp(),
    });
    return { message: 'Notice added successfully.' };
  } catch (error) {
    console.error("Error adding notice: ", error);
    return {
        errors: { firestore: ['Failed to add notice to database.'] }
    }
  }
}
