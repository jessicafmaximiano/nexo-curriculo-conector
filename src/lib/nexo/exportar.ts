import type { SecaoCurriculo } from "./types";
import { secoesParaTexto } from "./curriculo";
import { normalizar } from "./text";

export function nomeArquivo(nome: string, cargo: string, extensao: string): string {
  const parte = (v: string) =>
    normalizar(v)
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("");
  return ["Curriculo", parte(nome), parte(cargo)].filter(Boolean).join("_") + extensao;
}

function baixar(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function baixarTxt(secoes: SecaoCurriculo[], cargo: string): void {
  const nome = secoes.find((s) => s.id === "nome")?.conteudo ?? "";
  baixar(new Blob([secoesParaTexto(secoes)], { type: "text/plain;charset=utf-8" }), nomeArquivo(nome, cargo, ".txt"));
}

/** Gera um PDF A4 com texto real e selecionável, em coluna única. */
export async function exportarPdf(secoes: SecaoCurriculo[], cargo: string): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const margem = 56;
  const largura = doc.internal.pageSize.getWidth() - margem * 2;
  const alturaPagina = doc.internal.pageSize.getHeight();
  let y = margem;

  const novaPaginaSePreciso = (altura: number) => {
    if (y + altura > alturaPagina - margem) {
      doc.addPage();
      y = margem;
    }
  };

  const escrever = (texto: string, tamanho: number, estilo: "normal" | "bold", espacoDepois = 6) => {
    doc.setFont("helvetica", estilo);
    doc.setFontSize(tamanho);
    const linhas = doc.splitTextToSize(texto, largura) as string[];
    for (const linha of linhas) {
      novaPaginaSePreciso(tamanho * 1.35);
      doc.text(linha, margem, y);
      y += tamanho * 1.35;
    }
    y += espacoDepois;
  };

  const nome = secoes.find((s) => s.id === "nome")?.conteudo ?? "";
  const contato = secoes.find((s) => s.id === "contato")?.conteudo ?? "";

  if (nome) escrever(nome.toUpperCase(), 18, "bold", 2);
  if (contato) escrever(contato.split("\n").join("  •  "), 10, "normal", 10);

  for (const secao of secoes) {
    if (["nome", "contato"].includes(secao.id)) continue;
    if (!secao.conteudo.trim()) continue;
    novaPaginaSePreciso(46);
    escrever(secao.titulo.toUpperCase(), 11.5, "bold", 2);
    doc.setDrawColor(120);
    novaPaginaSePreciso(8);
    doc.line(margem, y - 6, margem + largura, y - 6);
    y += 2;
    for (const linha of secao.conteudo.split("\n")) {
      if (!linha.trim()) {
        y += 4;
        continue;
      }
      escrever(linha.replace(/^[-•*–·]\s*/, "• "), 10.5, "normal", 1);
    }
    y += 8;
  }

  doc.save(nomeArquivo(nome, cargo, ".pdf"));
}

export function imprimir(secoes: SecaoCurriculo[]): void {
  const janela = window.open("", "_blank", "width=800,height=900");
  if (!janela) return;
  const escapar = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const corpo = secoes
    .filter((s) => s.conteudo.trim())
    .map((s) =>
      s.id === "nome"
        ? `<h1>${escapar(s.conteudo)}</h1>`
        : s.id === "contato"
          ? `<p class="contato">${escapar(s.conteudo).replace(/\n/g, " • ")}</p>`
          : `<h2>${escapar(s.titulo)}</h2><pre>${escapar(s.conteudo)}</pre>`,
    )
    .join("");
  janela.document.write(
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Currículo</title><style>
      body{font-family:Arial,Helvetica,sans-serif;color:#1E293B;margin:2cm;font-size:11pt;line-height:1.45}
      h1{font-size:18pt;margin:0 0 4px;text-transform:uppercase}
      h2{font-size:12pt;margin:18px 0 4px;text-transform:uppercase;border-bottom:1px solid #94a3b8;padding-bottom:2px}
      pre{font-family:inherit;white-space:pre-wrap;margin:0}
      .contato{margin:0 0 8px;color:#475569}
    </style></head><body>${corpo}</body></html>`,
  );
  janela.document.close();
  janela.focus();
  janela.print();
}
