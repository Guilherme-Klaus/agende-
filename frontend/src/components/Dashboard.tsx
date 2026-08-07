import React, { useState, useEffect } from 'react';
import { 
  Building2, Calendar, Briefcase, Users, LogOut, Trash2, 
  Clock, CheckCircle, XCircle, MessageSquare, Settings, ShieldCheck, DollarSign, UserCheck, QrCode, Copy, ExternalLink, Palette, Package 
} from 'lucide-react';

interface UserProps {
  name: string;
  email: string;
  tenantId: string;
  tenantName: string;
  role?: string;
  id?: string;
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

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Professional {
  id: string;
  name: string;
  nickname: string;
  avatarUrl: string;
  email?: string;
}

interface Appointment {
  id: string;
  date: string;
  customer: { name: string; phone: string };
  service: { name: string; price: number };
  professional?: { id: string; name: string; nickname?: string };
  professionalId?: string;
  whatsappLink?: string;
}

interface CustomerReport {
  id: string;
  name: string;
  phone: string;
  totalAppointments: number;
  totalSpent: number;
  lastAppointment: string | null;
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
  const isProfessional = user?.role === 'professional';

  const [activeTab, setActiveTab] = useState<
    'appointments' | 'services' | 'products' | 'professionals' | 'hours' | 'profHours' | 'financial' | 'customers' | 'qrcode' | 'appearance' | 'settings' | 'rules'
  >('appointments');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [customers, setCustomers] = useState<CustomerReport[]>([]);

  const [selectedProfForHours, setSelectedProfForHours] = useState<string>('');
  const [profHours, setProfHours] = useState<BusinessHour[]>([]);

  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');
  const [newServicePrice, setNewServicePrice] = useState('');

  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('10');

  const [newProfName, setNewProfName] = useState('');
  const [newProfNickname, setNewProfNickname] = useState('');
  const [newProfAvatar, setNewProfAvatar] = useState('');
  const [newProfEmail, setNewProfEmail] = useState('');
  const [newProfPassword, setNewProfPassword] = useState('');
  
  const [logoPreview, setLogoPreview] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenantPixKey, setTenantPixKey] = useState('');
  
  // --- NOVOS ESTADOS DE REGRAS ---
  const [minNoticeHours, setMinNoticeHours] = useState('2');
  const [requireDeposit, setRequireDeposit] = useState(false);
  const [depositPercent, setDepositPercent] = useState('50');

  const [copied, setCopied] = useState(false);

  const tenantId = user?.tenantId;
  const bookingIdentifier = tenantSlug || tenantId;
  const bookingUrl = `${window.location.origin}/agendar/${bookingIdentifier}`;

  useEffect(() => {
    if (tenantId) {
      fetchAppointments();
      fetchTenantInfo();
      if (!isProfessional) {
        fetchServices();
        fetchProducts();
        fetchProfessionals();
        fetchBusinessHours();
        fetchCustomers();
      }
    }
  }, [tenantId, isProfessional]);

