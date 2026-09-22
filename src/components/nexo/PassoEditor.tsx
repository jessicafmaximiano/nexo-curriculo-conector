import { useState } from "react";
import { ArrowLeft, Copy, Download, FileDown, Printer, RotateCcw, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { secoesParaTexto } from "@/lib/nexo/curriculo";
import { baixarTxt, exportarPdf, imprimir } from "@/lib/nexo/exportar";
import type { SecaoCurriculo } from "@/lib/nexo/types";

export function PassoEditor({
  secoes,
  original,
  cargo,
  onAlterar,
  onRestaurar,
  onVoltar,
}: {
  secoes: SecaoCurriculo[];
  original: string;
  cargo: string;
  onAlterar: (id: string, conteudo: string) => void;
  onRestaurar: () => void;
  onVoltar: () => void;
}) {
  const [exportando, setExportando] = useState(false);
  const texto = secoesParaTexto(secoes);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Currículo copiado como texto.");
    } catch {
      toast.error("Não foi possível copiar. Selecione o texto na pré-visualização e copie manualmente.");
    }
  }

  async function pdf() {
    setExportando(true);
    try {
      await exportarPdf(secoes, cargo);
      toast.success("PDF gerado com texto selecionável.");
    } catch {
      toast.error("Não foi possível gerar o PDF. Tente novamente ou baixe a versão .txt.");
    } finally {
      setExportando(false);
    }
  }

  return (
    <section aria-labelledby="titulo-editor" className="space-y-5">
      <div>
        <h1 id="titulo-editor" className="text-2xl font-bold tracking-tight">
          Etapa 4 — Currículo otimizado
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Versão em coluna única, sem tabelas, ícones ou gráficos, montada apenas com as informações do seu currículo
          original. Suas edições são salvas automaticamente no navegador.
        </p>
      </div>

      <Alert>
        <ShieldAlert className="size-4" aria-hidden="true" />
        <AlertTitle>Revise antes de enviar</AlertTitle>
        <AlertDescription>
          Confira nomes, datas, cargos e resultados. O NexoCV apenas reorganiza e limpa o que você escreveu — nada é
          inventado.
        </AlertDescription>
      </Alert>

      <div className="flex flex-wrap gap-2">
        <Button onClick={pdf} disabled={exportando}>
          <FileDown className="size-4" aria-hidden="true" />
          {exportando ? "Gerando PDF..." : "Exportar currículo em PDF"}
        </Button>
        <Button variant="outline" onClick={copiar}>
          <Copy className="size-4" aria-hidden="true" />
          Copiar texto
        </Button>
        <Button variant="outline" onClick={() => baixarTxt(secoes, cargo)}>
          <Download className="size-4" aria-hidden="true" />
          Baixar .txt
        </Button>
        <Button variant="outline" onClick={() => imprimir(secoes)}>
          <Printer className="size-4" aria-hidden="true" />
          Imprimir
        </Button>
        <Button variant="ghost" onClick={onRestaurar}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Restaurar versão
        </Button>
      </div>

      <Tabs defaultValue="editor">
        <TabsList className="flex-wrap">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="previa">Pré-visualização</TabsTrigger>
          <TabsTrigger value="comparar">Original x Otimizado</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          {secoes.map((secao) => (
            <div key={secao.id} className="card-soft p-4">
              <Label htmlFor={`secao-${secao.id}`} className="mb-2 block">
                {secao.titulo}
              </Label>
              <Textarea
                id={`secao-${secao.id}`}
                value={secao.conteudo}
                onChange={(e) => onAlterar(secao.id, e.target.value)}
                rows={secao.id === "nome" || secao.id === "titulo" ? 2 : 6}
                className="font-mono text-sm"
              />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="previa">
          <article className="card-soft whitespace-pre-wrap p-6 font-sans text-sm leading-relaxed text-foreground">
            {texto}
          </article>
        </TabsContent>

        <TabsContent value="comparar">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card-soft p-4">
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Original</h2>
              <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap font-mono text-xs">{original}</pre>
            </div>
            <div className="card-soft p-4">
              <h2 className="mb-2 text-sm font-semibold text-primary">Otimizado (ATS-friendly)</h2>
              <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap font-mono text-xs">{texto}</pre>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onVoltar}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para a análise
        </Button>
      </div>
    </section>
  );
}
