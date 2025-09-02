
'use server';

import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { z } from 'zod';

const StudentDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  major: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

export async function saveStudentDetails(details: z.infer<typeof StudentDetailsSchema>) {
  const validatedDetails = StudentDetailsSchema.parse(details);
  
  const dataToSave: any = {
    name: validatedDetails.name,
    major: validatedDetails.major,
  };

  if (validatedDetails.location) {
    dataToSave.location = validatedDetails.location;
  }

  await setDoc(doc(db, "students", validatedDetails.id), dataToSave, { merge: true });
}
