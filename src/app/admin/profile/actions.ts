"use server";

import { auth } from "@/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import * as bcrypt from "bcryptjs";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/admin?error=auth");
  const sessUser = session.user as { id?: string; username?: string | null; email?: string | null };
  let id = sessUser.id;
  const db = sql;
  if (!db) redirect("/admin?error=db");

  // Fallback: resolve user id via username or email if not present on session
  if (!id) {
    const username = sessUser.username ?? undefined;
    const email = sessUser.email ?? undefined;
    try {
      if (username) {
        const rows = await db<{ id: string }[]>`
          SELECT id FROM rss_users WHERE lower(username) = lower(${username}) LIMIT 1
        `;
        id = rows[0]?.id;
      }
      if (!id && email) {
        const rows = await db<{ id: string }[]>`
          SELECT id FROM rss_users WHERE lower(email) = lower(${email}) LIMIT 1
        `;
        id = rows[0]?.id;
      }
    } catch {
      console.error("Failed to resolve current user id");
    }
  }
  if (!id) redirect("/admin?error=auth");
  id = String(id);
  const name = String(formData.get("name") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const password = String(formData.get("password") ?? "").trim();

  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    await db`
      UPDATE rss_users SET name = ${name}, email = ${email}, password = ${hashed}
      WHERE id = ${id}
    `;
  } else {
    await db`
      UPDATE rss_users SET name = ${name}, email = ${email}
      WHERE id = ${id}
    `;
  }
  redirect("/admin");
}
