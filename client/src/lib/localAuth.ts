export type LocalAccount = {
  username: string;
  salt: string;
  passwordHash: string;
};

export async function hashLocalPassword(salt: string, password: string) {
  const material = new TextEncoder().encode(`${salt}:${password}`);
  const derived = await crypto.subtle.digest("SHA-256", material);
  return Array.from(new Uint8Array(derived))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createLocalAccount(username: string, password: string): Promise<LocalAccount> {
  const salt = crypto.randomUUID();
  return {
    username: username.trim().toLocaleLowerCase(),
    salt,
    passwordHash: await hashLocalPassword(salt, password),
  };
}

export async function isLocalPasswordValid(account: LocalAccount, password: string) {
  return (await hashLocalPassword(account.salt, password)) === account.passwordHash;
}
