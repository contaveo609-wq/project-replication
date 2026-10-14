import { effectivePrice, formatBRL, primaryImage, type Product } from "@/lib/menu";

export function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const image = primaryImage(product);
  const price = effectivePrice(product);
  const hasPromo = price < product.price;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={product.is_sold_out}
      className="group flex w-full gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md disabled:opacity-60"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <h3 className="font-semibold leading-tight text-foreground">{product.name}</h3>
          {product.is_sold_out ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
              Esgotado
            </span>
          ) : null}
          {hasPromo ? (
            <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase text-gold-foreground">
              Promoção
            </span>
          ) : null}
        </div>
        {product.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        ) : null}
        <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
          {product.weight ? <span>{product.weight}</span> : null}
          {product.quantity_label ? <span>{product.quantity_label}</span> : null}
          {product.serves ? <span>Serve {product.serves} pessoa(s)</span> : null}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-2xl text-primary">
            {product.price_from ? "A partir de " : ""}
            {formatBRL(price)}
          </span>
          {hasPromo ? (
            <span className="text-sm text-muted-foreground line-through">{formatBRL(product.price)}</span>
          ) : null}
        </div>
      </div>
      {image ? (
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          width={112}
          height={112}
          className="h-24 w-24 shrink-0 rounded-xl object-cover sm:h-28 sm:w-28"
        />
      ) : null}
    </button>
  );
}
