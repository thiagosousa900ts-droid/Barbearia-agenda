import { createClient } from "@supabase/supabase-js";

// URL e chave publicável são públicas por natureza; a segurança vem das políticas RLS.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qhvbcvhrmnudcosohdkr.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_KEY || "sb_publishable_Qq5d_KCq8s9Nf9vY0PoYww_QqH00l1M"
);
export const TZ = "America/Sao_Paulo";
export const brl = (n: number) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const hhmm = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
export const dataLonga = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: TZ, weekday: "long", day: "2-digit", month: "long" });
