import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { ProductDialog } from "@/components/ProductDialog";
import { fetchCategories, fetchProducts, type Product } from "@/lib/menu";

export function MenuBrowser({ search }: { search: string }) {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: products = [], isLoading } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const [active, setActive] = useState<string | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);

  const term = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      products
        .filter((p) => p.is_active)
        .filter((p) =>
          term
            ? p.name.toLowerCase().includes(term) || (p.description ?? "").toLowerCase().includes(term)
            : true,
        ),
    [products, term],
  );

  const featured = visible
    .filter((p) => p.is_featured)
    .sort((a, b) => a.featured_order - b.featured_order);

  const sections = categories
    .filter((c) => c.is_active)
    .map((c) => ({ category: c, items: visible.filter((p) => p.category_id === c.id) }))
    .filter((s) => s.items.length > 0);

  function scrollTo(slug: string) {
    setActive(slug);
    document.getElementById(`cat-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <nav
        aria-label="Categorias"
        className="sticky top-[104px] z-30 -mx-3 mb-4 flex gap-2 overflow-x-auto bg-background/95 px-3 py-2 backdrop-blur sm:top-[108px]"
      >
        {term ? null : (
          <>
            {featured.length ? (
              <CategoryChip
                label="🔥 Mais pedidos"
                active={active === "mais-pedidos"}
                onClick={() => scrollTo("mais-pedidos")}
              />
            ) : null}
            {sections.map((s) => (
              <CategoryChip
                key={s.category.id}
                label={`${s.category.emoji ?? ""} ${s.category.name}`.trim()}
                active={active === s.category.slug}
                onClick={() => scrollTo(s.category.slug)}
              />
            ))}
          </>
        )}
      </nav>

      {isLoading ? <p className="py-8 text-center text-muted-foreground">Carregando cardápio...</p> : null}

      {term && visible.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          Nenhum item encontrado para "{search}".
        </p>
      ) : null}

      {!term && featured.length ? (
        <section id="cat-mais-pedidos" className="scroll-mt-40">
          <h2 className="font-display text-3xl text-foreground">🔥 Mais pedidos</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {featured.map((p) => (
              <ProductCard key={`f-${p.id}`} product={p} onClick={() => setSelected(p)} />
            ))}
          </div>
        </section>
      ) : null}

      {term ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} onClick={() => setSelected(p)} />
          ))}
        </div>
      ) : (
        sections.map((s) => (
          <section key={s.category.id} id={`cat-${s.category.slug}`} className="mt-10 scroll-mt-40">
            <h2 className="font-display text-3xl text-foreground">
              {s.category.emoji ? `${s.category.emoji} ` : ""}
              {s.category.name}
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {s.items.map((p) => (
                <ProductCard key={p.id} product={p} onClick={() => setSelected(p)} />
              ))}
            </div>
          </section>
        ))
      )}

      <ProductDialog
        product={selected}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/50"
      }`}
    >
      {label}
    </button>
  );
}
