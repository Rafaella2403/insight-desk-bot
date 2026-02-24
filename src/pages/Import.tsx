import React, { useState, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, FileJson, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { ProcessingResult } from '@/utils/processing';

const EXPECTED_FIELDS = ['id', 'created_at', 'subject', 'body', 'status', 'tags'] as const;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += char; }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  });
}

export default function Import() {
  const { importAndProcess } = useData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<Record<string, string>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError('');

    try {
      const text = await f.text();
      let data: Record<string, string>[];

      if (f.name.endsWith('.json')) {
        const parsed = JSON.parse(text);
        data = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        data = parseCSV(text);
      }

      if (data.length === 0) {
        setError('Arquivo vazio ou formato inválido.');
        return;
      }

      setRawData(data);
      const cols = Object.keys(data[0]);
      setColumns(cols);

      // Auto-map matching columns
      const autoMap: Record<string, string> = {};
      for (const field of EXPECTED_FIELDS) {
        const match = cols.find(c => c.toLowerCase() === field.toLowerCase());
        if (match) autoMap[field] = match;
      }
      setMapping(autoMap);
    } catch {
      setError('Erro ao ler o arquivo. Verifique o formato.');
    }
  };

  const handleProcess = () => {
    if (!mapping.body) {
      setError('O campo "body" (texto do ticket) é obrigatório.');
      return;
    }

    setProcessing(true);
    setError('');

    setTimeout(() => {
      const mapped = rawData.map(row => ({
        id: mapping.id ? row[mapping.id] : undefined,
        created_at: mapping.created_at ? row[mapping.created_at] : undefined,
        subject: mapping.subject ? row[mapping.subject] : undefined,
        body: row[mapping.body] || '',
        status: mapping.status ? row[mapping.status] : undefined,
        tags: mapping.tags ? row[mapping.tags] : undefined,
      }));

      const res = importAndProcess(mapped);
      setResult(res);
      setProcessing(false);
    }, 800);
  };

  const needsMapping = columns.length > 0 && !columns.some(c => c.toLowerCase() === 'body');

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Importar Tickets</h2>
        <p className="text-sm text-muted-foreground">Faça upload de um arquivo CSV ou JSON com os tickets de atendimento.</p>
      </div>

      {/* Upload */}
      <Card>
        <CardContent className="pt-6">
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
          >
            <input ref={fileRef} type="file" accept=".csv,.json" onChange={handleFile} className="hidden" />
            <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium">
              {file ? file.name : 'Clique ou arraste um arquivo CSV/JSON'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Formatos aceitos: .csv, .json</p>
            {file && (
              <div className="flex items-center justify-center gap-2 mt-3">
                {file.name.endsWith('.json') ? <FileJson className="w-4 h-4 text-primary" /> : <FileSpreadsheet className="w-4 h-4 text-primary" />}
                <span className="text-xs text-muted-foreground">
                  {rawData.length} registro(s) encontrados
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Column mapping */}
      {columns.length > 0 && (
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Mapeamento de Colunas</CardTitle>
            <CardDescription>Associe as colunas do arquivo aos campos esperados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {EXPECTED_FIELDS.map(field => (
              <div key={field} className="flex items-center gap-3">
                <Label className="w-28 text-xs font-medium shrink-0">
                  {field}
                  {field === 'body' && <span className="text-destructive ml-0.5">*</span>}
                </Label>
                <Select
                  value={mapping[field] || '_none'}
                  onValueChange={v => setMapping(prev => ({ ...prev, [field]: v === '_none' ? '' : v }))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecionar coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">— Não mapear —</SelectItem>
                    {columns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Process button */}
      {rawData.length > 0 && !result && (
        <Button onClick={handleProcess} disabled={processing || !mapping.body} className="w-full sm:w-auto">
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...
            </>
          ) : (
            'Processar agora'
          )}
        </Button>
      )}

      {/* Results */}
      {result && (
        <Card className="animate-fade-in border-success/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" /> Processamento Concluído
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-md bg-muted">
                <p className="text-xl font-bold">{result.batchRun.tickets_total}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Total</p>
              </div>
              <div className="text-center p-3 rounded-md bg-muted">
                <p className="text-xl font-bold">{result.batchRun.tickets_processed}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Processados</p>
              </div>
              <div className="text-center p-3 rounded-md bg-muted">
                <p className="text-xl font-bold">{result.batchRun.tickets_discarded}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Descartados</p>
              </div>
              <div className="text-center p-3 rounded-md bg-muted">
                <p className="text-xl font-bold">{result.themes.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Temas</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.themes.map(t => (
                <Badge key={t.id} variant="secondary" className="text-xs">
                  {t.name} ({t.tickets_count})
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{result.batchRun.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
