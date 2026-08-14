import React, { useState } from 'react';
import { Store, UserPlus, LogIn, Check, Sparkles } from 'lucide-react';
import { api } from '../services/api'; // Importando nossa API centralizada!

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
  const [selectedPlan, setSelectedPlan] = useState<'essencial' | 'profissional'>('profissional');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Usando 'api.post' no lugar de 'fetch'
      const tenantRes = await api.post('/tenant', {
        name,
        category,
        whatsapp,
        address,
        closingHour,
        plan: selectedPlan
      });

      const tenantData = tenantRes.data;

      const userRes = await api.post('/user', {
        name: adminName,
        email,
        password,
        tenantId: tenantData.id,
      });

      if (userRes.status === 201) {
        alert('Empresa cadastrada com sucesso!');
        onRegisterSuccess();
      }
    } catch (err: any) {
      // Capturamos os erros que vêm do axios
      const errorMsg = err.response?.data?.error || 'Erro de conexão ou e-mail já em uso.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/60 p-8 rounded-3xl w-full max-w-xl shadow-2xl text-slate-100">
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
          
          {/* SELEÇÃO DE PLANOS */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Escolha o seu Plano</label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => setSelectedPlan('essencial')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${selectedPlan === 'essencial' ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-[#0f172a] border-slate-700 text-slate-400'}`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-400">Essencial</span>
                  <p className="text-lg font-black text-white mt-1">R$ 79<span className="text-[10px] font-normal">/mês</span></p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px]">
                  <Check className={`w-3.5 h-3.5 ${selectedPlan === 'essencial' ? 'text-emerald-400' : 'text-slate-600'}`} /> Autônomos
                </div>
              </div>

              <div 
                onClick={() => setSelectedPlan('profissional')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative ${selectedPlan === 'profissional' ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-[#0f172a] border-slate-700 text-slate-400'}`}
              >
                <span className="absolute -top-2.5 right-3 bg-emerald-500 text-slate-950 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">Popular</span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-400">Profissional</span>
                  <p className="text-lg font-black text-white mt-1">R$ 119<span className="text-[10px] font-normal">/mês</span></p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px]">
                  <Check className={`w-3.5 h-3.5 ${selectedPlan === 'profissional' ? 'text-emerald-400' : 'text-slate-600'}`} /> Equipes & Completo
                </div>
              </div>
            </div>
          </div>

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