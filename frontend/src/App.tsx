import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { SuperAdmin } from './components/SuperAdmin';
import { Register } from './components/Register';
import { LandingPage } from './components/LandingPage';
import { ClientBooking } from './ClientBooking';
import { ShieldCheck, LogIn, UserPlus, AlertTriangle, ArrowLeft, Lock } from 'lucide-react';

export function App() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'landing' | 'login' | 'register'>('landing');

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
    setView('landing');
  }

  return (
    <Router>
      <Routes>
        <Route path="/agendar/:tenantId" element={<ClientBooking />} />

        <Route
          path="/*"
          element={
            user && user.tenantId ? (
              <div className="relative min-h-screen bg-[#0f172a]">
                {/* --- TRAVA DE CONTA INATIVA / BLOQUEIO TOTAL DO PAINEL --- */}
                {user.tenantId !== 'super-admin' && user.isActive === false ? (
                  <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] border border-amber-500/40 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl relative">
                      <button
                        onClick={handleLogout}
                        className="absolute top-4 right-4 text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        Sair da Conta
                      </button>

                      <div className="bg-amber-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-amber-400 border border-amber-500/30">
                        <Lock className="w-8 h-8" />
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white">Conta Aguardando Ativação</h2>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Sua empresa foi cadastrada com sucesso, mas o acesso ao painel está temporariamente bloqueado aguardando a confirmação do pagamento do plano.
                        </p>
                      </div>

                      <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl text-left space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Estabelecimento</span>
                        <p className="text-xs font-semibold text-white">{user.tenantName}</p>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block pt-2">E-mail de Acesso</span>
                        <p className="text-xs text-slate-300 font-mono">{user.email}</p>
                      </div>

                      <p className="text-[11px] text-slate-400">
                        Assim que o pagamento for identificado pelo nosso suporte, sua conta será liberada automaticamente.
                      </p>
                    </div>
                  </div>
                ) : user.tenantId === 'super-admin' ? (
                  <SuperAdmin onLogout={handleLogout} />
                ) : (
                  <Dashboard user={user} onLogout={handleLogout} />
                )}
              </div>
            ) : view === 'landing' ? (
              <LandingPage
                onOpenLogin={() => setView('login')}
                onOpenRegister={() => setView('register')}
              />
            ) : view === 'register' ? (
              <div className="relative min-h-screen bg-[#0f172a]">
                <button
                  onClick={() => setView('landing')}
                  className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2 text-xs font-semibold bg-slate-800/60 px-4 py-2 rounded-xl transition-colors border border-slate-700"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar ao Início
                </button>
                <Register
                  onRegisterSuccess={() => setView('login')}
                  onSwitchToLogin={() => setView('login')}
                />
              </div>
            ) : (
              <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative">
                <button
                  onClick={() => setView('landing')}
                  className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2 text-xs font-semibold bg-slate-800/60 px-4 py-2 rounded-xl transition-colors border border-slate-700"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar ao Início
                </button>

                <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/60 p-8 rounded-3xl w-full max-w-md shadow-2xl text-slate-100">
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/30">
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-white">Agende+</h1>
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