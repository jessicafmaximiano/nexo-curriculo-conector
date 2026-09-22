import type { RegistroHistorico } from "./types";

const CHAVE_HISTORICO = "nexocv:historico";
const CHAVE_SESSAO = "nexocv:sessao";

function disponivel(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export interface SessaoNexo {
  curriculo: string;
  descricaoVaga: string;
  cargo: string;
  empresa: string;
  link: string;
  registroId?: string;
}

export const sessaoVazia: SessaoNexo = {
  curriculo: "",
  descricaoVaga: "",
  cargo: "",
  empresa: "",
  link: "",
};

export function lerSessao(): SessaoNexo {
  if (!disponivel()) return sessaoVazia;
  try {
    const bruto = localStorage.getItem(CHAVE_SESSAO);
    return bruto ? { ...sessaoVazia, ...(JSON.parse(bruto) as SessaoNexo) } : sessaoVazia;
  } catch {
    return sessaoVazia;
  }
}

export function salvarSessao(sessao: SessaoNexo): void {
  if (!disponivel()) return;
  try {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  } catch {
    /* armazenamento indisponível */
  }
}

export function lerHistorico(): RegistroHistorico[] {
  if (!disponivel()) return [];
  try {
    const bruto = localStorage.getItem(CHAVE_HISTORICO);
    const lista = bruto ? (JSON.parse(bruto) as RegistroHistorico[]) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function escrever(lista: RegistroHistorico[]): void {
  if (!disponivel()) return;
  try {
    localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(lista.slice(0, 40)));
  } catch {
    /* espaço insuficiente */
  }
}

export function salvarRegistro(registro: RegistroHistorico): void {
  const lista = lerHistorico().filter((r) => r.id !== registro.id);
  escrever([registro, ...lista]);
}

export function lerRegistro(id: string): RegistroHistorico | undefined {
  return lerHistorico().find((r) => r.id === id);
}

export function excluirRegistro(id: string): void {
  escrever(lerHistorico().filter((r) => r.id !== id));
}

export function duplicarRegistro(id: string): RegistroHistorico | undefined {
  const original = lerRegistro(id);
  if (!original) return undefined;
  const copia: RegistroHistorico = {
    ...original,
    id: novoId(),
    data: new Date().toISOString(),
    cargo: `${original.cargo} (cópia)`,
  };
  salvarRegistro(copia);
  return copia;
}

export function apagarTudo(): void {
  if (!disponivel()) return;
  localStorage.removeItem(CHAVE_HISTORICO);
  localStorage.removeItem(CHAVE_SESSAO);
}

export function novoId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
