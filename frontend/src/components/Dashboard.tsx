import React, { useState, useEffect } from 'react';
import { 
  Building2, Calendar, Scissors, Users, LogOut, Trash2, 
  Clock, CheckCircle, XCircle, MessageSquare, Settings, ShieldCheck 
} from 'lucide-react';

interface UserProps {
  name: string;
  email: string;
  tenantId: string;
  tenantName: string;
}

interface DashboardProps {
  user?: UserProps;
  onLogout: () => void;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface Professional {
  id: string;
  name: string;
  nickname: string;
  avatarUrl: string;
}

interface Appointment {
  id: string;
  date: string;
  customer: { name: string; phone: string };
  service: { name: string; price: number };
  professional?: { name: string; nickname?: string };
  whatsappLink?: string;
}

interface BusinessHour {
  id: string;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  lunchStart: string;
  lunchEnd: string;
}

const DAYS_OF_WEEK = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'professionals' | 'hours' | 'profHours'>('appointments');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);

  const [selectedProfForHours, setSelectedProfForHours] = useState<string>('');
  const [profHours, setProfHours] = useState<BusinessHour[]>([]);

  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');
  const [newServicePrice, setNewServicePrice] = useState('');

  const [newProfName, setNewProfName] = useState('');
  const [newProfNickname, setNewProfNickname] = useState('');
  const [newProfAvatar, setNewProfAvatar] = useState('');

  const tenantId = user?.tenantId;

  useEffect(() => {
    if (tenantId) {
      fetchAppointments();
      fetchServices();
      fetchProfessionals();
      fetchBusinessHours();
    }
  }, [tenantId]);

  useEffect(() => {
    if (professionals.length > 0 && !selectedProfForHours) {
      setSelectedProfForHours(professionals[0].id);
    } else if (professionals.length === 0) {
      setSelectedProfForHours('');
    }
  }, [professionals]);

  useEffect(() => {
    if (selectedProfForHours) {
      fetchProfHours(selectedProfForHours);
    }
  }, [selectedProfForHours]);

  async function fetchAppointments() {
    if (!tenantId) return;
    try {
      const res = await fetch(`http://localhost:3000/appointments/${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        const enhancedData = data.map((app: any) => {
          if (!app.whatsappLink && app.customer) {
            const dateObj = new Date(app.date);
            const msg = encodeURIComponent(
              `Olá ${app.customer.name}! Passando para lembrar do seu agendamento de *${app.service?.name || 'Atendimento'}* para o dia *${dateObj.toLocaleDateString('pt-BR')} às ${dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}*. Te esperamos!`
            );
            const cleanPhone = app.customer.phone.replace(/\D/g, '');
            app.whatsappLink = `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${msg}`;
          }
          return app;
        });
        setAppointments(enhancedData);
      }
    } catch (err) { console.error(err); }
  }

  async function fetchServices() {
    if (!tenantId) return;
    try {
      const res = await fetch(`http://localhost:3000/services/${tenantId}`);
      if (res.ok) setServices(await res.json());
    } catch (err) { console.error(err); }
  }

  async function fetchProfessionals() {
    if (!tenantId) return;
    try {
      const res = await fetch(`http://localhost:3000/professionals/${tenantId}`);
      if (res.ok) setProfessionals(await res.json());
    } catch (err) { console.error(err); }
  }

  async function fetchBusinessHours() {
    if (!tenantId) return;
    try {
      const res = await fetch(`http://localhost:3000/business-hours/${tenantId}`);
      if (res.ok) setBusinessHours(await res.json());
    } catch (err) { console.error(err); }
  }

  async function fetchProfHours(profId: string) {
    try {
      const res = await fetch(`http://localhost:3000/professional-hours/${profId}`);
      if (res.ok) setProfHours(await res.json());
    } catch (err) { console.error(err); }
  }

  async function handleCreateService(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    try {
      const res = await fetch('http://localhost:3000/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newServiceName, duration: Number(newServiceDuration), price: Number(newServicePrice), tenantId }),
      });
      if (res.ok) { setNewServiceName(''); setNewServicePrice(''); fetchServices(); }
    } catch (err) { alert('Erro ao cadastrar serviço'); }
  }

  async function handleDeleteService(serviceId: string, serviceName: string) {
    if (!confirm(`Deseja realmente excluir o serviço "${serviceName}"?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/service/${serviceId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchServices();
      } else {
        alert('Erro ao excluir serviço.');
      }
    } catch (err) {
      alert('Erro de conexão ao excluir serviço.');
    }
  }

  async function handleCreateProfessional(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    try {
      const res = await fetch('http://localhost:3000/professional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProfName, nickname: newProfNickname, avatarUrl: newProfAvatar, tenantId }),
      });
      if (res.ok) { setNewProfName(''); setNewProfNickname(''); setNewProfAvatar(''); fetchProfessionals(); }
    } catch (err) { alert('Erro ao cadastrar profissional'); }
  }

  async function handleDeleteProfessional(profId: string, profName: string) {
    if (!confirm(`Deseja realmente excluir o profissional ${profName}?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/professional/${profId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchProfessionals();
        fetchAppointments();
      } else {
        alert('Erro ao excluir profissional.');
      }
    } catch (err) {
      alert('Erro de conexão ao excluir.');
    }
  }

  async function handleUpdateBusinessHour(hourId: string, updatedData: Partial<BusinessHour>) {
    try {
      const current = businessHours.find(h => h.id === hourId);
      if (!current) return;
      const payload = { ...current, ...updatedData };
      const res = await fetch(`http://localhost:3000/business-hour/${hourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) fetchBusinessHours();
    } catch (err) { alert('Erro ao atualizar horário'); }
  }

  async function handleUpdateProfHour(hourId: string, updatedData: Partial<BusinessHour>) {
    try {
      const current = profHours.find(h => h.id === hourId);
      if (!current) return;
      const payload = { ...current, ...updatedData };
      const res = await fetch(`http://localhost:3000/professional-hour/${hourId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok && selectedProfForHours) fetchProfHours(selectedProfForHours);
    } catch (err) { alert('Erro ao atualizar horário do profissional'); }
  }

  async function handleCancelAppointment(id: string) {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;
    try {
      const res = await fetch(`http://localhost:3000/appointment/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAppointments();
    } catch (err) { alert('Erro ao cancelar agendamento'); }
  }

  if (!user) return <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center">Carregando dados...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-[#1e293b]/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user.tenantName}</h1>
            <p className="text-xs text-slate-400">Painel do Estabelecimento • Logado como: {user.name}</p>
          </div>
        </div>
        <button onClick={onLogout} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </header>

      {/* Navegação por Abas */}
      <div className="border-b border-slate-800 bg-[#1e293b]/20 px-6 flex gap-4 overflow-x-auto">
        <button onClick={() => setActiveTab('appointments')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'appointments' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
          <Calendar className="w-4 h-4" /> Agendamentos ({appointments.length})
        </button>
        <button onClick={() => setActiveTab('services')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'services' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
          <Scissors className="w-4 h-4" /> Serviços ({services.length})
        </button>
        <button onClick={() => setActiveTab('professionals')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'professionals' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
          <Users className="w-4 h-4" /> Profissionais ({professionals.length})
        </button>
        <button onClick={() => setActiveTab('hours')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'hours' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
          <Clock className="w-4 h-4" /> Expediente Geral
        </button>
        <button onClick={() => setActiveTab('profHours')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'profHours' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
          <Settings className="w-4 h-4" /> Horários por Profissional
        </button>
      </div>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        
        {/* ABA: AGENDAMENTOS */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Agenda de Atendimentos</h2>
            {appointments.length === 0 ? (
              <div className="text-center py-16 bg-[#1e293b] border border-slate-800 rounded-2xl text-slate-500 text-xs">Nenhum agendamento registrado.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((app) => {
                  const dateObj = new Date(app.date);
                  return (
                    <div key={app.id} className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-md">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md font-mono font-bold border border-emerald-500/20">
                            {dateObj.toLocaleDateString('pt-BR')} às {dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button onClick={() => handleCancelAppointment(app.id)} className="text-red-400 hover:text-red-300 p-1 text-xs flex items-center gap-1 font-medium">
                            <Trash2 className="w-3.5 h-3.5" /> Cancelar
                          </button>
                        </div>
                        <h3 className="font-bold text-white text-base mt-3">{app.service?.name || 'Atendimento'}</h3>
                        <p className="text-xs text-slate-400 mt-1">👤 Cliente: <strong className="text-slate-200">{app.customer?.name}</strong> ({app.customer?.phone})</p>
                        {app.professional && (
                          <p className="text-xs text-slate-400 mt-0.5">✂️ Profissional: <strong className="text-slate-200">{app.professional.name}</strong></p>
                        )}
                      </div>

                      {app.whatsappLink && (
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Lembrete WhatsApp pronto:</span>
                          <a href={app.whatsappLink} target="_blank" rel="noopener noreferrer" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/10">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-950" /> Enviar Lembrete
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ABA: SERVIÇOS */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl h-fit space-y-4">
              <h3 className="font-bold text-sm">Novo Serviço</h3>
              <form onSubmit={handleCreateService} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nome do Serviço</label>
                  <input type="text" required value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} placeholder="" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Duração (minutos)</label>
                  <input type="number" required value={newServiceDuration} onChange={(e) => setNewServiceDuration(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Preço (R$)</label>
                  <input type="number" step="0.01" required value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} placeholder="45.00" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 font-bold text-slate-950 py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/10">Adicionar Serviço</button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h3 className="font-bold text-sm">Serviços Cadastrados</h3>
              {services.length === 0 ? (
                <div className="text-center py-12 bg-[#1e293b] border border-slate-800 rounded-2xl text-slate-500 text-xs">Nenhum serviço cadastrado.</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {services.map((s) => (
                    <div key={s.id} className="bg-[#1e293b] border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-white">{s.name}</h4>
                        <p className="text-xs text-slate-400">R$ {s.price.toFixed(2)} • {s.duration} min</p>
                      </div>
                      <button
                        onClick={() => handleDeleteService(s.id, s.name)}
                        className="text-red-400 hover:text-red-300 p-2 bg-red-500/10 border border-red-500/20 rounded-xl transition-colors"
                        title="Excluir Serviço"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA: PROFISSIONAIS */}
        {activeTab === 'professionals' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl h-fit space-y-4">
              <h3 className="font-bold text-sm">Novo Profissional</h3>
              <form onSubmit={handleCreateProfessional} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nome</label>
                  <input type="text" required value={newProfName} onChange={(e) => setNewProfName(e.target.value)} placeholder="" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Apelido / Especialidade</label>
                  <input type="text" value={newProfNickname} onChange={(e) => setNewProfNickname(e.target.value)} placeholder="" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Link da Foto (Avatar)</label>
                  <input type="text" value={newProfAvatar} onChange={(e) => setNewProfAvatar(e.target.value)} placeholder="" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 font-bold text-slate-950 py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/10">Cadastrar Profissional</button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h3 className="font-bold text-sm">Equipe Cadastrada</h3>
              {professionals.length === 0 ? (
                <div className="text-center py-12 bg-[#1e293b] border border-slate-800 rounded-2xl text-slate-500 text-xs">Nenhum profissional cadastrado.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {professionals.map((p) => (
                    <div key={p.id} className="bg-[#1e293b] border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={p.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt={p.name} className="w-12 h-12 rounded-full object-cover border border-slate-700" />
                        <div>
                          <h4 className="font-bold text-sm text-white">{p.name}</h4>
                          {p.nickname && <p className="text-xs text-slate-400">{p.nickname}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProfessional(p.id, p.name)}
                        className="text-red-400 hover:text-red-300 p-2 bg-red-500/10 border border-red-500/20 rounded-xl transition-colors"
                        title="Excluir Profissional"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA: EXPEDIENTE GERAL */}
        {activeTab === 'hours' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold">Expediente Geral do Estabelecimento</h2>
              <p className="text-xs text-slate-400">Defina os dias de funcionamento geral da empresa.</p>
            </div>
            <div className="space-y-3">
              {businessHours.map((h) => (
                <div key={h.id} className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${h.isOpen ? 'bg-[#1e293b] border-slate-800' : 'bg-red-950/20 border-red-900/40'}`}>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => handleUpdateBusinessHour(h.id, { isOpen: !h.isOpen })} className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${h.isOpen ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                      {h.isOpen ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {h.isOpen ? 'ABERTO' : 'FECHADO'}
                    </button>
                    <span className="font-bold text-sm text-white">{DAYS_OF_WEEK[h.dayOfWeek]}</span>
                  </div>

                  {h.isOpen && (
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 mr-1">Abre:</span>
                        <input type="time" value={h.openTime} onChange={(e) => handleUpdateBusinessHour(h.id, { openTime: e.target.value })} className="bg-[#0f172a] border border-slate-800 rounded-lg px-2 py-1 text-white font-mono focus:border-emerald-500 focus:outline-none" />
                      </div>
                      <div>
                        <span className="text-slate-500 mr-1">Fecha:</span>
                        <input type="time" value={h.closeTime} onChange={(e) => handleUpdateBusinessHour(h.id, { closeTime: e.target.value })} className="bg-[#0f172a] border border-slate-800 rounded-lg px-2 py-1 text-white font-mono focus:border-emerald-500 focus:outline-none" />
                      </div>
                      <div className="border-l border-slate-800 pl-3 flex items-center gap-2">
                        <span className="text-slate-500">Almoço:</span>
                        <input type="time" value={h.lunchStart || ''} onChange={(e) => handleUpdateBusinessHour(h.id, { lunchStart: e.target.value })} className="bg-[#0f172a] border border-slate-800 rounded-lg px-2 py-1 text-white font-mono focus:border-emerald-500 focus:outline-none" />
                        <span>às</span>
                        <input type="time" value={h.lunchEnd || ''} onChange={(e) => handleUpdateBusinessHour(h.id, { lunchEnd: e.target.value })} className="bg-[#0f172a] border border-slate-800 rounded-lg px-2 py-1 text-white font-mono focus:border-emerald-500 focus:outline-none" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA: HORÁRIOS POR PROFISSIONAL */}
        {activeTab === 'profHours' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Agenda Individual de Cada Profissional</h2>
                <p className="text-xs text-slate-400">Selecione o profissional para ajustar sua folga ou horário específico.</p>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {professionals.map((prof) => (
                  <button
                    key={prof.id}
                    onClick={() => setSelectedProfForHours(prof.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                      selectedProfForHours === prof.id ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' : 'bg-[#1e293b] border border-slate-800 text-slate-300'
                    }`}
                  >
                    <img src={prof.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt="" className="w-5 h-5 rounded-full object-cover" />
                    {prof.name}
                  </button>
                ))}
              </div>
            </div>

            {professionals.length === 0 ? (
              <div className="text-center py-16 bg-[#1e293b] border border-slate-800 rounded-2xl text-slate-500 text-xs">Nenhum profissional cadastrado para configurar.</div>
            ) : (
              <div className="space-y-3">
                {profHours.map((h) => (
                  <div key={h.id} className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${h.isOpen ? 'bg-[#1e293b] border-slate-800' : 'bg-red-950/20 border-red-900/40'}`}>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => handleUpdateProfHour(h.id, { isOpen: !h.isOpen })} className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${h.isOpen ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                        {h.isOpen ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {h.isOpen ? 'TRABALHA' : 'FOLGA'}
                      </button>
                      <span className="font-bold text-sm text-white">{DAYS_OF_WEEK[h.dayOfWeek]}</span>
                    </div>

                    {h.isOpen && (
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 mr-1">Início:</span>
                          <input type="time" value={h.openTime} onChange={(e) => handleUpdateProfHour(h.id, { openTime: e.target.value })} className="bg-[#0f172a] border border-slate-800 rounded-lg px-2 py-1 text-white font-mono focus:border-emerald-500 focus:outline-none" />
                        </div>
                        <div>
                          <span className="text-slate-500 mr-1">Fim:</span>
                          <input type="time" value={h.closeTime} onChange={(e) => handleUpdateProfHour(h.id, { closeTime: e.target.value })} className="bg-[#0f172a] border border-slate-800 rounded-lg px-2 py-1 text-white font-mono focus:border-emerald-500 focus:outline-none" />
                        </div>
                        <div className="border-l border-slate-800 pl-3 flex items-center gap-2">
                          <span className="text-slate-500">Almoço:</span>
                          <input type="time" value={h.lunchStart || ''} onChange={(e) => handleUpdateProfHour(h.id, { lunchStart: e.target.value })} className="bg-[#0f172a] border border-slate-800 rounded-lg px-2 py-1 text-white font-mono focus:border-emerald-500 focus:outline-none" />
                          <span>às</span>
                          <input type="time" value={h.lunchEnd || ''} onChange={(e) => handleUpdateProfHour(h.id, { lunchEnd: e.target.value })} className="bg-[#0f172a] border border-slate-800 rounded-lg px-2 py-1 text-white font-mono focus:border-emerald-500 focus:outline-none" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}