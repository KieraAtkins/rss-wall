"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_session";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days

// Default credentials; override via env in production.
const USER = process.env.ADMIN_USER ?? "admin";
const PASS = process.env.ADMIN_PASSWORD ?? "password";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (username === USER && password === PASS) {
    const jar = await cookies();
    jar.set(COOKIE_NAME, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
      secure: process.env.NODE_ENV === "production",
    });
    redirect("/admin");
  }

  redirect("/admin?error=1");
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  redirect("/admin");
}
