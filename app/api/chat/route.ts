import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  UIMessage,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { validateMember, checkAvailability, reserveBook } from './tools';
import { db } from '../../../lib/prisma';
 
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
 
export async function POST(req: Request) {
  try {
    const body = (await req.json() as { messages?: UIMessage[] });

    if (!Array.isArray(body.messages)) {
      return Response.json({ error: "The request must include a messages array." }, { status: 400 });
    }

    const result = streamText({
      model: openai("gpt-4o-mini"), // or your preferred model
      system: `You are an official digital assistant for the NSW Library network. 
Your goal is to help users search for books, check their membership status, and place reservations.

Follow this strict catalogue workflow:
1. Always validate the member's email or library card first using 'validateMember' before proceeding with reservations.
2. Search the catalogue using 'checkBookAvailability' to confirm the book exists and is available.
3. Once availability is confirmed and the user is validated, execute 'reserveBook' to finalize the hold request.
Maintain a polite, professional, and helpful tone matching public library services.`,
  
      messages: await convertToModelMessages(body.messages),
      tools: { 
        validateMember,
        checkAvailability,
        reserveBook,
      },
      stopWhen: stepCountIs(5),
    });

    // Directly convert the stream result into an HTTP Response
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
