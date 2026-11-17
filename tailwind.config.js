/** Design tokens live in src/app/globals.css (CSS variables); Tailwind maps to them here. */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--brand)",
          dark: "var(--brand-dark)",
          soft: "var(--brand-soft)",
        },
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        surface: "var(--surface)",
        danger: "var(--danger)",
      },
      borderRadius: { card: "var(--radius-card)", btn: "var(--radius-btn)" },
      maxWidth: { page: "var(--page-width)" },
    },
  },
  plugins: [],
};
