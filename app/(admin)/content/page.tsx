import type { Metadata } from "next";
import ContentView from "@/components/admin/content/ContentView";
import { getContentBlocks } from "@/lib/homeContent";

export const metadata: Metadata = {
  title: "Home Content | AUREX Admin",
};

export default function ContentPage() {
  return <ContentView blocks={getContentBlocks()} />;
}
