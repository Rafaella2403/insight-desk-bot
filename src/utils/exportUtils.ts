import { Theme, Ticket, ThemeTicket } from '@/types';

export function exportThemesCSV(themes: Theme[]): void {
  const header = 'Tema,Volume,Tendência,Sumário';
  const rows = themes.map(t => {
    const trend = t.trend_vs_prev !== null ? `${t.trend_vs_prev > 0 ? '+' : ''}${t.trend_vs_prev}%` : 'N/A';
    const summary = t.summary.replace(/\n/g, ' ').replace(/"/g, '""');
    return `"${t.name}",${t.tickets_count},"${trend}","${summary}"`;
  });
  const csv = [header, ...rows].join('\n');
  downloadFile(csv, 'temas_insightdesk.csv', 'text/csv');
}

export function exportReportPDF(
  themes: Theme[],
  tickets: Ticket[],
  themeTickets: ThemeTicket[],
  lastRun?: string
): void {
  const themeRows = themes.map(t => {
    const trend = t.trend_vs_prev !== null ? `${t.trend_vs_prev > 0 ? '+' : ''}${t.trend_vs_prev}%` : 'N/A';
    const examples = themeTickets
      .filter(tt => tt.theme_id === t.id && tt.is_example)
      .slice(0, 3)
      .map(tt => {
        const ticket = tickets.find(tk => tk.id === tt.ticket_id);
        return ticket ? `<li style="margin-bottom:4px;color:#555;">${ticket.body_masked.slice(0, 120)}…</li>` : '';
      })
      .join('');

    return `
      <div style="margin-bottom:24px;page-break-inside:avoid;">
        <h3 style="color:#0f766e;margin-bottom:4px;">${t.name}</h3>
        <p style="color:#666;font-size:14px;">Volume: ${t.tickets_count} · Tendência: ${trend}</p>
        <p style="white-space:pre-line;font-size:13px;color:#333;margin:8px 0;">${t.summary}</p>
        ${examples ? `<ul style="font-size:12px;padding-left:16px;">${examples}</ul>` : ''}
      </div>`;
  }).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Relatório InsightDesk AI</title>
    <style>body{font-family:'DM Sans',system-ui,sans-serif;padding:40px;max-width:800px;margin:0 auto;color:#1a1a2e;}
    h1{color:#0f766e;} h2{color:#333;border-bottom:2px solid #e0e0e0;padding-bottom:8px;} .meta{color:#888;font-size:13px;margin-bottom:24px;}
    @media print{body{padding:20px;}}</style></head>
    <body><h1>📊 InsightDesk AI — Relatório</h1>
    <p class="meta">Cliente: LojaFlex · Gerado em: ${new Date().toLocaleString('pt-BR')}${lastRun ? ` · Última execução: ${new Date(lastRun).toLocaleString('pt-BR')}` : ''}</p>
    <p class="meta" style="background:#fff3cd;padding:8px;border-radius:4px;color:#856404;">⚠️ Insights assistidos por IA — valide com evidências. Nenhum dado pessoal (PII) está presente neste relatório.</p>
    <h2>Top Temas</h2>${themeRows}
    <hr style="margin-top:32px;"><p style="font-size:11px;color:#aaa;text-align:center;">InsightDesk AI · LojaFlex · Documento sem PII</p>
    </body></html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type: `${type};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
