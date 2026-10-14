import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Chatbot } from "@/components/Chatbot";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export function SiteShell({
  children,
  search,
  onSearchChange,
}: {
  children: ReactNode;
  search?: string;
  onSearchChange?: (value: string) => void;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader search={search} onSearchChange={onSearchChange} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppButton />
      <Chatbot />
    </div>
  );
}
