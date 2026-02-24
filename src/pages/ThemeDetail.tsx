import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, ThumbsUp, ThumbsDown, MessageSquare, CheckCircle, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ACTION_SUGGESTIONS: Record<string, string[]> = {
  'Atrasos na Entrega': [
    'Revisar SLAs com transportadoras e renegociar prazos',
    'Implementar notificações proativas para clientes sobre status de entrega',
    'Criar painel de monitoramento de prazos em tempo real',
    'Avaliar inclusão de transportadora alternativa para regiões críticas',
  ],
  'Problemas de Pagamento': [
    'Auditar integração com gateway de pagamento para identificar falhas',
    'Melhorar mensagens de erro no checkout para orientar o cliente',
    'Implementar reconciliação automática de pagamentos Pix',
    'Revisar fluxo de geração e vencimento de boletos',
  ],
  'Qualidade do Produto': [
    'Reforçar inspeção de qualidade no centro de distribuição',
    'Melhorar embalagem para produtos frágeis',
    'Atualizar fotos e descrições de produtos para refletir o real',
    'Criar canal prioritário para trocas por defeito',
  ],
  'Solicitações de Reembolso': [
    'Reduzir SLA de processamento de reembolso para 5 dias úteis',
    'Automatizar notificações de status do reembolso',
    'Criar FAQ com prazos e processo de reembolso',
    'Implementar reembolso parcial automático para casos simples',
  ],
  'Problemas de Acesso/Conta': [
    'Revisar fluxo de reset de senha e garantir entrega de email',
    'Implementar login via SMS como alternativa',
    'Melhorar mensagens de erro na tela de login',
    'Criar processo de desbloqueio de conta automatizado',
  ],
  'Preço e Frete': [
    'Revisar política de frete grátis e comunicar de forma clara',
    'Auditar sistema de cupons para garantir funcionamento',
    'Implementar cálculo de frete mais competitivo para regiões distantes',
    'Garantir consistência de preços entre listagem e checkout',
  ],
};

