"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Nav() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return (
    <div className="nav">
      <Link href="/"><b>Studio Sandro Cortes</b></Link>
      <span>
        {email ? (<><Link href="/meus">Meus horários</Link><button onClick={() => supabase.auth.signOut()}>Sair</button></>) : (<Link href="/login">Entrar</Link>)}
      </span>
    </div>
  );
}
