import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from './services/api';
import { Store, MapPin, ArrowLeft, CheckCircle2, CheckCircle, ArrowRight, History, Calendar, Trash2, Copy, DollarSign, Package, Star } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  category: string;
  whatsapp: string;
  address: string;
  themeColor: string;
  logoUrl: string;
  pixKey: string;
  minNoticeHours: number;
  requireDeposit: boolean;
  depositPercent: number;
  portfolioPhotos?: string;
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
  review?: { rating: number; comment?: string };
}

export function ClientBooking() {
  const { tenantId } = useParams<{ tenantId: string }>();
  
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [professionalHours, setProfessionalHours] = useState<BusinessHour[]>([]);
  
  const [mode, setMode] = useState<'home' | 'services' | 'booking' | 'history' | 'success'>('home');
  const [step, setStep] = useState<'services' | 'booking' | 'success'>('services');
  
  const [searchPhone, setSearchPhone] = useState('');
  const [clientAppointments, setClientAppointments] = useState<AppointmentHistory[]>([]);
  
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientBirthDate, setClientBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAppointmentId, setReviewAppointmentId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (tenantId) fetchTenantInfo();
  }, [tenantId]);

  async function fetchTenantInfo() {
    try {
      const res = await api.get(`/tenant/${tenantId}`);
      const data = res.data;
      setTenant(data);
      fetchServices(data.id);
      fetchProducts(data.id);
      fetchProfessionals(data.id);
      fetchBusinessHours(data.id);
    } catch (err) { console.error(err); }
  }

  async function fetchServices(realTenantId: string) {
    try {
      const res = await api.get(`/services/${realTenantId}/public`);
      setServices(res.data);
    } catch (err) { console.error(err); }
  }

  async function fetchProducts(realTenantId: string) {
    try {
      const res = await api.get(`/products/${realTenantId}`);
      setProducts(res.data);
    } catch (err) { console.error(err); }
  }

  async function fetchProfessionals(realTenantId: string) {
    try {
      const res = await api.get(`/professionals/${realTenantId}/public`);
      setProfessionals(res.data);
    } catch (err) { console.error(err); }
  }

  async function fetchBusinessHours(realTenantId: string) {
    try {
      const res = await api.get(`/business-hours/${realTenantId}/public`);
      setBusinessHours(res.data);
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    if (selectedProfessional) fetchProfessionalHours(selectedProfessional.id);
  }, [selectedProfessional]);

  async function fetchProfessionalHours(profId: string) {
    try {
      const res = await api.get(`/professional-hours/${profId}`);
      setProfessionalHours(res.data);
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    if (tenant && selectedDate) fetchBookedAppointments(tenant.id);
  }, [tenant, selectedDate, selectedProfessional, professionals, professionalHours]);

  async function fetchBookedAppointments(realTenantId: string) {
    try {
      // Uso da rota enxuta de slots públicos (segurança Fase 4.3)
      const res = await api.get(`/appointments/${realTenantId}/slots`);
      const data = res.data;
      const appointmentsOnDate = data.filter((item: any) => new Date(item.date).toISOString().split('T')[0] === selectedDate);

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
          const fullyBookedTimes = Object.keys(timeCounts).filter((time) => timeCounts[time] >= totalProfessionals);
          setBookedTimes(fullyBookedTimes);
        }
      }
    } catch (err) { console.error(err); }
  }

  async function handleSearchHistory(e: React.FormEvent) {
    e.preventDefault();
    if (!tenant || !searchPhone) return;
    try {
      const res = await api.get(`/customer-appointments/${tenant.id}?phone=${encodeURIComponent(searchPhone)}`);
      setClientAppointments(res.data);
      setMode('history');
    } catch (err) {
      alert('Erro ao buscar histórico.');
    }
  }

  async function handleCancelAppointment(appId: string) {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;
    try {
      // Envia o telefone para validação de segurança no cancelamento (Fase 4.2)
      await api.delete(`/appointment/${appId}?phone=${encodeURIComponent(searchPhone)}`);
      alert('Agendamento cancelado com sucesso.');
      handleSearchHistory({ preventDefault: () => {} } as any);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao cancelar.');
    }
  }

  async function handleSendReview(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/review', { appointmentId: reviewAppointmentId, rating, comment });
      alert('Obrigado pela sua avaliação!');
      setShowReviewModal(false);
      handleSearchHistory({ preventDefault: () => {} } as any);
    } catch (err) {
      alert('Erro ao enviar avaliação.');
    }
  }

  function handleToggleService(serviceId: string) {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter(id => id !== serviceId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  }

  function handleToggleProduct(productId: string) {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  }

  const selectedServicesList = services.filter(s => selectedServiceIds.includes(s.id));
  const selectedProductsList = products.filter(p => selectedProductIds.includes(p.id));
  const totalPrice = selectedServicesList.reduce((acc, s) => acc + s.price, 0) + selectedProductsList.reduce((acc, p) => acc + p.price, 0);
  const totalDuration = selectedServicesList.reduce((acc, s) => acc + s.duration, 0);

  const currentDayOfWeek = new Date(selectedDate + 'T00:00:00').getDay();
  const activeConfig = selectedProfessional ? professionalHours.find(h => h.dayOfWeek === currentDayOfWeek) : businessHours.find(h => h.dayOfWeek === currentDayOfWeek);

  function generateTimeSlots() {
    if (!activeConfig || !activeConfig.isOpen) return [];
    const slots = [];
    const [openH, openM] = activeConfig.openTime.split(':').map(Number);
    const [closeH, closeM] = activeConfig.closeTime.split(':').map(Number);
    let currentMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;
    const now = new Date();
    const minNoticeMs = (tenant?.minNoticeHours || 0) * 60 * 60 * 1000;

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

      if (!inLunch) {
        const slotDate = new Date(`${selectedDate}T${timeStr}:00`);
        if (slotDate.getTime() - now.getTime() >= minNoticeMs) {
          slots.push(timeStr);
        }
      }
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
      const customerRes = await api.post('/customer', { 
        name: clientName, 
        phone: clientPhone, 
        birthDate: clientBirthDate || null, 
        tenantId: tenant.id 
      });
      const customerData = customerRes.data;

      const [hours, minutes] = selectedTime.split(':');
      const appointmentDate = new Date(selectedDate + 'T00:00:00');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      let assignedProfessionalId = selectedProfessional ? selectedProfessional.id : null;
      if (!assignedProfessionalId && professionals.length > 0) {
        const resApp = await api.get(`/appointments/${tenant.id}/slots`);
        const allApps = resApp.data;
        const busyProfIds = allApps
          .filter((item: any) => new Date(item.date).getTime() === appointmentDate.getTime() && item.professionalId)
          .map((item: any) => item.professionalId);

        const freeProf = professionals.find((p) => !busyProfIds.includes(p.id));
        assignedProfessionalId = freeProf ? freeProf.id : professionals[0].id;
      }

      const appointmentRes = await api.post('/appointment', {
        date: appointmentDate.toISOString(),
        tenantId: tenant.id,
        customerId: customerData.id,
        serviceId: selectedServiceIds[0],
        professionalId: assignedProfessionalId,
        productIds: selectedProductIds,
      });

      if (appointmentRes.status === 201) {
        setStep('success');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao realizar agendamento.');
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
  const customColor = tenant?.themeColor || '#10b981';
  const depositAmount = tenant.requireDeposit ? (totalPrice * tenant.depositPercent) / 100 : totalPrice;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 pb-28 relative">
      
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white text-center">Como foi sua primeira experiência?</h3>
            <p className="text-xs text-slate-400 text-center">Sua opinião é fundamental para nos ajudarmos a melhorar!</p>
            <form onSubmit={handleSendReview} className="space-y-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star} onClick={() => setRating(star)} className="p-1 focus:outline-none">
                    <Star className={`w-8 h-8 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                  </button>
                ))}
              </div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Deixe um comentário opcional..." className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white h-20 resize-none focus:outline-none" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowReviewModal(false)} className="w-full bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs">Pular</button>
                <button type="submit" style={{ backgroundColor: customColor }} className="w-full font-bold text-slate-950 py-2.5 rounded-xl text-xs shadow-lg">Enviar Avaliação</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-[#1e293b] border-b border-slate-800 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              style={{ borderColor: `${customColor}50`, backgroundColor: `${customColor}15`, color: customColor }}
              className="w-16 h-16 border rounded-2xl flex items-center justify-center overflow-hidden shadow-sm"
            >
              {tenant.logoUrl ? (
                <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{tenant.name}</h1>
              <p style={{ color: customColor }} className="text-xs font-medium uppercase tracking-wider mt-1">{tenant.category || 'Estabelecimento'}</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <MapPin style={{ color: customColor }} className="w-3.5 h-3.5" /> {tenant.address || 'Endereço não informado'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-medium transition-colors"
          >
            Acessar minha conta
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 mt-8">
        
        {mode === 'home' && step !== 'success' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-6">
              <div 
                onClick={() => { setMode('services'); setStep('services'); }}
                style={{ '--hover-color': customColor } as React.CSSProperties}
                className="bg-[#1e293b] border border-slate-800 hover:border-[var(--hover-color)] p-8 rounded-3xl cursor-pointer text-center space-y-4 shadow-xl transition-all group"
              >
                <div 
                  style={{ borderColor: `${customColor}50`, backgroundColor: `${customColor}15`, color: customColor }}
                  className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border"
                >
                  <Calendar className="w-8 h-8" />
                </div>
                <h2 style={{ '--hover-text': customColor } as React.CSSProperties} className="text-lg font-bold text-white group-hover:text-[var(--hover-text)] transition-colors">Novo Agendamento</h2>
                <p className="text-xs text-slate-400">Escolha os serviços, produtos de balcão e horários disponíveis.</p>
              </div>

              <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-3xl space-y-4 shadow-xl">
                <div 
                  style={{ borderColor: `${customColor}50`, backgroundColor: `${customColor}15`, color: customColor }}
                  className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border"
                >
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
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-slate-600"
                  />
                  <button 
                    type="submit"
                    style={{ backgroundColor: customColor }}
                    className="w-full font-bold py-2.5 rounded-xl text-xs text-slate-950 transition-colors shadow-md"
                  >
                    Ver Histórico
                  </button>
                </form>
              </div>
            </div>

            {tenant.portfolioPhotos && (() => {
              try {
                const photos: string[] = JSON.parse(tenant.portfolioPhotos);
                if (photos.length === 0) return null;
                return (
                  <div className="max-w-3xl mx-auto space-y-4 pt-6 border-t border-slate-800">
                    <h3 className="text-sm font-bold text-white text-center uppercase tracking-wider">Portfólio de Trabalhos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {photos.map((photoUrl, idx) => (
                        <div key={idx} className="rounded-2xl overflow-hidden border border-slate-800 bg-[#1e293b] aspect-square shadow-lg">
                          <img src={photoUrl} alt="Trabalho realizado" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              } catch {
                return null;
              }
            })()}
          </div>
        )}

        {mode === 'history' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <button onClick={() => setMode('home')} style={{ color: customColor }} className="text-xs hover:underline flex items-center gap-1 font-medium">
              <ArrowLeft className="w-4 h-4" /> Voltar ao início
            </button>

            <h2 className="text-xl font-bold text-white">Seus Agendamentos e Avaliações</h2>

            {clientAppointments.length === 0 ? (
              <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-2xl text-center text-slate-400 text-xs">
                Nenhum agendamento encontrado para este número de WhatsApp.
              </div>
            ) : (
              <div className="space-y-3">
                {clientAppointments.map((app) => {
                  const dateObj = new Date(app.date);
                  const isPast = dateObj < new Date();
                  const isNewCustomer = clientAppointments.length === 1;

                  return (
                    <div key={app.id} className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span style={{ color: customColor, borderColor: `${customColor}40`, backgroundColor: `${customColor}10` }} className="text-xs px-2.5 py-1 rounded-md font-mono font-bold border">
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

                      {isPast && isNewCustomer && (
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                          {app.review ? (
                            <div className="flex items-center gap-1.5 text-xs text-amber-400">
                              <Star className="w-4 h-4 fill-amber-400" />
                              <span>Sua nota: {app.review.rating}/5 {app.review.comment ? `- "${app.review.comment}"` : ''}</span>
                            </div>
                          ) : (
                            <button 
                              onClick={() => { setReviewAppointmentId(app.id); setShowReviewModal(true); }}
                              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <Star className="w-3.5 h-3.5" /> Avaliar Atendimento
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {mode === 'services' && step === 'services' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <button onClick={() => setMode('home')} style={{ color: customColor }} className="text-xs hover:underline flex items-center gap-1 font-medium">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              {(selectedServiceIds.length > 0 || selectedProductIds.length > 0) && (
                <button 
                  onClick={() => setStep('booking')}
                  style={{ backgroundColor: customColor }}
                  className="font-bold px-6 py-2.5 rounded-xl text-xs text-slate-950 transition-colors shadow-md flex items-center gap-2"
                >
                  Continuar (R$ {totalPrice.toFixed(2)}) <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">1. Selecione os Serviços</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => {
                  const isSelected = selectedServiceIds.includes(service.id);
                  return (
                    <div 
                      key={service.id} 
                      onClick={() => handleToggleService(service.id)}
                      style={isSelected ? { borderColor: customColor, backgroundColor: `${customColor}10` } : {}}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between shadow-md ${
                        isSelected ? '' : 'bg-[#1e293b] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <h3 className="font-bold text-white text-sm">{service.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">R$ {service.price.toFixed(2)} • {service.duration} min</p>
                      </div>
                      <div 
                        style={isSelected ? { backgroundColor: customColor, borderColor: 'transparent' } : {}}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center ${isSelected ? 'text-slate-950' : 'border-slate-700 bg-[#0f172a]'}`}
                      >
                        {isSelected && <CheckCircle className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {products.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Package style={{ color: customColor }} className="w-5 h-5" /> 2. Produtos de Balcão (Opcional)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => {
                    const isSelected = selectedProductIds.includes(product.id);
                    return (
                      <div 
                        key={product.id} 
                        onClick={() => handleToggleProduct(product.id)}
                        style={isSelected ? { borderColor: customColor, backgroundColor: `${customColor}10` } : {}}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between shadow-md ${
                          isSelected ? '' : 'bg-[#1e293b] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <h3 className="font-bold text-white text-sm">{product.name}</h3>
                          <p className="text-xs text-slate-400 mt-1">R$ {product.price.toFixed(2)} • Estoque disponível</p>
                        </div>
                        <div 
                          style={isSelected ? { backgroundColor: customColor, borderColor: 'transparent' } : {}}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center ${isSelected ? 'text-slate-950' : 'border-slate-700 bg-[#0f172a]'}`}
                        >
                          {isSelected && <CheckCircle className="w-4 h-4" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'services' && step === 'booking' && (
          <div className="bg-[#1e293b] border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-2xl">
            <button onClick={() => setStep('services')} style={{ color: customColor }} className="text-xs hover:underline flex items-center gap-1 font-medium">
              <ArrowLeft className="w-4 h-4" /> Voltar e alterar itens
            </button>

            <div>
              <h2 className="text-xl font-bold text-white">Resumo do Pedido</h2>
              
              <div className="space-y-2 mt-3">
                {selectedServicesList.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">Serviços:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedServicesList.map(s => (
                        <span key={s.id} style={{ color: customColor, borderColor: `${customColor}40`, backgroundColor: `${customColor}10` }} className="text-xs px-3 py-1 rounded-xl border">
                          {s.name} (R$ {s.price.toFixed(2)} • {s.duration} min)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProductsList.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">Produtos de Balcão:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedProductsList.map(p => (
                        <span key={p.id} className="text-xs px-3 py-1 rounded-xl border bg-purple-500/10 border-purple-500/30 text-purple-300">
                          {p.name} (R$ {p.price.toFixed(2)})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-300 mt-4 font-mono font-bold bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                Resumo: ⏱️ Tempo total: {totalDuration} min | 💰 Valor Total: R$ {totalPrice.toFixed(2)}
                {tenant.requireDeposit && ` | ⚠️ Sinal exigido (${tenant.depositPercent}%): R$ ${depositAmount.toFixed(2)}`}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Escolha o Profissional</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div 
                  onClick={() => setSelectedProfessional(null)} 
                  style={!selectedProfessional ? { borderColor: customColor, backgroundColor: `${customColor}15`, color: customColor } : {}}
                  className={`cursor-pointer p-3 rounded-2xl border text-center transition-all ${
                    !selectedProfessional ? '' : 'bg-[#0f172a] border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="w-12 h-12 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center text-xs">🔄</div>
                  <p className="text-xs font-bold">Qualquer um</p>
                </div>

                {professionals.map((prof) => (
                  <div 
                    key={prof.id} 
                    onClick={() => setSelectedProfessional(prof)} 
                    style={selectedProfessional?.id === prof.id ? { borderColor: customColor, backgroundColor: `${customColor}15`, color: customColor } : {}}
                    className={`cursor-pointer p-3 rounded-2xl border text-center transition-all ${
                      selectedProfessional?.id === prof.id ? '' : 'bg-[#0f172a] border-slate-800 text-slate-400'
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
                  <button 
                    key={d.dateString} 
                    type="button" 
                    onClick={() => { setSelectedDate(d.dateString); setSelectedTime(''); }} 
                    style={selectedDate === d.dateString ? { backgroundColor: customColor, color: '#090d16' } : {}}
                    className={`flex-shrink-0 px-4 py-3 rounded-2xl border text-center transition-all ${selectedDate === d.dateString ? 'font-bold border-transparent shadow-md' : 'bg-[#0f172a] border-slate-800 text-slate-300'}`}
                  >
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
                <div className="text-slate-500 text-xs">Nenhum horário disponível que respeite a antecedência mínima de {tenant.minNoticeHours}h.</div>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {timeSlots.map((time) => {
                    const isBooked = bookedTimes.includes(time);
                    const isSelected = selectedTime === time;

                    return (
                      <button 
                        key={time} 
                        type="button" 
                        disabled={isBooked} 
                        onClick={() => setSelectedTime(time)} 
                        style={isSelected ? { backgroundColor: customColor, color: '#090d16' } : {}}
                        className={`py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${isBooked ? 'bg-[#0f172a]/40 border border-slate-900 text-slate-700 line-through cursor-not-allowed' : isSelected ? 'border-transparent shadow-md' : 'bg-[#0f172a] border border-slate-800 text-slate-300 hover:border-slate-700'}`}
                      >
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Seu Nome Completo" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-slate-600" />
                  <input type="text" required value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="Seu WhatsApp" className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-slate-600" />
                  
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Data de Nascimento (Opcional)</label>
                    <input type="date" value={clientBirthDate} onChange={(e) => setClientBirthDate(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-slate-600" />
                  </div>
                </div>
                <button type="submit" disabled={loading || !selectedTime} style={{ backgroundColor: customColor }} className="w-full font-bold py-3.5 rounded-xl text-xs text-slate-950 disabled:opacity-50 shadow-lg transition-all">Confirmar Agendamento</button>
              </form>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-3xl text-center max-w-lg mx-auto space-y-6 shadow-2xl">
            <div 
              style={{ borderColor: `${customColor}50`, backgroundColor: `${customColor}15`, color: customColor }}
              className="w-16 h-16 border rounded-full flex items-center justify-center mx-auto"
            >
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Agendamento Confirmado!</h2>
              <p className="text-xs text-slate-400 mt-1">Seu horário e itens foram reservados com sucesso.</p>
            </div>

            {tenant.pixKey ? (
              <div style={{ borderColor: `${customColor}40` }} className="bg-[#0f172a] border p-5 rounded-2xl text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div style={{ color: customColor }} className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-bold text-xs uppercase tracking-wider">
                      {tenant.requireDeposit ? `Sinal de ${tenant.depositPercent}% via PIX` : 'Pagamento via PIX'}
                    </span>
                  </div>
                  <span style={{ color: customColor, borderColor: `${customColor}40`, backgroundColor: `${customColor}10` }} className="text-sm font-mono font-bold px-3 py-1 rounded-xl border">
                    R$ {depositAmount.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  {tenant.requireDeposit 
                    ? `O estabelecimento exige um sinal de ${tenant.depositPercent}% para confirmar a reserva. Pague utilizando a chave abaixo:` 
                    : 'Pague o valor total utilizando a chave PIX abaixo:'}
                </p>

                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={tenant.pixKey} 
                    style={{ color: customColor }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono select-all" 
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(tenant.pixKey);
                      setPixCopied(true);
                      setTimeout(() => setPixCopied(false), 2000);
                    }}
                    style={{ backgroundColor: customColor }}
                    className="text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 flex-shrink-0"
                  >
                    {pixCopied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {pixCopied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl text-slate-400 text-xs">
                Valor Total: <strong className="text-white font-mono">R$ {depositAmount.toFixed(2)}</strong>
              </div>
            )}

            <button onClick={() => { setStep('services'); setMode('home'); setSelectedServiceIds([]); setSelectedProductIds([]); setSelectedTime(''); setClientBirthDate(''); }} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl text-xs font-medium transition-colors">
              Voltar ao Início
            </button>
          </div>
        )}

      </main>
    </div>
  );
}