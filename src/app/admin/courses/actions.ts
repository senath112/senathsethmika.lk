
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';

const courseSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  youtubeUrls: z.array(z.string().url({ message: 'Please enter a valid YouTube URL.' })).optional(),
});

const videoSchema = z.object({
  youtubeUrls: z.array(z.string().url({ message: 'Please enter a valid YouTube URL.' })).optional(),
});

export async function addCourse(prevState: any, formData: FormData) {
  const youtubeUrlsRaw = formData.get('youtubeUrls') as string;
  const youtubeUrls = youtubeUrlsRaw.split('\n').map(url => url.trim()).filter(url => url);

  const validatedFields = courseSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    youtubeUrls: youtubeUrls.length > 0 ? youtubeUrls : undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const randomImageId = Math.floor(Math.random() * 1000);
    await addDoc(collection(db, "courses"), {
      title: validatedFields.data.title,
      description: validatedFields.data.description,
      youtubeUrls: validatedFields.data.youtubeUrls || [],
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

export async function updateCourseVideos(courseId: string, youtubeUrlsRaw: string) {
  const youtubeUrls = youtubeUrlsRaw.split('\n').map(url => url.trim()).filter(url => url);

  const validatedFields = videoSchema.safeParse({
    youtubeUrls: youtubeUrls.length > 0 ? youtubeUrls : undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, {
      youtubeUrls: validatedFields.data.youtubeUrls || []
    });
    return { message: 'Course videos updated successfully.' };
  } catch (error) {
     return {
        errors: { firestore: 'Failed to update course videos.' }
    }
  }
}
