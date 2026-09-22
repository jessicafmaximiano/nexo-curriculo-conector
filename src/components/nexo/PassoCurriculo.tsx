import { useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Eraser, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ErroArquivo, TAMANHO_MAXIMO, extrairTextoDoArquivo } from "@/lib/nexo/arquivos";
import { sanitizar } from "@/lib/nexo/text";

const MINIMO = 200;

export function PassoCurriculo({
  valor,
  onChange,
  onAvancar,
}: {
  valor: string;
  onChange: (texto: string) => void;
  onAvancar: () => void;
}) {
  const [erro, setErro] = useState("");
  const [lendo, setLendo] = useState(false);
  const [arquivoLido, setArquivoLido] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const suficiente = valor.trim().length >= MINIMO;

  async function receberArquivo(arquivo: File | undefined) {
    if (!arquivo) return;
    setErro("");
    setLendo(true);
    try {
      const texto = await extrairTextoDoArquivo(arquivo);
      onChange(texto);
      setArquivoLido(arquivo.name);
    } catch (e) {
      setArquivoLido("");
      setErro(
        e instanceof ErroArquivo
          ? e.message
          : "Não foi possível ler este arquivo. Cole o texto do seu currículo no campo abaixo.",
      );
    } finally {
      setLendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section aria-labelledby="titulo-curriculo" className="space-y-5">
      <div>
        <h1 id="titulo-curriculo" className="text-2xl font-bold tracking-tight">
          Etapa 1 — Seu currículo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cole o conteúdo completo do seu currículo. O texto é processado apenas no seu navegador.
        </p>
      </div>

      <div className="card-soft p-4 sm:p-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="curriculo">Conteúdo do currículo</Label>
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {valor.length.toLocaleString("pt-BR")} caracteres
          </span>
        </div>
        <Textarea
          id="curriculo"
          value={valor}
          onChange={(e) => onChange(sanitizar(e.target.value))}
          rows={14}
          placeholder="Cole aqui seu currículo completo: nome, contato, resumo, competências, experiências, formação, cursos e idiomas."
          aria-describedby="ajuda-curriculo"
          className="min-h-56 font-mono text-sm"
        />
        <p id="ajuda-curriculo" className="mt-2 text-xs text-muted-foreground">
          Mínimo de {MINIMO} caracteres para uma análise útil.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="sr-only"
            id="arquivo-curriculo"
            onChange={(e) => receberArquivo(e.target.files?.[0])}
          />
          <Button type="button" variant="outline" disabled={lendo} onClick={() => inputRef.current?.click()}>
            <Upload className="size-4" aria-hidden="true" />
            {lendo ? "Lendo arquivo..." : "Enviar PDF, DOCX ou TXT"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onChange("");
              setArquivoLido("");
              setErro("");
            }}
            disabled={!valor}
          >
            <Eraser className="size-4" aria-hidden="true" />
            Limpar
          </Button>
          <span className="self-center text-xs text-muted-foreground">
            Até {Math.round(TAMANHO_MAXIMO / 1024 / 1024)} MB por arquivo.
          </span>
        </div>
      </div>

      {erro && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Não foi possível usar o arquivo</AlertTitle>
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      {arquivoLido && !erro && (
        <Alert>
          <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
          <AlertTitle>Conteúdo reconhecido</AlertTitle>
          <AlertDescription>
            Texto extraído de “{arquivoLido}”. Revise abaixo e corrija o que for necessário.
          </AlertDescription>
        </Alert>
      )}

      {!suficiente && valor.trim().length > 0 && (
        <Alert role="status">
          <AlertTitle>Dados insuficientes</AlertTitle>
          <AlertDescription>
            O conteúdo está muito curto. Inclua suas experiências, competências e formação para uma análise confiável.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button onClick={onAvancar} disabled={!suficiente} size="lg">
          Continuar para a vaga
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
