import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM, listLLMModels } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  ai: router({
    chat: publicProcedure
      .input(
        z.object({
          messages: z
            .array(
              z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string().trim().min(1).max(12_000),
              })
            )
            .min(1)
            .max(24),
        })
      )
      .mutation(async ({ input }) => {
        const { data: models } = await listLLMModels();
        const candidateModels = [
          models.find((entry) => entry.id === "gpt-5")?.id,
          models.find((entry) => entry.id === "gpt-5-mini")?.id,
          models.find((entry) => entry.id === "gemini-3-flash-preview")?.id,
        ].filter((model): model is string => Boolean(model));

        if (candidateModels.length === 0) {
          throw new Error("No LLM model is available for Ldoug AI");
        }

        const messages = [
          {
            role: "system" as const,
            content:
              "You are Ldoug AI, an intelligent general-purpose assistant inside a private messenger. Answer fully and directly: first give the useful conclusion, then explain the important reasoning, steps, examples, or caveats when they help. Match the user's language. Never return a vague placeholder or an unfinished answer. If a request lacks details, state a reasonable assumption and still provide the best actionable answer. Do not claim access to WhatsApp, contacts, private chats, or external accounts. Format longer answers with concise Markdown headings and lists.",
          },
          ...input.messages,
        ];

        let lastError: unknown;
        for (const model of candidateModels) {
          try {
            const response = await invokeLLM({
              model,
              maxTokens: 1_800,
              ...(model.startsWith("gpt-5") ? { reasoning: { effort: "medium" } } : {}),
              messages,
            });
            const content = response.choices[0]?.message?.content;
            if (typeof content === "string" && content.trim()) {
              return { message: content.trim() };
            }
            lastError = new Error(`Model ${model} returned an empty response`);
          } catch (error) {
            lastError = error;
          }
        }

        console.error("Ldoug AI failed after model fallbacks", lastError);
        throw new Error("Ldoug AI is temporarily unavailable. Please try again.");
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
