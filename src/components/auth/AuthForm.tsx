'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

type AuthMode = 'login' | 'register';

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register, loading } = useAuth();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (mode === 'register' && !name) {
      setError('Por favor, informe seu nome');
      return;
    }

    console.log(`Tentando ${mode === 'login' ? 'login' : 'registro'} com:`, { email });
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        console.log('Iniciando processo de login...');
        const success = await login(email, password);
        console.log('Resultado do login:', success);

        if (!success) {
          setError('Email ou senha inválidos');
        }
      } else {
        console.log('Iniciando processo de registro...');
        const success = await register(name, email, password);
        console.log('Resultado do registro:', success);

        if (success) {
          setMode('login');
          setEmail(email);
          setPassword('');
          setError('');
          return;
        } else {
          setError('Falha no cadastro. Por favor, tente novamente.');
        }
      }
    } catch (err) {
      console.error('Erro durante a autenticação:', err);
      setError('Ocorreu um erro inesperado. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setPassword('');
  };

  return (
    <div className="flex items-center justify-cente">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {mode === 'login' ? 'Faça login' : 'Crie uma nova conta'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' 
              ? 'Entre com seu email e senha para fazer login' 
              : 'Preencha os detalhes para criar sua conta'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required={mode === 'register'}
                  disabled={isSubmitting || loading}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                disabled={isSubmitting || loading}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                {mode === 'login' && (
                  <a href="#" className="text-sm font-medium text-primary hover:underline">
                    Esqueceu sua senha?
                  </a>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isSubmitting || loading}
              />
              {mode === 'register' && (
                <p className="text-xs text-muted-foreground">
                  Senha deve ter pelo menos 6 caracteres
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'login' ? 'Entrando...' : 'Registrando...'}
                </>
              ) : (
                mode === 'login' ? 'Entrar' : 'Cadastrar'
              )}
            </Button>
            
            <div className="text-center text-sm">
              {mode === 'login' ? "Não tem uma conta?" : 'Já tem uma conta?'}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-primary hover:underline"
                disabled={isSubmitting || loading}
              >
                {mode === 'login' ? 'Cadastrar' : 'Entrar'}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
