import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Info, Lightbulb, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Analise } from "@/lib/nexo/types";

const COMPOSICAO: { chave: keyof Analise["composicao"]; rotulo: string; peso: string }[] = [
  { chave: "competencias", rotulo: "Competências e palavras-chave", peso: "45%" },
  { chave: "experiencias", rotulo: "Experiências e responsabilidades", peso: "25%" },
  { chave: "formacao", rotulo: "Formação, idiomas e certificações", peso: "15%" },
  { chave: "estrutura", rotulo: "Estrutura e legibilidade ATS", peso: "15%" },
];

function corScore(score: number) {
  if (score < 40) return "text-destructive";
  if (score < 60) return "text-warning";
  if (score < 80) return "text-primary";
  return "text-success";
}

function Bloco({
  titulo,
  children,
  descricao,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-soft p-4 sm:p-5">
      <h3 className="font-semibold text-foreground">{titulo}</h3>
      {descricao && <p className="mt-1 text-xs text-muted-foreground">{descricao}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Lista({ itens, icone: Icone, cor }: { itens: string[]; icone: typeof CheckCircle2; cor: string }) {
  if (itens.length === 0) return <p className="text-sm text-muted-foreground">Nenhum item identificado.</p>;
  return (
    <ul className="space-y-2">
      {itens.map((item) => (
        <li key={item} className="flex gap-2 text-sm text-foreground">
          <Icone className={`mt-0.5 size-4 shrink-0 ${cor}`} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PassoAnalise({
  analise,
  onVoltar,
  onAvancar,
}: {
  analise: Analise;
  onVoltar: () => void;
  onAvancar: () => void;
}) {
  return (
    <section aria-labelledby="titulo-analise" className="space-y-5">
      <div>
        <h1 id="titulo-analise" className="text-2xl font-bold tracking-tight">
          Etapa 3 — Análise de compatibilidade
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vaga analisada: <strong>{analise.vaga.cargo}</strong>
          {analise.vaga.empresa && <> — {analise.vaga.empresa}</>}
          {analise.vaga.senioridade && <> · Senioridade identificada: {analise.vaga.senioridade}</>}
        </p>
      </div>

      <div className="card-soft grid gap-6 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="text-center">
          <p className={`text-5xl font-extrabold ${corScore(analise.score)}`}>{analise.score}%</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{analise.classificacao}</p>
          <Badge variant="secondary" className="mt-2">
            Match Score
          </Badge>
        </div>
        <div className="space-y-3">
          {COMPOSICAO.map(({ chave, rotulo, peso }) => (
            <div key={chave}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  {rotulo} <span className="text-muted-foreground">({peso} do score)</span>
                </span>
                <span className="text-muted-foreground">{analise.composicao[chave]}%</span>
              </div>
              <Progress value={analise.composicao[chave]} aria-label={`${rotulo}: ${analise.composicao[chave]}%`} />
            </div>
          ))}
        </div>
      </div>

      <Alert>
        <Info className="size-4" aria-hidden="true" />
        <AlertTitle>Estimativa orientativa</AlertTitle>
        <AlertDescription>
          O Match Score indica o quanto seu currículo comunica os requisitos da vaga. Não é uma garantia de aprovação no
          processo seletivo.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <Bloco titulo="Palavras-chave encontradas" descricao="Termos da vaga que já aparecem no seu currículo.">
          {analise.encontradas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma palavra-chave da vaga foi encontrada.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {analise.encontradas.map((k) => (
                <li key={k.termo}>
                  <Badge className="bg-success/12 text-success hover:bg-success/20" variant="secondary">
                    <CheckCircle2 className="size-3" aria-hidden="true" />
                    {k.termo}
                    {k.obrigatoria && <span className="sr-only"> (requisito obrigatório)</span>}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Bloco>

        <Bloco
          titulo="Palavras-chave ausentes"
          descricao="Esta competência aparece na vaga, mas não foi identificada no seu currículo. Adicione somente se você realmente possuir esse conhecimento."
        >
          {analise.ausentes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todas as palavras-chave relevantes foram encontradas.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {analise.ausentes.map((k) => (
                <li key={k.termo}>
                  <Badge className="bg-warning/12 text-warning hover:bg-warning/20" variant="secondary">
                    <XCircle className="size-3" aria-hidden="true" />
                    {k.termo}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Bloco>

        <Bloco titulo="Pontos fortes do currículo">
          <Lista itens={analise.pontosFortes} icone={CheckCircle2} cor="text-success" />
        </Bloco>

        <Bloco titulo="Problemas de estrutura">
          <Lista itens={analise.problemasEstrutura} icone={AlertTriangle} cor="text-warning" />
        </Bloco>

        <Bloco titulo="Requisitos não identificados no currículo">
          <Lista itens={analise.requisitosNaoIdentificados} icone={XCircle} cor="text-destructive" />
        </Bloco>

        <Bloco titulo="Seções que precisam de mais clareza">
          <Lista itens={analise.secoesPoucoClaras} icone={Info} cor="text-primary" />
        </Bloco>
      </div>

      <Bloco titulo="Recomendações" descricao="Cada recomendação explica o motivo. Você decide o que se aplica a você.">
        <ul className="space-y-3">
          {analise.recomendacoes.map((r, i) => (
            <li key={`${r.titulo}-${i}`} className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="flex items-start gap-2 text-sm font-medium text-foreground">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {r.titulo}
              </p>
              <p className="mt-1 pl-6 text-sm text-muted-foreground">{r.motivo}</p>
            </li>
          ))}
        </ul>
      </Bloco>

      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="outline" onClick={onVoltar}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Ajustar dados
        </Button>
        <Button size="lg" onClick={onAvancar}>
          Ver currículo otimizado
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
