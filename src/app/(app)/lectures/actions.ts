"use server";

import { z } from "zod";
import { summarizeLecture } from "@/ai/flows/lecture-summary";

const summarySchema = z.object({
  lectureContent: z.string().min(10, { message: "Lecture content is too short." }),
  confusingSections: z.string().min(10, { message: "Description of confusing sections is too short." }),
});

export async function getLectureSummary(prevState: any, formData: FormData) {
  const validatedFields = summarySchema.safeParse({
    lectureContent: formData.get('lectureContent'),
    confusingSections: formData.get('confusingSections'),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
      summary: null,
    };
  }

  try {
    const result = await summarizeLecture(validatedFields.data);
    return {
      message: "Summary generated successfully.",
      errors: null,
      summary: result.summary,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "An unexpected error occurred.",
      errors: null,
      summary: null,
    };
  }
}
