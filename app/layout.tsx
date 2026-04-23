import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

const title = "PostPod — Turn every podcast episode into a week of content";
const description =
  "Upload once. Get timestamps, pull quotes, a LinkedIn post, YouTube chapters, and three click-tested titles — in minutes.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "PostPod",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
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
