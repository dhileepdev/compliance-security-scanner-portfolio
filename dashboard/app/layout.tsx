import "./globals.css";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";

const ibmPlexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-ibm-plex-sans" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-ibm-plex-mono" });

export const metadata = {
  title: "Compliance & Security Scanner",
  description: "Compliance scores, rule pass/fail, and vulnerability trends",
};

const NavItem = ({ active, children, href }: { active?: boolean; children: React.ReactNode; href: string }) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] text-sm font-500 ${
      active
        ? "bg-[#e9e9e9] text-[#131416]"
        : "text-[#5d5f60] hover:bg-[#f4f6f8]"
    }`}
  >
    {children}
  </Link>
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased selection:bg-[#1b6c80] selection:text-white`}>
        <aside className="shell-sidebar">
          <div className="h-[48px] flex items-center gap-2 px-4 border-b-1 border-[#e8eaec]">
            <span className="text-[13px] font-600 tracking-[-0.02em]">KYV</span>
          </div>
          <nav className="mt-6 px-2 space-y-1">
            <NavItem active href="/">Overview</NavItem>
            <NavItem href="/rules">Rules</NavItem>
            <NavItem href="/vulnerabilities">Vulnerabilities</NavItem>
            <NavItem href="/history">History</NavItem>
          </nav>
        </aside>
        <header className="shell-topbar flex items-center justify-between px-6">
          <div className="text-[20px] font-600 text-[#131416]">Compliance &amp; Security Scanner</div>
          <div className="text-[12px] text-[#5d5f60] flex items-center gap-2">
            <span className="dot dot-ok"></span>
            <span id="freshness">—</span>
          </div>
        </header>
        <main className="shell-sheet">
          <div className="sheet-body">{children}</div>
        </main>
      </body>
    </html>
  );
}
