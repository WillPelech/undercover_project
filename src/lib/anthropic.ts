import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

/**
 * Drafts an email with Claude. Returns null (never throws) if no API key is
 * configured or the call fails, so callers can fall back to the static
 * template in src/lib/email-templates.ts — email drafting should never be a
 * hard dependency on the AI call succeeding.
 */
export async function draftEmailWithAI(
  prompt: string
): Promise<{ subject: string; body: string } | null> {
  const anthropic = getClient();
  if (!anthropic) return null;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 700,
      system:
        'You write short, structured production-coordination emails in the style of a video production company\'s internal playbook: clear asks, predictable next steps, no fluff, never overpromising. Respond ONLY with valid JSON of the shape {"subject": string, "body": string}. The body should use "[Name]" and "[Your Name]" placeholders exactly like a template, and should not invent specific facts (dates, people, numbers) beyond what is given in the prompt.',
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    const parsed = JSON.parse(textBlock.text) as {
      subject?: string;
      body?: string;
    };
    if (!parsed.subject || !parsed.body) return null;
    return { subject: parsed.subject, body: parsed.body };
  } catch (err) {
    console.error("draftEmailWithAI failed, falling back to template:", err);
    return null;
  }
}
