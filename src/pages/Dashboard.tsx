import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportThemesCSV, exportReportPDF } from '@/utils/exportUtils';
import { Ticket as TicketIcon, Layers, Clock, TrendingUp, TrendingDown, Minus, Search, Download, FileText, ArrowRight, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { tickets, themes, themeTickets, lastRun } = useData();
  const { isAdmin } = useAuth();
  const [period, setPeriod] = useState('all');
  const [search, setSearch] = useState('');

  const filteredThemes = useMemo(() => {
    let t = themes;
    if (search) {
      const q = search.toLowerCase();
      t = t.filter(th => th.name.toLowerCase().includes(q));
    }
    // Filter by last run for period (simplified - just show latest batch themes)
    if (period !== 'all') {
      const days = parseInt(period);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      // In a real app we'd filter tickets by date, here we show all for demo
    }
    return t;
  }, [themes, search, period]);

  const latestRunThemes = useMemo(() => {
    if (!lastRun) return filteredThemes;
    return filteredThemes.filter(t => t.run_id === lastRun.id);
  }, [filteredThemes, lastRun]);

  const displayThemes = latestRunThemes.length > 0 ? latestRunThemes : filteredThemes;

  const trendIcon = (trend: number | null) => {
    if (trend === null) return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
    if (trend > 0) return <TrendingUp className="w-3.5 h-3.5 text-destructive" />;
    if (trend < 0) return <TrendingDown className="w-3.5 h-3.5 text-success" />;
    return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  const trendText = (trend: number | null) => {
    if (trend === null) return 'N/A';
    return `${trend > 0 ? '+' : ''}${trend}%`;
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Visão geral dos insights de atendimento
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportThemesCSV(displayThemes)}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportReportPDF(displayThemes, tickets, themeTickets, lastRun?.created_at)}>
              <FileText className="w-3.5 h-3.5 mr-1.5" /> PDF
            </Button>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="animate-fade-in">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <TicketIcon className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tickets.length}</p>
                <p className="text-xs text-muted-foreground">Total de tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Layers className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{displayThemes.length}</p>
                <p className="text-xs text-muted-foreground">Temas identificados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {lastRun ? new Date(lastRun.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                </p>
                <p className="text-xs text-muted-foreground">Última execução</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-warning/10 text-warning text-xs font-medium">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        Insights assistidos por IA — valide com evidências antes de tomar decisões.
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tema..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            maxLength={100}
          />
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Themes table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Top Temas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tema</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Volume</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Tendência</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {displayThemes.map((theme, i) => (
                  <tr
                    key={theme.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <td className="px-4 py-3 font-medium">{theme.name}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="secondary">{theme.tickets_count}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1">
                        {trendIcon(theme.trend_vs_prev)}
                        <span className="text-xs">{trendText(theme.trend_vs_prev)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/theme/${theme.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Detalhes <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {displayThemes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum tema encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
