import { sql } from "@/lib/db";
import { deleteFeedAction, updateFeedAction } from "../actions";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditFeedPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const rows = await sql<{ id: number; name: string; url: string; item_limit: number | null; keywords: string | null }[]>`
    SELECT id, name, url, item_limit, keywords
    FROM feeds
    WHERE id = ${id}
  `;

  const feed = rows[0];
  if (!feed) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-12 align-with-nav">
        <h1 className="font-logo text-2xl mb-2">Feed not found</h1>
        <p className="text-brand-muted">ID {id} does not exist.</p>
      </section>
    );
  }

  async function action(formData: FormData) {
    'use server';
    return updateFeedAction(id, formData);
  }

  async function del() {
    'use server';
    return deleteFeedAction(id);
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 align-with-nav">
      <h1 className="font-logo text-2xl mb-6">Edit Feed</h1>
      <form id="save-form" action={action} className="space-y-4">
        <div>
          <label className="block text-sm text-brand-muted mb-1" htmlFor="name">Name</label>
          <input id="name" name="name" defaultValue={feed.name} required className="w-full rounded-md border border-brand-border bg-brand-card px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="block text-sm text-brand-muted mb-1" htmlFor="url">URL</label>
          <input id="url" name="url" defaultValue={feed.url} required className="w-full rounded-md border border-brand-border bg-brand-card px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="block text-sm text-brand-muted mb-1" htmlFor="item_limit">Item Limit</label>
          <input id="item_limit" name="item_limit" type="number" min="1" step="1" required defaultValue={feed.item_limit ?? undefined} className="w-full rounded-md border border-brand-border bg-brand-card px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="block text-sm text-brand-muted mb-1" htmlFor="keywords">Keywords (semicolon-separated)</label>
          <textarea id="keywords" name="keywords" rows={3} defaultValue={feed.keywords ?? ''} className="w-full rounded-md border border-brand-border bg-brand-card px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-red-500" />
        </div>
      </form>
      <div className="mt-6 flex items-center gap-3">
        <button type="submit" form="save-form" className="btn">Save</button>
        <form action={del} className="inline-block">
          <button type="submit" className="btn">Delete</button>
        </form>
        <Link href="/admin" className="btn">Cancel</Link>
      </div>
    </section>
  );
}
