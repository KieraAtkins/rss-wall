import { createFeedAction } from "../actions";
import { auth } from "@/auth";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NewFeedPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <section className="mx-auto max-w-md px-4 py-12">
        <h1 className="font-logo mb-6 text-2xl">Admin Login</h1>
        <p className="text-brand-muted">You must be signed in to create feeds.</p>
      </section>
    );
  }
  return (
    <section className="mx-auto max-w-2xl px-4 py-12 align-with-nav">
      <h1 className="font-logo text-2xl mb-6">New Feed</h1>
      <form action={createFeedAction} className="space-y-4">
        <div>
          <label className="block text-sm text-brand-muted mb-1" htmlFor="name">Name</label>
          <input id="name" name="name" required className="w-full rounded-md border border-brand-border bg-brand-card px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="block text-sm text-brand-muted mb-1" htmlFor="url">URL</label>
          <input id="url" name="url" required className="w-full rounded-md border border-brand-border bg-brand-card px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="block text-sm text-brand-muted mb-1" htmlFor="item_limit">Item Limit</label>
          <input id="item_limit" name="item_limit" type="number" min="1" step="1" required className="w-full rounded-md border border-brand-border bg-brand-card px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="block text-sm text-brand-muted mb-1" htmlFor="keywords">Keywords (semicolon-separated)</label>
          <textarea id="keywords" name="keywords" rows={3} className="w-full rounded-md border border-brand-border bg-brand-card px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn">Create</button>
          <Link href="/admin" className="btn">Cancel</Link>
        </div>
      </form>
    </section>
  );
}
