import { IDIOMAS, TERMOS_TECNICOS, contem, normalizar, palavras, titulo } from "./text";
import type { Analise, Classificacao, PalavraChave, Recomendacao, VagaInfo } from "./types";

function linhas(texto: string): string[] {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function classificar(score: number): Classificacao {
  if (score < 40) return "Baixa compatibilidade";
  if (score < 60) return "Compatibilidade parcial";
  if (score < 80) return "Boa compatibilidade";
  return "Alta compatibilidade";
}

const VERBOS_ACAO = [
  "atendi","analisei","apoiei","conduzi","coordenei","criei","desenvolvi","elaborei","executei","geri","implementei",
  "liderei","monitorei","negociei","organizei","planejei","realizei","reduzi","aumentei","otimizei","automatizei",
  "responsavel","atuei","gerenciei","treinei","supervisionei",
];

const SENIORIDADES = ["estagio","estagiario","aprendiz","trainee","junior","jr","pleno","senior","especialista","coordenador","supervisor","gerente","analista","assistente","auxiliar","lider"];

const MARCADORES_OBRIGATORIO = ["requisito","obrigatori","imprescindiv","necessario","exige","pre-requisito","precisa"];
const MARCADORES_DESEJAVEL = ["desejav","diferencial","sera um plus","valorizamos","bonus"];
const MARCADORES_RESPONSABILIDADE = ["responsabilidade","atividade","voce vai","o que voce","fara","realizar","atribuic","dia a dia","rotina"];

export function extrairInfoVaga(descricao: string, cargoManual = "", empresaManual = "", link = ""): VagaInfo {
  const ls = linhas(descricao);
  const norm = normalizar(descricao);

  let cargo = cargoManual.trim();
  if (!cargo) {
    const candidata = ls.find((l) => l.length < 80 && SENIORIDADES.some((s) => contem(normalizar(l), s)));
    cargo = (candidata ?? ls[0] ?? "").replace(/^vaga( de| para)?:?\s*/i, "").slice(0, 80);
  }

  const senioridade = SENIORIDADES.find((s) => contem(norm, s)) ?? "";

  const obrigatorios: string[] = [];
  const desejaveis: string[] = [];
  const responsabilidades: string[] = [];
  let bloco: "obrig" | "desej" | "resp" | null = null;

  for (const linha of ls) {
    const n = normalizar(linha);
    if (MARCADORES_DESEJAVEL.some((m) => n.includes(m)) && linha.length < 90) {
      bloco = "desej";
      continue;
    }
    if (MARCADORES_OBRIGATORIO.some((m) => n.includes(m)) && linha.length < 90) {
      bloco = "obrig";
      continue;
    }
    if (MARCADORES_RESPONSABILIDADE.some((m) => n.includes(m)) && linha.length < 90) {
      bloco = "resp";
      continue;
    }
    const item = linha.replace(/^[-•*–·\u2022\d.)\s]+/, "").trim();
    if (item.length < 4) continue;
    if (bloco === "desej") desejaveis.push(item);
    else if (bloco === "resp") responsabilidades.push(item);
    else if (bloco === "obrig") obrigatorios.push(item);
  }

  if (obrigatorios.length === 0) {
    obrigatorios.push(...ls.filter((l) => /^[-•*–·]/.test(l)).map((l) => l.replace(/^[-•*–·\s]+/, "")).slice(0, 12));
  }

  const tecnologias = TERMOS_TECNICOS.filter(
    (t) => contem(norm, t) && !IDIOMAS.includes(t) && !COMPORTAMENTAIS.includes(t),
  );
  const comportamentais = COMPORTAMENTAIS.filter((t) => contem(norm, t));
  const idiomas = IDIOMAS.filter((i) => contem(norm, i));
  const formacao = ["ensino medio", "ensino superior", "superior completo", "superior cursando", "tecnico", "tecnologo", "pos-graduacao", "mba", "bacharelado", "graduacao"].filter((f) => contem(norm, f));
  const certificacoes = ["certificacao", "iso 9001", "pmp", "scrum master", "cnh", "crc", "coren", "cfc", "itil"].filter((c) => contem(norm, c));

  return {
    cargo: cargo || "Vaga",
    empresa: empresaManual.trim(),
    link: link.trim(),
    senioridade: senioridade ? titulo(senioridade) : "",
    requisitosObrigatorios: dedupe(obrigatorios).slice(0, 15),
    requisitosDesejaveis: dedupe(desejaveis).slice(0, 10),
    responsabilidades: dedupe(responsabilidades).slice(0, 12),
    tecnologias,
    comportamentais,
    formacao,
    idiomas,
    certificacoes,
  };
}

const COMPORTAMENTAIS = [
  "comunicacao","lideranca","proatividade","organizacao","trabalho em equipe","resolucao de problemas",
  "gestao de pessoas","negociacao","flexibilidade","empatia","atendimento ao cliente",
];

