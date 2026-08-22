type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = "You are Ldoug AI, an intelligent general-purpose assistant inside a private messenger. Answer fully and directly, match the user's language, use concise Markdown headings and lists for longer answers, and never claim access to WhatsApp, contacts, private chats, or external accounts.";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "AI provider key is not configured" });
    return;
  }

  const messages = Array.isArray(req.body?.messages)
    ? req.body.messages
        .filter((item: unknown): item is ChatMessage => Boolean(item && typeof item === "object" && ((item as ChatMessage).role === "user" || (item as ChatMessage).role === "assistant") && typeof (item as ChatMessage).content === "string"))
        .slice(-24)
        .map((item: ChatMessage) => ({ role: item.role, content: item.content.trim().slice(0, 12000) }))
        .filter((item: ChatMessage) => item.content.length > 0)
    : [];

  if (messages.length === 0) {
    res.status(400).json({ error: "At least one message is required" });
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 1400,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI request failed", response.status, await response.text());
      res.status(502).json({ error: "AI provider did not return a response" });
      return;
    }

    const payload = await response.json();
    const message = payload.choices?.[0]?.message?.content?.trim();
    if (!message) {
      res.status(502).json({ error: "AI provider returned an empty response" });
      return;
    }
    res.status(200).json({ message });
  } catch (error) {
    console.error("Ldoug AI route failed", error);
    res.status(502).json({ error: "Unable to reach AI provider" });
  }
}
