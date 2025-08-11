import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = {
  amount: number;
  name: string;
  image_url: string | null;
  email: string;
  id: string;
};

export default async function TestPage() {
  if (!sql) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12 align-with-nav">
        <h1 className="font-logo text-2xl mb-4">DB Test</h1>
        <p className="text-brand-muted">DATABASE_URL is not configured.</p>
      </section>
    );
  }

  const rows = await sql<Row[]>`
    SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    ORDER BY invoices.date DESC
    LIMIT 5
  `;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 align-with-nav">
      <h1 className="font-logo text-2xl mb-6">DB Test</h1>
      <div className="overflow-x-auto rounded-brand border border-brand-border bg-brand-card">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-header text-brand-muted">
            <tr>
              <th className="px-4 py-2 text-left">Invoice ID</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: Row) => (
              <tr key={r.id} className="border-t border-brand-border">
                <td className="px-4 py-2">{r.id}</td>
                <td className="px-4 py-2 flex items-center gap-3">
                  {r.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.image_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <span className="inline-block h-7 w-7 rounded-full bg-brand-header" />
                  )}
                  <span>{r.name}</span>
                </td>
                <td className="px-4 py-2">{r.email}</td>
                <td className="px-4 py-2 text-right">${""}{(r.amount / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
