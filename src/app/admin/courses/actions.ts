
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';

const videoObjectSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid YouTube URL.' }),
  description: z.string().optional(),
});

const courseSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  youtubeVideos: z.array(videoObjectSchema).optional(),
});

const videoSchema = z.object({
  youtubeVideos: z.array(videoObjectSchema).optional(),
});

export async function addCourse(prevState: any, formData: FormData) {
  const videoUrls = formData.getAll('youtubeUrl');
  const videoDescriptions = formData.getAll('youtubeDescription');

  const youtubeVideos = videoUrls.map((url, index) => ({
    url: String(url),
    description: String(videoDescriptions[index]),
  })).filter(video => video.url);

  const validatedFields = courseSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    youtubeVideos: youtubeVideos.length > 0 ? youtubeVideos : undefined,
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
      youtubeVideos: validatedFields.data.youtubeVideos || [],
      image: `https://picsum.photos/600/400?random=${randomImageId}`,
      aiHint: `science ${validatedFields.data.title.split(' ')[0].toLowerCase()}`
    });
    return { message: 'Course added successfully.' };
  } catch (error) {
    return {
        errors: { firestore: ['Failed to add course to database.'] }
    }
  }
}

export async function updateCourseVideos(courseId: string, videos: { url: string; description: string }[]) {
  const youtubeVideos = videos.filter(video => video.url);

  const validatedFields = videoSchema.safeParse({
    youtubeVideos: youtubeVideos.length > 0 ? youtubeVideos : undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, {
      youtubeVideos: validatedFields.data.youtubeVideos || []
    });
    return { message: 'Course videos updated successfully.' };
  } catch (error) {
     return {
        errors: { firestore: ['Failed to update course videos.'] }
    }
  }
}
