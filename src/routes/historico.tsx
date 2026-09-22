import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, FileText, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apagarTudo, duplicarRegistro, excluirRegistro, lerHistorico } from "@/lib/nexo/storage";
import type { RegistroHistorico } from "@/lib/nexo/types";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de análises — NexoCV" },
      {
        name: "description",
        content: "Reabra, continue editando, duplique ou exclua suas análises de currículo salvas neste navegador.",
      },
      { property: "og:title", content: "Histórico de análises — NexoCV" },
      { property: "og:description", content: "Suas análises ficam salvas apenas no seu navegador." },
    ],
  }),
  component: Historico,
});

function Historico() {
  const [registros, setRegistros] = useState<RegistroHistorico[]>([]);
  const [carregado, setCarregado] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setRegistros(lerHistorico());
    setCarregado(true);
  }, []);

  function recarregar() {
    setRegistros(lerHistorico());
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Histórico</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suas análises ficam salvas apenas no armazenamento local deste navegador. Nenhum cadastro é necessário.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={registros.length === 0}>
              <Trash2 className="size-4" aria-hidden="true" />
              Apagar meus dados
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apagar todos os dados do NexoCV?</AlertDialogTitle>
              <AlertDialogDescription>
                Isso remove do seu navegador todas as análises salvas e o rascunho atual. A ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  apagarTudo();
                  recarregar();
                  toast.success("Seus dados foram apagados deste navegador.");
                }}
              >
                Apagar tudo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {carregado && registros.length === 0 && (
        <Alert>
          <FileText className="size-4" aria-hidden="true" />
          <AlertTitle>Nenhuma análise salva</AlertTitle>
          <AlertDescription>
            Você ainda não gerou análises neste navegador.{" "}
            <Link to="/analisar" className="font-medium text-primary underline">
              Analisar meu currículo
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}

      <ul className="space-y-3">
        {registros.map((r) => (
          <li key={r.id} className="card-soft flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="min-w-48 space-y-1">
              <p className="font-semibold text-foreground">{r.cargo || "Vaga sem título"}</p>
              <p className="text-sm text-muted-foreground">
                {r.empresa || "Empresa não informada"} ·{" "}
                {new Date(r.data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              </p>
              <Badge variant="secondary">
                Match Score {r.score}% — {r.classificacao}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => navigate({ to: "/analisar", search: { id: r.id } })}>
                <Pencil className="size-4" aria-hidden="true" />
                Abrir e continuar editando
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const copia = duplicarRegistro(r.id);
                  recarregar();
                  if (copia) toast.success("Análise duplicada.");
                }}
              >
                <Copy className="size-4" aria-hidden="true" />
                Duplicar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  excluirRegistro(r.id);
                  recarregar();
                  toast.success("Análise excluída.");
                }}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Excluir
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
