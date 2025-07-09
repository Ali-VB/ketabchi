'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating weekly platform usage reports.
 *
 * - generatePlatformReport - A function that generates a weekly platform usage report.
 * - GeneratePlatformReportInput - The input type for the generatePlatformReport function.
 * - GeneratePlatformReportOutput - The return type for the generatePlatformReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getStatsForDateRange } from '@/lib/firebase/firestore';

const GeneratePlatformReportInputSchema = z.object({
  startDate: z.string().describe('The start date for the weekly report (YYYY-MM-DD).'),
  endDate: z.string().describe('The end date for the weekly report (YYYY-MM-DD).'),
});
export type GeneratePlatformReportInput = z.infer<typeof GeneratePlatformReportInputSchema>;

const PromptInputSchema = GeneratePlatformReportInputSchema.extend({
    newRequests: z.number(),
    newTrips: z.number(),
    completedMatches: z.number(),
})

const GeneratePlatformReportOutputSchema = z.object({
  report: z.string().describe('The generated weekly platform usage report.'),
});
export type GeneratePlatformReportOutput = z.infer<typeof GeneratePlatformReportOutputSchema>;

export async function generatePlatformReport(input: GeneratePlatformReportInput): Promise<GeneratePlatformReportOutput> {
  return generatePlatformReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePlatformReportPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: GeneratePlatformReportOutputSchema},
  prompt: `You are a data analyst tasked with generating a weekly platform usage report for a P2P book delivery service called Ketabchi.

Use the following data to generate your report:
- Total number of new book requests: {{newRequests}}
- Total number of new trips announced: {{newTrips}}
- Number of successful book deliveries (completed matches): {{completedMatches}}

Based on this data, generate a summary for the period from {{startDate}} to {{endDate}}.
Highlight any interesting trends, successes, or potential areas for improvement. For instance, if there are many requests but few trips, you could mention that. If many deliveries were successful, highlight it as a success story.

Format the report in a clear and concise manner, suitable for presentation to platform administrators. Start with a title.
Weekly Platform Usage Report ({{startDate}} - {{endDate}})
`,config: {
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

const generatePlatformReportFlow = ai.defineFlow(
  {
    name: 'generatePlatformReportFlow',
    inputSchema: GeneratePlatformReportInputSchema,
    outputSchema: GeneratePlatformReportOutputSchema,
  },
  async input => {
    const stats = await getStatsForDateRange(input.startDate, input.endDate);
    const {output} = await prompt({
        ...input,
        ...stats,
    });
    return output!;
  }
);
