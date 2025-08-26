
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { z } from 'zod';

const courseSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  youtubeUrl: z.string().url({ message: 'Please enter a valid YouTube URL.' }).optional().or(z.literal('')),
});

export async function addCourse(prevState: any, formData: FormData) {
  const validatedFields = courseSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    youtubeUrl: formData.get('youtubeUrl'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const randomImageId = Math.floor(Math.random() * 1000);
    await addDoc(collection(db, "courses"), {
      ...validatedFields.data,
      image: `https://picsum.photos/600/400?random=${randomImageId}`,
      aiHint: `science ${validatedFields.data.title.split(' ')[0].toLowerCase()}`
    });
    return { message: 'Course added successfully.' };
  } catch (error) {
    return {
        errors: { firestore: 'Failed to add course to database.' }
    }
  }
}
