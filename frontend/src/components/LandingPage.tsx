import React, { useState } from 'react';
import { 
  ShieldCheck, Calendar, TrendingDown, Users, Check, Sparkles, 
  Star, ArrowRight, Zap, Smartphone, DollarSign, Clock, HelpCircle, ChevronDown, CheckCircle2 
} from 'lucide-react';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export function LandingPage({ onOpenLogin, onOpenRegister }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans overflow-x-hidden">
      
      {/* NAVBAR FIXA COM BLUR */}
      <header className="border-b border-slate-800/80 bg-[#1e293b]/60 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-white tracking-tight">Agende<span className="text-emerald-400">+</span></span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold">Plataforma SaaS</span>
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
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
          >
            Cadastrar Empresa
          </button>
        </div>
      </header>

      {/* HERO SECTION DE IMPACTO */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center space-y-8 flex flex-col items-center justify-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-400 text-xs font-semibold animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> A revolução na gestão de agendamentos e caixa
        </div>

        <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight leading-tight max-w-4xl">
          Lote sua agenda e controle seu negócio sem <span className="text-emerald-400 underline decoration-emerald-500/40">complicação</span>.
        </h1>

        <p className="text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed">
          Esqueça o WhatsApp lotado de mensagens manuais. Com o Agende+, seus clientes agendam sozinhos pelo celular com seu link personalizado, enquanto você foca no atendimento.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center pt-4">
          <button 
            onClick={onOpenRegister}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/25 hover:scale-105"
          >
            Cadastrar Empresa <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={onOpenLogin}
            className="w-full sm:w-auto bg-[#1e293b] hover:bg-slate-800 text-slate-200 font-semibold px-8 py-4 rounded-2xl text-sm transition-all border border-slate-700/80"
          >
            Acessar Meu Painel
          </button>
        </div>

        {/* MOCKUP DO DASHBOARD INTERATIVO */}
        <div className="w-full pt-12">
          <div className="bg-[#1e293b]/90 backdrop-blur-2xl border border-slate-700/80 rounded-3xl p-5 md:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-slate-400 ml-2 font-mono">app.agendeplus.com/painel</span>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Sistema Operacional</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800/80 space-y-2 hover:border-emerald-500/40 transition-colors">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Faturamento do Mês</span>
                <p className="text-2xl font-bold text-emerald-400 font-mono">R$ 14.850,00</p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-emerald-400 h-full w-[85%]"></div></div>
              </div>
              <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800/80 space-y-2 hover:border-blue-500/40 transition-colors">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Atendimentos Agendados</span>
                <p className="text-2xl font-bold text-white font-mono">192 Clientes</p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-blue-400 h-full w-[95%]"></div></div>
              </div>
              <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800/80 space-y-2 hover:border-purple-500/40 transition-colors">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Lucro Líquido Real</span>
                <p className="text-2xl font-bold text-purple-400 font-mono">R$ 11.200,00</p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-purple-400 h-full w-[75%]"></div></div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3 text-xs text-slate-400 justify-center">
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <span>Utilizado e aprovado por mais de <strong>100+ estabelecimentos</strong> em todo o Brasil.</span>
        </div>
      </section>

      {/* SEÇÃO DE BENEFÍCIOS */}
      <section className="border-t border-slate-800/80 bg-[#1e293b]/30 py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-black text-white">Por que escolher o Agende+?</h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">Tudo o que sua barbearia, salão ou clínica precisa para automatizar processos e reter clientes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1e293b] border border-slate-800/80 p-8 rounded-3xl space-y-4 shadow-xl hover:border-emerald-500/45 transition-all group">
              <div className="bg-emerald-500/10 w-14 h-14 rounded-2xl flex items-center justify-center border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-white">Link Próprio & QR Code</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seus clientes ganham uma página exclusiva com sua logo e cores para agendar horários em segundos direto pelo celular, 24 horas por dia.
              </p>
            </div>

            <div className="bg-[#1e293b] border border-slate-800/80 p-8 rounded-3xl space-y-4 shadow-xl hover:border-blue-500/40 transition-all group">
              <div className="bg-blue-500/10 w-14 h-14 rounded-2xl flex items-center justify-center border border-blue-500/30 text-blue-400 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-white">Financeiro & Comissões</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Acompanhe o faturamento em tempo real, registre despesas operacionais e calcule o repasse de comissões da sua equipe com exatidão cirúrgica.
              </p>
            </div>

            <div className="bg-[#1e293b] border border-slate-800/80 p-8 rounded-3xl space-y-4 shadow-xl hover:border-purple-500/40 transition-all group">
              <div className="bg-purple-500/10 w-14 h-14 rounded-2xl flex items-center justify-center border border-purple-500/30 text-purple-400 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-white">CRM & Aniversariantes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitore o histórico de consumo dos clientes, descubra quem faz aniversário no mês e envie mensagens de parabéns via WhatsApp com um clique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE PLANOS (ESSENCIAL VS PROFISSIONAL) */}
      <section className="py-24 px-6 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-5xl font-black text-white">Planos simples e transparentes</h2>
          <p className="text-xs md:text-sm text-slate-400">Escolha o plano ideal para o tamanho do seu negócio. Sem taxas escondidas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          
          {/* PLANO ESSENCIAL */}
          <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-3xl space-y-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-4">
              <span className="text-xs bg-slate-800 text-slate-300 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider">Essencial</span>
              <h3 className="text-4xl font-black text-white">R$ 79<span className="text-xs text-slate-400 font-normal"> /mês</span></h3>
              <p className="text-xs text-slate-400 leading-relaxed">Perfeito para profissionais autônomos e pequenos espaços que estão começando a estruturar a agenda.</p>
              
              <ul className="space-y-3 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Página de agendamento própria</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Gestão de agendamentos e lembretes</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cadastro de serviços e produtos</li>
              </ul>
            </div>

            <button 
              onClick={onOpenRegister}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl text-xs transition-colors border border-slate-700"
            >
              Assinar Plano Essencial
            </button>
          </div>

          {/* PLANO PROFISSIONAL (DESTAQUE) */}
          <div className="bg-gradient-to-b from-emerald-950/50 to-[#1e293b] border border-emerald-500/50 p-8 rounded-3xl space-y-6 flex flex-col justify-between relative shadow-2xl">
            <div className="absolute -top-3 right-6 bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase px-3.5 py-1 rounded-full shadow-md">Mais Popular</div>
            <div className="space-y-4">
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider">Profissional SaaS</span>
              <h3 className="text-4xl font-black text-white">R$ 119<span className="text-xs text-slate-400 font-normal"> /mês</span></h3>
              <p className="text-xs text-slate-400 leading-relaxed">Para estabelecimentos completos com equipe de colaboradores e alta demanda diária.</p>
              
              <ul className="space-y-3 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Tudo do plano Essencial</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Múltiplos profissionais e comissões</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Financeiro avançado, despesas & lucro</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> CRM de clientes & Aniversariantes</li>
              </ul>
            </div>

            <button 
              onClick={onOpenRegister}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 rounded-2xl text-xs transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
            >
              Começar com o Profissional
            </button>
          </div>

        </div>
      </section>

      {/* SEÇÃO DE FAQ (PERGUNTAS FREQUENTES INTERATIVA) */}
      <section className="py-24 px-6 max-w-4xl mx-auto w-full space-y-10 border-t border-slate-800/80">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-4xl font-black text-white">Dúvidas Frequentes</h2>
          <p className="text-xs text-slate-400">Tudo o que você precisa saber antes de começar.</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Como meus clientes acessam a página de agendamento?",
              a: "Cada estabelecimento ganha um link exclusivo (ex: agendeplus.com/sua-loja) e um QR Code pronto para imprimir. Seus clientes clicam ou escaneiam e agendam direto pelo celular sem precisar baixar nenhum aplicativo."
            },
            {
              q: "Posso mudar de plano depois?",
              a: "Sim! Você pode fazer o upgrade do plano Essencial para o Profissional a qualquer momento diretamente com o nosso suporte ou pelo painel."
            },
            {
              q: "Como funciona a ativação da conta após o cadastro?",
              a: "Logo após preencher o cadastro, sua conta entra no modo de segurança. Assim que o pagamento do plano for confirmado, o acesso total ao painel é liberado."
            },
            {
              q: "Preciso instalar algum programa no computador?",
              a: "Não. O Agende+ é 100% online (nuvem). Você pode acessar pelo computador, tablet ou celular de onde estiver."
            }
          ].map((item, index) => (
            <div 
              key={index} 
              className="bg-[#1e293b] border border-slate-800 rounded-2xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full p-5 text-left flex items-center justify-between text-xs md:text-sm font-bold text-white hover:text-emerald-400 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === index ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>
              {openFaq === index && (
                <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-[#0f172a] px-6 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Agende+ — Todos os direitos reservados.</p>
      </footer>

    </div>
  );
}