import { sanitizar } from "./text";

export const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB
export const TIPOS_ACEITOS = [".pdf", ".docx", ".txt"];

export class ErroArquivo extends Error {}

/** Extrai texto de PDF, DOCX ou TXT no próprio navegador (nenhum envio externo). */
export async function extrairTextoDoArquivo(arquivo: File): Promise<string> {
  const nome = arquivo.name.toLowerCase();
  if (arquivo.size > TAMANHO_MAXIMO) {
    throw new ErroArquivo("O arquivo é maior que 5 MB. Envie um arquivo menor ou cole o texto manualmente.");
  }
  if (!TIPOS_ACEITOS.some((ext) => nome.endsWith(ext))) {
    throw new ErroArquivo("Formato não compatível. Use PDF, DOCX ou TXT, ou cole o texto manualmente.");
  }

  if (nome.endsWith(".txt")) {
    return sanitizar(await arquivo.text());
  }

  if (nome.endsWith(".docx")) {
    const mammoth = await import("mammoth/mammoth.browser");
    const buffer = await arquivo.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
    return sanitizar(value);
  }

  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const doc = await pdfjs.getDocument({ data: await arquivo.arrayBuffer() }).promise;
  const paginas: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const pagina = await doc.getPage(i);
    const conteudo = await pagina.getTextContent();
    const linhas = new Map<number, string[]>();
    for (const item of conteudo.items as { str: string; transform: number[] }[]) {
      if (!item.str) continue;
      const y = Math.round(item.transform[5] ?? 0);
      if (!linhas.has(y)) linhas.set(y, []);
      linhas.get(y)!.push(item.str);
    }
    const ordenadas = [...linhas.entries()].sort((a, b) => b[0] - a[0]);
    paginas.push(ordenadas.map(([, partes]) => partes.join(" ").replace(/\s{2,}/g, " ").trim()).join("\n"));
  }
  const texto = sanitizar(paginas.join("\n"));
  if (texto.replace(/\s/g, "").length < 40) {
    throw new ErroArquivo(
      "Não foi possível ler o texto deste PDF (ele pode ser digitalizado como imagem). Cole o conteúdo manualmente.",
    );
  }
  return texto;
}