  async function fetchTenantInfo() {
    try {
      const res = await fetch(`http://localhost:3000/tenant/${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.logoUrl) setLogoPreview(data.logoUrl);
        if (data.slug) setTenantSlug(data.slug);
        if (data.pixKey) setTenantPixKey(data.pixKey);
        if (data.minNoticeHours !== undefined) setMinNoticeHours(String(data.minNoticeHours));
        if (data.requireDeposit !== undefined) setRequireDeposit(data.requireDeposit);
        if (data.depositPercent !== undefined) setDepositPercent(String(data.depositPercent));
      }
    } catch (err) { console.error(err); }
  }

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
        let data = await res.json();
        
        if (isProfessional && user?.id) {
          data = data.filter((app: any) => app.professionalId === user.id);
        }

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

  async function fetchProducts() {
    if (!tenantId) return;
    try {
      const res = await fetch(`http://localhost:3000/products/${tenantId}`);
      if (res.ok) setProducts(await res.json());
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

  async function fetchCustomers() {
    if (!tenantId) return;
    try {
      const res = await fetch(`http://localhost:3000/customers-report/${tenantId}`);
      if (res.ok) setCustomers(await res.json());
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
      const res = await fetch(`http://localhost:3000/service/${serviceId}`, { method: 'DELETE' });
      if (res.ok) fetchServices();
    } catch (err) { alert('Erro ao excluir serviço.'); }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    try {
      const res = await fetch('http://localhost:3000/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProdName, price: Number(newProdPrice), stock: Number(newProdStock), tenantId }),
      });
      if (res.ok) { setNewProdName(''); setNewProdPrice(''); fetchProducts(); }
    } catch (err) { alert('Erro ao cadastrar produto'); }
  }

  async function handleDeleteProduct(productId: string) {
    if (!confirm('Deseja excluir este produto?')) return;
    try {
      const res = await fetch(`http://localhost:3000/product/${productId}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch (err) { alert('Erro ao excluir produto.'); }
  }

  async function handleCreateProfessional(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    try {
      const res = await fetch('http://localhost:3000/professional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newProfName, 
          nickname: newProfNickname, 
          avatarUrl: newProfAvatar, 
          email: newProfEmail || null,
          password: newProfPassword || null,
          tenantId 
        }),
      });
      if (res.ok) { 
        setNewProfName(''); 
        setNewProfNickname(''); 
        setNewProfAvatar(''); 
        setNewProfEmail(''); 
        setNewProfPassword(''); 
        fetchProfessionals(); 
      } else {
        alert('Erro ao cadastrar profissional.');
      }
    } catch (err) { alert('Erro ao cadastrar profissional'); }
  }

  async function handleDeleteProfessional(profId: string, profName: string) {
    if (!confirm(`Deseja realmente excluir o profissional ${profName}?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/professional/${profId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProfessionals();
        fetchAppointments();
      }
    } catch (err) { alert('Erro de conexão ao excluir.'); }
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
      if (res.ok) {
        fetchAppointments();
        if (!isProfessional) fetchCustomers();
      }
    } catch (err) { alert('Erro ao cancelar agendamento'); }
  }

  async function handleSavePixKey() {
    try {
      const res = await fetch(`http://localhost:3000/tenant/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixKey: tenantPixKey }),
      });
      if (res.ok) {
        alert('Chave PIX salva com sucesso!');
      } else {
        alert('Erro ao salvar Chave PIX.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    }
  }

  async function handleSaveRules() {
    try {
      const res = await fetch(`http://localhost:3000/tenant/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          minNoticeHours: Number(minNoticeHours), 
          requireDeposit, 
          depositPercent: Number(depositPercent) 
        }),
      });
      if (res.ok) {
        alert('Regras de agendamento salvas com sucesso!');
      } else {
        alert('Erro ao salvar regras.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);

        try {
          const res = await fetch(`http://localhost:3000/tenant/${tenantId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logoUrl: base64String }),
          });
          if (res.ok) {
            alert('Foto de perfil do estabelecimento atualizada com sucesso!');
          }
        } catch (err) {
          alert('Erro ao salvar a imagem.');
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSaveSlug() {
    try {
      const res = await fetch(`http://localhost:3000/tenant/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: tenantSlug }),
      });
      if (res.ok) {
        alert('Link personalizado salvo com sucesso!');
      } else {
        alert('Este link já pode estar em uso.');
      }
    } catch (err) {
      alert('Erro ao salvar link.');
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const futureAppointments = appointments.filter((app) => {
    const appDate = new Date(app.date);
    return appDate >= now;
  });

  const groupedByDay: { [key: string]: Appointment[] } = {};
  futureAppointments.forEach((app) => {
    const dStr = new Date(app.date).toISOString().split('T')[0];
    if (!groupedByDay[dStr]) groupedByDay[dStr] = [];
    groupedByDay[dStr].push(app);
  });

  const sortedDays = Object.keys(groupedByDay).sort();

  function getDayLabel(dateString: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (dateString === todayStr) return '📅 Hoje';
    if (dateString === tomorrowStr) return '📅 Amanhã';

    const [year, month, day] = dateString.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    return `📅 ${dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}`;
  }

  const totalRevenue = appointments.reduce((acc, app) => acc + (app.service?.price || 0), 0);
  const totalAppointmentsCount = appointments.length;
  const averageTicket = totalAppointmentsCount > 0 ? totalRevenue / totalAppointmentsCount : 0;

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
            <p className="text-xs text-slate-400">
              {isProfessional ? `Painel do Profissional • ${user.name}` : `Painel do Estabelecimento • Logado como: ${user.name}`}
            </p>
          </div>
        </div>
        <button onClick={onLogout} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </header>

      {/* Navegação por Abas */}
      <div className="border-b border-slate-800 bg-[#1e293b]/20 px-6 flex gap-4 overflow-x-auto">
        <button onClick={() => setActiveTab('appointments')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'appointments' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
          <Calendar className="w-4 h-4" /> Agendamentos Ativos ({futureAppointments.length})
        </button>

        {!isProfessional && (
          <>
            <button onClick={() => setActiveTab('services')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'services' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              <Briefcase className="w-4 h-4" /> Serviços ({services.length})
            </button>
            <button onClick={() => setActiveTab('products')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'products' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              <Package className="w-4 h-4" /> Produtos / Balcão ({products.length})
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
            <button onClick={() => setActiveTab('rules')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'rules' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              <ShieldCheck className="w-4 h-4" /> Regras e Sinal PIX
            </button>
            <button onClick={() => setActiveTab('financial')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'financial' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              <DollarSign className="w-4 h-4" /> Faturamento
            </button>
            <button onClick={() => setActiveTab('customers')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'customers' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              <UserCheck className="w-4 h-4" /> Clientes (CRM)
            </button>
            <button onClick={() => setActiveTab('qrcode')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'qrcode' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              <QrCode className="w-4 h-4" /> QR Code de Agendamento
            </button>
            <button onClick={() => setActiveTab('appearance')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'appearance' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              <Palette className="w-4 h-4" /> Aparência e Cores
            </button>
            <button onClick={() => setActiveTab('settings')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              <DollarSign className="w-4 h-4" /> Chave PIX
            </button>
          </>
        )}
      </div>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-8">
        
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Agenda de Atendimentos</h2>
            {sortedDays.length === 0 ? (
              <div className="text-center py-16 bg-[#1e293b] border border-slate-800 rounded-2xl text-slate-500 text-xs">Nenhum agendamento futuro encontrado.</div>
            ) : (
              sortedDays.map((dayStr) => (
                <div key={dayStr} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      {getDayLabel(dayStr)}
                    </h3>
                    <div className="flex-1 h-[1px] bg-slate-800"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedByDay[dayStr].map((app) => {
                      const dateObj = new Date(app.date);
                      return (
                        <div key={app.id} className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-md">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs bg-slate-900 text-emerald-300 px-2.5 py-1 rounded-md font-mono font-bold border border-slate-700">
                                ⏰ {dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <button onClick={() => handleCancelAppointment(app.id)} className="text-red-400 hover:text-red-300 p-1 text-xs flex items-center gap-1 font-medium">
                                <Trash2 className="w-3.5 h-3.5" /> Cancelar
                              </button>
                            </div>
                            <h4 className="font-bold text-white text-base mt-3">{app.service?.name || 'Atendimento'}</h4>
                            <p className="text-xs text-slate-400 mt-1">👤 Cliente: <strong className="text-slate-200">{app.customer?.name}</strong> ({app.customer?.phone})</p>
                            {app.professional && !isProfessional && (
                              <p className="text-xs text-slate-400 mt-0.5">👤 Profissional: <strong className="text-slate-200">{app.professional.name}</strong></p>
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
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'services' && !isProfessional && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl h-fit space-y-4">
              <h3 className="font-bold text-sm">Novo Serviço</h3>
              <form onSubmit={handleCreateService} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nome do Serviço</label>
                  <input type="text" required value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Duração (minutos)</label>
                  <input type="number" required value={newServiceDuration} onChange={(e) => setNewServiceDuration(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Preço (R$)</label>
                  <input type="number" step="0.01" required value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
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
                      <button onClick={() => handleDeleteService(s.id, s.name)} className="text-red-400 hover:text-red-300 p-2 bg-red-500/10 border border-red-500/20 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'products' && !isProfessional && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl h-fit space-y-4">
              <h3 className="font-bold text-sm">Novo Produto / Balcão</h3>
              <form onSubmit={handleCreateProduct} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nome do Produto</label>
                  <input type="text" required value={newProdName} onChange={(e) => setNewProdName(e.target.value)} placeholder="Ex: Pomada Modeladora" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Preço (R$)</label>
                  <input type="number" step="0.01" required value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} placeholder="35.00" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Estoque Inicial</label>
                  <input type="number" required value={newProdStock} onChange={(e) => setNewProdStock(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 font-bold text-slate-950 py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/10">Cadastrar Produto</button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h3 className="font-bold text-sm">Produtos Cadastrados</h3>
              {products.length === 0 ? (
                <div className="text-center py-12 bg-[#1e293b] border border-slate-800 rounded-2xl text-slate-500 text-xs">Nenhum produto cadastrado no balcão.</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {products.map((p) => (
                    <div key={p.id} className="bg-[#1e293b] border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-white">{p.name}</h4>
                        <p className="text-xs text-slate-400">R$ {p.price.toFixed(2)} • Estoque: {p.stock} un</p>
                      </div>
                      <button onClick={() => handleDeleteProduct(p.id)} className="text-red-400 hover:text-red-300 p-2 bg-red-500/10 border border-red-500/20 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'professionals' && !isProfessional && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl h-fit space-y-4">
              <h3 className="font-bold text-sm">Novo Profissional</h3>
              <form onSubmit={handleCreateProfessional} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nome</label>
                  <input type="text" required value={newProfName} onChange={(e) => setNewProfName(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Apelido / Especialidade</label>
                  <input type="text" value={newProfNickname} onChange={(e) => setNewProfNickname(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">E-mail para Login (Opcional)</label>
                  <input type="email" value={newProfEmail} onChange={(e) => setNewProfEmail(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Senha de Acesso (Opcional)</label>
                  <input type="password" value={newProfPassword} onChange={(e) => setNewProfPassword(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none" />
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
                          {p.email && <p className="text-[10px] text-emerald-400 mt-0.5">Acesso liberado</p>}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteProfessional(p.id, p.name)} className="text-red-400 hover:text-red-300 p-2 bg-red-500/10 border border-red-500/20 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA: REGRAS E SINAL PIX (Funcionalidade 1 e 3) */}
        {activeTab === 'rules' && !isProfessional && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-lg font-bold">Regras de Antecedência e Sinal PIX</h2>
              <p className="text-xs text-slate-400">Configure a antecedência mínima e a exigência de sinal financeiro para os agendamentos.</p>
            </div>

            <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Antecedência Mínima (em horas)</label>
                <input 
                  type="number" 
                  value={minNoticeHours} 
                  onChange={(e) => setMinNoticeHours(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono" 
                />
                <p className="text-[10px] text-slate-500 mt-1">Impossibilita clientes de marcarem horários em cima da hora.</p>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block">Exigir Sinal via PIX para Confirmar?</span>
                    <span className="text-[10px] text-slate-500">O cliente precisará pagar uma porcentagem do valor total para reservar.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={requireDeposit} 
                    onChange={(e) => setRequireDeposit(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                {requireDeposit && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Porcentagem do Sinal (%)</label>
                    <input 
                      type="number" 
                      value={depositPercent} 
                      onChange={(e) => setDepositPercent(e.target.value)}
                      placeholder="Ex: 50" 
                      className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono" 
                    />
                  </div>
                )}
              </div>

              <button 
                onClick={handleSaveRules}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/10 mt-2"
              >
                Salvar Regras de Agendamento
              </button>
            </div>
          </div>
        )}

        {activeTab === 'hours' && !isProfessional && (
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profHours' && !isProfessional && (
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
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'financial' && !isProfessional && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Métricas de Faturamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl">
                <p className="text-xs uppercase tracking-wider text-slate-400">Faturamento Total</p>
                <p className="text-2xl font-bold text-emerald-400 mt-2">R$ {totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl">
                <p className="text-xs uppercase tracking-wider text-slate-400">Total de Atendimentos</p>
                <p className="text-2xl font-bold text-white mt-2">{totalAppointmentsCount}</p>
              </div>
              <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl">
                <p className="text-xs uppercase tracking-wider text-slate-400">Ticket Médio</p>
                <p className="text-2xl font-bold text-emerald-400 mt-2">R$ {averageTicket.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && !isProfessional && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Base de Clientes (CRM)</h2>
            {customers.length === 0 ? (
              <div className="text-center py-16 bg-[#1e293b] border border-slate-800 rounded-2xl text-slate-500 text-xs">Nenhum cliente cadastrado ainda.</div>
            ) : (
              <div className="bg-[#1e293b] border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Cliente</th>
                      <th className="p-4">WhatsApp</th>
                      <th className="p-4">Atendimentos</th>
                      <th className="p-4">Total Gasto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-bold text-white">{c.name}</td>
                        <td className="p-4 text-slate-300">{c.phone}</td>
                        <td className="p-4 text-slate-300">{c.totalAppointments}</td>
                        <td className="p-4 font-mono font-bold text-emerald-400">R$ {c.totalSpent.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'qrcode' && !isProfessional && (
          <div className="space-y-6 max-w-xl mx-auto text-center">
            <div>
              <h2 className="text-xl font-bold text-white">QR Code para o Balcão / Recepção</h2>
              <p className="text-xs text-slate-400 mt-1">Imprima este QR Code e coloque em um display no seu estabelecimento para seus clientes escanearem e agendarem na hora!</p>
            </div>

            <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl shadow-inner">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(bookingUrl)}`} 
                  alt="QR Code de Agendamento" 
                  className="w-56 h-56 object-contain"
                />
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-center gap-2 bg-[#0f172a] border border-slate-800 p-3 rounded-xl">
                  <input 
                    type="text" 
                    readOnly 
                    value={bookingUrl} 
                    className="w-full bg-transparent text-xs text-slate-300 focus:outline-none font-mono"
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" /> {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>

                <a 
                  href={bookingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Abrir Página de Agendamento em Nova Aba
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && !isProfessional && (
          <div className="space-y-8 max-w-xl">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold">Link Personalizado (Slug)</h2>
                <p className="text-xs text-slate-400">Defina um nome limpo para o seu link de agendamento (ex: psicologanathi).</p>
              </div>

              <div className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl space-y-3">
                <label className="block text-xs text-slate-400">Seu Link Exclusivo</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="ex: psicologanathi" 
                    value={tenantSlug} 
                    onChange={(e) => setTenantSlug(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" 
                  />
                  <button 
                    onClick={handleSaveSlug}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0"
                  >
                    Salvar Link
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold">Foto de Perfil / Logo do Estabelecimento</h2>
                <p className="text-xs text-slate-400">Faça upload de uma imagem do seu computador para usar como foto de perfil.</p>
              </div>

              <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl border border-slate-700 overflow-hidden bg-[#0f172a] flex items-center justify-center shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-slate-500" />
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <label className="block text-xs font-semibold text-slate-300">Selecionar imagem do computador</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold">Personalização do Tema Visual</h2>
                <p className="text-xs text-slate-400">Escolha a cor principal que aparecerá na sua página de agendamento público.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'emerald', name: 'Verde Neon (Padrão)', color: 'bg-emerald-500' },
                  { id: 'blue', name: 'Azul Elétrico', color: 'bg-blue-600' },
                  { id: 'purple', name: 'Roxo Neon', color: 'bg-purple-600' },
                  { id: 'pink', name: 'Rosa Estúdio', color: 'bg-pink-600' },
                ].map((theme) => (
                  <button
                    key={theme.id}
                    onClick={async () => {
                      try {
                        const res = await fetch(`http://localhost:3000/tenant/${tenantId}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ themeColor: theme.id }),
                        });
                        if (res.ok) {
                          alert('Tema atualizado com sucesso!');
                        }
                      } catch (err) {
                        alert('Erro ao atualizar tema.');
                      }
                    }}
                    className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-emerald-500/50 transition-all text-left"
                  >
                    <div className={`w-8 h-8 rounded-full ${theme.color} shadow-md`}></div>
                    <div>
                      <p className="font-bold text-xs text-white">{theme.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Aplicar este estilo</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && !isProfessional && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-lg font-bold">Configuração de Chave PIX</h2>
              <p className="text-xs text-slate-400">Informe sua chave PIX para que ela apareça na tela de sucesso quando o cliente realizar um agendamento.</p>
            </div>

            <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Sua Chave PIX (CPF, CNPJ, E-mail, Telefone ou Aleatória)</label>
                <input 
                  type="text" 
                  placeholder="Ex: 11999999999 ou meu@email.com" 
                  value={tenantPixKey} 
                  onChange={(e) => setTenantPixKey(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono" 
                />
              </div>
              <button 
                onClick={handleSavePixKey}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/10"
              >
                Salvar Chave PIX
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}