'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { NavBar } from "./components/nav";
import { Footer } from "./components/footer";
import "./layout.css";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showGlobalElements = !pathname.startsWith('/activate') && !pathname.startsWith('/dashboard');

  return (
    <html lang="en">
      <head>
        <title>OrgaGPS</title>
        <Script id="hcaptcha-init" strategy="beforeInteractive">
          {`
            window.initHCaptcha = function() {
              console.log("hCaptcha script loaded, ready for explicit rendering");
            }
          `}
        </Script>
        <Script
          src="https://hcaptcha.com/1/api.js?render=explicit&onload=initHCaptcha"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        {showGlobalElements && <NavBar />}
        <main>{children}</main>
        {showGlobalElements && <Footer />}
      </body>
    </html>
  );
}
