import { headers } from "next/headers";
import dynamic from "next/dynamic";

const PostPodApp = dynamic(() =>
  import("@/components/PostPodApp").then((m) => ({ default: m.PostPodApp }))
);
const WaitlistPage = dynamic(() =>
  import("@/components/WaitlistPage").then((m) => ({ default: m.WaitlistPage }))
);

export default async function Home() {
  const host = (await headers()).get("host") ?? "";
  const showApp = host.includes("postpodcast") || host.startsWith("localhost");
  return showApp ? <PostPodApp /> : <WaitlistPage />;
}
