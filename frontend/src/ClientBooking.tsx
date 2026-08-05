import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Store, MapPin, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  category: string;
  whatsapp: string;
  address: string;
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

export function ClientBooking() {
  const { tenantId } = useParams<{ tenantId: string }>();
  
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [professionalHours, setProfessionalHours] = useState<BusinessHour[]>([]);
  
  const [step, setStep] = useState<'services' | 'booking' | 'success'>('services');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tenantId) {
      fetchTenantInfo();
      fetchServices();
      fetchProfessionals();
      fetchBusinessHours();
    }
  }, [tenantId]);

  useEffect(() => {
    if (selectedProfessional) {
      fetchProfessionalHours(selectedProfessional.id);
    }
  }, [selectedProfessional]);

  useEffect(() => {
    if (tenantId && selectedDate) {
      fetchBookedAppointments();
    }
  }, [tenantId, selectedDate, selectedProfessional, professionals, professionalHours]);

  async function fetchTenantInfo() {
    try {
      const res = await fetch(`http://localhost:3000/tenant/${tenantId}`);
      if (res.ok) setTenant(await res.json());
    } catch (err) { console.error(err); }
  }

  async function fetchServices() {
    try {
      const res = await fetch(`http://localhost:3000/services/${tenantId}`);
      if (res.ok) setServices(await res.json());
    } catch (err) { console.error(err); }
  }

  async function fetchProfessionals() {
    try {
      const res = await fetch(`http://localhost:3000/professionals/${tenantId}`);
      if (res.ok) setProfessionals(await res.json());
    } catch (err) { console.error(err); }
  }

  async function fetchBusinessHours() {
    try {
      const res = await fetch(`http://localhost:3000/business-hours/${tenantId}`);
      if (res.ok) setBusinessHours(await res.json());
    } catch (err) { console.error(err); }
  }

  async function fetchProfessionalHours(profId: string) {
    try {
      const res = await fetch(`http://localhost:3000/professional-hours/${profId}`);
      if (res.ok) setProfessionalHours(await res.json());
    } catch (err) { console.error(err); }
  }

  async function fetchBookedAppointments() {
    try {
      const res = await fetch(`http://localhost:3000/appointments/${tenantId}`);
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
    if (!selectedService || !selectedTime || !clientName || !clientPhone) {
      alert('Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const customerRes = await fetch('http://localhost:3000/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clientName, phone: clientPhone, tenantId }),
      });
      const customerData = await customerRes.json();

      const [hours, minutes] = selectedTime.split(':');
      const appointmentDate = new Date(selectedDate + 'T00:00:00');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      let assignedProfessionalId = selectedProfessional ? selectedProfessional.id : null;
      
      if (!assignedProfessionalId && professionals.length > 0) {
        const resApp = await fetch(`http://localhost:3000/appointments/${tenantId}`);
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
          tenantId,
          customerId: customerData.id,
          serviceId: selectedService.id,
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

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 pb-12">
      <div className="bg-[#1e293b] border-b border-slate-800 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{tenant.name}</h1>
              <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider mt-1">{tenant.category || 'Estabelecimento'}</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {tenant.address || 'Endereço não informado'}
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
        {step === 'services' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Serviços Disponíveis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div key={service.id} className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-md">
                  <div>
                    <h3 className="font-bold text-white text-sm">{service.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">R$ {service.price.toFixed(2)} • {service.duration} min</p>
                  </div>
                  <button onClick={() => { setSelectedService(service); setStep('booking'); }} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/10">Agendar</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'booking' && selectedService && (
          <div className="bg-[#1e293b] border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl">
            <button onClick={() => setStep('services')} className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium">
              <ArrowLeft className="w-4 h-4" /> Voltar aos serviços
            </button>

            <div>
              <h2 className="text-xl font-bold text-white">{selectedService.name}</h2>
              <p className="text-xs text-slate-400">R$ {selectedService.price.toFixed(2)} • {selectedService.duration} min</p>
            </div>

            {/* SELEÇÃO DE PROFISSIONAIS */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Escolha o Profissional</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div 
                  onClick={() => setSelectedProfessional(null)} 
                  className={`cursor-pointer p-3 rounded-2xl border text-center transition-all ${
                    !selectedProfessional ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-[#0f172a] border-slate-800 text-slate-400'
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
                      selectedProfessional?.id === prof.id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-[#0f172a] border-slate-800 text-slate-400'
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

            {/* Datas */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Selecione a Data</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {nextDays.map((d) => (
                  <button key={d.dateString} type="button" onClick={() => { setSelectedDate(d.dateString); setSelectedTime(''); }} className={`flex-shrink-0 px-4 py-3 rounded-2xl border text-center transition-all ${selectedDate === d.dateString ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-500 shadow-md shadow-emerald-500/10' : 'bg-[#0f172a] border-slate-800 text-slate-300'}`}>
                    <span className="block text-[10px] uppercase">{d.dayName}</span>
                    <span className="block text-base font-bold my-0.5">{d.dayNumber}</span>
                    <span className="block text-[10px] uppercase">{d.monthName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Horários */}
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
                      <button key={time} type="button" disabled={isBooked} onClick={() => setSelectedTime(time)} className={`py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${isBooked ? 'bg-[#0f172a]/40 border border-slate-900 text-slate-700 line-through cursor-not-allowed' : isSelected ? 'bg-emerald-500 text-slate-950 border border-emerald-500 shadow-md shadow-emerald-500/10' : 'bg-[#0f172a] border border-slate-800 text-slate-300 hover:border-emerald-500/50'}`}>
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dados do Cliente */}
            {activeConfig?.isOpen && (
              <form onSubmit={handleConfirmBooking} className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300">Seus Dados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Seu Nome Completo" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                  <input type="text" required value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="Seu WhatsApp" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <button type="submit" disabled={loading || !selectedTime} className="w-full bg-emerald-500 hover:bg-emerald-400 font-bold text-slate-950 py-3.5 rounded-xl text-xs disabled:opacity-50 shadow-lg shadow-emerald-500/20 transition-all">Confirmar Agendamento</button>
              </form>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-3xl text-center max-w-md mx-auto space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Agendamento Confirmado!</h2>
            <button onClick={() => { setStep('services'); setSelectedService(null); setSelectedTime(''); }} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl text-xs font-medium transition-colors">Novo Agendamento</button>
          </div>
        )}
      </main>
    </div>
  );
}