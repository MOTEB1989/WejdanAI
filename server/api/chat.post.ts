/**
 * Chat API Endpoint - WejdanAI
 * POST /api/chat
 *
 * Accepts: { message: string }
 * Returns: { ok: boolean, reply?: string, error?: string }
 */

interface ChatRequest {
  message: string;
}

interface ChatResponse {
  ok: boolean;
  reply?: string;
  error?: string;
}

interface AIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export default defineEventHandler(async (event): Promise<ChatResponse> => {
  // Parse request body
  const body = await readBody<ChatRequest>(event);
  const message = body?.message?.trim();

  // Validate input
  if (!message) {
    return { ok: false, error: "الرسالة فارغة / Empty message" };
  }

  if (message.length > 4000) {
    return { ok: false, error: "الرسالة طويلة جداً / Message too long" };
  }

  // Get AI configuration from environment
  const baseUrl = process.env.AI_BASE_URL;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  // Check configuration
  if (!baseUrl || !apiKey) {
    console.error("AI not configured: Missing AI_BASE_URL or AI_API_KEY");
    return { ok: false, error: "خدمة الذكاء الاصطناعي غير مُعدّة / AI service not configured" };
  }

  try {
    // Make request to AI API
    const response = await $fetch<AIResponse>(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: {
        model,
        messages: [
          {
            role: "system",
            content: `You are WejdanAI, a helpful bilingual assistant (Arabic/English).
- Be concise and practical in your responses
- Respond in the same language as the user's message
- If the user writes in Arabic, respond in Arabic
- If the user writes in English, respond in English
- Be friendly and professional`
          },
          { role: "user", content: message }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }
    });

    // Extract reply from response
    const reply = response?.choices?.[0]?.message?.content ?? "";

    if (!reply) {
      return { ok: false, error: "لم يتم استلام رد / No response received" };
    }

    return { ok: true, reply };

  } catch (error: unknown) {
    // Log error for debugging (server-side only)
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Chat API Error:", errorMessage);

    return {
      ok: false,
      error: "حدث خطأ أثناء معالجة طلبك / An error occurred while processing your request"
    };
  }
});
