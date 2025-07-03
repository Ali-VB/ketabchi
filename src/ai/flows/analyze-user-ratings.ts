// This is an auto-generated file from Firebase Studio.
'use server';

/**
 * @fileOverview Analyzes user ratings and comments for suspicious activity.
 *
 * - analyzeUserRatings - A function that analyzes user ratings and comments.
 * - AnalyzeUserRatingsInput - The input type for the analyzeUserRatings function.
 * - AnalyzeUserRatingsOutput - The return type for the analyzeUserRatings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeUserRatingsInputSchema = z.object({
  userId: z.string().describe('The ID of the user whose ratings are being analyzed.'),
  ratings: z.array(
    z.object({
      rating: z.number().min(1).max(5).describe('The rating given by the user.'),
      comment: z.string().describe('The comment provided by the user.'),
    })
  ).describe('An array of ratings and comments for the user.'),
});
export type AnalyzeUserRatingsInput = z.infer<typeof AnalyzeUserRatingsInputSchema>;

const AnalyzeUserRatingsOutputSchema = z.object({
  isSuspicious: z.boolean().describe('Whether the user activity is deemed suspicious or potentially fraudulent.'),
  reason: z.string().describe('The reason for the suspicious activity, if any.'),
});
export type AnalyzeUserRatingsOutput = z.infer<typeof AnalyzeUserRatingsOutputSchema>;

export async function analyzeUserRatings(input: AnalyzeUserRatingsInput): Promise<AnalyzeUserRatingsOutput> {
  return analyzeUserRatingsFlow(input);
}

const analyzeUserRatingsPrompt = ai.definePrompt({
  name: 'analyzeUserRatingsPrompt',
  input: {schema: AnalyzeUserRatingsInputSchema},
  output: {schema: AnalyzeUserRatingsOutputSchema},
  prompt: `You are an AI assistant specializing in fraud detection. Analyze the user's ratings and comments to determine if there is any suspicious or potentially fraudulent behavior.

  User ID: {{{userId}}}
  Ratings and Comments:
  {{#each ratings}}
  - Rating: {{{this.rating}}}, Comment: {{{this.comment}}}
  {{/each}}

  Determine if the user's activity is suspicious. Suspicious activity includes:
  - Sudden changes in rating patterns
  - Unusually positive or negative ratings without corresponding comments
  - Comments that are inconsistent with the ratings
  - Use of similar comments across multiple ratings
  - Ratings and comments that are indicative of bot activity or fake reviews

  Output a boolean value isSuspicious indicating whether the activity is suspicious or not. If suspicious, provide a detailed reason in the reason field.
  If not suspicious, the reason should be "".
  Be very conservative about flagging activity as suspicious.

  Ensure that the output is valid JSON that matches the output schema.`,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const analyzeUserRatingsFlow = ai.defineFlow(
  {
    name: 'analyzeUserRatingsFlow',
    inputSchema: AnalyzeUserRatingsInputSchema,
    outputSchema: AnalyzeUserRatingsOutputSchema,
  },
  async input => {
    const {output} = await analyzeUserRatingsPrompt(input);
    return output!;
  }
);
