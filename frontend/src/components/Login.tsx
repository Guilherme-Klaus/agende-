import React, { useState } from 'react';
import { api } from '../services/api';
import { ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string, tenantId: string, tenantName: string, email: string) => void;
  onSwitchToRegister: () => void;
}

export function Login({ onLoginSuccess, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoginError('');
      const response = await api.post('/login', { email, password });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('tenantId', user.tenantId);
      localStorage.setItem('tenantName', user.tenantName);
      localStorage.setItem('userEmail', user.email);

      onLoginSuccess(token, user.tenantId, user.tenantName, user.email);
    } catch (err) {
      setLoginError('E-mail ou senha inválidos.');
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/25">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Agende+</h1>
            <p className="text-sm text-zinc-400">Acesse o painel do seu estabelecimento</p>
          </div>
        </div>

        {loginError && (
          <div className="bg-red-950/50 border border-red-800 text-red-200 p-3 rounded-xl mb-4 text-xs">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 font-semibold text-zinc-950 py-3 rounded-xl transition-colors shadow-lg shadow-amber-500/10 text-xs"
          >
            Entrar no Sistema
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={onSwitchToRegister}
            className="text-xs text-zinc-400 hover:text-amber-500 transition-colors underline"
          >
            Não tem uma empresa cadastrada? Cadastre-se aqui
          </button>
        </div>
      </div>
    </div>
  );
}