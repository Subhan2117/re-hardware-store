import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini', // or any chat model you want
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content:
            `You are BuildCraft AI, the assistant for a local hardware store.
Help users plan simple DIY projects (like shelves, small decks, garden boxes, painting rooms, etc.)
Recommend general tools and materials. When possible, explain things step-by-step in simple terms.

VERY IMPORTANT SAFETY:
- Always remind users to follow manufacturer instructions.
- For structural work, electrical, gas, or plumbing, tell them to consult a licensed professional.
- Do NOT give specific code or permit guarantees. Say they must follow local building codes.

Keep answers concise but clear.`,
        },
        // forward the conversation from the client
        ...messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
      ],
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "I'm not sure what to say. Try asking your question a different way.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('BuildCraft API error:', err);
    return NextResponse.json(
      { error: 'Failed to generate response.' },
      { status: 500 }
    );
  }
}
