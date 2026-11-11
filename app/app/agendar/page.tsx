"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, TZ, brl, hhmm, dataLonga } from "@/lib/supabase";

// próximos N dias no fuso da barbearia, como 'YYYY-MM-DD'
function nextDays(n: number) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: TZ });
  const base = new Date(today + "T12:00:00Z");
  return Array.from({ length: n }, (_, i) => new Date(base.getTime() + i * 864e5).toISOString().slice(0, 10));
}

export default function Agendar() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [pros, setPros] = useState<any[]>([]);
  const [pro, setPro] = useState<string | null>(null);
  const [sel, setSel] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [slotsByDay, setSlotsByDay] = useState<Record<string, string[]>>({});
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const days = useMemo(() => nextDays(14), []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { router.replace("/login?next=/agendar"); return; }
      const [c, s, p] = await Promise.all([
        supabase.from("clients").select("id").eq("profile_id", data.session.user.id).maybeSingle(),
        supabase.from("services").select("id,name,price,duration_min").eq("active", true).order("price", { ascending: false }),
        supabase.from("professionals").select("id,display_name").eq("active", true),
      ]);
      setClientId(c.data?.id ?? null); setServices(s.data || []); setPros(p.data || []);
      if (p.data?.length === 1) setPro(p.data[0].id);
      setReady(true);
    })();
  }, [router]);

  async function loadAvailability(proId: string, ids: string[]) {
    const res = await Promise.all(days.map((d) => supabase.rpc("get_available_slots", { p_professional: proId, p_service_ids: ids, p_day: d })));
    const by: Record<string, string[]> = {}; const cnt: Record<string, number> = {};
    res.forEach((r, i) => { const list = (r.data || []).map((x: any) => x.slot_start); by[days[i]] = list; cnt[days[i]] = list.length; });
    setSlotsByDay(by); setCounts(cnt);
    setDay((cur) => (cur && cnt[cur] ? cur : days.find((d) => cnt[d] > 0) || null));
  }
  useEffect(() => {
    setSlot(null);
    if (pro && sel.length) loadAvailability(pro, sel); else { setSlotsByDay({}); setCounts({}); setDay(null); }
  }, [pro, sel]); // eslint-disable-line

  const chosen = services.filter((s) => sel.includes(s.id));
  const total = chosen.reduce((a, s) => a + Number(s.price), 0);
  const mins = chosen.reduce((a, s) => a + s.duration_min, 0);
  const toggle = (id: string) => setSel((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  async function confirm() {
    if (!pro || !slot || !clientId) return;
    setBusy(true); setMsg(null);
    const { error } = await supabase.rpc("book_appointment", { p_professional: pro, p_client: clientId, p_service_ids: sel, p_start: slot });
    setBusy(false);
    if (error) {
      setMsg(error.message.includes("indispon") ? "Esse horário acabou de ser ocupado. Escolha outro." : "Não foi possível agendar: " + error.message);
      setSlot(null); loadAvailability(pro, sel); return;
    }
    router.push("/meus?ok=1");
  }

  if (!ready) return <p className="mut">Carregando…</p>;
  if (!clientId) return <div className="msg err">Não encontramos seu cadastro de cliente. Saia e crie a conta novamente.</div>;

  return (
    <>
      <h2>1. Serviços</h2>
      {services.map((s) => (
        <div key={s.id} className={"opt " + (sel.includes(s.id) ? "on" : "")} onClick={() => toggle(s.id)}>
          <span>{s.name} <span className="mut">· {s.duration_min} min</span></span><span className="price">{brl(s.price)}</span>
        </div>
      ))}
      {pros.length > 1 && (<>
        <h2>Profissional</h2>
        {pros.map((p) => <div key={p.id} className={"opt " + (pro === p.id ? "on" : "")} onClick={() => setPro(p.id)}>{p.display_name}</div>)}
      </>)}
      {pro && sel.length > 0 && (<>
        <h2>2. Data</h2>
        <div className="chips">
          {days.map((d) => {
            const dt = new Date(d + "T12:00:00Z");
            return (
              <button key={d} disabled={!counts[d]} className={"chip " + (day === d ? "on" : "")} onClick={() => { setDay(d); setSlot(null); }}>
                <small>{dt.toLocaleDateString("pt-BR", { weekday: "short", timeZone: "UTC" })}</small>
                <b>{dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" })}</b>
              </button>
            );
          })}
        </div>
        <h2>3. Horário</h2>
        {!day && <p className="mut">Sem horários disponíveis nos próximos dias.</p>}
        <div className="slots">
          {day && (slotsByDay[day] || []).map((s) => <button key={s} className={"slot " + (slot === s ? "on" : "")} onClick={() => setSlot(s)}>{hhmm(s)}</button>)}
        </div>
      </>)}
      {msg && <div className="msg err">{msg}</div>}
      {slot && (
        <div className="card" style={{ borderColor: "var(--gold)" }}>
          <div className="mut">Resumo</div>
          <p style={{ margin: "6px 0" }}>{chosen.map((s) => s.name).join(" + ")}</p>
          <p style={{ margin: "6px 0", textTransform: "capitalize" }}>{dataLonga(slot)}, às {hhmm(slot)}</p>
          <div className="row"><span className="mut">{mins} min</span><span className="price">{brl(total)}</span></div>
          <p className="mut">Pagamento no local: cartão (com taxa da maquininha) ou PIX.</p>
          <button className="btn full" disabled={busy} onClick={confirm}>{busy ? "Confirmando…" : "Confirmar agendamento"}</button>
        </div>
      )}
    </>
  );
}