export default function ThemeDetail() {
  const { id } = useParams<{ id: string }>();
  const { themes, getThemeTickets, themeTickets, addFeedback, getThemeFeedbacks } = useData();
  const { user } = useAuth();
  const { toast } = useToast();

  const theme = themes.find(t => t.id === id);
  const tickets = theme ? getThemeTickets(theme.id) : [];
  const existingFeedbacks = theme ? getThemeFeedbacks(theme.id) : [];
  const exampleTickets = theme
    ? themeTickets.filter(tt => tt.theme_id === theme.id && tt.is_example)
        .map(tt => tickets.find(t => t.id === tt.ticket_id)).filter(Boolean)
    : [];

  const [useful, setUseful] = useState<boolean | null>(null);
  const [themeCorrect, setThemeCorrect] = useState<boolean | null>(null);
  const [suggestedName, setSuggestedName] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [actions, setActions] = useState<string[]>(
    theme ? (ACTION_SUGGESTIONS[theme.name] || ['Analisar tickets em detalhe', 'Definir plano de ação com a equipe']) : []
  );

  if (!theme) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Tema não encontrado.</p>
        <Link to="/dashboard"><Button variant="ghost" className="mt-4">Voltar</Button></Link>
      </div>
    );
  }

  const trendEl = () => {
    if (theme.trend_vs_prev === null) return <span className="text-muted-foreground">N/A</span>;
    const val = theme.trend_vs_prev;
    return (
      <span className={`inline-flex items-center gap-1 ${val > 0 ? 'text-destructive' : val < 0 ? 'text-success' : 'text-muted-foreground'}`}>
        {val > 0 ? <TrendingUp className="w-4 h-4" /> : val < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
        {val > 0 ? '+' : ''}{val}%
      </span>
    );
  };

  const handleSubmitFeedback = () => {
    if (useful === null || themeCorrect === null) return;
    addFeedback({
      theme_id: theme.id,
      user_name: user?.name || 'Anônimo',
      useful,
      theme_correct: themeCorrect,
      suggested_name: suggestedName || undefined,
      comment: comment || undefined,
    });
    setSubmitted(true);
    toast({ title: 'Feedback registrado', description: 'Obrigado pela sua avaliação!' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Dashboard
      </Link>

      {/* Header */}
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold tracking-tight">{theme.name}</h2>
        <div className="flex items-center gap-4 mt-2">
          <Badge variant="secondary" className="text-sm">{theme.tickets_count} tickets</Badge>
          <span className="text-sm">Tendência: {trendEl()}</span>
        </div>
      </div>

      {/* Summary */}
      <Card className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Sumário</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">
            {theme.summary}
          </pre>
        </CardContent>
      </Card>

      {/* Example tickets */}
      <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Exemplos de Tickets (mascarados)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(exampleTickets.length > 0 ? exampleTickets : tickets.slice(0, 5)).map((ticket: any) => (
            <div key={ticket.id} className="p-3 rounded-md bg-muted/50 border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{ticket.subject || ticket.id}</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{ticket.body_masked}</p>
              {ticket.tags && (
                <div className="flex gap-1 mt-2">
                  {ticket.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-[10px] h-4">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action suggestions */}
      <Card className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-warning" /> Sugestões de Plano de Ação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {actions.map((action, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground mt-1 shrink-0">{i + 1}.</span>
              <Textarea
                value={action}
                onChange={e => {
                  const updated = [...actions];
                  updated[i] = e.target.value;
                  setActions(updated);
                }}
                className="text-sm min-h-[36px] resize-none"
                rows={1}
                maxLength={500}
              />
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground">Edite as sugestões acima conforme necessário.</p>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex items-center gap-2 text-success text-sm py-4">
              <CheckCircle className="w-5 h-5" />
              Feedback registrado com sucesso! Obrigado.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Este insight foi útil?</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={useful === true ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUseful(true)}
                  >
                    <ThumbsUp className="w-3.5 h-3.5 mr-1" /> Sim
                  </Button>
                  <Button
                    type="button"
                    variant={useful === false ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => setUseful(false)}
                  >
                    <ThumbsDown className="w-3.5 h-3.5 mr-1" /> Não
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">O tema está correto?</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={themeCorrect === true ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setThemeCorrect(true)}
                  >
                    Sim, correto
                  </Button>
                  <Button
                    type="button"
                    variant={themeCorrect === false ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => setThemeCorrect(false)}
                  >
                    Precisa ajuste
                  </Button>
                </div>
              </div>

              {themeCorrect === false && (
                <div className="space-y-2">
                  <Label className="text-xs">Sugestão de nome para o tema</Label>
                  <Input
                    value={suggestedName}
                    onChange={e => setSuggestedName(e.target.value)}
                    placeholder="Ex: Problemas Logísticos"
                    maxLength={100}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs">Comentário (opcional)</Label>
                <Textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Observações adicionais..."
                  rows={2}
                  maxLength={500}
                />
              </div>

              <Button
                onClick={handleSubmitFeedback}
                disabled={useful === null || themeCorrect === null}
                size="sm"
              >
                Enviar Feedback
              </Button>
            </div>
          )}

          {/* Previous feedbacks */}
          {existingFeedbacks.length > 0 && (
            <>
              <Separator className="my-4" />
              <p className="text-xs font-medium text-muted-foreground mb-2">Feedbacks anteriores ({existingFeedbacks.length})</p>
              {existingFeedbacks.map(fb => (
                <div key={fb.id} className="text-xs p-2 rounded bg-muted/50 mb-2">
                  <span className="font-medium">{fb.user_name}</span>
                  <span className="text-muted-foreground"> · {new Date(fb.created_at).toLocaleDateString('pt-BR')}</span>
                  <span className="ml-2">{fb.useful ? '👍' : '👎'}</span>
                  {fb.comment && <p className="mt-1 text-muted-foreground">{fb.comment}</p>}
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
