import { contem, normalizar } from "./text";
import type { Analise, SecaoCurriculo } from "./types";

export const ORDEM_SECOES: { id: string; titulo: string }[] = [
  { id: "nome", titulo: "Nome" },
  { id: "contato", titulo: "Informações de contato" },
  { id: "titulo", titulo: "Título profissional" },
  { id: "resumo", titulo: "Resumo profissional" },
  { id: "competencias", titulo: "Competências" },
  { id: "experiencias", titulo: "Experiências profissionais" },
  { id: "formacao", titulo: "Formação acadêmica" },
  { id: "cursos", titulo: "Cursos e certificações" },
  { id: "idiomas", titulo: "Idiomas" },
  { id: "projetos", titulo: "Projetos" },
];

const MAPA_CABECALHOS: { id: string; termos: string[] }[] = [
  { id: "resumo", termos: ["resumo", "perfil profissional", "sobre mim", "apresentacao"] },
  { id: "titulo", termos: ["objetivo", "titulo profissional", "cargo pretendido"] },
  { id: "competencias", termos: ["competencia", "habilidade", "conhecimento", "skills", "qualificac"] },
  { id: "experiencias", termos: ["experiencia", "historico profissional", "atuacao profissional", "empregos"] },
  { id: "formacao", termos: ["formacao", "escolaridade", "educacao", "academic"] },
  { id: "cursos", termos: ["curso", "certificac", "capacitac", "complementar"] },
  { id: "idiomas", termos: ["idioma", "lingua"] },
  { id: "projetos", termos: ["projeto", "portfolio"] },
  { id: "contato", termos: ["contato", "dados pessoais"] },
];

function ehCabecalho(linha: string): string | null {
  const l = linha.trim();
  if (!l || l.length > 60) return null;
  const n = normalizar(l);
  for (const grupo of MAPA_CABECALHOS) {
    if (grupo.termos.some((t) => n.includes(t))) return grupo.id;
  }
  return null;
}

function limpar(texto: string): string {
  return texto
    .split("\n")
    .map((l) => l.replace(/\t+/g, " ").replace(/\s*\|\s*/g, " — ").replace(/\s{2,}/g, " ").trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Monta as seções do currículo otimizado usando SOMENTE o conteúdo original.
 * Nada é inventado: o texto é apenas reorganizado e limpo.
 */
export function montarCurriculoOtimizado(original: string, analise: Analise): SecaoCurriculo[] {
  const linhas = original.split("\n");
  const buckets = new Map<string, string[]>();
  let atual = "cabecalho";

  for (const linha of linhas) {
    const id = ehCabecalho(linha);
    if (id) {
      atual = id;
      continue;
    }
    if (!buckets.has(atual)) buckets.set(atual, []);
    buckets.get(atual)!.push(linha);
  }

  const cabecalho = (buckets.get("cabecalho") ?? []).map((l) => l.trim()).filter(Boolean);
  const nome = cabecalho[0] ?? "";

  const contatosDetectados: string[] = [];
  const email = original.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0];
  const telefone = original.match(/(\(?\d{2}\)?\s?)?9?\d{4}[-\s.]?\d{4}/)?.[0];
  const linkedin = original.match(/(https?:\/\/)?(www\.)?linkedin\.com\/[^\s,;]+/i)?.[0];
  const cidade = cabecalho.slice(1).find((l) => /,\s*[A-Z]{2}\b|\b(SP|RJ|MG|RS|PR|BA|SC|PE|CE|GO|DF)\b/.test(l));
  if (email) contatosDetectados.push(`E-mail: ${email}`);
  if (telefone) contatosDetectados.push(`Telefone: ${telefone.trim()}`);
  if (linkedin) contatosDetectados.push(`LinkedIn: ${linkedin}`);
  if (cidade) contatosDetectados.push(`Localidade: ${cidade}`);
  const contatoExtra = (buckets.get("contato") ?? []).map((l) => l.trim()).filter(Boolean);

  const restoCabecalho = cabecalho
    .slice(1)
    .filter((l) => l !== cidade && !contatosDetectados.some((c) => c.includes(l)) && !l.includes("@"));

  const secoes: SecaoCurriculo[] = ORDEM_SECOES.map(({ id, titulo }) => {
    let conteudo = "";
    switch (id) {
      case "nome":
        conteudo = nome;
        break;
      case "contato":
        conteudo = [...contatosDetectados, ...contatoExtra].join("\n");
        break;
      case "titulo": {
        const objetivo = (buckets.get("titulo") ?? []).map((l) => l.trim()).filter(Boolean).join(" ");
        conteudo = objetivo || restoCabecalho[0] || "";
        break;
      }
      case "resumo": {
        const resumo = (buckets.get("resumo") ?? []).join("\n");
        conteudo = resumo.trim() || restoCabecalho.slice(1).join(" ").trim();
        break;
      }
      case "competencias": {
        const brutas = (buckets.get("competencias") ?? []).join("\n");
        const itens = brutas
          .split(/[\n,;•·]|\s-\s/)
          .map((i) => i.replace(/^[-•*–·\s]+/, "").trim())
          .filter((i) => i.length > 1);
        // Reordena colocando primeiro as competências já compatíveis com a vaga.
        const compativeis = analise.competenciasCompativeis.map((c) => normalizar(c));
        itens.sort((a, b) => {
          const pa = compativeis.some((c) => contem(normalizar(a), c)) ? 0 : 1;
          const pb = compativeis.some((c) => contem(normalizar(b), c)) ? 0 : 1;
          return pa - pb;
        });
        conteudo = itens.map((i) => `- ${i}`).join("\n");
        break;
      }
      default: {
        const bruto = (buckets.get(id) ?? []).join("\n");
        conteudo = bruto;
      }
    }
    return { id, titulo, conteudo: limpar(conteudo) };
  });

  // Se nada foi classificado como experiência, preserva o texto restante ali.
  const experiencias = secoes.find((s) => s.id === "experiencias")!;
  if (!experiencias.conteudo) {
    const usados = new Set(["cabecalho", "resumo", "titulo", "competencias", "contato"]);
    const sobra = [...buckets.entries()]
      .filter(([k]) => !usados.has(k))
      .map(([, v]) => v.join("\n"))
      .join("\n");
    experiencias.conteudo = limpar(sobra || restoCabecalho.join("\n"));
  }

  return secoes.filter((s) => s.conteudo.trim().length > 0 || ["nome", "contato", "resumo", "experiencias"].includes(s.id));
}

export function secoesParaTexto(secoes: SecaoCurriculo[]): string {
  const partes: string[] = [];
  for (const secao of secoes) {
    if (!secao.conteudo.trim()) continue;
    if (secao.id === "nome") {
      partes.push(secao.conteudo.toUpperCase());
      continue;
    }
    if (secao.id === "contato") {
      partes.push(secao.conteudo);
      continue;
    }
    partes.push(`${secao.titulo.toUpperCase()}\n${secao.conteudo}`);
  }
  return partes.join("\n\n");
}
