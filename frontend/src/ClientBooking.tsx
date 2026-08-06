import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Store, MapPin, ArrowLeft, CheckCircle2, CheckCircle, ArrowRight, History, Calendar, Trash2, Copy, QrCode, DollarSign } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  category: string;
  whatsapp: string;
  address: string;
  themeColor: string;
  logoUrl: string;
  pixKey: string; // <--- Chave PIX cadastrada
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

interface BusinessHour {
  id: string;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  lunchStart: string;
  lunchEnd: string;
}

interface AppointmentHistory {
  id: string;
  date: string;
  service?: { name: string; price: number };
  professional?: { name: string };
}

const themes: Record<string, { primary: string, border: string, bgSoft: string, text: string, shadow: string, ring: string }> = {
  emerald: { primary: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950', border: 'border-emerald-500/50', bgSoft: 'bg-emerald-500/10', text: 'text-emerald-400', shadow: 'shadow-emerald-500/20', ring: 'focus:border-emerald-500' },
  blue: { primary: 'bg-blue-600 hover:bg-blue-500 text-white', border: 'border-blue-500/50', bgSoft: 'bg-blue-500/10', text: 'text-blue-400', shadow: 'shadow-blue-500/20', ring: 'focus:border-blue-500' },
  purple: { primary: 'bg-purple-600 hover:bg-purple-500 text-white', border: 'border-purple-500/50', bgSoft: 'bg-purple-500/10', text: 'text-purple-400', shadow: 'shadow-purple-500/20', ring: 'focus:border-purple-500' },
  pink: { primary: 'bg-pink-600 hover:bg-pink-500 text-white', border: 'border-pink-500/50', bgSoft: 'bg-pink-500/10', text: 'text-pink-400', shadow: 'shadow-pink-500/20', ring: 'focus:border-pink-500' },
};

export function ClientBooking() {
  const { tenantId } = useParams<{ tenantId: string }>();
  
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [professionalHours, setProfessionalHours] = useState<BusinessHour[]>([]);
  
  const [mode, setMode] = useState<'home' | 'services' | 'booking' | 'history' | 'success'>('home');
  const [step, setStep] = useState<'services' | 'booking' | 'success'>('services');
  
  const [searchPhone, setSearchPhone] = useState('');
  const [clientAppointments, setClientAppointments] = useState<AppointmentHistory[]>([]);
  
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  useEffect(() => {
    if (tenantId) {
      fetchTenantInfo();
    }
  }, [tenantId]);

  async function fetchTenantInfo() {
    try {
      const res = await fetch(`http://localhost:3000/tenant/${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setTenant(data);
        fetchServices(data.id);
        fetchProfessionals(data.id);
        fetchBusinessHours(data.id);
      }
    } catch (err) { console.error(err); }
  }

  async function fetchServices(realTenantId: string) {
    try {
      const res = await fetch(`http://localhost:3000/services/${realTenantId}`);
      if (res.ok) setServices(await res.json());
    } catch (err) { console.error(err); }
  }

  async function fetchProfessionals(realTenantId: string) {
    try {
      const res = await fetch(`http://localhost:3000/professionals/${realTenantId}`);
      if (res.ok) setProfessionals(await res.json());
    } catch (err) { console.error(err); }
  }

  async function fetchBusinessHours(realTenantId: string) {
    try {
      const res = await fetch(`http://localhost:3000/business-hours/${realTenantId}`);
      if (res.ok) setBusinessHours(await res.json());
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    if (selectedProfessional) {
      fetchProfessionalHours(selectedProfessional.id);
    }
  }, [selectedProfessional]);

  async function fetchProfessionalHours(profId: string) {
    try {
      const res = await fetch(`http://localhost:3000/professional-hours/${profId}`);
      if (res.ok) setProfessionalHours(await res.json());
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    if (tenant && selectedDate) {
      fetchBookedAppointments(tenant.id);
    }
  }, [tenant, selectedDate, selectedProfessional, professionals, professionalHours]);

  async function fetchBookedAppointments(realTenantId: string) {
    try {
      const res = await fetch(`http://localhost:3000/appointments/${realTenantId}`);
      if (res.ok) {
        const data = await res.json();
        
        const appointmentsOnDate = data.filter((item: any) => {
          const itemDate = new Date(item.date).toISOString().split('T')[0];
          return itemDate === selectedDate;
        });

        if (selectedProfessional) {
          const times = appointmentsOnDate
            .filter((item: any) => item.professionalId === selectedProfessional.id)
            .map((item: any) => {
              const d = new Date(item.date);
              return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            });
          setBookedTimes(times);
        } else {
          const totalProfessionals = professionals.length;
          
          if (totalProfessionals === 0) {
            const times = appointmentsOnDate.map((item: any) => {
              const d = new Date(item.date);
              return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            });
            setBookedTimes(times);
          } else {
            const timeCounts: { [key: string]: number } = {};
            appointmentsOnDate.forEach((item: any) => {
              const d = new Date(item.date);
              const tStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
              timeCounts[tStr] = (timeCounts[tStr] || 0) + 1;
            });

            const fullyBookedTimes = Object.keys(timeCounts).filter(
              (time) => timeCounts[time] >= totalProfessionals
            );
            setBookedTimes(fullyBookedTimes);
          }
        }
      }
    } catch (err) { console.error(err); }
  }

  async function handleSearchHistory(e: React.FormEvent) {
    e.preventDefault();
    if (!tenant || !searchPhone) return;

    try {
      const res = await fetch(`http://localhost:3000/customer-appointments/${tenant.id}?phone=${encodeURIComponent(searchPhone)}`);
      if (res.ok) {
        const data = await res.json();
        setClientAppointments(data);
        setMode('history');
      }
    } catch (err) {
      alert('Erro ao buscar histórico.');
    }
  }

  async function handleCancelAppointment(appId: string) {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;
    try {
      const res = await fetch(`http://localhost:3000/appointment/${appId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Agendamento cancelado com sucesso.');
        handleSearchHistory({ preventDefault: () => {} } as any);
      }
    } catch (err) {
      alert('Erro ao cancelar.');
    }
  }

  function handleToggleService(serviceId: string) {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter(id => id !== serviceId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  }

  const selectedServicesList = services.filter(s => selectedServiceIds.includes(s.id));
  const totalPrice = selectedServicesList.reduce((acc, s) => acc + s.price, 0);
  const totalDuration = selectedServicesList.reduce((acc, s) => acc + s.duration, 0);

  const currentDayOfWeek = new Date(selectedDate + 'T00:00:00').getDay();
  
  const activeConfig = selectedProfessional 
    ? professionalHours.find(h => h.dayOfWeek === currentDayOfWeek)
    : businessHours.find(h => h.dayOfWeek === currentDayOfWeek);

  function generateTimeSlots() {
    if (!activeConfig || !activeConfig.isOpen) return [];

    const slots = [];
    const [openH, openM] = activeConfig.openTime.split(':').map(Number);
    const [closeH, closeM] = activeConfig.closeTime.split(':').map(Number);

    let currentMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;

    let lunchStartMin = -1;
    let lunchEndMin = -1;
    if (activeConfig.lunchStart && activeConfig.lunchEnd) {
      const [lsH, lsM] = activeConfig.lunchStart.split(':').map(Number);
      const [leH, leM] = activeConfig.lunchEnd.split(':').map(Number);
      lunchStartMin = lsH * 60 + lsM;
      lunchEndMin = leH * 60 + leM;
    }

    while (currentMinutes < endMinutes) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      const inLunch = lunchStartMin !== -1 && currentMinutes >= lunchStartMin && currentMinutes < lunchEndMin;
      if (!inLunch) slots.push(timeStr);

      currentMinutes += 30;
    }

    return slots;
  }

  async function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!tenant) return;
    if (selectedServiceIds.length === 0 || !selectedTime || !clientName || !clientPhone) {
      alert('Selecione pelo menos um serviço e preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const customerRes = await fetch('http://localhost:3000/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clientName, phone: clientPhone, tenantId: tenant.id }),
      });
      const customerData = await customerRes.json();

      const [hours, minutes] = selectedTime.split(':');
      const appointmentDate = new Date(selectedDate + 'T00:00:00');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      let assignedProfessionalId = selectedProfessional ? selectedProfessional.id : null;
      
      if (!assignedProfessionalId && professionals.length > 0) {
        const resApp = await fetch(`http://localhost:3000/appointments/${tenant.id}`);
        if (resApp.ok) {
          const allApps = await resApp.json();
          const busyProfIds = allApps
            .filter((item: any) => {
              const itemDate = new Date(item.date).getTime();
              return itemDate === appointmentDate.getTime() && item.professionalId;
            })
            .map((item: any) => item.professionalId);

          const freeProf = professionals.find((p) => !busyProfIds.includes(p.id));
          if (freeProf) {
            assignedProfessionalId = freeProf.id;
          } else {
            assignedProfessionalId = professionals[0].id;
          }
        }
      }

      const appointmentRes = await fetch('http://localhost:3000/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: appointmentDate.toISOString(),
          tenantId: tenant.id,
          customerId: customerData.id,
          serviceId: selectedServiceIds[0],
          professionalId: assignedProfessionalId,
        }),
      });

      if (appointmentRes.ok) {
        setStep('success');
      } else {
        const errData = await appointmentRes.json();
        alert(errData.error || 'Erro ao realizar agendamento.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  }

  const nextDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateString: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('pt-BR', { month: 'short' }),
    };
  });

  if (!tenant) return <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center">Carregando...</div>;

  const timeSlots = generateTimeSlots();
  const activeTheme = themes[tenant?.themeColor || 'emerald'] || themes.emerald;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 pb-28">
      <div className="bg-[#1e293b] border-b border-slate-800 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 border rounded-2xl flex items-center justify-center overflow-hidden ${activeTheme.bgSoft} ${activeTheme.border} ${activeTheme.text}`}>
              {tenant.logoUrl ? (
                <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{tenant.name}</h1>
              <p className={`text-xs font-medium uppercase tracking-wider mt-1 ${activeTheme.text}`}>{tenant.category || 'Estabelecimento'}</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className={`w-3.5 h-3.5 ${activeTheme.text}`} /> {tenant.address || 'Endereço não informado'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.href = 'http://localhost:5173';
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-medium transition-colors"
          >
            Acessar minha conta
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 mt-8">
        
        {mode === 'home' && step !== 'success' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-12">
            <div 
              onClick={() => { setMode('services'); setStep('services'); }}
              className="bg-[#1e293b] border border-slate-800 hover:border-emerald-500/50 p-8 rounded-3xl cursor-pointer text-center space-y-4 shadow-xl transition-all group"
            >
              <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${activeTheme.bgSoft} ${activeTheme.border} ${activeTheme.text}`}>
                <Calendar className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Novo Agendamento</h2>
              <p className="text-xs text-slate-400">Escolha os serviços e horários disponíveis para marcar seu atendimento.</p>
            </div>

            <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-3xl space-y-4 shadow-xl">
              <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${activeTheme.bgSoft} ${activeTheme.border} ${activeTheme.text}`}>
                <History className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-white text-center">Meus Agendamentos</h2>
              <form onSubmit={handleSearchHistory} className="space-y-3">
                <input 
                  type="text" 
                  required 
                  placeholder="Seu WhatsApp (com DDD)" 
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className={`w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none ${activeTheme.ring}`}
                />
                <button 
                  type="submit"
                  className={`w-full font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md ${activeTheme.primary} ${activeTheme.shadow}`}
                >
                  Ver Histórico
                </button>
              </form>
            </div>
          </div>
        )}

        {mode === 'history' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <button onClick={() => setMode('home')} className={`text-xs hover:underline flex items-center gap-1 font-medium ${activeTheme.text}`}>
              <ArrowLeft className="w-4 h-4" /> Voltar ao início
            </button>

            <h2 className="text-xl font-bold text-white">Seus Agendamentos</h2>

            {clientAppointments.length === 0 ? (
              <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-2xl text-center text-slate-400 text-xs">
                Nenhum agendamento encontrado para este número de WhatsApp.
              </div>
            ) : (
              <div className="space-y-3">
                {clientAppointments.map((app) => {
                  const dateObj = new Date(app.date);
                  const isPast = dateObj < new Date();

                  return (
                    <div key={app.id} className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-slate-900 text-emerald-300 px-2.5 py-1 rounded-md font-mono font-bold border border-slate-700">
                            {dateObj.toLocaleDateString('pt-BR')} às {dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isPast && <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Realizado</span>}
                        </div>
                        <h4 className="font-bold text-white text-sm mt-2">{app.service?.name || 'Atendimento'}</h4>
                        {app.professional && <p className="text-xs text-slate-400">Profissional: {app.professional.name}</p>}
                      </div>

                      {!isPast && (
                        <button 
                          onClick={() => handleCancelAppointment(app.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 p-2.5 rounded-xl transition-colors"
                          title="Cancelar Agendamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {mode === 'services' && step === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={() => setMode('home')} className={`text-xs hover:underline flex items-center gap-1 font-medium ${activeTheme.text}`}>
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              {selectedServiceIds.length > 0 && (
                <button 
                  onClick={() => setStep('booking')}
                  className={`font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-md flex items-center gap-2 ${activeTheme.primary} ${activeTheme.shadow}`}
                >
                  Continuar ({selectedServiceIds.length}) <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <h2 className="text-lg font-bold">Selecione os Serviços</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => {
                const isSelected = selectedServiceIds.includes(service.id);
                return (
                  <div 
                    key={service.id} 
                    onClick={() => handleToggleService(service.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between shadow-md ${
                      isSelected ? `${activeTheme.bgSoft} ${activeTheme.border}` : 'bg-[#1e293b] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-white text-sm">{service.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">R$ {service.price.toFixed(2)} • {service.duration} min</p>
                    </div>
                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center ${isSelected ? `${activeTheme.primary.split(' ')[0]} border-transparent text-slate-950` : 'border-slate-700 bg-[#0f172a]'}`}>
                      {isSelected && <CheckCircle className="w-4 h-4" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'services' && step === 'booking' && (
          <div className="bg-[#1e293b] border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl">
            <button onClick={() => setStep('services')} className={`text-xs hover:underline flex items-center gap-1 font-medium ${activeTheme.text}`}>
              <ArrowLeft className="w-4 h-4" /> Voltar e alterar serviços
            </button>

            <div>
              <h2 className="text-xl font-bold text-white">Resumo dos Serviços Escolhidos</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedServicesList.map(s => (
                  <span key={s.id} className={`text-xs px-3 py-1 rounded-xl border ${activeTheme.bgSoft} ${activeTheme.border} ${activeTheme.text}`}>
                    {s.name} (R$ {s.price.toFixed(2)} • {s.duration} min)
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2 font-mono">
                Total: ⏱️ {totalDuration} min | 💰 R$ {totalPrice.toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Escolha o Profissional</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div 
                  onClick={() => setSelectedProfessional(null)} 
                  className={`cursor-pointer p-3 rounded-2xl border text-center transition-all ${
                    !selectedProfessional ? `${activeTheme.bgSoft} ${activeTheme.border} ${activeTheme.text}` : 'bg-[#0f172a] border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="w-12 h-12 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center text-xs">🔄</div>
                  <p className="text-xs font-bold">Qualquer um</p>
                </div>

                {professionals.map((prof) => (
                  <div 
                    key={prof.id} 
                    onClick={() => setSelectedProfessional(prof)} 
                    className={`cursor-pointer p-3 rounded-2xl border text-center transition-all ${
                      selectedProfessional?.id === prof.id ? `${activeTheme.bgSoft} ${activeTheme.border} ${activeTheme.text}` : 'bg-[#0f172a] border-slate-800 text-slate-400'
                    }`}
                  >
                    <img 
                      src={prof.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                      alt={prof.name} 
                      className="w-12 h-12 rounded-full mx-auto mb-2 object-cover border border-slate-700" 
                    />
                    <p className="text-xs font-bold text-white truncate">{prof.name}</p>
                    {prof.nickname && <p className="text-[10px] text-slate-500 truncate">{prof.nickname}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Selecione a Data</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {nextDays.map((d) => (
                  <button key={d.dateString} type="button" onClick={() => { setSelectedDate(d.dateString); setSelectedTime(''); }} className={`flex-shrink-0 px-4 py-3 rounded-2xl border text-center transition-all ${selectedDate === d.dateString ? `${activeTheme.primary} font-bold border-transparent shadow-md` : 'bg-[#0f172a] border-slate-800 text-slate-300'}`}>
                    <span className="block text-[10px] uppercase">{d.dayName}</span>
                    <span className="block text-base font-bold my-0.5">{d.dayNumber}</span>
                    <span className="block text-[10px] uppercase">{d.monthName}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Horários Disponíveis</label>
              {!activeConfig || !activeConfig.isOpen ? (
                <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-4 rounded-2xl text-xs text-center font-semibold">
                  🔴 {selectedProfessional ? `${selectedProfessional.name} está de folga` : 'Estabelecimento fechado'} neste dia da semana.
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="text-slate-500 text-xs">Nenhum horário disponível para esta data.</div>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {timeSlots.map((time) => {
                    const isBooked = bookedTimes.includes(time);
                    const isSelected = selectedTime === time;

                    return (
                      <button key={time} type="button" disabled={isBooked} onClick={() => setSelectedTime(time)} className={`py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${isBooked ? 'bg-[#0f172a]/40 border border-slate-900 text-slate-700 line-through cursor-not-allowed' : isSelected ? `${activeTheme.primary} border-transparent shadow-md` : 'bg-[#0f172a] border border-slate-800 text-slate-300 hover:border-slate-700'}`}>
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {activeConfig?.isOpen && (
              <form onSubmit={handleConfirmBooking} className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300">Seus Dados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Seu Nome Completo" className={`w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none ${activeTheme.ring}`} />
                  <input type="text" required value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="Seu WhatsApp" className={`w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none ${activeTheme.ring}`} />
                </div>
                <button type="submit" disabled={loading || !selectedTime} className={`w-full font-bold py-3.5 rounded-xl text-xs disabled:opacity-50 shadow-lg transition-all ${activeTheme.primary} ${activeTheme.shadow}`}>Confirmar Agendamento</button>
              </form>
            )}
          </div>
        )}

        {/* TELA DE SUCESSO COM PAGAMENTO VIA PIX */}
        {step === 'success' && (
          <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-3xl text-center max-w-lg mx-auto space-y-6 shadow-2xl">
            <div className={`w-16 h-16 border rounded-full flex items-center justify-center mx-auto ${activeTheme.bgSoft} ${activeTheme.border} ${activeTheme.text}`}>
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Agendamento Confirmado!</h2>
              <p className="text-xs text-slate-400 mt-1">Seu horário foi reservado com sucesso.</p>
            </div>

            {/* CARD DE PAGAMENTO VIA PIX */}
            {tenant.pixKey ? (
              <div className="bg-[#0f172a] border border-emerald-500/30 p-5 rounded-2xl text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-bold text-xs uppercase tracking-wider">Pagamento via PIX</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                    R$ {totalPrice.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-slate-300">Pague agora mesmo utilizando a chave PIX abaixo:</p>

                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={tenant.pixKey} 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 select-all" 
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(tenant.pixKey);
                      setPixCopied(true);
                      setTimeout(() => setPixCopied(false), 2000);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 flex-shrink-0"
                  >
                    {pixCopied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {pixCopied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl text-slate-400 text-xs">
                Valor Total do Atendimento: <strong className="text-white font-mono">R$ {totalPrice.toFixed(2)}</strong>
              </div>
            )}

            <button onClick={() => { setStep('services'); setMode('home'); setSelectedServiceIds([]); setSelectedTime(''); }} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl text-xs font-medium transition-colors">
              Voltar ao Início
            </button>
          </div>
        )}

      </main>
    </div>
  );
}