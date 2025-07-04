import { NextResponse } from "next/server";
import { chatCompletionWithRetry } from "@/lib/openai";

// NOTE: the OpenAI client and retry logic now live in `~/lib/openai.ts`.

const systemPrompt = `You are an expert at creating educational multiple-choice questions. Given some study material and a difficulty level:
1. Generate the requested number of questions that truly test understanding.
2. Each question must have exactly 4 options with one correct answer.
3. Provide a VERY SHORT explanation (max 20 words) that clarifies **why** the correct answer is correct. This will be shown only if the learner gets the question wrong, so keep it concise and helpful.

Return your output as JSON using the schema provided.`;

export async function POST(request: Request) {
  try {
    const { text, difficulty, count } = await request.json();

    const completion = await chatCompletionWithRetry({
      model: "gpt-4.1-mini-2025-04-14",
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
                    explanation: { type: "string" },
                  },
                  required: ["text", "options", "correctAnswer", "explanation"],
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
