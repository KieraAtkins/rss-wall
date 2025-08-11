import { auth } from "@/auth";
import { updateProfile } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <section className="mx-auto max-w-md px-4 py-12">
        <h1 className="font-logo mb-6 text-2xl">Admin Login</h1>
        <p className="text-brand-muted">You must be signed in to view your profile.</p>
      </section>
    );
  }
  const user: any = session.user;
  return (
    <section className="mx-auto max-w-2xl px-4 py-12 align-with-nav">
      <h1 className="font-logo text-2xl mb-6">Your Profile</h1>
      <form action={updateProfile} className="space-y-4">
        <div>
          <label className="block text-sm text-brand-muted mb-1" htmlFor="name">Name</label>
          <input id="name" name="name" defaultValue={user.name ?? ""} className="w-full rounded-md border border-brand-border bg-brand-card px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="block text-sm text-brand-muted mb-1" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" defaultValue={user.email ?? ""} className="w-full rounded-md border border-brand-border bg-brand-card px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="block text-sm text-brand-muted mb-1" htmlFor="password">New Password</label>
          <input id="password" name="password" type="password" placeholder="Leave blank to keep current" className="w-full rounded-md border border-brand-border bg-brand-card px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn">Save</button>
          <a href="/admin" className="btn">Cancel</a>
        </div>
      </form>
    </section>
  );
}
