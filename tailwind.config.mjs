export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          accent: 'var(--brand-accent)',
          bg: 'var(--brand-bg)',
          surface: 'var(--brand-surface)',
          muted: 'var(--brand-muted)',
          navy: 'var(--brand-navy)',
        },
      },
    },
  },
  plugins: [],
}