function dedupe(itens: string[]): string[] {
  const vistos = new Set<string>();
  return itens.filter((i) => {
    const k = normalizar(i);
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
}

function palavrasChaveVaga(descricao: string, vaga: VagaInfo): PalavraChave[] {
  const norm = normalizar(descricao);
  const freq = new Map<string, number>();
  for (const p of palavras(descricao)) freq.set(p, (freq.get(p) ?? 0) + 1);

  const candidatos = new Map<string, PalavraChave>();

  const adicionar = (termo: string, obrigatoria: boolean) => {
    const chave = normalizar(termo);
    if (chave.length < 3) return;
    const existente = candidatos.get(chave);
    const ocorrencias = chave.includes(" ")
      ? (norm.match(new RegExp(chave.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length
      : (freq.get(chave) ?? 1);
    if (existente) {
      existente.obrigatoria = existente.obrigatoria || obrigatoria;
      return;
    }
    candidatos.set(chave, { termo, ocorrenciasVaga: Math.max(1, ocorrencias), obrigatoria });
  };

  const obrigatorioNorm = normalizar(vaga.requisitosObrigatorios.join(" "));
  for (const t of [...vaga.tecnologias, ...vaga.comportamentais, ...vaga.idiomas, ...vaga.certificacoes]) {
    adicionar(t, contem(obrigatorioNorm, t));
  }

  const ordenadas = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);
  for (const [p, ocorr] of ordenadas) {
    if (ocorr < 2 && candidatos.size > 12) continue;
    if (GENERICAS.has(p) || SENIORIDADES.includes(p)) continue;
    adicionar(p, contem(obrigatorioNorm, p));
  }

  return [...candidatos.values()]
    .sort((a, b) => Number(b.obrigatoria) - Number(a.obrigatoria) || b.ocorrenciasVaga - a.ocorrenciasVaga)
    .slice(0, 30);
}

function avaliarEstrutura(curriculo: string) {
  const norm = normalizar(curriculo);
  const problemas: string[] = [];
  const fortes: string[] = [];
  let pontos = 0;

  const temEmail = /[\w.+-]+@[\w-]+\.[\w.]+/.test(curriculo);
  temEmail ? (pontos += 15, fortes.push("Possui e-mail de contato identificável.")) : problemas.push("Não foi identificado um e-mail de contato no topo do currículo.");

  const temTelefone = /(\(?\d{2}\)?\s?)?9?\d{4}[-\s]?\d{4}/.test(curriculo);
  temTelefone ? (pontos += 10, fortes.push("Possui telefone de contato.")) : problemas.push("Não foi identificado um telefone de contato.");

  const secoesEsperadas = ["experiencia", "formacao", "competencia", "habilidade", "resumo", "objetivo", "curso", "idioma"];
  const encontradasSecoes = secoesEsperadas.filter((s) => contem(norm, s));
  pontos += Math.min(30, encontradasSecoes.length * 6);
  if (encontradasSecoes.length < 3) problemas.push("O currículo tem poucos títulos de seção claros (ex.: Resumo, Competências, Experiência, Formação).");
  else fortes.push("Apresenta títulos de seção reconhecíveis por sistemas ATS.");

  const bullets = (curriculo.match(/^\s*[-•*–·]/gm) ?? []).length;
  if (bullets >= 3) {
    pontos += 15;
    fortes.push("Usa listas simples para descrever atividades.");
  } else problemas.push("As atividades não estão em listas simples, o que dificulta a leitura automática.");

  if (/\|/.test(curriculo) || /\t{2,}/.test(curriculo)) problemas.push("Foram detectados sinais de tabelas ou colunas (| ou tabulações), incompatíveis com ATS.");
  else pontos += 10;

  const temData = /(19|20)\d{2}/.test(curriculo);
  temData ? (pontos += 10) : problemas.push("Não foram identificadas datas nas experiências ou formações.");

  const verbos = VERBOS_ACAO.filter((v) => contem(norm, v)).length;
  if (verbos >= 3) {
    pontos += 10;
    fortes.push("Descreve atividades com verbos de ação.");
  } else problemas.push("Poucos verbos de ação nas descrições das experiências.");

  const palavrasTotais = palavras(curriculo).length;
  if (palavrasTotais < 120) problemas.push("O currículo é muito curto: detalhe melhor suas atividades reais.");

  return { pontos: Math.min(100, pontos), problemas, fortes };
}

export function analisar(curriculo: string, descricaoVaga: string, cargo = "", empresa = "", link = ""): Analise {
  const vaga = extrairInfoVaga(descricaoVaga, cargo, empresa, link);
  const normCurriculo = normalizar(curriculo);
  const chaves = palavrasChaveVaga(descricaoVaga, vaga);

  const encontradas = chaves.filter((k) => contem(normCurriculo, k.termo));
  const ausentes = chaves.filter((k) => !contem(normCurriculo, k.termo));

  const peso = (k: PalavraChave) => (k.obrigatoria ? 2 : 1) + Math.min(2, k.ocorrenciasVaga / 3);
  const totalPeso = chaves.reduce((s, k) => s + peso(k), 0) || 1;
  const pesoEncontrado = encontradas.reduce((s, k) => s + peso(k), 0);
  const scoreCompetencias = Math.round((pesoEncontrado / totalPeso) * 100);

  const itensExperiencia = [...vaga.responsabilidades, ...vaga.requisitosObrigatorios];
  const experienciasCobertas = itensExperiencia.filter((item) => {
    const termos = palavras(item).slice(0, 8);
    if (termos.length === 0) return false;
    const acertos = termos.filter((t) => contem(normCurriculo, t)).length;
    return acertos / termos.length >= 0.4;
  });
  const scoreExperiencias = itensExperiencia.length
    ? Math.round((experienciasCobertas.length / itensExperiencia.length) * 100)
    : 50;

  const itensFormacao = [...vaga.formacao, ...vaga.idiomas, ...vaga.certificacoes];
  const formacaoCoberta = itensFormacao.filter((i) => contem(normCurriculo, i));
  const scoreFormacao = itensFormacao.length
    ? Math.round((formacaoCoberta.length / itensFormacao.length) * 100)
    : 60;

  const estrutura = avaliarEstrutura(curriculo);

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        scoreCompetencias * 0.45 + scoreExperiencias * 0.25 + scoreFormacao * 0.15 + estrutura.pontos * 0.15,
      ),
    ),
  );

  const requisitosNaoIdentificados = itensExperiencia.filter((i) => !experienciasCobertas.includes(i)).slice(0, 10);

  const recomendacoes: Recomendacao[] = [];
  if (!contem(normCurriculo, "resumo") && !contem(normCurriculo, "objetivo")) {
    recomendacoes.push({
      tipo: "melhoria",
      titulo: `Inclua um resumo profissional direcionado a "${vaga.cargo}".`,
      motivo: "A vaga espera um perfil específico e o currículo não apresenta um resumo ou título profissional no topo.",
    });
  }
  for (const k of ausentes.slice(0, 6)) {
    recomendacoes.push({
      tipo: "ausencia",
      titulo: `A vaga menciona "${k.termo}", mas essa expressão não aparece no seu currículo.`,
      motivo:
        "Esta competência aparece na vaga, mas não foi identificada no seu currículo. Adicione somente se você realmente possuir esse conhecimento.",
    });
  }
  for (const p of estrutura.problemas) {
    recomendacoes.push({
      tipo: "estrutura",
      titulo: p,
      motivo: "Sistemas ATS leem o texto de forma linear; falhas de estrutura podem eliminar o currículo antes da leitura humana.",
    });
  }
  if (estrutura.problemas.every((p) => !p.includes("verbos"))) {
    // já reconhecido como ponto forte
  } else {
    recomendacoes.push({
      tipo: "melhoria",
      titulo: "Apresente suas atividades com verbos de ação (ex.: atendi, organizei, reduzi).",
      motivo: "Verbos de ação deixam claro o que você fez de fato em cada experiência.",
    });
  }
  recomendacoes.push({
    tipo: "estrutura",
    titulo: "Evite tabelas, colunas, ícones e gráficos na versão enviada ao ATS.",
    motivo: "Esses elementos costumam ser ignorados ou embaralhados na leitura automática, apagando informações importantes.",
  });

  const secoesPoucoClaras: string[] = [];
  if (!contem(normCurriculo, "competencia") && !contem(normCurriculo, "habilidade"))
    secoesPoucoClaras.push("Competências — crie uma seção própria listando suas competências reais.");
  if (!contem(normCurriculo, "formacao") && !contem(normCurriculo, "escolaridade"))
    secoesPoucoClaras.push("Formação acadêmica — informe curso, instituição e período.");
  if (!contem(normCurriculo, "idioma") && vaga.idiomas.length > 0)
    secoesPoucoClaras.push("Idiomas — a vaga cita idiomas; descreva seu nível somente se já possuir.");
  if (vaga.responsabilidades.length > 0 && experienciasCobertas.length < vaga.responsabilidades.length / 2)
    secoesPoucoClaras.push("Experiências profissionais — detalhe atividades relacionadas às responsabilidades da vaga.");

  return {
    score,
    classificacao: classificar(score),
    composicao: {
      competencias: scoreCompetencias,
      experiencias: scoreExperiencias,
      formacao: scoreFormacao,
      estrutura: estrutura.pontos,
    },
    encontradas,
    ausentes,
    competenciasCompativeis: encontradas.map((k) => k.termo),
    requisitosNaoIdentificados,
    pontosFortes: estrutura.fortes,
    problemasEstrutura: estrutura.problemas,
    recomendacoes,
    secoesPoucoClaras,
    vaga,
  };
}
