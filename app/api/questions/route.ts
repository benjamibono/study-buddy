import OpenAI from "openai";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You are an expert at creating educational multiple-choice questions. 
Given some study material and a difficulty level, generate questions that test understanding.
Each question should have 4 options with exactly one correct answer.
Format your response as a JSON array of objects with the following structure:
{
  "text": "question text",
  "options": ["option A", "option B", "option C", "option D"],
  "correctAnswer": 0 // index of correct option (0-3)
}`;

async function createCompletionWithRetry(params: any, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await openai.chat.completions.create(params);
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.warn(`Attempt ${attempt} failed. Retrying...`);
    }
  }
}

export async function POST(request: Request) {
  try {
    const { text, difficulty, count } = await request.json();

    const completion = await createCompletionWithRetry({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate ${count} ${difficulty} difficulty questions about:\n\n${text}`,
        },
      ],
      temperature: 0.7,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "questions_schema",
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string" },
                    options: {
                      type: "array",
                      items: { type: "string" },
                    },
                    correctAnswer: { type: "integer" },
                  },
                  required: ["text", "options", "correctAnswer"],
                  additionalProperties: false,
                },
              },
            },
            required: ["questions"],
            additionalProperties: false,
          },
        },
      },
      store: true,
    });

    if (!completion) {
      throw new Error("No completion returned from OpenAI");
    }
    const responseContent = completion.choices[0]?.message?.content || "{}";
    console.log("OpenAI response:", responseContent);

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseContent);
    } catch (error) {
      throw new Error("Respuesta no es un JSON válido");
    }

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error procesando la respuesta de OpenAI:", error);
    return NextResponse.json(
      { error: "Respuesta inválida de OpenAI" },
      { status: 500 }
    );
  }
}
