import { Ticket, BatchRun, Theme, ThemeTicket } from '@/types';
import { maskPII } from '@/utils/pii';

const rawSeeds = [
  { id: 't001', subject: 'Pedido atrasado', body: 'Boa tarde, meu pedido #4521 está com 10 dias de atraso. O prazo era 5 dias úteis. Meu email é joao.silva@gmail.com e telefone 11 98765-4321. Preciso urgente.', status: 'aberto', tags: 'entrega,urgente', days: 2 },
  { id: 't002', subject: 'Não recebi meu produto', body: 'Comprei um fone de ouvido há 15 dias e até agora não chegou. O rastreio não atualiza desde semana passada. CPF 123.456.789-00. Me ajudem por favor!', status: 'aberto', tags: 'entrega', days: 3 },
  { id: 't003', subject: 'Entrega com defeito', body: 'Recebi o produto mas a caixa veio toda amassada e o item dentro estava quebrado. Quero trocar ou devolver. Email maria.santos@hotmail.com', status: 'aberto', tags: 'qualidade,entrega', days: 1 },
  { id: 't004', subject: 'Cobrança duplicada', body: 'Fui cobrado duas vezes no cartão pelo pedido #8832. Valor de R$199,90 apareceu duplicado na fatura. Preciso do estorno. Tel: (21) 99887-6655', status: 'aberto', tags: 'pagamento', days: 4 },
  { id: 't005', subject: 'Pix não confirmado', body: 'Fiz o pagamento via Pix ontem às 14h mas o pedido continua como "aguardando pagamento". Já enviei o comprovante. Email carlos.oliveira@yahoo.com', status: 'pendente', tags: 'pagamento', days: 2 },
  { id: 't006', subject: 'Boleto vencido', body: 'O boleto do meu pedido venceu antes de eu conseguir pagar. Podem gerar um novo? CPF 987.654.321-00. Telefone 31 3333-4444.', status: 'aberto', tags: 'pagamento', days: 5 },
  { id: 't007', subject: 'Produto veio errado', body: 'Pedi uma camiseta tamanho M azul e recebi uma G vermelha. Isso é a segunda vez que acontece! Quero devolver. ana.pereira@gmail.com', status: 'aberto', tags: 'qualidade', days: 3 },
  { id: 't008', subject: 'Produto com defeito de fábrica', body: 'O liquidificador que comprei parou de funcionar depois de 3 dias de uso. Claramente defeito de fábrica. Quero reembolso total. (11) 95555-1234', status: 'aberto', tags: 'qualidade,reembolso', days: 6 },
  { id: 't009', subject: 'Quero reembolso', body: 'Não quero mais o produto, o prazo de entrega já passou e preciso do dinheiro de volta. Pedido #1199. Favor estornar no cartão final 4567. Email pedro.lima@email.com', status: 'aberto', tags: 'reembolso', days: 1 },
  { id: 't010', subject: 'Cancelar pedido', body: 'Preciso cancelar o pedido #7721 que fiz ontem. Comprei errado. Pode cancelar e fazer devolução do valor? CPF 111.222.333-44', status: 'aberto', tags: 'reembolso', days: 2 },
  { id: 't011', subject: 'Não consigo fazer login', body: 'Tentei fazer login com meu email lucia.mendes@gmail.com mas diz que a senha está incorreta. Já tentei recuperar e não recebo o email de reset.', status: 'aberto', tags: 'conta', days: 4 },
  { id: 't012', subject: 'Conta bloqueada', body: 'Minha conta foi bloqueada sem motivo aparente. Preciso acessar para ver meus pedidos. Tel 21 91234-5678. Me ajudem a desbloquear.', status: 'urgente', tags: 'conta', days: 1 },
  { id: 't013', subject: 'Frete muito caro', body: 'O frete para minha cidade está custando R$89,90 para um produto de R$49,90. Isso é mais caro que o produto! Não faz sentido. Algum cupom de desconto?', status: 'aberto', tags: 'frete,preço', days: 3 },
  { id: 't014', subject: 'Cupom não funciona', body: 'Tenho um cupom PROMO20 que deveria dar 20% de desconto mas ao aplicar diz "cupom inválido". Email roberto.costa@gmail.com', status: 'aberto', tags: 'preço', days: 5 },
  { id: 't015', subject: 'Entrega atrasada - 2a vez', body: 'É a segunda vez que meu pedido atrasa. Dessa vez já são 8 dias de atraso. CPF 555.666.777-88. Vou reclamar no Procon se não resolverem.', status: 'urgente', tags: 'entrega', days: 1 },
  { id: 't016', subject: 'Transportadora não entrega', body: 'A transportadora tentou entregar mas eu estava em casa e ninguém tocou a campainha. O rastreio diz "destinatário ausente". Mentira! (41) 98765-0000', status: 'aberto', tags: 'entrega', days: 2 },
  { id: 't017', subject: 'Parcela não reconhecida', body: 'Apareceu uma parcela de R$150 na minha fatura que não reconheço. Meu pedido era de R$89,90. Preciso entender essa cobrança. Email fernanda.alves@outlook.com', status: 'aberto', tags: 'pagamento', days: 7 },
  { id: 't018', subject: 'Estorno não processado', body: 'Solicitei estorno há 15 dias e até agora nada caiu na minha conta. O protocolo é #EST-445. CPF 999.888.777-66. Por favor resolvam.', status: 'pendente', tags: 'reembolso', days: 4 },
  { id: 't019', subject: 'Produto diferente da foto', body: 'A cor do sofá que recebi é completamente diferente da foto do site. No site parece cinza claro mas o que chegou é quase marrom. Quero devolver.', status: 'aberto', tags: 'qualidade', days: 3 },
  { id: 't020', subject: 'Cadastro com erro', body: 'Meu cadastro está com o endereço antigo e não consigo alterar pelo app. Quando clico em editar dá erro. Email marcos.rodrigues@gmail.com, tel 11 91111-2222', status: 'aberto', tags: 'conta', days: 6 },
  { id: 't021', subject: 'Prazo de entrega não cumprido', body: 'Comprei com frete expresso de 2 dias e já se passaram 7 dias. Paguei mais caro pra receber rápido. Quero reembolso do frete pelo menos. (85) 99876-5432', status: 'aberto', tags: 'entrega,frete', days: 1 },
  { id: 't022', subject: 'Produto quebrado na caixa', body: 'Abri a caixa e o espelho estava todo estilhaçado. Zero proteção na embalagem. Preciso de reembolso ou reenvio. renata.souza@gmail.com', status: 'aberto', tags: 'qualidade', days: 2 },
  { id: 't023', subject: 'Cartão recusado', body: 'Tentei pagar com 3 cartões diferentes e todos são recusados. Meu limite está ok. Acho que é problema do site. CPF 444.333.222-11', status: 'aberto', tags: 'pagamento', days: 3 },
  { id: 't024', subject: 'Devolução sem resposta', body: 'Abri solicitação de devolução há 20 dias e ninguém me respondeu. Protocolo #DEV-887. Preciso devolver esse produto que veio com defeito. Tel (11) 94444-3333', status: 'urgente', tags: 'reembolso', days: 8 },
  { id: 't025', subject: 'Promoção enganosa', body: 'O preço estava R$99 na promoção mas quando fui pagar voltou pra R$199. Isso é propaganda enganosa! Quero o preço anunciado. Email tiago.nunes@gmail.com', status: 'aberto', tags: 'preço', days: 2 },
  { id: 't026', subject: 'Rastreio não funciona', body: 'O código de rastreio que me enviaram não funciona no site dos Correios. Aparece "objeto não encontrado". Pedido feito há 6 dias. (19) 98888-7777', status: 'aberto', tags: 'entrega', days: 4 },
  { id: 't027', subject: 'Senha não reseta', body: 'Pedi reset de senha mas o link que chega por email já vem expirado. Tentei 4 vezes. Email julia.ferreira@hotmail.com. Preciso acessar minha conta urgente.', status: 'aberto', tags: 'conta', days: 1 },
  { id: 't028', subject: 'Cobrança após cancelamento', body: 'Cancelei o pedido #3345 mas mesmo assim fui cobrado R$250 no cartão. Quero estorno imediato. CPF 222.111.333-55', status: 'urgente', tags: 'pagamento,reembolso', days: 3 },
  { id: 't029', subject: 'Frete grátis não aplicado', body: 'Minha compra é acima de R$200, deveria ter frete grátis conforme anunciado no banner do site. Mas estão cobrando R$35 de frete. Email: paulo.gomes@gmail.com', status: 'aberto', tags: 'frete', days: 5 },
  { id: 't030', subject: 'Produto incompleto', body: 'A estante veio sem os parafusos e o manual de montagem. Impossível montar. Preciso que enviem as peças faltantes. Tel 31 97777-8888', status: 'aberto', tags: 'qualidade', days: 2 },
  { id: 't031', subject: 'Demora no envio', body: 'Já fazem 5 dias que o status está em "preparando envio". Quanto mais tempo vai demorar? Meu CPF é 333.444.555-66 e email rafael.martins@email.com', status: 'aberto', tags: 'entrega', days: 3 },
  { id: 't032', subject: 'Reembolso parcial', body: 'Recebi um reembolso de R$50 mas meu pedido era de R$150. Onde está o resto? Protocolo #RMB-221. (62) 93333-2222', status: 'pendente', tags: 'reembolso', days: 6 },
  { id: 't033', subject: 'Valor diferente no checkout', body: 'O produto marca R$79,90 na página mas no checkout aparece R$99,90. Corrijam isso! Email sandra.lima@gmail.com', status: 'aberto', tags: 'preço', days: 1 },
  { id: 't034', subject: 'App não carrega pedidos', body: 'O aplicativo não mostra meus pedidos, fica carregando infinitamente. Já reinstalei e o problema persiste. Uso Android 14. CPF 777.888.999-00', status: 'aberto', tags: 'conta', days: 4 },
  { id: 't035', subject: 'Entrega em endereço errado', body: 'O pedido foi entregue no endereço antigo que já tinha sido removido do cadastro. Como isso é possível? Tel (51) 96666-5555. Quero reenvio.', status: 'urgente', tags: 'entrega', days: 2 },
];

