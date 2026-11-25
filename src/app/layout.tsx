import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { MaintenanceBanner } from "@/components/navigation/maintenance-banner";
import { AuthProvider } from "@/context/auth-context";

export const metadata: Metadata = {
  title: "Levchary LMS | Verified Tutors for Virtual & Physical Classes",
  description:
    "Connect with vetted, background-checked tutors for 1-on-1 and group classes in interactive virtual classrooms and supervised physical education centers.",
  keywords: [
    "LMS",
    "Tutors",
    "Calculus Tutor",
    "SAT Prep",
    "Private Tutoring",
    "Interactive Video Classrooms",
    "In-Person Learning Centers",
  ],
  authors: [{ name: "Levchary LMS Inc." }],
  openGraph: {
    title: "Levchary LMS - Company-Controlled Education Marketplace",
    description:
      "Expert-led academic learning for virtual and physical classes with guaranteed identity verification and transaction security.",
    url: "https://levchary.com",
    siteName: "Levchary LMS",
    type: "website",
  },
  icons: {
    icon: "/logo-icon.png",
    shortcut: "/favicon.ico",
    apple: "/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="flex min-h-full flex-col font-sans bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <MaintenanceBanner />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
