import { useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { effectivePrice, formatBRL, primaryImage, type Product } from "@/lib/menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function ProductDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<Record<string, number>>({});

  useEffect(() => {
    setQuantity(1);
    setNotes("");
    setSelected({});
  }, [product?.id, open]);

  const unitPrice = product ? effectivePrice(product) : 0;

  const addonList = useMemo(() => {
    if (!product) return [];
    return product.addon_groups.flatMap((g) =>
      g.product_addons
        .filter((a) => (selected[a.id] ?? 0) > 0)
        .map((a) => ({ id: a.id, name: a.name, price: a.price, quantity: selected[a.id] ?? 0 })),
    );
  }, [product, selected]);

  const total =
    (unitPrice + addonList.reduce((sum, a) => sum + a.price * a.quantity, 0)) * quantity;

  if (!product) return null;

  const image = primaryImage(product);

  function groupCount(groupId: string) {
    const group = product!.addon_groups.find((g) => g.id === groupId);
    return (group?.product_addons ?? []).reduce((sum, a) => sum + (selected[a.id] ?? 0), 0);
  }

  function change(addonId: string, groupId: string, delta: number) {
    const group = product!.addon_groups.find((g) => g.id === groupId);
    const max = group?.max_select ?? 99;
    setSelected((prev) => {
      const current = prev[addonId] ?? 0;
      const next = current + delta;
      if (next < 0) return prev;
      if (delta > 0 && max > 0 && groupCount(groupId) >= max) {
        toast.info(`Máximo de ${max} opção(ões) em "${group?.title}".`);
        return prev;
      }
      return { ...prev, [addonId]: next };
    });
  }

  function handleAdd() {
    for (const group of product!.addon_groups) {
      if (group.is_required && groupCount(group.id) < Math.max(group.min_select, 1)) {
        toast.error(`Escolha ao menos ${Math.max(group.min_select, 1)} item em "${group.title}".`);
        return;
      }
    }
    addItem({
      productId: product!.id,
      slug: product!.slug,
      name: product!.name,
      image,
      unitPrice,
      quantity,
      notes: notes.trim(),
      addons: addonList,
    });
    toast.success(`${product!.name} adicionado ao carrinho`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        {image ? (
          <img src={image} alt={product.name} className="h-56 w-full object-cover sm:h-64" />
        ) : null}
        <div className="p-5">
          <DialogTitle className="font-display text-3xl leading-tight">{product.name}</DialogTitle>
          {product.description ? (
            <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {product.weight ? <span className="rounded-full bg-muted px-2 py-1">{product.weight}</span> : null}
            {product.quantity_label ? (
              <span className="rounded-full bg-muted px-2 py-1">{product.quantity_label}</span>
            ) : null}
            {product.serves ? (
              <span className="rounded-full bg-muted px-2 py-1">Serve {product.serves} pessoa(s)</span>
            ) : null}
          </div>
          <p className="mt-3 font-display text-3xl text-primary">
            {product.price_from ? "A partir de " : ""}
            {formatBRL(unitPrice)}
          </p>

          {product.addon_groups.map((group) => (
            <section key={group.id} className="mt-5">
              <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                <h4 className="font-semibold">{group.title}</h4>
                <span className="text-xs text-muted-foreground">
                  {group.is_required ? "Obrigatório" : "Opcional"}
                  {group.max_select > 0 ? ` • até ${group.max_select}` : ""}
                </span>
              </div>
              <ul className="divide-y divide-border">
                {group.product_addons.map((addon) => (
                  <li key={addon.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{addon.name}</p>
                      {addon.description ? (
                        <p className="text-xs text-muted-foreground">{addon.description}</p>
                      ) : null}
                      <p className="text-sm text-primary">
                        {addon.price > 0 ? `+ ${formatBRL(addon.price)}` : "Grátis"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-label={`Remover ${addon.name}`}
                        className="h-8 w-8"
                        onClick={() => change(addon.id, group.id, -1)}
                        disabled={(selected[addon.id] ?? 0) === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-5 text-center text-sm font-semibold">
                        {selected[addon.id] ?? 0}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-label={`Adicionar ${addon.name}`}
                        className="h-8 w-8"
                        onClick={() => change(addon.id, group.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <div className="mt-5">
            <label className="text-sm font-semibold" htmlFor="obs">
              Observações
            </label>
            <Textarea
              id="obs"
              value={notes}
              maxLength={300}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: sem pimenta, ponto da carne..."
              className="mt-1"
            />
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center gap-3 border-t border-border bg-card p-4">
          <div className="flex items-center gap-2 rounded-full border border-border px-2 py-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Diminuir quantidade"
              className="h-8 w-8"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-5 text-center font-semibold">{quantity}</span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Aumentar quantidade"
              className="h-8 w-8"
              onClick={() => setQuantity((q) => Math.min(50, q + 1))}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={product.is_sold_out}
            className="h-11 flex-1 rounded-full text-base font-bold"
          >
            {product.is_sold_out ? "Esgotado" : `Adicionar • ${formatBRL(total)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
