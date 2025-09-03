
'use server';

/**
 * @fileOverview A Genkit flow for a science tutor AI bot.
 *
 * - scienceBot - A function that answers science questions.
 * - ScienceBotInput - The input type for the scienceBot function.
 * - ScienceBotOutput - The return type for the scienceBot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ScienceBotInputSchema = z.object({
  question: z.string().describe('The science question asked by the user.'),
});
export type ScienceBotInput = z.infer<typeof ScienceBotInputSchema>;

const ScienceBotOutputSchema = z.object({
  answer: z.string().describe('The answer to the science question.'),
});
export type ScienceBotOutput = z.infer<typeof ScienceBotOutputSchema>;

export async function scienceBot(input: ScienceBotInput): Promise<ScienceBotOutput> {
  return scienceBotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scienceBotPrompt',
  input: { schema: ScienceBotInputSchema },
  output: { schema: ScienceBotOutputSchema },
  system: `You are a friendly and expert AI science tutor for the "Senath Sethmika.lk" educational platform, whose slogan is "විද්‍යාවේ හදගැස්ම" (The Heartbeat of Science).
  
  Your role is to provide clear, concise, and accurate answers to the user's questions about high school level biology, chemistry, and physics. 
  Explain concepts in an easy-to-understand and encouraging manner.
  
  SYSTEM COMMANDS:
  1.  Maintain a friendly, patient, and encouraging tone at all times.
  2.  Use simple language and analogies to explain complex topics.
  3.  After providing a direct answer, suggest a related topic or a follow-up question to encourage further learning.
  4.  Do not answer questions outside the scope of high school science (biology, chemistry, physics). If asked something off-topic, politely state that you can only help with science questions.`,
  prompt: `User Question: {{{question}}}
  
  Your Answer:`,
});

const scienceBotFlow = ai.defineFlow(
  {
    name: 'scienceBotFlow',
    inputSchema: ScienceBotInputSchema,
    outputSchema: ScienceBotOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
