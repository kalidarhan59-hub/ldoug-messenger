import { describe, expect, it } from "vitest";
import { createLocalAccount, isLocalPasswordValid } from "../client/src/lib/localAuth";

describe("local account credentials", () => {
  it("stores a hash and validates only the original password", async () => {
    const account = await createLocalAccount("  DemoUser  ", "secure-pass");

    expect(account.username).toBe("demouser");
    expect(account.passwordHash).not.toBe("secure-pass");
    await expect(isLocalPasswordValid(account, "secure-pass")).resolves.toBe(true);
    await expect(isLocalPasswordValid(account, "wrong-pass")).resolves.toBe(false);
  });
});
