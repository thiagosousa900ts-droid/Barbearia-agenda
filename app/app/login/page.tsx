"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [f, setF] = useState({ name: "", phone: "", email: "", password: "" });
  const [msg, setMsg] = useState<{ t: "err" | "ok"; s: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const next = () => (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("next")) || "/agendar";

  async function submit() {
    setBusy(true); setMsg(null);
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({
        email: f.email, password: f.password,
        options: { data: { full_name: f.name, phone: f.phone }, emailRedirectTo: window.location.origin + "/agendar" },
      });
      if (error) setMsg({ t: "err", s: error.message });
      else if (data.session) window.location.href = next();
      else setMsg({ t: "ok", s: "Conta criada! Confirme seu e-mail pelo link que enviamos e depois entre." });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
      if (error) setMsg({ t: "err", s: "E-mail ou senha incorretos." });
      else window.location.href = next();
    }
    setBusy(false);
  }
  async function reset() {
    if (!f.email) return setMsg({ t: "err", s: "Digite seu e-mail primeiro." });
    const { error } = await supabase.auth.resetPasswordForEmail(f.email, { redirectTo: window.location.origin + "/login" });
    setMsg(error ? { t: "err", s: error.message } : { t: "ok", s: "Enviamos um link para redefinir sua senha." });
  }
  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div className="tabs">
        <button className={"btn " + (mode === "in" ? "" : "ghost")} onClick={() => setMode("in")}>Entrar</button>
        <button className={"btn " + (mode === "up" ? "" : "ghost")} onClick={() => setMode("up")}>Criar conta</button>
      </div>
      {mode === "up" && (<>
        <input placeholder="Nome completo" value={f.name} onChange={set("name")} />
        <input placeholder="Telefone (WhatsApp)" inputMode="tel" value={f.phone} onChange={set("phone")} />
      </>)}
      <input placeholder="E-mail" type="email" value={f.email} onChange={set("email")} />
      <input placeholder="Senha (mín. 6 caracteres)" type="password" value={f.password} onChange={set("password")} />
      {msg && <div className={"msg " + msg.t}>{msg.s}</div>}
      <button className="btn full" disabled={busy || !f.email || f.password.length < 6 || (mode === "up" && !f.name)} onClick={submit}>
        {busy ? "Aguarde…" : mode === "in" ? "Entrar" : "Criar conta"}
      </button>
      {mode === "in" && <p className="mut" style={{ textAlign: "center" }}><a href="#" onClick={(e) => { e.preventDefault(); reset(); }}>Esqueci minha senha</a></p>}
    </div>
  );
}
