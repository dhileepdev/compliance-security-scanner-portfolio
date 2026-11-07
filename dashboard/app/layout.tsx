import "./globals.css";

export const metadata = {
  title: "Compliance & Security Scanner Dashboard",
  description: "Realtime dashboard for compliance scores, rule pass/fail, and vulnerability trends",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
