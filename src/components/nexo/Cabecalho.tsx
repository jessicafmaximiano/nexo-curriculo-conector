import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Logotipo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <span
        aria-hidden="true"
        className="gradient-brand flex size-8 items-center justify-center rounded-lg text-sm font-bold text-primary-foreground"
      >
        N
      </span>
      <span className="text-lg">
        Nexo<span className="text-primary">CV</span>
      </span>
    </Link>
  );
}

export function Cabecalho() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Logotipo />
        <nav aria-label="Navegação principal" className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/historico" activeProps={{ className: "bg-accent text-accent-foreground" }}>
              Histórico
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/analisar">Analisar currículo</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

export function Rodape() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto max-w-5xl space-y-2 px-4 py-8 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">NexoCV — Conecte seu currículo à vaga certa.</p>
        <p>
          Privacidade: seu currículo e a descrição da vaga são processados no seu próprio navegador e salvos apenas no
          armazenamento local do seu dispositivo. Nada é enviado para servidores externos.
        </p>
        <p>
          O NexoCV oferece uma análise orientativa e não garante aprovação em processos seletivos. Revise sempre todas as
          informações antes de enviar seu currículo.
        </p>
      </div>
    </footer>
  );
}
