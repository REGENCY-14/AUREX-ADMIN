import type { Metadata } from "next";
import ContentView from "@/components/admin/content/ContentView";

export const metadata: Metadata = {
  title: "Home Content | AUREX Admin",
};

export default function ContentPage() {
  return <ContentView />;
}
