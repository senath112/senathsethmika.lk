
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection, doc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { z } from 'zod';
import { format } from 'date-fns';

const videoObjectSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid YouTube URL.' }),
  description: z.string().optional(),
  thumbnail: z.string().url({ message: 'Please enter a valid image URL.' }).optional(),
});

const courseSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  courseFee: z.string().min(1, { message: 'Course fee is required.' }),
  image: z.string().url({ message: 'Please enter a valid image URL.' }).optional(),
  youtubeVideos: z.array(videoObjectSchema).optional(),
});

const videoSchema = z.object({
  youtubeVideos: z.array(videoObjectSchema).optional(),
});

const documentSchema = z.object({
    name: z.string().min(3, { message: 'Document name must be at least 3 characters.' }),
    type: z.string(),
    fileUrl: z.string().url({ message: 'Please enter a valid file URL.' }),
});

const quizQuestionSchema = z.object({
    question: z.string().min(1, 'Question cannot be empty.'),
    options: z.array(z.string().min(1, 'Option cannot be empty.')).min(2, 'Must have at least two options.'),
    correctAnswer: z.string().min(1, 'A correct answer must be selected.')
});

const quizSchema = z.object({
    title: z.string().min(3, 'Quiz title must be at least 3 characters.'),
    questions: z.array(quizQuestionSchema).min(1, 'A quiz must have at least one question.')
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
    courseFee: formData.get('courseFee'),
    image: formData.get('image'),
    youtubeVideos: youtubeVideos.length > 0 ? youtubeVideos : undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await addDoc(collection(db, "courses"), {
      title: validatedFields.data.title,
      description: validatedFields.data.description,
      courseFee: validatedFields.data.courseFee,
      youtubeVideos: validatedFields.data.youtubeVideos || [],
      image: validatedFields.data.image || `https://picsum.photos/600/400`,
      aiHint: `science ${validatedFields.data.title.split(' ')[0].toLowerCase()}`,
      createdAt: serverTimestamp(),
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

export async function addCourseDocument(courseId: string, courseTitle: string, document: { name: string; type: string; fileUrl: string; }) {
    
    let fileUrl = document.fileUrl;
    // If it's a google drive link, transform it for direct download
    if (fileUrl.includes('drive.google.com')) {
        const parts = fileUrl.split('/');
        const fileId = parts[parts.indexOf('d') + 1];
        if(fileId) {
             fileUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
    }

    const validatedFields = documentSchema.safeParse({
        ...document,
        fileUrl,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await addDoc(collection(db, "documents"), {
            ...validatedFields.data,
            courseId,
            courseTitle,
            date: format(new Date(), 'yyyy-MM-dd'),
        });
        return { message: 'Document added successfully.' };
    } catch (error) {
        console.error("Error adding document: ", error);
        return {
            errors: { firestore: ['Failed to add document to database.'] }
        }
    }
}

export async function addQuiz(courseId: string, quizData: any) {
    const validatedFields = quizSchema.safeParse(quizData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await addDoc(collection(db, 'courses', courseId, 'quizzes'), validatedFields.data);
        return { message: 'Quiz added successfully.' };
    } catch (error) {
        console.error("Error adding quiz: ", error);
        return {
             errors: { firestore: ['Failed to add quiz to database.'] }
        }
    }
}

export async function deleteCourse(courseId: string) {
  try {
    await deleteDoc(doc(db, "courses", courseId));
    return { message: 'Course deleted successfully.' };
  } catch (error) {
    console.error("Error deleting course: ", error);
    return {
      errors: { firestore: ['Failed to delete course from database.'] }
    }
  }
}
