import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "DocuCanvas — The Modern Word Template & Document Suite",
  description:
    "Design, create, edit, collaborate, and export Microsoft Word document templates with AI assistance.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
