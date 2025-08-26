
'use server';

import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { z } from 'zod';

const StudentDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  major: z.string(),
});

export async function saveStudentDetails(details: z.infer<typeof StudentDetailsSchema>) {
  const validatedDetails = StudentDetailsSchema.parse(details);
  await setDoc(doc(db, "students", validatedDetails.id), {
    name: validatedDetails.name,
    major: validatedDetails.major,
  }, { merge: true });
}
