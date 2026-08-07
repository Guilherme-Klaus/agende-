import React, { useState, useEffect } from 'react';
import { Building2, ShieldAlert, LogOut, Copy, Check, Trash2, Lock, Unlock } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  category: string;
  whatsapp: string;
  createdAt: string;
  isActive: boolean;
  users?: { id: string; email: string }[];
}

interface SuperAdminProps {
  onLogout: () => void;
}

export function SuperAdmin({ onLogout }: SuperAdminProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingEmails, setEditingEmails] = useState<{ [key: string]: string }>({});

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/25">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-amber-500">Painel Master — Agende+</h1>
            <p className="text-xs text-zinc-400">Gerenciamento de Assinaturas e Acessos</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Empresas Assinantes</h2>
            <p className="text-xs text-zinc-400">Total de negócios utilizando a plataforma: {tenants.length}</p>
          </div>
          <button
            onClick={fetchTenants}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs px-4 py-2 rounded-xl transition-colors"
          >
            🔄 Atualizar Lista
          </button>
        </div>

        {tenants.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500 text-sm">
            Nenhuma empresa cadastrada no sistema ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenants.map((tenant) => {
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
                      
                      {/* Botão de Bloquear / Desbloquear */}
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

                    <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-md font-medium uppercase tracking-wider inline-block">
                      {tenant.category || 'Geral'}
                    </span>

                    <p className="text-xs text-zinc-400">📞 WhatsApp: {tenant.whatsapp || 'Não informado'}</p>
                    <p className="text-[11px] text-zinc-500 font-mono bg-zinc-950 p-2 rounded-lg border border-zinc-800/60 truncate">
                      ID: {tenant.id}
                    </p>
                  </div>

                  {/* Campo de Edição de E-mail */}
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