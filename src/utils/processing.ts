import { Ticket, BatchRun, Theme, ThemeTicket } from '@/types';
import { maskPII } from './pii';

const THEME_KEYWORDS: Record<string, string[]> = {
  'Atrasos na Entrega': ['entrega', 'atraso', 'prazo', 'chegou', 'demora', 'transportadora', 'rastreio', 'envio', 'demorando'],
  'Problemas de Pagamento': ['pagamento', 'cartão', 'pix', 'boleto', 'cobran', 'fatura', 'parcela', 'pagar'],
  'Qualidade do Produto': ['defeito', 'qualidade', 'quebrado', 'danificado', 'errado', 'diferente', 'veio errado'],
  'Solicitações de Reembolso': ['reembolso', 'devolução', 'estorno', 'devolver', 'cancelar pedido', 'cancelamento'],
  'Problemas de Acesso/Conta': ['login', 'senha', 'conta', 'acesso', 'cadastro', 'não consigo entrar'],
  'Preço e Frete': ['frete', 'preço', 'caro', 'desconto', 'cupom', 'promoção', 'valor do frete'],
};

function classifyTicket(body: string): string {
  const lower = body.toLowerCase();
  let bestTheme = 'Outros';
  let bestScore = 0;
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    const score = keywords.filter(k => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestTheme = theme;
    }
  }
  return bestTheme;
}

function generateSummary(themeName: string, tickets: Ticket[]): string {
  const count = tickets.length;
  const sample = tickets.slice(0, 3).map(t => {
    const snippet = t.body_masked.slice(0, 80).trim();
    return `"${snippet}…"`;
  });
  return `• ${count} tickets identificados neste tema.\n• Exemplos: ${sample.join('; ')}\n• Padrão recorrente detectado nos relatos dos clientes.`;
}

export interface ProcessingResult {
  batchRun: BatchRun;
  tickets: Ticket[];
  themes: Theme[];
  themeTickets: ThemeTicket[];
}

export function processTickets(
  rawTickets: Array<{ id?: string; created_at?: string; subject?: string; body?: string; status?: string; tags?: string }>,
  previousThemes?: Theme[]
): ProcessingResult {
  const runId = `run_${Date.now()}`;
  const now = new Date().toISOString();
  let discarded = 0;

  const tickets: Ticket[] = [];
  for (const raw of rawTickets) {
    if (!raw.body || raw.body.trim().length < 10) {
      discarded++;
      continue;
    }
    const masked = maskPII(raw.body);
    tickets.push({
      id: raw.id || `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      created_at: raw.created_at || now,
      status: raw.status,
      channel: 'tickets',
      subject: raw.subject,
      body: raw.body,
      body_masked: masked,
      tags: raw.tags ? raw.tags.split(',').map(t => t.trim()) : undefined,
    });
  }

  // Group by theme
  const groups: Record<string, Ticket[]> = {};
  for (const ticket of tickets) {
    const theme = classifyTicket(ticket.body_masked);
    if (!groups[theme]) groups[theme] = [];
    groups[theme].push(ticket);
  }

  const themes: Theme[] = [];
  const themeTickets: ThemeTicket[] = [];

  for (const [themeName, themeGroup] of Object.entries(groups)) {
    const themeId = `theme_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    // Calculate trend
    let trend: number | null = null;
    if (previousThemes) {
      const prev = previousThemes.find(t => t.name === themeName);
      if (prev && prev.tickets_count > 0) {
        trend = Math.round(((themeGroup.length - prev.tickets_count) / prev.tickets_count) * 100);
      }
    }

    const summary = generateSummary(themeName, themeGroup);

    themes.push({
      id: themeId,
      name: themeName,
      summary,
      tickets_count: themeGroup.length,
      trend_vs_prev: trend,
      run_id: runId,
    });

    // Mark examples (first 5)
    themeGroup.forEach((ticket, i) => {
      themeTickets.push({
        theme_id: themeId,
        ticket_id: ticket.id,
        is_example: i < 5,
      });
    });
  }

  // Sort themes by volume desc
  themes.sort((a, b) => b.tickets_count - a.tickets_count);

  const batchRun: BatchRun = {
    id: runId,
    created_at: now,
    tickets_total: rawTickets.length,
    tickets_processed: tickets.length,
    tickets_discarded: discarded,
    notes: `Processamento concluído. ${themes.length} temas identificados. ${discarded} tickets descartados (texto insuficiente).`,
  };

  return { batchRun, tickets, themes, themeTickets };
}
