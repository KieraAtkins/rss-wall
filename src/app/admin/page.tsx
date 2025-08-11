// src/app/admin/page.tsx
import { auth, signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic"; // ensure SSR each visit

export default async function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const error = typeof sp?.error === "string" ? sp.error : undefined;
  const session = await auth();
  const authed = Boolean(session?.user);

  if (!authed) {
    return (
      <section className="mx-auto max-w-md px-4 py-12">
        <h1 className="font-logo mb-6 text-2xl">Admin Login</h1>
        {error && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            Invalid Username or Password
          </div>
        )}
        <form action={async (fd: FormData) => {
          "use server";
          try {
            await signIn("credentials", {
              username: String(fd.get("username") ?? "").trim(),
              password: String(fd.get("password") ?? ""),
              redirectTo: "/admin",
            });
          } catch (err) {
            if (err instanceof AuthError) {
              redirect("/admin?error=CredentialsSignin");
            }
            throw err;
          }
        }} className="space-y-4">
          <div>
            <label className="block text-sm text-brand-muted mb-1" htmlFor="username">Username</label>
            <input id="username" name="username" required className="w-full rounded-md border border-brand-border bg-brand-card px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm text-brand-muted mb-1" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required className="w-full rounded-md border border-brand-border bg-brand-card px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <button type="submit" className="btn">Sign in</button>
        </form>
      </section>
    );
  }

  // Ensure database is configured
  if (!sql) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12 align-with-nav">
        <h1 className="font-logo text-2xl mb-2">Admin</h1>
        <p className="text-brand-muted">Database is not configured. Please set DATABASE_URL to manage feeds.</p>
      </section>
    );
  }

  const feeds = await sql<{ id: number; name: string; url: string; item_limit: number | null; keywords: string | null }[]>`
    SELECT id, name, url, item_limit, keywords
    FROM feeds
    ORDER BY id ASC
  `;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 align-with-nav">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-logo text-2xl admin-title">
          <Link href="/admin/profile" className="text-white hover:underline">
            {(session?.user as { username?: string | null; name?: string | null } | undefined)?.username ?? session?.user?.name ?? "Admin"}
          </Link>
        </h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/feeds/new" className="btn">New Feed</Link>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/admin" }); }}>
            <button type="submit" className="btn">Log out</button>
          </form>
        </div>
      </div>

      <div className="overflow-x-auto rounded-brand border border-brand-border bg-brand-card">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-header text-brand-muted">
            <tr>
              <th className="px-4 py-2 text-left w-16">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">URL</th>
              <th className="px-4 py-2 text-left w-28">Item Limit</th>
              <th className="px-4 py-2 text-left">Keywords</th>
            </tr>
          </thead>
          <tbody>
            {feeds.map((f: { id: number; name: string; url: string; item_limit: number | null; keywords: string | null }) => (
              <tr key={f.id} className="border-t border-brand-border hover:bg-white/5">
                <td className="px-4 py-2 text-brand-muted">{f.id}</td>
                <td className="px-4 py-2">
                  <Link href={`/admin/feeds/${f.id}`} className="text-brand-link hover:underline">{f.name}</Link>
                </td>
                <td className="px-4 py-2 break-all text-brand-muted">{f.url}</td>
                <td className="px-4 py-2">{f.item_limit ?? ""}</td>
                <td className="px-4 py-2 whitespace-pre-line text-brand-muted">{f.keywords ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
