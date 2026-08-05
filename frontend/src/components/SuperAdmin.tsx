import React, { useState, useEffect } from 'react';
import { Building2, ShieldAlert, LogOut, Copy, Check, Trash2 } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  category: string;
  whatsapp: string;
  createdAt: string;
}

interface SuperAdminProps {
  onLogout: () => void;
}

export function SuperAdmin({ onLogout }: SuperAdminProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  function handleCopyLink(id: string) {
    const link = `http://localhost:5173/agendar/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleDeleteTenant(id: string, name: string) {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a empresa "${name}"? Todos os dados, agendamentos e serviços dela serão apagados permanentemente.`
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:3000/tenant/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Empresa removida com sucesso.');
        fetchTenants();
      } else {
        alert('Erro ao tentar excluir a empresa.');
      }
    } catch (err) {
      console.error('Erro na requisição de exclusão:', err);
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
            <p className="text-xs text-zinc-400">Visão Geral de Empresas Cadastradas no SaaS</p>
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
            {tenants.map((tenant) => (
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
                    <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-md font-medium uppercase tracking-wider">
                      {tenant.category || 'Geral'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">📞 WhatsApp: {tenant.whatsapp || 'Não informado'}</p>
                  <p className="text-[11px] text-zinc-500 font-mono bg-zinc-950 p-2 rounded-lg border border-zinc-800/60 truncate">
                    ID: {tenant.id}
                  </p>
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
                      title="Excluir empresa inadimplente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}