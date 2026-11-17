import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteCategory } from "@/app/actions/admin-categories";
import { PageHeader, Notice } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/ConfirmButton";

export default async function Categories({ searchParams }) {
  await requireAdmin();
  const cats = await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
  return (
    <>
      <PageHeader title="Categories"><Link href="/admin-dashboard/categories/new" className="btn-primary px-4 py-2 text-sm">New category</Link></PageHeader>
      <Notice searchParams={await searchParams} />
      <div className="card overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-surface"><tr><th className="p-3">Name</th><th>Slug</th><th>Products</th><th>Order</th><th>Published</th><th /></tr></thead>
        <tbody>{cats.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted">No categories yet.</td></tr>}
          {cats.map((c) => (<tr key={c.id} className="border-t border-line"><td className="p-3 font-medium">{c.name}</td><td>/{c.slug}</td><td>{c._count.products}</td><td>{c.sortOrder}</td><td>{c.published ? "Yes" : "No"}</td>
            <td className="flex gap-2 p-3"><Link href={`/admin-dashboard/categories/${c.id}`} className="btn-outline px-3 py-1.5 text-sm">Edit</Link>
              <form action={deleteCategory.bind(null, c.id)}><ConfirmButton message={`Delete category "${c.name}"?`}>Delete</ConfirmButton></form></td></tr>))}</tbody></table></div>
    </>
  );
}
