// src/app/admin/page.tsx
import { cookies } from "next/headers";
import { loginAction, logoutAction } from "./actions";
import Link from "next/link";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic"; // ensure SSR each visit

export default async function AdminPage() {
  const jar = await cookies();
  const authed = jar.get("admin_session")?.value === "1";

  if (!authed) {
    return (
      <section className="mx-auto max-w-md px-4 py-12">
        <h1 className="font-logo mb-6 text-2xl">Admin Login</h1>
        <form action={loginAction} className="space-y-4">
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

  const feeds = await sql<{ id: number; name: string; url: string; item_limit: number | null; keywords: string | null }[]>`
    SELECT id, name, url, item_limit, keywords
    FROM feeds
    ORDER BY id ASC
  `;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 align-with-nav">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-logo text-2xl">Admin</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/feeds/new" className="btn">New Feed</Link>
          <form action={logoutAction}>
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
