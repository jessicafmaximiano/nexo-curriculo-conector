/** Utilidades de texto puras, sem dependências de navegador. */

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Remove caracteres de controle e limita o tamanho (sanitização básica). */
export function sanitizar(texto: string, limite = 60000): string {
  return texto
    .replace(/\r\n?/g, "\n")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .slice(0, limite);
}

export const STOPWORDS = new Set(
  [
    "a","ao","aos","as","com","como","da","das","de","do","dos","e","em","entre","era","essa","esse","esta","este","eu",
    "foi","ha","isso","ja","la","mais","mas","me","mesmo","meu","minha","muito","na","nao","nas","no","nos","o","os","ou",
    "para","pela","pelo","por","que","se","sem","ser","seu","sua","tambem","tem","ter","um","uma","umas","uns","vaga",
    "sobre","voce","nossa","nosso","sao","seja","sera","todos","toda","todas","todo","dia","dias","ano","anos","area",
    "atividades","empresa","trabalho","profissional","conhecimento","conhecimentos","experiencia","experiencias","perfil",
    "requisitos","desejavel","desejaveis","obrigatorio","obrigatorios","responsabilidades","principais","atuar","atuacao",
    "candidato","candidata","time","equipe","forma","nivel","local","salario","beneficios","horario","contrato","apenas",
    "bem","boa","bom","ainda","onde","quando","qual","quais","desde","ate","pode","podera","deve","devera","fazer","feito",
    "novo","nova","outros","outras","etc","junto","alem","atraves","cada","algum","alguma","assim","aqui","este","esses",
  ].map(normalizar),
);

export function palavras(texto: string): string[] {
  return normalizar(texto)
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .split(/\s+/)
    .map((p) => p.replace(/^[-./]+|[-./]+$/g, ""))
    .filter((p) => p.length > 2 && !STOPWORDS.has(p) && !/^\d+$/.test(p));
}

/** Termos técnicos/ferramentas reconhecidos mesmo quando curtos. */
export const TERMOS_TECNICOS = [
  "excel","power bi","powerbi","sql","python","java","javascript","typescript","react","node","angular","vue","php",
  "c#",".net","aws","azure","gcp","docker","kubernetes","git","linux","html","css","figma","photoshop","illustrator",
  "canva","salesforce","sap","totvs","protheus","crm","erp","jira","scrum","kanban","agile","agil","pmo","itil",
  "google analytics","seo","sem","meta ads","google ads","inbound","copywriting","branding","ux","ui","wordpress",
  "vba","looker","tableau","qlik","etl","big data","machine learning","pandas","numpy","api","rest","graphql",
  "atendimento ao cliente","atendimento","vendas","negociacao","prospeccao","pos-venda","logistica","estoque",
  "financeiro","contabil","folha de pagamento","departamento pessoal","recrutamento","selecao","treinamento",
  "lgpd","iso 9001","lean","six sigma","kaizen","5s","pcp","qualidade","auditoria","compras","suprimentos",
  "ingles","espanhol","frances","alemao","libras","comunicacao","lideranca","proatividade","organizacao",
  "trabalho em equipe","resolucao de problemas","gestao de projetos","gestao de pessoas","analise de dados",
];

export const IDIOMAS = ["ingles", "espanhol", "frances", "alemao", "italiano", "mandarim", "libras", "japones"];

export function contem(textoNormalizado: string, termo: string): boolean {
  const t = normalizar(termo);
  const escapado = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escapado}([^a-z0-9]|$)`).test(textoNormalizado);
}

export function titulo(termo: string): string {
  return termo
    .split(" ")
    .map((p) => (p.length > 2 ? p.charAt(0).toUpperCase() + p.slice(1) : p))
    .join(" ");
}
