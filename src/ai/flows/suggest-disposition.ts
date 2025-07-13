'use server';

/**
 * @fileOverview An AI agent that suggests the most appropriate sub-disposition based on user remarks and historical data.
 *
 * - suggestDisposition - A function that handles the sub-disposition suggestion process.
 * - SuggestDispositionInput - The input type for the suggestDisposition function.
 * - SuggestDispositionOutput - The return type for the suggestDisposition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDispositionInputSchema = z.object({
  remarks: z
    .string()
    .describe('The remarks or notes taken during the call with the lead.'),
  historicalData: z
    .string()
    .describe(
      'Historical data of previous call dispositions and sub-dispositions for similar leads.'
    ),
});
export type SuggestDispositionInput = z.infer<typeof SuggestDispositionInputSchema>;

const SuggestDispositionOutputSchema = z.object({
  suggestedSubDisposition: z
    .string()
    .describe(
      'The AI-suggested sub-disposition based on the remarks and historical data.'
    ),
  confidenceScore: z
    .number()
    .describe(
      'A numerical score (0-1) indicating the AI confidence in the suggested sub-disposition.'
    ),
});
export type SuggestDispositionOutput = z.infer<typeof SuggestDispositionOutputSchema>;

export async function suggestDisposition(
  input: SuggestDispositionInput
): Promise<SuggestDispositionOutput> {
  return suggestDispositionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDispositionPrompt',
  input: {schema: SuggestDispositionInputSchema},
  output: {schema: SuggestDispositionOutputSchema},
  prompt: `You are an AI assistant that suggests the most appropriate sub-disposition for a lead, given the remarks from the call and historical data.

  Analyze the following information to determine the best sub-disposition:

  Remarks: {{{remarks}}}
  Historical Data: {{{historicalData}}}

  Consider the remarks and historical data to suggest the most relevant sub-disposition. Provide a confidence score (0-1) indicating how sure you are of the suggestion.
  `,
});

const suggestDispositionFlow = ai.defineFlow(
  {
    name: 'suggestDispositionFlow',
    inputSchema: SuggestDispositionInputSchema,
    outputSchema: SuggestDispositionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
