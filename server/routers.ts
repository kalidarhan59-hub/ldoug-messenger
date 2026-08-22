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
        const model =
          models.find((entry) => entry.id === "gpt-5-mini")?.id ??
          models.find((entry) => entry.id.startsWith("gpt-5"))?.id ??
          models[0]?.id;

        if (!model) {
          throw new Error("No LLM model is available for Ldoug AI");
        }

        const response = await invokeLLM({
          model,
          maxTokens: 900,
          reasoning: { effort: "minimal" },
          messages: [
            {
              role: "system",
              content:
                "You are Ldoug AI, a concise, friendly general assistant inside a private local messenger. Reply in the user's language when possible. Be helpful, factual, and clear. Do not claim access to WhatsApp, contacts, private chats, or external accounts. Use Markdown only when it improves readability.",
            },
            ...input.messages,
          ],
        });

        const content = response.choices[0]?.message?.content;
        return {
          message:
            typeof content === "string" && content.trim()
              ? content.trim()
              : "Ldoug AI не смог подготовить ответ. Попробуйте переформулировать вопрос.",
        };
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