function daysAgo(d: number): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString();
}

export const seedTickets: Ticket[] = rawSeeds.map(s => ({
  id: s.id,
  created_at: daysAgo(s.days),
  status: s.status,
  channel: 'tickets',
  subject: s.subject,
  body: s.body,
  body_masked: maskPII(s.body),
  tags: s.tags.split(','),
}));

// Pre-built themes
const themeMap: Record<string, string[]> = {
  'Atrasos na Entrega': ['t001', 't002', 't015', 't016', 't021', 't026', 't031', 't035'],
  'Problemas de Pagamento': ['t004', 't005', 't006', 't017', 't023', 't028'],
  'Qualidade do Produto': ['t003', 't007', 't008', 't019', 't022', 't030'],
  'Solicitações de Reembolso': ['t009', 't010', 't018', 't024', 't032'],
  'Problemas de Acesso/Conta': ['t011', 't012', 't020', 't027', 't034'],
  'Preço e Frete': ['t013', 't014', 't025', 't029', 't033'],
};

const seedRunId = 'run_seed_001';

export const seedBatchRun: BatchRun = {
  id: seedRunId,
  created_at: daysAgo(0),
  tickets_total: 35,
  tickets_processed: 35,
  tickets_discarded: 0,
  notes: 'Dados de demonstração carregados com sucesso. 6 temas identificados.',
};

