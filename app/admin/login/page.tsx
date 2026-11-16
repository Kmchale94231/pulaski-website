"use client";

import { useActionState } from "react";
import { signIn } from "../actions";

const input = "w-full rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700";

export default function Login() {
  const [error, action, pending] = useActionState(signIn, null);
  return (
    <main className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold">Admin login</h1>
      <form action={action} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input name="email" type="email" autoComplete="email" required className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input name="password" type="password" autoComplete="current-password" required className={input} />
        </label>
        <button disabled={pending} className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-50">
          {pending ? "Logging in…" : "Log in"}
        </button>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
