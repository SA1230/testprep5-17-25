import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import { ApolloProvider } from "@/lib/apollo/ApolloProvider";
import { ThemeRegistry } from "@/lib/ThemeRegistry";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dreambound GED Test-Prep",
  description: "Adaptive practice for GED test preparation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${roboto.variable}`}>
        <ThemeRegistry>
          <ApolloProvider>
            {children}
          </ApolloProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
