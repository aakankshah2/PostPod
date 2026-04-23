import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

const title = "PostPod — Turn every podcast episode into a week of content";
const description =
  "Upload once. Timestamps, pull quotes, a LinkedIn post, YouTube chapters, three click-ready titles — in minutes.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "PostPod",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
