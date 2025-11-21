import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
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

    const formattedMessages = messages.map((m) => {
      if (typeof m.content === "string") {
        return {
          role: m.role,
          content: [
            { type: 'text', text: m.content}
          ]
        };
      }

      if (Array.isArray(m.content)) {
        return {
          role: m.role,
          content: m.content
        };
      }

      return {
        role: m.role,
        content: [{ type: "text", text: String(m.content) }]
      }
    });

    const completion = await openai.chat.completions.create({
      model: "Qwen/Qwen2.5-VL-7B-Instruct:hyperbolic", // or any chat model you want
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
        ...formattedMessages,
      ],
    });

    const reply =
      completion?.choices[0]?.message?.content || {
        role: "assistant",
        content: [{ type: "text", text: "I'm not sure what to say. Try asking your question a different way." }]
      }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('BuildCraft API error:', err);
    return NextResponse.json(
      { error: 'Failed to generate response.' },
      { status: 500 }
    );
  }
}
