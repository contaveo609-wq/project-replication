import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — Skina do Frango & Assados" },
      { name: "description", content: "Como a Skina do Frango & Assados coleta e utiliza seus dados." },
      { property: "og:title", content: "Política de privacidade — Skina do Frango & Assados" },
      { property: "og:description", content: "Transparência no uso dos seus dados pessoais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-2xl space-y-4 px-4 py-10 text-sm leading-relaxed text-muted-foreground">
        <h1 className="font-display text-4xl text-foreground">Política de privacidade</h1>
        <p>
          Coletamos apenas os dados necessários para preparar e entregar seu pedido: nome, telefone de
          contato, endereço de entrega e o histórico de pedidos feitos na plataforma.
        </p>
        <p>
          Esses dados são usados exclusivamente para atendimento, entrega e suporte. Não vendemos nem
          compartilhamos suas informações com terceiros para fins publicitários.
        </p>
        <p>
          O acesso ao histórico de pedidos é protegido por autenticação, e cada cliente visualiza somente
          os próprios dados.
        </p>
        <p>
          Para solicitar correção ou exclusão dos seus dados, fale conosco pelo WhatsApp +55 66 8105-5779.
        </p>
      </article>
    </SiteShell>
  );
}
