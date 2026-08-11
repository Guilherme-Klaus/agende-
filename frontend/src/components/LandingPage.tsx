import React from 'react';
import { ShieldCheck, Calendar, TrendingDown, Users, QrCode, CheckCircle, ArrowRight, Sparkles, Star, ChevronDown, Check, Smartphone, BarChart3, HelpCircle } from 'lucide-react';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export function LandingPage({ onOpenLogin, onOpenRegister }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans">
      
      {/* HEADER / NAVBAR */}
      <header className="border-b border-slate-800/80 bg-[#1e293b]/50 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-white tracking-tight">Agende<span className="text-emerald-400">+</span></span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">SaaS de Gestão</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenLogin}
            className="text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            Entrar
          </button>
          <button 
            onClick={onOpenRegister}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
          >
            Criar Conta Grátis
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center space-y-8 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" /> O sistema número 1 para barbearias, salões e clínicas
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl">
          Lote sua agenda e controle seu caixa sem <span className="text-emerald-400 underline decoration-emerald-500/30">complicação</span>.
        </h1>

        <p className="text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed">
          Esqueça o WhatsApp lotado de mensagens manuais. Com o Agende+, seus clientes agendam sozinhos pelo celular, você reduz faltas com lembretes automáticos e gerencia lucros e comissões em tempo real.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center pt-2">
          <button 
            onClick={onOpenRegister}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
          >
            Começar Gratuitamente <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={onOpenLogin}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-4 rounded-2xl text-sm transition-colors border border-slate-700"
          >
            Acessar Painel
          </button>
        </div>

        {/* MOCKUP / PREVIEW VISUAL DO SISTEMA */}
        <div className="w-full pt-10">
          <div className="bg-[#1e293b] border border-slate-700/80 rounded-3xl p-4 md:p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-40 pointer-events-none"></div>
            <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="text-xs text-slate-400 ml-2 font-mono">dashboard.agendeplus.com</span>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold uppercase">Ao Vivo</span>
            </div>
            
            {/* Grid Simulando o Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Faturamento do Mês</span>
                <p className="text-xl font-bold text-emerald-400 font-mono">R$ 12.450,00</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-400 h-full w-[75%]"></div></div>
              </div>
              <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Atendimentos Agendados</span>
                <p className="text-xl font-bold text-white font-mono">148 Clientes</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-400 h-full w-[90%]"></div></div>
              </div>
              <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Lucro Líquido Real</span>
                <p className="text-xl font-bold text-purple-400 font-mono">R$ 9.820,00</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"><div className="bg-purple-400 h-full w-[80%]"></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* PROVA SOCIAL RÁPIDA */}
        <div className="pt-6 flex flex-col sm:flex-row items-center gap-3 text-xs text-slate-400 justify-center">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <span>Avaliado com nota <strong>4.9/5</strong> por mais de 100+ lojistas e profissionais.</span>
        </div>
      </section>

      {/* SEÇÃO DE FUNCIONALIDADES DETALHADAS */}
      <section className="border-t border-slate-800 bg-[#1e293b]/30 py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-4xl font-black text-white">Tudo o que sua empresa precisa para crescer</h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">Ferramentas robustas desenvolvidas para lojistas que querem focar no atendimento e deixar a burocracia com a tecnologia.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-3xl space-y-4 shadow-xl hover:border-slate-700 transition-all">
              <div className="bg-emerald-500/10 w-12 h-12 rounded-2xl flex items-center justify-center border border-emerald-500/30 text-emerald-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Link Próprio & QR Code</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seus clientes ganham uma página exclusiva com a sua logo, cores personalizadas e portfólio para agendar horários em segundos, direto pelo celular.
              </p>
            </div>

            <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-3xl space-y-4 shadow-xl hover:border-slate-700 transition-all">
              <div className="bg-blue-500/10 w-12 h-12 rounded-2xl flex items-center justify-center border border-blue-500/30 text-blue-400">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Financeiro & Comissões</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Acompanhe o faturamento em tempo real, lance despesas diárias, visualize o lucro líquido real e calcule o repasse de comissões da equipe automaticamente.
              </p>
            </div>

            <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-3xl space-y-4 shadow-xl hover:border-slate-700 transition-all">
              <div className="bg-purple-500/10 w-12 h-12 rounded-2xl flex items-center justify-center border border-purple-500/30 text-purple-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">CRM & Aniversariantes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitore o histórico de gastos dos clientes, identifique quem faz aniversário no mês e envie mensagens de parabéns via WhatsApp com um único clique.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SEÇÃO DE PLANOS / PREÇOS */}
      <section className="py-20 px-6 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-4xl font-black text-white">Planos simples e transparentes</h2>
          <p className="text-xs md:text-sm text-slate-400">Escolha o plano ideal para impulsionar o seu negócio hoje mesmo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          
          <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-3xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Essencial</span>
              <h3 className="text-3xl font-black text-white">R$ 79<span className="text-xs text-slate-400 font-normal"> /mês</span></h3>
              <p className="text-xs text-slate-400">Ideal para profissionais autônomos e pequenos espaços.</p>
              
              <ul className="space-y-3 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Página de agendamento própria</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Gestão de agendamentos e lembretes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Relatório básico de clientes</li>
              </ul>
            </div>

            <button 
              onClick={onOpenRegister}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl text-xs transition-colors border border-slate-700"
            >
              Assinar Plano Essencial
            </button>
          </div>

          <div className="bg-gradient-to-b from-emerald-950/40 to-[#1e293b] border border-emerald-500/40 p-8 rounded-3xl space-y-6 flex flex-col justify-between relative shadow-xl">
            <div className="absolute -top-3 right-6 bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">Mais Popular</div>
            <div className="space-y-4">
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Profissional SaaS</span>
              <h3 className="text-3xl font-black text-white">R$ 119<span className="text-xs text-slate-400 font-normal"> /mês</span></h3>
              <p className="text-xs text-slate-400">Para estabelecimentos completos com equipe e alta demanda.</p>
              
              <ul className="space-y-3 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Tudo do plano Essencial</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Múltiplos profissionais e comissões</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Controle financeiro avançado & despesas</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> CRM completo & Aniversariantes do mês</li>
              </ul>
            </div>

            <button 
              onClick={onOpenRegister}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              Começar com o Profissional
            </button>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-[#0f172a] px-6 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Agende+ — Todos os direitos reservados.</p>
      </footer>

    </div>
  );
}