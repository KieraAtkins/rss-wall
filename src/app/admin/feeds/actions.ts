"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";

export async function createFeedAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const item_limit = formData.get("item_limit");
  const keywords = String(formData.get("keywords") ?? "").trim() || null;

  if (!name || !url) {
    redirect("/admin?error=missing");
  }

  const limit = item_limit ? Number(item_limit) : null;
  if (limit === null || Number.isNaN(limit) || limit <= 0) {
    redirect("/admin?error=item_limit");
  }
  const db = sql;
  if (!db) {
    redirect("/admin?error=db");
  }
  await db`
    INSERT INTO feeds (name, url, item_limit, keywords)
    VALUES (${name}, ${url}, ${limit}, ${keywords})
  `;
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateFeedAction(id: number, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const item_limit = formData.get("item_limit");
  const keywords = String(formData.get("keywords") ?? "").trim() || null;

  const limit = item_limit ? Number(item_limit) : null;
  if (!name || !url) {
    redirect("/admin?error=missing");
  }
  if (limit === null || Number.isNaN(limit) || limit <= 0) {
    redirect("/admin?error=item_limit");
  }
  const db = sql;
  if (!db) {
    redirect("/admin?error=db");
  }
  await db`
    UPDATE feeds
    SET name = ${name}, url = ${url}, item_limit = ${limit}, keywords = ${keywords}
    WHERE id = ${id}
  `;
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteFeedAction(id: number) {
  const db = sql;
  if (!db) {
    redirect("/admin?error=db");
  }
  await db`DELETE FROM feeds WHERE id = ${id}`;
  revalidatePath("/admin");
  redirect("/admin");
}
