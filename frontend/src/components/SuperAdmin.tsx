import React, { useState, useEffect } from 'react';
import { Building2, ShieldAlert, LogOut, Copy, Check, Trash2, Lock, Unlock, Search, Calendar, DollarSign, Users, AlertCircle, CheckCircle2, Award } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  category: string;
  whatsapp: string;
  createdAt: string;
  isActive: boolean;
  dueDate?: string;
  plan?: string;
  users?: { id: string; email: string }[];
}

interface SuperAdminProps {
  onLogout: () => void;
}

export function SuperAdmin({ onLogout }: SuperAdminProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingEmails, setEditingEmails] = useState<{ [key: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    try {
      const res = await fetch('http://localhost:3000/tenants');
      if (res.ok) {
        const data = await res.json();
        setTenants(data);
      }
    } catch (err) {
      console.error('Erro ao buscar lista de empresas');
    }
  }

  async function handleToggleStatus(tenantId: string, currentStatus: boolean) {
    try {
      const res = await fetch(`http://localhost:3000/admin/toggle-tenant-status/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        fetchTenants();
      } else {
        alert('Erro ao alterar status da conta.');
      }
    } catch (err) {
      alert('Erro de conexão ao alterar status.');
    }
  }

  async function handleChangePlan(tenantId: string, newPlan: string) {
    try {
      const res = await fetch(`http://localhost:3000/admin/update-tenant-plan/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      });

      if (res.ok) {
        fetchTenants();
      } else {
        alert('Erro ao atualizar plano.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    }
  }

  async function handleUpdateDueDate(tenantId: string, newDate: string) {
    try {
      const res = await fetch(`http://localhost:3000/admin/update-tenant-due-date/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: newDate || null }),
      });

      if (res.ok) {
        alert('Data de vencimento atualizada!');
        fetchTenants();
      } else {
        alert('Erro ao atualizar vencimento.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    }
  }

  async function handleUpdateEmail(tenantId: string, userId: string) {
    const newEmail = editingEmails[tenantId];
    if (!newEmail) {
      alert('Digite um e-mail válido.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/admin/update-user-email/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail }),
      });

      if (res.ok) {
        alert('E-mail atualizado com sucesso!');
        fetchTenants();
      } else {
        alert('Erro ao atualizar e-mail.');
      }
    } catch (err) {
      alert('Erro de conexão ao atualizar e-mail.');
    }
  }

  function handleCopyLink(id: string) {
    const link = `http://localhost:5173/agendar/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleDeleteTenant(id: string, name: string) {
    if (!window.confirm(`Tem certeza que deseja excluir a empresa "${name}" permanentemente?`)) return;

    try {
      const res = await fetch(`http://localhost:3000/tenant/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Empresa removida com sucesso.');
        fetchTenants();
      } else {
        alert('Erro ao tentar excluir a empresa.');
      }
    } catch (err) {
      alert('Erro de conexão ao excluir empresa.');
    }
  }

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tenant.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'active') return matchesSearch && tenant.isActive;
    if (statusFilter === 'blocked') return matchesSearch && !tenant.isActive;
    return matchesSearch;
  });

  const totalTenantsCount = tenants.length;
  const activeTenantsCount = tenants.filter(t => t.isActive).length;
  const blockedTenantsCount = totalTenantsCount - activeTenantsCount;
  
  // Cálculo MRR dinâmico baseado no plano selecionado de cada tenant ativo
  const estimatedMRR = tenants.reduce((sum, t) => {
    if (!t.isActive) return sum;
    return sum + (t.plan === 'profissional' ? 119 : 79);
  }, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/25">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-amber-500">Painel Master — Agende+</h1>
            <p className="text-xs text-zinc-400">Gerenciamento de Assinaturas e Planos</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-8">
        
        {/* CARDS DE MÉTRICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs uppercase font-semibold">Total de Empresas</span>
              <Users className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-white">{totalTenantsCount}</p>
            <p className="text-[10px] text-zinc-500">Cadastradas na plataforma</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs uppercase font-semibold">Empresas Ativas</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{activeTenantsCount}</p>
            <p className="text-[10px] text-zinc-500">Com acesso liberado ao sistema</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs uppercase font-semibold">Bloqueadas / Inadimplentes</span>
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{blockedTenantsCount}</p>
            <p className="text-[10px] text-zinc-500">Acessos suspensos</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs uppercase font-semibold">MRR (Receita Mensal)</span>
              <DollarSign className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-500 font-mono">R$ {estimatedMRR.toFixed(2)}</p>
            <p className="text-[10px] text-zinc-500">Baseado nos planos ativos</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
          <div>
            <h2 className="text-lg font-semibold">Gerenciamento de Assinantes</h2>
            <p className="text-xs text-zinc-400">Total filtrado: {filteredTenants.length} de {tenants.length} empresas</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Pesquisar empresa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todas</option>
              <option value="active">Ativas</option>
              <option value="blocked">Bloqueadas</option>
            </select>
          </div>
        </div>

        {filteredTenants.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500 text-sm">
            Nenhuma empresa encontrada.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTenants.map((tenant) => {
              const adminUser = tenant.users && tenant.users.length > 0 ? tenant.users[0] : null;

              return (
                <div
                  key={tenant.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-zinc-800 p-2 rounded-lg">
                          <Building2 className="w-5 h-5 text-amber-500" />
                        </div>
                        <h3 className="font-bold text-base text-white">{tenant.name}</h3>
                      </div>
                      
                      <button
                        onClick={() => handleToggleStatus(tenant.id, tenant.isActive)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                          tenant.isActive ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        }`}
                      >
                        {tenant.isActive ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {tenant.isActive ? 'Ativa' : 'Bloqueada'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-md font-medium uppercase tracking-wider">
                          {tenant.category || 'Geral'}
                        </span>
                        
                        {/* Seletor de Plano pelo Super Admin */}
                        <select
                          value={tenant.plan || 'essencial'}
                          onChange={(e) => handleChangePlan(tenant.id, e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 text-amber-400 rounded-lg px-2 py-1 text-[11px] font-bold uppercase focus:outline-none focus:border-amber-500"
                        >
                          <option value="essencial">Plano Essencial (R$ 79)</option>
                          <option value="profissional">Plano Profissional (R$ 119)</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <input
                          type="date"
                          defaultValue={tenant.dueDate ? tenant.dueDate.split('T')[0] : ''}
                          onBlur={(e) => handleUpdateDueDate(tenant.id, e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-200 focus:border-amber-500 outline-none"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400">📞 WhatsApp: {tenant.whatsapp || 'Não informado'}</p>
                    <p className="text-[11px] text-zinc-500 font-mono bg-zinc-950 p-2 rounded-lg border border-zinc-800/60 truncate">
                      ID: {tenant.id}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                    <label className="text-[11px] text-zinc-400 font-medium">
                      E-mail do Admin (Acesso e Resumo 20h):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        defaultValue={adminUser?.email || ''}
                        placeholder="E-mail do administrador..."
                        onChange={(e) =>
                          setEditingEmails({ ...editingEmails, [tenant.id]: e.target.value })
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50 transition-colors"
                      />
                      {adminUser ? (
                        <button
                          onClick={() => handleUpdateEmail(tenant.id, adminUser.id)}
                          className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-medium px-4 py-1.5 rounded-lg text-xs transition-colors shrink-0"
                        >
                          Salvar
                        </button>
                      ) : (
                        <span className="text-[10px] text-red-400/80 self-center px-2">Sem admin</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">
                      Cadastrada em: {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyLink(tenant.id)}
                        className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 font-medium"
                        title="Copiar link de agendamento"
                      >
                        {copiedId === tenant.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Link
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                        className="bg-red-950/30 hover:bg-red-900/50 border border-red-900/50 text-red-400 text-xs p-2 rounded-xl transition-colors"
                        title="Excluir empresa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}