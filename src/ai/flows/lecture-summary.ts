// This file contains the Genkit flow for summarizing confusing lecture portions based on student feedback.

'use server';

/**
 * @fileOverview Summarizes confusing parts of a lecture based on student feedback.
 *
 * - summarizeLecture - A function that summarizes confusing lecture sections.
 * - LectureSummaryInput - The input type for the summarizeLecture function.
 * - LectureSummaryOutput - The return type for the summarizeLecture function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LectureSummaryInputSchema = z.object({
  lectureContent: z
    .string()
    .describe('The content of the lecture to be summarized.'),
  confusingSections: z
    .string()
    .describe(
      'A description of the sections of the lecture that students found confusing.'
    ),
});
export type LectureSummaryInput = z.infer<typeof LectureSummaryInputSchema>;

const LectureSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the confusing sections.'),
});
export type LectureSummaryOutput = z.infer<typeof LectureSummaryOutputSchema>;

export async function summarizeLecture(input: LectureSummaryInput): Promise<LectureSummaryOutput> {
  return summarizeLectureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'lectureSummaryPrompt',
  input: {schema: LectureSummaryInputSchema},
  output: {schema: LectureSummaryOutputSchema},
  prompt: `You are an AI assistant helping students understand lectures.

  Summarize the following sections of the lecture that students found confusing:

  Lecture Content: {{{lectureContent}}}
  Confusing Sections: {{{confusingSections}}}

  Summary:`,
});

const summarizeLectureFlow = ai.defineFlow(
  {
    name: 'summarizeLectureFlow',
    inputSchema: LectureSummaryInputSchema,
    outputSchema: LectureSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
