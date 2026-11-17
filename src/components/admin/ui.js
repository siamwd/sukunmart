import Link from "next/link";

export function PageHeader({ title, children }) {
  return <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">{title}</h1><div className="flex gap-2">{children}</div></div>;
}
export function Notice({ searchParams }) {
  const { ok, err } = searchParams || {};
  if (!ok && !err) return null;
  return <p role={err ? "alert" : "status"} className={`mb-4 rounded-btn p-3 text-sm ${err ? "bg-red-50 text-danger" : "bg-brand-soft text-brand-dark"}`}>{err || ok}</p>;
}
export function Field({ label, name, defaultValue, type = "text", required, hint, children, ...rest }) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}{required && <span className="text-danger"> *</span>}</label>
      {children || <input id={name} name={name} type={type} {...(type === "file" ? {} : { defaultValue: defaultValue ?? "" })} required={required} className="input" {...rest} />}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
export function TextArea({ label, name, defaultValue, rows = 4, hint, ...rest }) {
  return <Field label={label} name={name} hint={hint}><textarea id={name} name={name} rows={rows} defaultValue={defaultValue ?? ""} className="input" {...rest} /></Field>;
}
export function Check({ label, name, defaultChecked }) {
  return <label className="flex items-center gap-2 text-sm"><input type="checkbox" name={name} defaultChecked={defaultChecked} /> {label}</label>;
}
export function Pager({ base, page, pages, params = {} }) {
  if (pages <= 1) return null;
  const href = (p) => `${base}?${new URLSearchParams({ ...params, page: p }).toString()}`;
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center gap-3 text-sm">
      {page > 1 && <Link href={href(page - 1)} className="btn-outline px-3 py-1.5">Previous</Link>}
      <span>Page {page} of {pages}</span>
      {page < pages && <Link href={href(page + 1)} className="btn-outline px-3 py-1.5">Next</Link>}
    </nav>
  );
}
export const flash = (path, kind, msg) => `${path}${path.includes("?") ? "&" : "?"}${kind}=${encodeURIComponent(msg)}`;
