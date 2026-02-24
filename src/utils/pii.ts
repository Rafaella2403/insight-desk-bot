const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}[-.\s]?\d{4}/g;
const CPF_RE = /\d{3}[.\s-]?\d{3}[.\s-]?\d{3}[.\s-]?\d{2}/g;
const CNPJ_RE = /\d{2}[.\s]?\d{3}[.\s]?\d{3}[\/]?\d{4}[-]?\d{2}/g;

export function maskPII(text: string): string {
  return text
    .replace(EMAIL_RE, '[EMAIL]')
    .replace(CPF_RE, '[CPF]')
    .replace(CNPJ_RE, '[CNPJ]')
    .replace(PHONE_RE, '[TELEFONE]');
}
