import React, { useState, useEffect } from 'react';
import { 
  Building2, Calendar, Briefcase, Users, LogOut, Trash2, 
  Clock, CheckCircle, XCircle, MessageSquare, Settings, ShieldCheck, DollarSign, UserCheck, QrCode, Copy, ExternalLink, Palette, Package, Star, TrendingDown, Image as ImageIcon, BarChart3, Layers, Gift 
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

interface Service { id: string; name: string; duration: number; price: number; }
interface Product { id: string; name: string; price: number; stock: number; }
interface Professional { id: string; name: string; nickname: string; avatarUrl: string; email?: string; commission: number; }
interface Appointment { id: string; date: string; customer: { name: string; phone: string }; service: { name: string; price: number }; professional?: { id: string; name: string; nickname?: string; commission?: number }; professionalId?: string; whatsappLink?: string; }
interface CustomerReport { id: string; name: string; phone: string; birthDate?: string | null; totalAppointments: number; totalSpent: number; lastAppointment: string | null; }
interface Expense { id: string; description: string; amount: number; date: string; }
interface ReviewItem { id: string; rating: number; comment?: string; createdAt: string; appointment: { customer: { name: string }; service?: { name: string }; }; }
interface BusinessHour { id: string; dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string; lunchStart: string; lunchEnd: string; }

const DAYS_OF_WEEK = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export function Dashboard({ user, onLogout }: DashboardProps) {
  const isProfessional = user?.role === 'professional';

  const [activeTab, setActiveTab] = useState<
    'appointments' | 'finance' | 'servicesProducts' | 'teamHours' | 'appearancePortfolio' | 'customersReviews' | 'rulesPix' | 'qrcode'
  >('appointments');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [customers, setCustomers] = useState<CustomerReport[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);
  const [newPortfolioUrl, setNewPortfolioUrl] = useState('');
  const [themeColor, setThemeColor] = useState('#10b981');

  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

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
  const [newProfCommission, setNewProfCommission] = useState('50');
  
  const [logoPreview, setLogoPreview] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenantPixKey, setTenantPixKey] = useState('');
  
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
        fetchExpenses();
        fetchReviews();
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
        if (data.themeColor) setThemeColor(data.themeColor);
        if (data.minNoticeHours !== undefined) setMinNoticeHours(String(data.minNoticeHours));
        if (data.requireDeposit !== undefined) setRequireDeposit(data.requireDeposit);
        if (data.depositPercent !== undefined) setDepositPercent(String(data.depositPercent));
        if (data.portfolioPhotos) {
          try { setPortfolioPhotos(JSON.parse(data.portfolioPhotos)); } catch { setPortfolioPhotos([]); }
        }
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

  async function fetchServices() { try { const res = await fetch(`http://localhost:3000/services/${tenantId}`); if (res.ok) setServices(await res.json()); } catch (err) {} }
  async function fetchProducts() { try { const res = await fetch(`http://localhost:3000/products/${tenantId}`); if (res.ok) setProducts(await res.json()); } catch (err) {} }
  async function fetchProfessionals() { try { const res = await fetch(`http://localhost:3000/professionals/${tenantId}`); if (res.ok) setProfessionals(await res.json()); } catch (err) {} }
  async function fetchBusinessHours() { try { const res = await fetch(`http://localhost:3000/business-hours/${tenantId}`); if (res.ok) setBusinessHours(await res.json()); } catch (err) {} }
  async function fetchCustomers() { try { const res = await fetch(`http://localhost:3000/customers-report/${tenantId}`); if (res.ok) setCustomers(await res.json()); } catch (err) {} }
  async function fetchExpenses() { try { const res = await fetch(`http://localhost:3000/expenses/${tenantId}`); if (res.ok) setExpenses(await res.json()); } catch (err) {} }
  async function fetchReviews() { try { const res = await fetch(`http://localhost:3000/reviews/${tenantId}`); if (res.ok) setReviews(await res.json()); } catch (err) {} }

  async function fetchProfHours(profId: string) {
    try {
      const res = await fetch(`http://localhost:3000/professional-hours/${profId}`);
      if (res.ok) setProfHours(await res.json());
    } catch (err) { console.error(err); }
  }

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

  async function handleCreateExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    try {
      const res = await fetch('http://localhost:3000/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newExpenseDesc, amount: Number(newExpenseAmount), tenantId })
      });
      if (res.ok) {
        setNewExpenseDesc('');
        setNewExpenseAmount('');
        fetchExpenses();
      }
    } catch (err) { alert('Erro ao cadastrar despesa.'); }
  }

  async function handleDeleteExpense(id: string) {
    if (!confirm('Deseja excluir esta despesa?')) return;
    try {
      const res = await fetch(`http://localhost:3000/expense/${id}`, { method: 'DELETE' });
      if (res.ok) fetchExpenses();
    } catch (err) { alert('Erro ao excluir.'); }
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
          commission: Number(newProfCommission) || 50,
          tenantId 
        }),
      });
      if (res.ok) { 
        setNewProfName(''); setNewProfNickname(''); setNewProfAvatar(''); setNewProfEmail(''); setNewProfPassword(''); setNewProfCommission('50'); fetchProfessionals(); 
      } else {
        alert('Erro ao cadastrar profissional.');
      }
    } catch (err) { alert('Erro ao cadastrar profissional'); }
  }

  async function handleDeleteProfessional(profId: string, profName: string) {
    if (!confirm(`Deseja realmente excluir o profissional ${profName}?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/professional/${profId}`, { method: 'DELETE' });
      if (res.ok) { fetchProfessionals(); fetchAppointments(); }
    } catch (err) { alert('Erro de conexão ao excluir.'); }
  }

  async function handleAddPortfolioPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!newPortfolioUrl) return;
    const updatedPhotos = [...portfolioPhotos, newPortfolioUrl];
    setPortfolioPhotos(updatedPhotos);
    setNewPortfolioUrl('');
    try {
      await fetch(`http://localhost:3000/tenant/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioPhotos: JSON.stringify(updatedPhotos) }),
      });
      alert('Foto adicionada ao portfólio!');
    } catch (err) { alert('Erro ao salvar portfólio.'); }
  }

  async function handleDeletePortfolioPhoto(index: number) {
    const updatedPhotos = portfolioPhotos.filter((_, i) => i !== index);
    setPortfolioPhotos(updatedPhotos);
    try {
      await fetch(`http://localhost:3000/tenant/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioPhotos: JSON.stringify(updatedPhotos) }),
      });
    } catch (err) {}
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
      if (res.ok) { fetchAppointments(); if (!isProfessional) fetchCustomers(); }
    } catch (err) { alert('Erro ao cancelar agendamento'); }
  }

  async function handleSavePixKey() {
    try {
      const res = await fetch(`http://localhost:3000/tenant/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixKey: tenantPixKey }),
      });
      if (res.ok) alert('Chave PIX salva com sucesso!');
    } catch (err) { alert('Erro de conexão.'); }
  }

  async function handleSaveRules() {
    try {
      const res = await fetch(`http://localhost:3000/tenant/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minNoticeHours: Number(minNoticeHours), requireDeposit, depositPercent: Number(depositPercent) }),
      });
      if (res.ok) alert('Regras de agendamento salvas com sucesso!');
    } catch (err) { alert('Erro de conexão.'); }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        try {
          await fetch(`http://localhost:3000/tenant/${tenantId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logoUrl: base64String }),
          });
          alert('Foto de perfil atualizada com sucesso!');
        } catch (err) { alert('Erro ao salvar a imagem.'); }
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
      if (res.ok) alert('Link personalizado salvo com sucesso!');
      else alert('Este link já pode estar em uso.');
    } catch (err) { alert('Erro ao salvar link.'); }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const futureAppointments = appointments.filter((app) => new Date(app.date) >= now);

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
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalAppointmentsCount = appointments.length;

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

      {/* Menu Superior em 8 Abas Principais */}
      <div className="border-b border-slate-800 bg-[#1e293b]/20 px-6 flex gap-4 overflow-x-auto">
        <button onClick={() => setActiveTab('appointments')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'appointments' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
          <Calendar className="w-4 h-4" /> Agenda ({futureAppointments.length})
        </button>

        {!isProfessional && (
          <>
            <button onClick={() => setActiveTab('finance')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'finance' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              <TrendingDown className="w-4 h-4" /> Financeiro & Caixa
            </button>
            <button onClick={() => setActiveTab('servicesProducts')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'servicesProducts' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              <Briefcase className="w-4 h-4" /> Serviços & Produtos
            </button>
            <button onClick={() => setActiveTab('teamHours')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'teamHours' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              <Users className="w-4 h-4" /> Equipe & Horários
            </button>
            <button onClick={() => setActiveTab('appearancePortfolio')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'appearancePortfolio' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              <Palette className="w-4 h-4" /> Aparência & Loja
            </button>
            <button onClick={() => setActiveTab('customersReviews')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'customersReviews' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              <UserCheck className="w-4 h-4" /> Clientes & Avaliações
            </button>
            <button onClick={() => setActiveTab('rulesPix')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'rulesPix' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              <DollarSign className="w-4 h-4" /> Regras & PIX
            </button>
            <button onClick={() => setActiveTab('qrcode')} className={`py-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'qrcode' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              <QrCode className="w-4 h-4" /> QR Code
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

        {/* 1. FINANCEIRO & CAIXA */}
        {activeTab === 'finance' && !isProfessional && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total de Atendimentos</span>
                <p className="text-2xl font-bold text-white">{totalAppointmentsCount}</p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Entradas (Faturamento)</span>
                <p className="text-2xl font-bold text-emerald-400">R$ {totalRevenue.toFixed(2)}</p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: '80%' }}></div>
                </div>
              </div>

              <div className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Lucro Líquido Real</span>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>R$ {netProfit.toFixed(2)}</p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl h-fit space-y-4">
                <h3 className="font-bold text-sm">Lançar Nova Despesa</h3>
                <form onSubmit={handleCreateExpense} className="space-y-3">
                  <input type="text" required value={newExpenseDesc} onChange={(e) => setNewExpenseDesc(e.target.value)} placeholder="Descrição (Ex: Aluguel)" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                  <input type="number" step="0.01" required value={newExpenseAmount} onChange={(e) => setNewExpenseAmount(e.target.value)} placeholder="Valor (R$)" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                  <button type="submit" className="w-full bg-emerald-500 font-bold text-slate-950 py-2.5 rounded-xl text-xs">Registrar Despesa</button>
                </form>
              </div>

              <div className="md:col-span-2 space-y-4">
                <h3 className="font-bold text-sm">Histórico de Despesas</h3>
                {expenses.length === 0 ? (
                  <div className="text-center py-8 bg-[#1e293b] border border-slate-800 rounded-2xl text-slate-500 text-xs">Nenhuma despesa registrada.</div>
                ) : (
                  <div className="space-y-2">
                    {expenses.map((exp) => (
                      <div key={exp.id} className="bg-[#1e293b] border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{exp.description}</h4>
                          <p className="text-[10px] text-slate-400">{new Date(exp.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-red-400">- R$ {exp.amount.toFixed(2)}</span>
                          <button onClick={() => handleDeleteExpense(exp.id)} className="text-red-400 p-1.5 bg-red-500/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-800">
              <h3 className="font-bold text-sm">Comissões da Equipe</h3>
              {professionals.length === 0 ? (
                <div className="text-center py-6 bg-[#1e293b] border border-slate-800 rounded-2xl text-slate-500 text-xs">Nenhum profissional cadastrado.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {professionals.map((prof) => {
                    const profAppointments = appointments.filter(app => app.professionalId === prof.id);
                    const profRevenue = profAppointments.reduce((sum, app) => sum + (app.service?.price || 0), 0);
                    const commissionRate = prof.commission || 50;
                    const commissionAmount = (profRevenue * commissionRate) / 100;

                    return (
                      <div key={prof.id} className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl space-y-2">
                        <div className="flex items-center gap-3">
                          <img src={prof.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                          <div>
                            <h4 className="font-bold text-white text-sm">{prof.name}</h4>
                            <p className="text-[10px] text-slate-400">Comissão: {commissionRate}%</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center bg-[#0f172a] p-3 rounded-xl border border-slate-800 text-xs">
                          <span className="text-slate-400">Total a Repassar:</span>
                          <span className="font-bold text-emerald-400 font-mono">R$ {commissionAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. SERVIÇOS & PRODUTOS */}
        {activeTab === 'servicesProducts' && !isProfessional && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-emerald-400">Gerenciar Serviços</h3>
              <form onSubmit={handleCreateService} className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl space-y-3">
                <input type="text" required value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} placeholder="Nome do Serviço" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <input type="number" required value={newServiceDuration} onChange={(e) => setNewServiceDuration(e.target.value)} placeholder="Duração (min)" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <input type="number" step="0.01" required value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} placeholder="Preço (R$)" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <button type="submit" className="w-full bg-emerald-500 font-bold text-slate-950 py-2.5 rounded-xl text-xs">Adicionar Serviço</button>
              </form>
              <div className="space-y-2">
                {services.map((s) => (
                  <div key={s.id} className="bg-[#1e293b] border border-slate-800 p-3.5 rounded-xl flex justify-between items-center text-xs">
                    <div><span className="font-bold text-white">{s.name}</span><p className="text-slate-400">R$ {s.price.toFixed(2)} • {s.duration} min</p></div>
                    <button onClick={() => handleDeleteService(s.id, s.name)} className="text-red-400 p-1.5"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-sm text-purple-400">Gerenciar Produtos / Balcão</h3>
              <form onSubmit={handleCreateProduct} className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl space-y-3">
                <input type="text" required value={newProdName} onChange={(e) => setNewProdName(e.target.value)} placeholder="Nome do Produto" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <input type="number" step="0.01" required value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} placeholder="Preço (R$)" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <input type="number" required value={newProdStock} onChange={(e) => setNewProdStock(e.target.value)} placeholder="Estoque Inicial" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <button type="submit" className="w-full bg-purple-600 font-bold text-white py-2.5 rounded-xl text-xs">Cadastrar Produto</button>
              </form>
              <div className="space-y-2">
                {products.map((p) => (
                  <div key={p.id} className="bg-[#1e293b] border border-slate-800 p-3.5 rounded-xl flex justify-between items-center text-xs">
                    <div><span className="font-bold text-white">{p.name}</span><p className="text-slate-400">R$ {p.price.toFixed(2)} • Estoque: {p.stock}</p></div>
                    <button onClick={() => handleDeleteProduct(p.id)} className="text-red-400 p-1.5"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. EQUIPE & HORÁRIOS */}
        {activeTab === 'teamHours' && !isProfessional && (
          <div className="space-y-10">
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-emerald-400">Equipe de Profissionais</h3>
              <form onSubmit={handleCreateProfessional} className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="text" required value={newProfName} onChange={(e) => setNewProfName(e.target.value)} placeholder="Nome" className="bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <input type="text" value={newProfNickname} onChange={(e) => setNewProfNickname(e.target.value)} placeholder="Especialidade" className="bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <input type="number" value={newProfCommission} onChange={(e) => setNewProfCommission(e.target.value)} placeholder="Comissão % (ex: 50)" className="bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <input type="email" value={newProfEmail} onChange={(e) => setNewProfEmail(e.target.value)} placeholder="E-mail Login" className="bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <input type="password" value={newProfPassword} onChange={(e) => setNewProfPassword(e.target.value)} placeholder="Senha" className="bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <button type="submit" className="bg-emerald-500 font-bold text-slate-950 py-2 rounded-xl text-xs">Cadastrar Profissional</button>
              </form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {professionals.map((p) => (
                  <div key={p.id} className="bg-[#1e293b] border border-slate-800 p-4 rounded-xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <img src={p.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                      <div><span className="font-bold text-white">{p.name}</span><p className="text-slate-400">Comissão: {p.commission || 50}%</p></div>
                    </div>
                    <button onClick={() => handleDeleteProfessional(p.id, p.name)} className="text-red-400 p-1.5"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-800">
              <h3 className="font-bold text-sm text-blue-400">Expediente Geral da Empresa</h3>
              <div className="space-y-2">
                {businessHours.map((h) => (
                  <div key={h.id} className="bg-[#1e293b] border border-slate-800 p-3.5 rounded-xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleUpdateBusinessHour(h.id, { isOpen: !h.isOpen })} className={`px-2.5 py-1 rounded-lg font-bold ${h.isOpen ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {h.isOpen ? 'ABERTO' : 'FECHADO'}
                      </button>
                      <span className="font-bold text-white">{DAYS_OF_WEEK[h.dayOfWeek]}</span>
                    </div>
                    {h.isOpen && (
                      <div className="flex gap-2">
                        <input type="time" value={h.openTime} onChange={(e) => handleUpdateBusinessHour(h.id, { openTime: e.target.value })} className="bg-[#0f172a] border border-slate-800 rounded px-2 py-1 text-white font-mono" />
                        <input type="time" value={h.closeTime} onChange={(e) => handleUpdateBusinessHour(h.id, { closeTime: e.target.value })} className="bg-[#0f172a] border border-slate-800 rounded px-2 py-1 text-white font-mono" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-purple-400">Horários e Folgas por Profissional</h3>
                  <p className="text-[11px] text-slate-400">Selecione o profissional para ajustar sua escala específica.</p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {professionals.map((prof) => (
                    <button
                      key={prof.id}
                      onClick={() => setSelectedProfForHours(prof.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                        selectedProfForHours === prof.id ? 'bg-purple-600 text-white shadow-md' : 'bg-[#1e293b] border border-slate-800 text-slate-300'
                      }`}
                    >
                      <img src={prof.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt="" className="w-4 h-4 rounded-full object-cover" />
                      {prof.name}
                    </button>
                  ))}
                </div>
              </div>

              {professionals.length === 0 ? (
                <div className="text-center py-6 bg-[#1e293b] border border-slate-800 rounded-2xl text-slate-500 text-xs">Nenhum profissional cadastrado.</div>
              ) : (
                <div className="space-y-2">
                  {profHours.map((h) => (
                    <div key={h.id} className={`p-3.5 rounded-xl border flex justify-between items-center text-xs ${h.isOpen ? 'bg-[#1e293b] border-slate-800' : 'bg-red-950/20 border-red-900/40'}`}>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleUpdateProfHour(h.id, { isOpen: !h.isOpen })} className={`px-2.5 py-1 rounded-lg font-bold ${h.isOpen ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {h.isOpen ? 'TRABALHA' : 'FOLGA'}
                        </button>
                        <span className="font-bold text-white">{DAYS_OF_WEEK[h.dayOfWeek]}</span>
                      </div>
                      {h.isOpen && (
                        <div className="flex gap-2">
                          <input type="time" value={h.openTime} onChange={(e) => handleUpdateProfHour(h.id, { openTime: e.target.value })} className="bg-[#0f172a] border border-slate-800 rounded px-2 py-1 text-white font-mono" />
                          <input type="time" value={h.closeTime} onChange={(e) => handleUpdateProfHour(h.id, { closeTime: e.target.value })} className="bg-[#0f172a] border border-slate-800 rounded px-2 py-1 text-white font-mono" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. APARÊNCIA & LOJA */}
        {activeTab === 'appearancePortfolio' && !isProfessional && (
          <div className="space-y-8 max-w-xl">
            <div className="space-y-4">
              <h3 className="font-bold text-sm">Link Personalizado (Slug)</h3>
              <div className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl flex gap-2">
                <input type="text" placeholder="ex: sualoja" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <button onClick={handleSaveSlug} className="bg-emerald-500 font-bold text-slate-950 px-4 py-2 rounded-xl text-xs shrink-0">Salvar</button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-sm">Logo / Foto de Perfil</h3>
              <div className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                {logoPreview && <img src={logoPreview} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-700" />}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs text-slate-400 file:bg-emerald-500/10 file:text-emerald-400 file:border-0 file:py-2 file:px-4 file:rounded-xl cursor-pointer" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-sm">Cor do Tema da Página Pública (Personalizada)</h3>
              <div className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                <input 
                  id="customThemeColor"
                  type="color" 
                  value={themeColor}
                  onChange={async (e) => {
                    const customColor = e.target.value;
                    setThemeColor(customColor);
                    if (!tenantId) return;
                    try {
                      const res = await fetch(`http://localhost:3000/tenant/${tenantId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ themeColor: customColor }),
                      });
                      if (!res.ok) alert('Erro ao salvar a cor no servidor.');
                    } catch (err) { 
                      console.error(err); 
                    }
                  }}
                  className="w-12 h-12 rounded-xl bg-transparent cursor-pointer border border-slate-700"
                />
                <div>
                  <p className="font-bold text-xs text-white">Escolha qualquer cor ({themeColor})</p>
                  <p className="text-[10px] text-slate-400">A cor é salva automaticamente ao selecionar na paleta.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-sm">Portfólio de Fotos (Galeria Pública)</h3>
              <form onSubmit={handleAddPortfolioPhoto} className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl space-y-3">
                <input type="url" required placeholder="https://exemplo.com/foto.jpg" value={newPortfolioUrl} onChange={(e) => setNewPortfolioUrl(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <button type="submit" className="w-full bg-emerald-500 font-bold text-slate-950 py-2.5 rounded-xl text-xs">Adicionar Foto</button>
              </form>
              <div className="grid grid-cols-3 gap-3">
                {portfolioPhotos.map((photo, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-800 aspect-square bg-[#1e293b]">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => handleDeletePortfolioPhoto(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. CLIENTES & AVALIAÇÕES (CRM + Aniversariantes + Avaliações) */}
        {activeTab === 'customersReviews' && !isProfessional && (
          <div className="space-y-8">
            {/* Seção de Aniversariantes do Mês */}
            <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-pink-500/10 p-2.5 rounded-xl border border-pink-500/30 text-pink-400">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Aniversariantes do Mês</h3>
                  <p className="text-xs text-slate-400">Clientes cadastrados que fazem aniversário neste mês.</p>
                </div>
              </div>

              {customers.filter(c => {
                if (!c.birthDate) return false;
                const bDate = new Date(c.birthDate);
                const currentMonth = new Date().getMonth();
                return bDate.getMonth() === currentMonth;
              }).length === 0 ? (
                <div className="text-center py-6 bg-[#0f172a] border border-slate-800 rounded-xl text-slate-500 text-xs">Nenhum aniversariante neste mês.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customers.filter(c => {
                    if (!c.birthDate) return false;
                    const bDate = new Date(c.birthDate);
                    const currentMonth = new Date().getMonth();
                    return bDate.getMonth() === currentMonth;
                  }).map(c => {
                    const bDate = new Date(c.birthDate!);
                    const cleanPhone = c.phone.replace(/\D/g, '');
                    const msg = encodeURIComponent(`Olá ${c.name}! Passando para te desejar um feliz aniversário! Muitas felicidades e sucesso, e conte sempre conosco da ${user.tenantName}! 🎂🎉`);
                    const waLink = `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${msg}`;

                    return (
                      <div key={c.id} className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white block">{c.name}</span>
                          <span className="text-slate-400">🎂 Dia {String(bDate.getUTCDate()).padStart(2, '0')}/{String(bDate.getUTCMonth() + 1).padStart(2, '0')}</span>
                        </div>
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm">
                          <MessageSquare className="w-3.5 h-3.5" /> Parabéns
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Base de Clientes (CRM) */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm">Base de Clientes (CRM)</h3>
              {customers.length === 0 ? (
                <div className="text-center py-8 bg-[#1e293b] border border-slate-800 rounded-2xl text-slate-500 text-xs">Nenhum cliente cadastrado.</div>
              ) : (
                <div className="bg-[#1e293b] border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 bg-slate-900/50 text-slate-400 uppercase">
                      <tr><th className="p-3">Cliente</th><th className="p-3">WhatsApp</th><th className="p-3">Nascimento</th><th className="p-3">Atendimentos</th><th className="p-3">Total Gasto</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {customers.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-800/30">
                          <td className="p-3 font-bold text-white">{c.name}</td>
                          <td className="p-3 text-slate-300">{c.phone}</td>
                          <td className="p-3 text-slate-300">{c.birthDate ? new Date(c.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}</td>
                          <td className="p-3 text-slate-300">{c.totalAppointments}</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">R$ {c.totalSpent.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Avaliações Recebidas */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="font-bold text-sm">Avaliações Recebidas ({reviews.length})</h3>
              {reviews.length === 0 ? (
                <div className="text-center py-8 bg-[#1e293b] border border-slate-800 rounded-2xl text-slate-500 text-xs">Nenhuma avaliação recebida.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-[#1e293b] border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center"><span className="font-bold text-white">{rev.appointment.customer?.name}</span><span className="text-amber-400 font-bold">★ {rev.rating}/5</span></div>
                      {rev.comment && <p className="text-slate-300 bg-[#0f172a] p-2.5 rounded-lg">"{rev.comment}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. REGRAS & PIX */}
        {activeTab === 'rulesPix' && !isProfessional && (
          <div className="space-y-6 max-w-xl">
            <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm">Chave PIX</h3>
              <input type="text" placeholder="Sua Chave PIX" value={tenantPixKey} onChange={(e) => setTenantPixKey(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white" />
              <button onClick={handleSavePixKey} className="w-full bg-emerald-500 font-bold text-slate-950 py-2.5 rounded-xl text-xs">Salvar Chave PIX</button>
            </div>

            <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm">Regras de Antecedência e Sinal</h3>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Antecedência Mínima (horas)</label>
                <input type="number" value={minNoticeHours} onChange={(e) => setMinNoticeHours(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Exigir Sinal via PIX?</span>
                <input type="checkbox" checked={requireDeposit} onChange={(e) => setRequireDeposit(e.target.checked)} className="w-4 h-4 accent-emerald-500" />
              </div>
              {requireDeposit && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Porcentagem do Sinal (%)</label>
                  <input type="number" value={depositPercent} onChange={(e) => setDepositPercent(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono" />
                </div>
              )}
              <button onClick={handleSaveRules} className="w-full bg-emerald-500 font-bold text-slate-950 py-2.5 rounded-xl text-xs">Salvar Regras</button>
            </div>
          </div>
        )}

        {/* 7. QR CODE */}
        {activeTab === 'qrcode' && !isProfessional && (
          <div className="space-y-6 max-w-xl mx-auto text-center">
            <div>
              <h2 className="text-xl font-bold">QR Code de Agendamento</h2>
              <p className="text-xs text-slate-400 mt-1">Imprima ou compartilhe este QR Code para seus clientes escanearem e agendarem diretamente.</p>
            </div>
            
            <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-3xl space-y-6 flex flex-col items-center shadow-xl">
              <div className="bg-white p-4 rounded-2xl shadow-md">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(bookingUrl)}`} alt="QR Code" className="w-56 h-56 object-contain" />
              </div>

              <div className="w-full space-y-3">
                <div className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 truncate max-w-[280px] font-mono">{bookingUrl}</span>
                  <button onClick={handleCopyLink} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>

                <a 
                  href={bookingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-500/10"
                >
                  <ExternalLink className="w-4 h-4" /> Abrir Página Pública de Agendamento
                </a>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}