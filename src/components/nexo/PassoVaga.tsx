import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { sanitizar } from "@/lib/nexo/text";

const MINIMO = 120;

export function PassoVaga({
  descricao,
  cargo,
  empresa,
  link,
  onChange,
  onVoltar,
  onAnalisar,
}: {
  descricao: string;
  cargo: string;
  empresa: string;
  link: string;
  onChange: (campos: { descricaoVaga?: string; cargo?: string; empresa?: string; link?: string }) => void;
  onVoltar: () => void;
  onAnalisar: () => void;
}) {
  const suficiente = descricao.trim().length >= MINIMO;

  return (
    <section aria-labelledby="titulo-vaga" className="space-y-5">
      <div>
        <h1 id="titulo-vaga" className="text-2xl font-bold tracking-tight">
          Etapa 2 — Descrição da vaga
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cole o anúncio completo, incluindo responsabilidades e requisitos.
        </p>
      </div>

      <div className="card-soft space-y-4 p-4 sm:p-5">
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="vaga">Descrição completa da vaga</Label>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {descricao.length.toLocaleString("pt-BR")} caracteres
            </span>
          </div>
          <Textarea
            id="vaga"
            rows={12}
            value={descricao}
            onChange={(e) => onChange({ descricaoVaga: sanitizar(e.target.value) })}
            placeholder="Cole aqui o texto da vaga: cargo, responsabilidades, requisitos obrigatórios e desejáveis."
            className="min-h-48 font-mono text-sm"
            aria-describedby="ajuda-vaga"
          />
          <p id="ajuda-vaga" className="mt-2 text-xs text-muted-foreground">
            Mínimo de {MINIMO} caracteres. Cargo, senioridade, requisitos, tecnologias e idiomas são identificados
            automaticamente.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo (opcional)</Label>
            <Input id="cargo" value={cargo} onChange={(e) => onChange({ cargo: e.target.value })} placeholder="Analista de Dados" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa (opcional)</Label>
            <Input id="empresa" value={empresa} onChange={(e) => onChange({ empresa: e.target.value })} placeholder="Nome da empresa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Link da vaga (opcional)</Label>
            <Input id="link" type="url" value={link} onChange={(e) => onChange({ link: e.target.value })} placeholder="https://" />
          </div>
        </div>
      </div>

      {!suficiente && descricao.trim().length > 0 && (
        <Alert role="status">
          <AlertTitle>Dados insuficientes</AlertTitle>
          <AlertDescription>
            A descrição está curta demais para identificar requisitos. Cole o anúncio completo da vaga.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="outline" onClick={onVoltar}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar
        </Button>
        <Button size="lg" disabled={!suficiente} onClick={onAnalisar}>
          <Search className="size-4" aria-hidden="true" />
          Analisar compatibilidade
        </Button>
      </div>
    </section>
  );
}
