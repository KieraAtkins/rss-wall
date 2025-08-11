import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { sql } from "@/lib/db";
import * as bcrypt from "bcryptjs";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // Persist id and username on the token at sign-in
      if (user) {
        const u = user as unknown as { id?: string; username?: string | null };
        if (u.id) (token as Record<string, unknown>).id = u.id;
        if (u.username) (token as Record<string, unknown>).username = u.username;
      }
      return token;
    },
    async session({ session, token }) {
      // Attach id/username to session and refresh name/email from DB each request
      const t = token as Record<string, unknown>;
      const id = typeof t.id === "string" ? t.id : undefined;
      if (session.user && id) {
        const s: any = session;
        s.user.id = id;
        const db = sql;
        if (db) {
          try {
            const rows = await db<{ id: string; name: string | null; username: string; email: string | null }[]>`
              SELECT id, name, username, email
              FROM rss_users
              WHERE id = ${id}
              LIMIT 1
            `;
            const row = rows[0];
            if (row) {
              s.user.name = row.name ?? row.username;
              s.user.email = row.email ?? null;
              s.user.username = row.username;
            }
          } catch (e) {
            // ignore - fallback to token/session values
          }
        }
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
  authorize: async (credentials: Record<string, unknown> | undefined) => {
        const u = (credentials?.username ?? "").toString().trim();
        const p = (credentials?.password ?? "").toString();
        if (!u || !p) return null;
        const db = sql;
        if (!db) return null;
        type DBUser = { id: string; name: string | null; username: string; email: string | null; password: string };
        try {
          const rows = await db<DBUser[]>`
            SELECT id, name, username, email, password
            FROM rss_users
            WHERE lower(username) = lower(${u}) OR lower(email) = lower(${u})
            LIMIT 1
          `;
          const user = rows[0];
          if (!user) return null;
          // Support bcrypt-hashed passwords; fall back to plain text and upgrade
          let ok = false;
          if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
            ok = await bcrypt.compare(p, user.password);
          } else {
            ok = user.password === p;
            if (ok) {
              try {
                const hashed = await bcrypt.hash(p, 10);
                await db`
                  UPDATE rss_users SET password = ${hashed} WHERE id = ${user.id}
                `;
              } catch {}
            }
          }
          if (!ok) return null;
          return {
            id: user.id,
            name: user.name ?? user.username,
            email: user.email ?? undefined,
            username: user.username,
          };
        } catch (e) {
          console.error("Auth query failed", e);
          return null;
        }
      },
    }),
  ],
});
