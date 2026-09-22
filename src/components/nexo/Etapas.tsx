import { Check } from "lucide-react";

export const ETAPAS = ["Currículo", "Vaga", "Análise", "Currículo otimizado"] as const;

export function IndicadorEtapas({
  atual,
  onIr,
  liberadas,
}: {
  atual: number;
  onIr: (indice: number) => void;
  liberadas: number;
}) {
  return (
    <nav aria-label="Progresso da análise" className="w-full">
      <ol className="flex flex-wrap items-center gap-2 sm:gap-3">
        {ETAPAS.map((etapa, i) => {
          const concluida = i < atual;
          const ativa = i === atual;
          const habilitada = i <= liberadas;
          return (
            <li key={etapa} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => habilitada && onIr(i)}
                disabled={!habilitada}
                aria-current={ativa ? "step" : undefined}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                  ativa
                    ? "border-primary bg-primary text-primary-foreground"
                    : concluida
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-border bg-card text-muted-foreground"
                } ${habilitada ? "cursor-pointer hover:border-primary" : "cursor-not-allowed opacity-70"}`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    ativa ? "bg-primary-foreground/20" : concluida ? "bg-success/20" : "bg-muted"
                  }`}
                >
                  {concluida ? <Check className="size-3" /> : i + 1}
                </span>
                {etapa}
                {concluida && <span className="sr-only">(etapa concluída)</span>}
              </button>
              {i < ETAPAS.length - 1 && (
                <span aria-hidden="true" className="hidden h-px w-4 bg-border sm:block" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
