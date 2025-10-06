import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "BatchSend",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <h2>Hey Layout!</h2>
        <Providers>{props.children}</Providers>
      </body>
    </html>
  );
}
