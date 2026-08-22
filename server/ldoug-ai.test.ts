import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { invokeLLMMock, listLLMModelsMock } = vi.hoisted(() => ({
  invokeLLMMock: vi.fn(),
  listLLMModelsMock: vi.fn(),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: invokeLLMMock,
  listLLMModels: listLLMModelsMock,
}));

import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      name: "Test user",
      email: "test@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Ldoug AI", () => {
  beforeEach(() => {
    listLLMModelsMock.mockResolvedValue({
      data: [{ id: "gpt-5-mini", object: "model", created: 0, owned_by: "openai" }],
    });
    invokeLLMMock.mockResolvedValue({
      choices: [{ message: { content: "Готово." } }],
    });
  });

  it("uses the available model and returns an assistant message", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.ai.chat({
      messages: [{ role: "user", content: "Помоги составить план" }],
    });

    expect(result).toEqual({ message: "Готово." });
    expect(invokeLLMMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5-mini",
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "system" }),
          { role: "user", content: "Помоги составить план" },
        ]),
      })
    );
  });
});
