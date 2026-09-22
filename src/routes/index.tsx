import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardList, FileText, Lock, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NexoCV — Currículo ATS-friendly em 4 etapas" },
      {
        name: "description",
        content:
          "Descubra como seu currículo conversa com a vaga antes de enviá-lo: Match Score, palavras-chave e versão otimizada para ATS.",
      },
      { property: "og:title", content: "NexoCV — Currículo ATS-friendly em 4 etapas" },
      {
        property: "og:description",
        content: "Compare competências, encontre palavras-chave importantes e gere um currículo compatível com ATS.",
      },
    ],
  }),
  component: Index,
});

const PASSOS = [
  {
    icone: FileText,
    titulo: "1. Adicione seu currículo",
    texto: "Cole o texto do seu currículo ou envie um arquivo PDF, DOCX ou TXT.",
  },
  {
    icone: ClipboardList,
    titulo: "2. Cole a descrição da vaga",
    texto: "Informe o anúncio completo. Cargo, empresa e link são opcionais.",
  },
  {
    icone: Sparkles,
    titulo: "3. Receba a análise e a versão otimizada",
    texto: "Veja seu Match Score, as palavras-chave e edite o currículo ATS-friendly.",
  },
];

function Index() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="py-14 text-center sm:py-20">
        <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Conecte seu currículo à vaga certa
        </p>
        <h1 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Descubra como seu currículo conversa com a vaga antes de enviá-lo.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Compare competências, encontre palavras-chave importantes e gere uma versão mais clara e compatível com
          sistemas ATS — sem inventar nenhuma informação sobre você.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/analisar">
              Analisar meu currículo
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link to="/historico">Ver análises salvas</Link>
          </Button>
        </div>
      </section>

      <section aria-labelledby="como-funciona" className="pb-4">
        <h2 id="como-funciona" className="text-xl font-bold text-foreground">
          Como funciona
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {PASSOS.map(({ icone: Icone, titulo, texto }) => (
            <Card key={titulo} className="card-soft border-none shadow-none">
              <CardContent className="space-y-3 p-6">
                <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icone className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-semibold text-foreground">{titulo}</h3>
                <p className="text-sm text-muted-foreground">{texto}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 py-10 sm:grid-cols-2">
        <Alert>
          <Lock className="size-4" aria-hidden="true" />
          <AlertTitle>Privacidade</AlertTitle>
          <AlertDescription>
            Toda a análise acontece no seu navegador. Seus dados ficam salvos apenas no armazenamento local do seu
            dispositivo e você pode apagá-los quando quiser.
          </AlertDescription>
        </Alert>
        <Alert>
          <ShieldAlert className="size-4" aria-hidden="true" />
          <AlertTitle>Aviso importante</AlertTitle>
          <AlertDescription>
            O Match Score é uma estimativa orientativa. O NexoCV não garante aprovação no processo seletivo e nunca cria
            experiências, cursos ou competências que você não tenha informado.
          </AlertDescription>
        </Alert>
      </section>
    </div>
  );
}
