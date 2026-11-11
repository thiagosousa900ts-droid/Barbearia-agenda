import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = {
  title: "Studio Sandro Cortes — Respeita o corte!",
  description: "Agende seu corte, barba e tratamentos no Studio Sandro Cortes.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
};
export const viewport = { themeColor: "#0b0b0c", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR"><body>
      <Nav />
      <main className="wrap">{children}</main>
      <footer>Qualidade ★ Estilo ★ Respeito<br />Aceitamos cartão (com taxa da maquininha) e PIX</footer>
    </body></html>
  );
}
