import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { checkinData, imageBase64 } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build check-in text
    const answersText = Array.isArray(checkinData) && checkinData.length > 0
      ? checkinData.map((a: any) => `Q: ${a.question}\nA: ${a.answer}`).join("\n\n")
      : "No check-in data available.";

    // Build user content with optional image
    const userContent: any[] = [
      {
        type: "text",
        text: `Here are the user's emotional check-in responses:\n\n${answersText}\n\nAnalyze these responses along with the user's facial expression (if provided) to generate a comprehensive personalized trading psychology report. For each of the 5 sections, provide a score (0-100), detailed insight, and actionable recommendation.`,
      },
    ];

    if (imageBase64) {
      const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
      const mimeMatch = imageBase64.match(/data:(image\/\w+);/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${base64Data}` },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are MindFi, an AI emotional intelligence analyst for crypto traders. You analyze emotional check-in responses and facial expressions to provide personalized trading psychology assessments.

You MUST respond using the provided tool to return structured report data.

For each section, provide:
- A score from 0-100 based on the user's responses
- A detailed, personalized insight referencing their specific answers
- An actionable recommendation

Be empathetic, specific, and data-driven. Reference the user's actual answers in your insights.`,
          },
          {
            role: "user",
            content: userContent,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_report",
              description: "Generate a structured trading psychology report with 5 scored sections.",
              parameters: {
                type: "object",
                properties: {
                  sections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: {
                          type: "string",
                          enum: ["Emotional Stability", "FOMO Resistance", "Risk Tolerance Alignment", "Decision Quality", "Stress Recovery"],
                        },
                        score: {
                          type: "number",
                          description: "Score from 0-100 based on analysis",
                        },
                        insight: {
                          type: "string",
                          description: "Detailed personalized insight in markdown format, referencing the user's specific answers and facial expression",
                        },
                        recommendation: {
                          type: "string",
                          description: "Actionable recommendation in markdown format",
                        },
                      },
                      required: ["title", "score", "insight", "recommendation"],
                      additionalProperties: false,
                    },
                    description: "Exactly 5 report sections in order: Emotional Stability, FOMO Resistance, Risk Tolerance Alignment, Decision Quality, Stress Recovery",
                  },
                  overallSummary: {
                    type: "string",
                    description: "A brief 2-3 sentence overall assessment of the trader's psychological state",
                  },
                },
                required: ["sections", "overallSummary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_report" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No tool call response from AI");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
