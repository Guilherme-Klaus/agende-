import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { SuperAdmin } from './components/SuperAdmin';
import { Register } from './components/Register';
import { ClientBooking } from './ClientBooking';
import { ShieldCheck, LogIn, UserPlus } from 'lucide-react';

export function App() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const savedUser = localStorage.getItem('agende_plus_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (email === 'admin@agendeplus.com' && password === 'Guilherme2103@') {
      const superAdminUser = { name: 'Super Admin', email, tenantId: 'super-admin', tenantName: 'Painel Master', role: 'super-admin' };
      setUser(superAdminUser);
      localStorage.setItem('agende_plus_user', JSON.stringify(superAdminUser));
      setLoading(false);
      return;
    }

    try {
      // Tenta login como admin do estabelecimento
      let res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data = await res.json();

      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('agende_plus_user', JSON.stringify(data.user));
        setLoading(false);
        return;
      }

      // Se o servidor retornou erro (ex: 403 Conta bloqueada ou 401 Credenciais inválidas)
      if (res.status === 403 || res.status === 401) {
        setError(data.error || 'E-mail ou senha inválidos.');
        setLoading(false);
        return;
      }

      // Se falhar, tenta login como profissional
      res = await fetch('http://localhost:3000/professional-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      data = await res.json();

      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('agende_plus_user', JSON.stringify(data.user));
      } else {
        setError(data.error || 'E-mail ou senha inválidos.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('agende_plus_user');
    setEmail('');
    setPassword('');
  }

  return (
    <Router>
      <Routes>
        <Route path="/agendar/:tenantId" element={<ClientBooking />} />

        <Route
          path="/*"
          element={
            user && user.tenantId ? (
              user.tenantId === 'super-admin' ? (
                <SuperAdmin onLogout={handleLogout} />
              ) : (
                <Dashboard user={user} onLogout={handleLogout} />
              )
            ) : view === 'register' ? (
              <Register
                onRegisterSuccess={() => setView('login')}
                onSwitchToLogin={() => setView('login')}
              />
            ) : (
              <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
                <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/60 p-8 rounded-3xl w-full max-w-md shadow-2xl text-slate-100">
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/30">
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-white">Agende+ </h1>
                      <p className="text-xs text-slate-400">Acesse o painel do seu estabelecimento</p>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-950/50 border border-red-800 text-red-200 p-3 rounded-xl mb-4 text-xs text-center font-medium">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">E-mail</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Senha</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 font-bold text-slate-950 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-xs disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                    >
                      <LogIn className="w-4 h-4 text-slate-950" />
                      {loading ? 'Entrando...' : 'Entrar no Sistema'}
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-slate-700/60 text-center">
                    <button
                      onClick={() => setView('register')}
                      className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1.5 mx-auto font-medium"
                    >
                      <UserPlus className="w-4 h-4" /> Deseja cadastrar sua empresa? Clique aqui
                    </button>
                  </div>
                </div>
              </div>
            )
          }
        />
      </Routes>
    </Router>
  );
}