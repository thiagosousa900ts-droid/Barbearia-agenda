"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, brl, hhmm, dataLonga } from "@/lib/supabase";

const LABEL: Record<string, string> = { confirmed: "Confirmado", held: "Reservando", completed: "Realizado", cancelled: "Cancelado", no_show: "Ausência" };

export default function Meus() {
  const router = useRouter();
  const [rows, setRows] = useState<any[] | null>(null);
  const [msg, setMsg] = useState<{ t: "err" | "ok"; s: string } | null>(null);

  async function load() {
    const { data } = await supabase.from("appointments")
      .select("id,start_at,status,price_total,professionals(display_name),appointment_services(services(name))")
      .order("start_at", { ascending: false }).limit(50);
    setRows(data || []);
  }
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/login?next=/meus"); else load();
    });
    if (new URLSearchParams(window.location.search).get("ok")) setMsg({ t: "ok", s: "Agendamento confirmado!" });
  }, []); // eslint-disable-line

  async function cancel(id: string) {
    if (!confirm("Cancelar este horário?")) return;
    const { error } = await supabase.rpc("cancel_appointment", { p_appt: id });
    setMsg(error ? { t: "err", s: error.message.includes("Prazo") ? "O prazo para cancelar já passou. Fale com a barbearia." : error.message } : { t: "ok", s: "Horário cancelado." });
    load();
  }

  const now = Date.now();
  const upcoming = (rows || []).filter((r) => r.status === "confirmed" && new Date(r.start_at).getTime() >= now).reverse();
  const past = (rows || []).filter((r) => !upcoming.includes(r));
  const Item = ({ r, act }: any) => (
    <div className="card">
      <div className="row"><b style={{ textTransform: "capitalize" }}>{dataLonga(r.start_at)} · {hhmm(r.start_at)}</b><span className="mut">{LABEL[r.status]}</span></div>
      <p className="mut" style={{ margin: "6px 0" }}>{(r.appointment_services || []).map((x: any) => x.services?.name).join(" + ")} · {r.professionals?.display_name}</p>
      <div className="row"><span className="price">{brl(r.price_total)}</span>{act && <button className="btn ghost" onClick={() => cancel(r.id)}>Cancelar</button>}</div>
    </div>
  );
  return (
    <>
      {msg && <div className={"msg " + msg.t}>{msg.s}</div>}
      <h2>Próximos horários</h2>
      {rows === null && <p className="mut">Carregando…</p>}
      {rows && upcoming.length === 0 && <p className="mut">Nenhum horário marcado. <Link href="/agendar" style={{ color: "var(--gold)" }}>Agendar agora</Link></p>}
      {upcoming.map((r) => <Item key={r.id} r={r} act />)}
      {past.length > 0 && <><h2>Histórico</h2>{past.map((r) => <Item key={r.id} r={r} />)}</>}
    </>
  );
}
