import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteShell } from "@/components/SiteShell";
import { fetchStoreSettings, formatBRL, ORDER_STATUS_LABEL, PAYMENT_LABEL, whatsappLink } from "@/lib/menu";
import { getOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/pedido/$id")({
  head: () => ({
    meta: [
      { title: "Acompanhe seu pedido — Skina do Frango & Assados" },
      { name: "description", content: "Acompanhe o status do seu pedido em tempo real." },
      { property: "og:title", content: "Acompanhe seu pedido — Skina do Frango & Assados" },
      { property: "og:description", content: "Status, itens e total do seu pedido." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

const STEPS = ["recebido", "confirmado", "em_preparacao", "saiu_entrega", "entregue"];

function OrderPage() {
  const { id } = Route.useParams();
  const fetchOrder = useServerFn(getOrder);
  const { data: store } = useQuery({ queryKey: ["store"], queryFn: fetchStoreSettings });
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder({ data: { id } }),
    refetchInterval: 20000,
  });

  if (isLoading) {
    return (
      <SiteShell>
        <p className="p-10 text-center text-muted-foreground">Carregando pedido...</p>
      </SiteShell>
    );
  }

  if (!order) {
    return (
      <SiteShell>
        <div className="p-10 text-center">
          <p className="text-muted-foreground">Pedido não encontrado.</p>
          <Link to="/" className="mt-3 inline-block font-semibold text-primary">
            Voltar ao início
          </Link>
        </div>
      </SiteShell>
    );
  }

  const currentStep = STEPS.indexOf(order.status as string);
  const wa = store?.whatsapp ?? "556681055779";

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Pedido</p>
          <h1 className="font-display text-5xl text-primary">#{order.order_number}</h1>
          <p className="mt-2 inline-block rounded-full bg-success px-3 py-1 text-sm font-semibold text-success-foreground">
            {ORDER_STATUS_LABEL[order.status as string] ?? order.status}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Entrega estimada: {store?.delivery_time_min ?? 40}–{store?.delivery_time_max ?? 57} minutos
          </p>
        </div>

        {order.status !== "cancelado" ? (
          <ol className="mt-5 space-y-2">
            {STEPS.map((step, index) => (
              <li
                key={step}
                className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${
                  index <= currentStep
                    ? "border-primary/40 bg-primary/5 font-semibold text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {index + 1}
                </span>
                {ORDER_STATUS_LABEL[step]}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-5 rounded-xl bg-destructive/10 p-4 text-center text-destructive">
            Este pedido foi cancelado.
          </p>
        )}

        <section className="mt-5 rounded-2xl border border-border bg-card p-4">
          <h2 className="font-display text-2xl">Itens</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {(order.order_items ?? []).map((item) => (
              <li key={item.id}>
                <div className="flex justify-between gap-3">
                  <span>
                    {item.quantity}x {item.product_name}
                  </span>
                  <span>{formatBRL(Number(item.line_total))}</span>
                </div>
                {(item.order_item_addons ?? []).map((addon) => (
                  <p key={addon.id} className="pl-4 text-xs text-muted-foreground">
                    + {addon.quantity}x {addon.name}
                  </p>
                ))}
                {item.notes ? (
                  <p className="pl-4 text-xs italic text-muted-foreground">Obs.: {item.notes}</p>
                ) : null}
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 border-t border-border pt-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatBRL(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa de entrega</span>
              <span>{formatBRL(Number(order.delivery_fee))}</span>
            </div>
            <div className="flex justify-between font-display text-2xl">
              <span>Total</span>
              <span className="text-primary">{formatBRL(Number(order.total))}</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Pagamento: {PAYMENT_LABEL[order.payment_method as string] ?? order.payment_method}
          </p>
          <p className="text-sm text-muted-foreground">
            Entregar em: {order.street}, {order.number}
            {order.complement ? ` — ${order.complement}` : ""} — {order.neighborhood}
          </p>
        </section>

        <a
          href={whatsappLink(wa, `Olá! Quero falar sobre o pedido #${order.order_number}.`)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex h-12 items-center justify-center rounded-full bg-success font-semibold text-success-foreground"
        >
          Falar sobre este pedido no WhatsApp
        </a>
      </div>
    </SiteShell>
  );
}
