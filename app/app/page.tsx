"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase, brl } from "@/lib/supabase";

export default function Home() {
  const [services, setServices] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("services").select("id,name,price,duration_min").eq("active", true).order("price", { ascending: false })
      .then(({ data }) => setServices(data || []));
  }, []);
  return (
    <>
      <section className="hero">
        <img src="/logo.webp" alt="Studio Sandro Cortes" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
        <h1>Studio Sandro Cortes</h1>
        <div className="stripe" />
        <p>Respeita o corte! Agende seu horário em poucos toques.</p>
        <Link href="/agendar" className="btn">Agendar horário</Link>
      </section>
      <h2>Tabela de preços</h2>
      <div className="card">
        {services.length === 0 && <span className="mut">Carregando…</span>}
        {services.map((s) => (
          <div className="row" key={s.id} style={{ padding: "8px 0" }}>
            <span>{s.name} <span className="mut">· {s.duration_min} min</span></span>
            <span className="price">{brl(s.price)}</span>
          </div>
        ))}
      </div>
      <h2>Atendimento</h2>
      <div className="card"><span className="mut">Terça a sábado, das 10h às 19h.</span></div>
    </>
  );
}