export const seedThemes: Theme[] = Object.entries(themeMap).map(([name, ids], i) => ({
  id: `theme_seed_${i + 1}`,
  name,
  summary: generateSeedSummary(name, ids.length),
  tickets_count: ids.length,
  trend_vs_prev: [15, -8, 10, 25, 0, -5][i] ?? null,
  run_id: seedRunId,
}));

export const seedThemeTickets: ThemeTicket[] = Object.entries(themeMap).flatMap(([, ids], i) =>
  ids.map((ticketId, j) => ({
    theme_id: `theme_seed_${i + 1}`,
    ticket_id: ticketId,
    is_example: j < 5,
  }))
);

function generateSeedSummary(name: string, count: number): string {
  const summaries: Record<string, string> = {
    'Atrasos na Entrega': `• ${count} tickets sobre atrasos e problemas logísticos.\n• Clientes relatam prazos não cumpridos e rastreios desatualizados.\n• Padrão recorrente: atrasos acima de 5 dias úteis.`,
    'Problemas de Pagamento': `• ${count} tickets sobre falhas em pagamentos.\n• Cobranças duplicadas, Pix não confirmado e cartões recusados.\n• Impacto direto na conversão e satisfação.`,
    'Qualidade do Produto': `• ${count} tickets sobre problemas com produtos recebidos.\n• Produtos danificados, errados ou diferentes da descrição.\n• Necessidade de melhoria no controle de qualidade e embalagem.`,
    'Solicitações de Reembolso': `• ${count} tickets solicitando reembolso ou estorno.\n• Demora no processamento é a principal reclamação.\n• Clientes frustrados com falta de resposta.`,
    'Problemas de Acesso/Conta': `• ${count} tickets sobre dificuldades de acesso.\n• Reset de senha não funcional e contas bloqueadas.\n• Impacto na experiência do usuário.`,
    'Preço e Frete': `• ${count} tickets sobre preços e frete.\n• Frete desproporcional e cupons inválidos.\n• Discrepância entre preço anunciado e checkout.`,
  };
  return summaries[name] || `• ${count} tickets neste tema.\n• Análise em andamento.`;
}
