import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Brain, Shield, Eye } from 'lucide-react';

export default function Login() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    login(name.trim(), role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">InsightDesk AI</h1>
            <p className="text-xs text-muted-foreground">LojaFlex · CS Ops</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Entrar</CardTitle>
            <CardDescription>Acesse o painel de insights de atendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label>Perfil de acesso</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                      role === 'admin'
                        ? 'border-primary bg-accent text-accent-foreground ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('viewer')}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                      role === 'viewer'
                        ? 'border-primary bg-accent text-accent-foreground ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Viewer
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={!name.trim()}>
                Acessar painel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
