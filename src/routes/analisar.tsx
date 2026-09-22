import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { IndicadorEtapas } from "@/components/nexo/Etapas";
import { PassoCurriculo } from "@/components/nexo/PassoCurriculo";
import { PassoVaga } from "@/components/nexo/PassoVaga";
import { PassoAnalise } from "@/components/nexo/PassoAnalise";
import { PassoEditor } from "@/components/nexo/PassoEditor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analisar as executarAnalise } from "@/lib/nexo/analise";
import { montarCurriculoOtimizado } from "@/lib/nexo/curriculo";
import {
  lerRegistro,
  lerSessao,
  novoId,
  salvarRegistro,
  salvarSessao,
  sessaoVazia,
  type SessaoNexo,
} from "@/lib/nexo/storage";
import type { Analise, SecaoCurriculo } from "@/lib/nexo/types";

export const Route = createFileRoute("/analisar")({
  validateSearch: z.object({ id: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Analisar currículo — NexoCV" },
      {
        name: "description",
        content:
          "Cole seu currículo e a descrição da vaga para ver o Match Score, as palavras-chave e gerar a versão ATS-friendly.",
      },
      { property: "og:title", content: "Analisar currículo — NexoCV" },
      {
        property: "og:description",
        content: "Fluxo em quatro etapas: currículo, vaga, análise e currículo otimizado.",
      },
    ],
  }),
  component: Analisar,
});

const MENSAGENS = [
  "Lendo seu currículo...",
  "Identificando requisitos da vaga...",
  "Comparando competências...",
  "Preparando suas recomendações...",
];

function Analisar() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState(0);
  const [sessao, setSessao] = useState<SessaoNexo>(sessaoVazia);
  const [analise, setAnalise] = useState<Analise | null>(null);
  const [secoes, setSecoes] = useState<SecaoCurriculo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState(0);
  const [erro, setErro] = useState("");
  const [pronto, setPronto] = useState(false);
  const registroId = useRef<string>("");

  // Carrega sessão do navegador (ou um registro salvo do histórico).
  useEffect(() => {
    if (id) {
      const registro = lerRegistro(id);
      if (registro) {
        registroId.current = registro.id;
        setSessao({
          curriculo: registro.curriculoOriginal,
          descricaoVaga: registro.descricaoVaga,
          cargo: registro.cargo,
          empresa: registro.empresa,
          link: "",
          registroId: registro.id,
        });
        setAnalise(registro.analise);
        setSecoes(registro.secoes);
        setEtapa(3);
        setPronto(true);
        return;
      }
      setErro("A análise solicitada não foi encontrada no seu navegador.");
    }
    setSessao(lerSessao());
    setPronto(true);
  }, [id]);

  // Salvamento automático da sessão.
  useEffect(() => {
    if (!pronto) return;
    salvarSessao(sessao);
  }, [sessao, pronto]);

  // Salvamento automático das edições no histórico.
  useEffect(() => {
    if (!pronto || !analise || secoes.length === 0 || !registroId.current) return;
    salvarRegistro({
      id: registroId.current,
      data: new Date().toISOString(),
      cargo: analise.vaga.cargo,
      empresa: analise.vaga.empresa,
      score: analise.score,
      classificacao: analise.classificacao,
      curriculoOriginal: sessao.curriculo,
      descricaoVaga: sessao.descricaoVaga,
      secoes,
      analise,
    });
  }, [secoes, analise, sessao.curriculo, sessao.descricaoVaga, pronto]);

  const atualizar = useCallback((campos: Partial<SessaoNexo>) => {
    setSessao((s) => ({ ...s, ...campos }));
  }, []);

  const gerar = useCallback(() => {
    setErro("");
    setCarregando(true);
    setMensagem(0);
    const intervalo = window.setInterval(() => setMensagem((m) => Math.min(m + 1, MENSAGENS.length - 1)), 450);
    window.setTimeout(() => {
      window.clearInterval(intervalo);
      try {
        const resultado = executarAnalise(
          sessao.curriculo,
          sessao.descricaoVaga,
          sessao.cargo,
          sessao.empresa,
          sessao.link,
        );
        const novasSecoes = montarCurriculoOtimizado(sessao.curriculo, resultado);
        registroId.current = registroId.current || novoId();
        setAnalise(resultado);
        setSecoes(novasSecoes);
        setEtapa(2);
      } catch {
        setErro("Não foi possível concluir a análise. Revise os textos inseridos e tente novamente.");
      } finally {
        setCarregando(false);
      }
    }, 1900);
  }, [sessao]);

  const restaurar = useCallback(() => {
    if (!analise) return;
    setSecoes(montarCurriculoOtimizado(sessao.curriculo, analise));
  }, [analise, sessao.curriculo]);

  const liberadas = useMemo(() => {
    if (analise) return 3;
    return sessao.curriculo.trim().length >= 200 ? 1 : 0;
  }, [analise, sessao.curriculo]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <IndicadorEtapas atual={etapa} liberadas={liberadas} onIr={setEtapa} />

      {erro && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Ocorreu um erro</AlertTitle>
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      {carregando ? (
        <div className="card-soft flex flex-col items-center gap-3 p-12 text-center" role="status" aria-live="polite">
          <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
          <p className="text-base font-medium text-foreground">{MENSAGENS[mensagem]}</p>
          <p className="text-sm text-muted-foreground">Tudo é processado no seu navegador.</p>
        </div>
      ) : (
        <>
          {etapa === 0 && (
            <PassoCurriculo
              valor={sessao.curriculo}
              onChange={(curriculo) => atualizar({ curriculo })}
              onAvancar={() => setEtapa(1)}
            />
          )}
          {etapa === 1 && (
            <PassoVaga
              descricao={sessao.descricaoVaga}
              cargo={sessao.cargo}
              empresa={sessao.empresa}
              link={sessao.link}
              onChange={atualizar}
              onVoltar={() => setEtapa(0)}
              onAnalisar={gerar}
            />
          )}
          {etapa === 2 &&
            (analise ? (
              <PassoAnalise analise={analise} onVoltar={() => setEtapa(1)} onAvancar={() => setEtapa(3)} />
            ) : (
              <VazioAnalise onVoltar={() => setEtapa(0)} />
            ))}
          {etapa === 3 &&
            (analise && secoes.length > 0 ? (
              <PassoEditor
                secoes={secoes}
                original={sessao.curriculo}
                cargo={analise.vaga.cargo}
                onAlterar={(id, conteudo) =>
                  setSecoes((atuais) => atuais.map((s) => (s.id === id ? { ...s, conteudo } : s)))
                }
                onRestaurar={restaurar}
                onVoltar={() => setEtapa(2)}
              />
            ) : (
              <VazioAnalise onVoltar={() => setEtapa(0)} />
            ))}
        </>
      )}

      {id && !lerRegistro(id) && pronto && (
        <button className="text-sm text-primary underline" onClick={() => navigate({ to: "/historico" })}>
          Voltar ao histórico
        </button>
      )}
    </div>
  );
}

function VazioAnalise({ onVoltar }: { onVoltar: () => void }) {
  return (
    <div className="card-soft p-10 text-center">
      <h2 className="text-lg font-semibold">Nenhuma análise disponível</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Insira seu currículo e a descrição da vaga para gerar a análise de compatibilidade.
      </p>
      <button onClick={onVoltar} className="mt-4 text-sm font-medium text-primary underline">
        Começar pela etapa 1
      </button>
    </div>
  );
}
