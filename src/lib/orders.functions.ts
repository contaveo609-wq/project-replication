import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { orderInputSchema, type OrderInput } from "./orders.server";

export const placeGuestOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderInputSchema.parse(data))
  .handler(async ({ data }) => {
    const { createValidatedOrder } = await import("./orders.server");
    return createValidatedOrder(data as OrderInput, null);
  });

export const placeUserOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => orderInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { createValidatedOrder } = await import("./orders.server");
    return createValidatedOrder(data as OrderInput, context.userId);
  });

export const getOrder = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { loadOrder } = await import("./orders.server");
    return loadOrder(data.id);
  });
