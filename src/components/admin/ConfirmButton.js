"use client";
export default function ConfirmButton({ message, children, className = "btn-outline px-3 py-1.5 text-sm text-danger", ...rest }) {
  return <button type="submit" className={className} onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }} {...rest}>{children}</button>;
}
