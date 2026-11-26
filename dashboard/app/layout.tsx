import "./globals.css";
import { Public_Sans, JetBrains_Mono } from "next/font/google";
import RailNav from "@/components/RailNav";

const publicSans = Public_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-display" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-text" });

export const metadata = {
  title: "Compliance & Security Scanner",
  description: "Compliance and security vulnerability scanning dashboard",
};

// Skip link for keyboard navigation
const SKIP_LINK_ID = "main-content";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${publicSans.variable} ${jetbrainsMono.variable} antialiased selection:bg-[#4a8ad6] selection:text-white`}>
        {/* Skip link for keyboard navigation */}
        <a
          className="skip-link"
          href="#{SKIP_LINK_ID}"
          aria-label="Skip to main content"
        >
          Skip to main content
        </a>

        <nav className="shell-rail" aria-label="Main navigation">
          <div className="rail-mark">CS</div>
          <RailNav />
        </nav>

        <main className="shell-content" id={SKIP_LINK_ID}>
          {children}
        </main>
      </body>
    </html>
  );
}
