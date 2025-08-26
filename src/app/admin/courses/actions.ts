
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';

const videoObjectSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid YouTube URL.' }),
  description: z.string().optional(),
  thumbnail: z.string().url({ message: 'Please enter a valid image URL.' }).optional(),
});

const courseSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  image: z.string().url({ message: 'Please enter a valid image URL.' }).optional(),
  youtubeVideos: z.array(videoObjectSchema).optional(),
});

const videoSchema = z.object({
  youtubeVideos: z.array(videoObjectSchema).optional(),
});

export async function addCourse(prevState: any, formData: FormData) {
  const videoUrls = formData.getAll('youtubeUrl');
  const videoDescriptions = formData.getAll('youtubeDescription');
  const videoThumbnails = formData.getAll('youtubeThumbnail');

  const youtubeVideos = videoUrls.map((url, index) => ({
    url: String(url),
    description: String(videoDescriptions[index]),
    thumbnail: String(videoThumbnails[index]),
  })).filter(video => video.url);

  const validatedFields = courseSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    image: formData.get('image'),
    youtubeVideos: youtubeVideos.length > 0 ? youtubeVideos : undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const randomImageId = 1;
    await addDoc(collection(db, "courses"), {
      title: validatedFields.data.title,
      description: validatedFields.data.description,
      youtubeVideos: validatedFields.data.youtubeVideos || [],
      image: validatedFields.data.image || `https://picsum.photos/600/400?random=${randomImageId}`,
      aiHint: `science ${validatedFields.data.title.split(' ')[0].toLowerCase()}`
    });
    return { message: 'Course added successfully.' };
  } catch (error) {
    return {
        errors: { firestore: ['Failed to add course to database.'] }
    }
  }
}

export async function updateCourseVideos(courseId: string, videos: { url: string; description: string; thumbnail: string }[]) {
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
