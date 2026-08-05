import React, { useState } from 'react';
import { Store, UserPlus } from 'lucide-react';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegisterSuccess, onSwitchToLogin }: RegisterProps) {
  const [tenantName, setTenantName] = useState('');
  const [category, setCategory] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [closingHour, setClosingHour] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Cria o Estabelecimento (Tenant) no Back-end com os novos campos
      const tenantRes = await fetch('http://localhost:3000/tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: tenantName, 
          category, 
          whatsapp, 
          address, 
          closingHour 
        }),
      });

      if (!tenantRes.ok) {
        throw new Error('Erro ao criar o estabelecimento.');
      }

      const tenantData = await tenantRes.json();

      // 2. Cria o Usuário Administrador vinculado ao Tenant recém-criado
      const userRes = await fetch('http://localhost:3000/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          tenantId: tenantData.id,
        }),
      });

      if (!userRes.ok) {
        throw new Error('Erro ao criar usuário administrador.');
      }

      alert('Empresa cadastrada com sucesso! Faça login para acessar seu painel.');
      onRegisterSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-lg shadow-2xl text-zinc-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/25">
            <Store className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cadastrar Empresa</h1>
            <p className="text-sm text-zinc-400">Crie seu painel no Agende+</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-200 p-3 rounded-xl mb-4 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Nome do Estabelecimento</label>
            <input
              type="text"
              required
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="Ex: Zahar"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Categoria</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Barbearia"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: 51999999999"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-zinc-400 mb-1">Endereço Completo</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Rua Araguaia, 862 / Canoas"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Fecha às</label>
              <input
                type="text"
                value={closingHour}
                onChange={(e) => setClosingHour(e.target.value)}
                placeholder="Ex: 20:00"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <hr className="border-zinc-800 my-2" />

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Seu Nome (Administrador)</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Guilherme Klaus"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">E-mail de Acesso</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@zahar.com"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 font-semibold text-zinc-950 py-3 rounded-xl transition-colors shadow-lg shadow-amber-500/10 text-xs mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Criando Empresa...' : 'Cadastrar Empresa'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={onSwitchToLogin}
            className="text-xs text-zinc-400 hover:text-amber-500 transition-colors underline"
          >
            Já tem uma conta? Faça login
          </button>
        </div>
      </div>
    </div>
  );
}