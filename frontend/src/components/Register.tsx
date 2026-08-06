import React, { useState } from 'react';
import { Store, UserPlus, LogIn } from 'lucide-react';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegisterSuccess, onSwitchToLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [closingHour, setClosingHour] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tenantRes = await fetch('http://localhost:3000/tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, whatsapp, address, closingHour }),
      });

      const tenantData = await tenantRes.json();

      if (!tenantRes.ok) {
        setError(tenantData.error || 'Erro ao cadastrar empresa.');
        setLoading(false);
        return;
      }

      const userRes = await fetch('http://localhost:3000/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminName,
          email,
          password,
          tenantId: tenantData.id,
        }),
      });

      if (userRes.ok) {
        alert('Empresa cadastrada com sucesso!');
        onRegisterSuccess();
      } else {
        const userData = await userRes.json();
        setError(userData.error || 'Erro ao criar usuário administrador.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/60 p-8 rounded-3xl w-full max-w-lg shadow-2xl text-slate-100">
        <div className="flex items-center gap-3.5 mb-6">
          <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/30">
            <Store className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Cadastrar Empresa</h1>
            <p className="text-xs text-slate-400">Crie seu painel no Agende+</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-200 p-3 rounded-xl mb-4 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Nome do Estabelecimento</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Categoria</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Endereço Completo</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Fecha às</label>
              <input
                type="time"
                value={closingHour}
                onChange={(e) => setClosingHour(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Seu Nome (Administrador)</label>
            <input
              type="text"
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">E-mail de Acesso</label>
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
            <UserPlus className="w-4 h-4 text-slate-950" />
            {loading ? 'Cadastrando...' : 'Cadastrar Empresa'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700/60 text-center">
          <button
            onClick={onSwitchToLogin}
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1.5 mx-auto font-medium"
          >
            <LogIn className="w-4 h-4" /> Já tem uma conta? Faça login
          </button>
        </div>
      </div>
    </div>
  );
}