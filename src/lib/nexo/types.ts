export type Classificacao =
  | "Baixa compatibilidade"
  | "Compatibilidade parcial"
  | "Boa compatibilidade"
  | "Alta compatibilidade";

export interface PalavraChave {
  termo: string;
  ocorrenciasVaga: number;
  obrigatoria: boolean;
}

export interface ComposicaoScore {
  competencias: number;
  experiencias: number;
  formacao: number;
  estrutura: number;
}

export interface Recomendacao {
  titulo: string;
  motivo: string;
  tipo: "melhoria" | "estrutura" | "ausencia";
}

export interface VagaInfo {
  cargo: string;
  empresa: string;
  link: string;
  senioridade: string;
  requisitosObrigatorios: string[];
  requisitosDesejaveis: string[];
  responsabilidades: string[];
  tecnologias: string[];
  comportamentais: string[];
  formacao: string[];
  idiomas: string[];
  certificacoes: string[];
}

export interface SecaoCurriculo {
  id: string;
  titulo: string;
  conteudo: string;
}

export interface Analise {
  score: number;
  classificacao: Classificacao;
  composicao: ComposicaoScore;
  encontradas: PalavraChave[];
  ausentes: PalavraChave[];
  competenciasCompativeis: string[];
  requisitosNaoIdentificados: string[];
  pontosFortes: string[];
  problemasEstrutura: string[];
  recomendacoes: Recomendacao[];
  secoesPoucoClaras: string[];
  vaga: VagaInfo;
}

export interface RegistroHistorico {
  id: string;
  data: string;
  cargo: string;
  empresa: string;
  score: number;
  classificacao: Classificacao;
  curriculoOriginal: string;
  descricaoVaga: string;
  secoes: SecaoCurriculo[];
  analise: Analise;
}
