import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blank Page",
  description: "A blank page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
