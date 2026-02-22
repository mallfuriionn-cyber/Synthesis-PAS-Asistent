import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  BookOpen, 
  AlertCircle, 
  Plus, 
  ChevronRight, 
  Heart, 
  Brain,
  MessageSquare,
  X
} from 'lucide-react';
import { cn } from './lib/utils';
import { analyzeBehavior, getCrisisAdvice, ABCLog } from './services/geminiService';
import Markdown from 'react-markdown';

// --- TYPES ---
type Tab = 'library' | 'diary' | 'sos' | 'chat';

// --- COMPONENTS ---

const LibraryScreen = () => {
  const cards = [
    { id: 1, title: 'Jídlo', icon: '🍎', color: 'bg-orange-100' },
    { id: 2, title: 'Pití', icon: '💧', color: 'bg-blue-100' },
    { id: 3, title: 'Záchod', icon: '🚽', color: 'bg-green-100' },
    { id: 4, title: 'Spát', icon: '😴', color: 'bg-purple-100' },
    { id: 5, title: 'Ven', icon: '🌳', color: 'bg-emerald-100' },
    { id: 6, title: 'Hra', icon: '🧸', color: 'bg-yellow-100' },
  ];

  return (
    <div className="p-6 pb-32">
      <header className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-brand-olive mb-2">Piktogramy</h1>
        <p className="text-slate-500 italic">Vizuální podpora pro komunikaci</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "aspect-square rounded-3xl flex flex-col items-center justify-center p-4 shadow-sm border border-black/5",
              card.color
            )}
          >
            <span className="text-5xl mb-3">{card.icon}</span>
            <span className="font-medium text-slate-700">{card.title}</span>
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="aspect-square rounded-3xl flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 text-slate-400"
        >
          <Plus size={32} />
          <span className="mt-2 text-sm">Přidat</span>
        </motion.button>
      </div>
    </div>
  );
};

const DiaryScreen = () => {
  const [logs, setLogs] = useState<ABCLog[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newLog, setNewLog] = useState({ antecedent: '', behavior: '', consequence: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const log: ABCLog = {
      ...newLog,
      timestamp: new Date().toISOString(),
    };
    
    try {
      const analysis = await analyzeBehavior(log, "PAS, hypersenzitivita na hluk, verbální");
      log.analysis = analysis;
      setLogs([log, ...logs]);
      setIsAdding(false);
      setNewLog({ antecedent: '', behavior: '', consequence: '' });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 pb-32">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-bold text-brand-olive mb-2">ABC Deník</h1>
          <p className="text-slate-500 italic">Analýza vzorců chování</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-brand-olive text-white p-3 rounded-full shadow-lg"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="space-y-4">
        {logs.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-white/50 rounded-3xl border border-dashed border-slate-300">
            <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-400">Zatím žádné záznamy. Začněte kliknutím na +</p>
          </div>
        )}

        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white p-6 rounded-3xl shadow-xl border border-black/5"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif text-xl font-bold">Nový záznam</h3>
                <button onClick={() => setIsAdding(false)} className="text-slate-400"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">A - Co předcházelo?</label>
                  <textarea 
                    required
                    value={newLog.antecedent}
                    onChange={e => setNewLog({...newLog, antecedent: e.target.value})}
                    className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-olive min-h-[80px]"
                    placeholder="Např. příchod do hlučného obchodu..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">B - Jak se chovalo?</label>
                  <textarea 
                    required
                    value={newLog.behavior}
                    onChange={e => setNewLog({...newLog, behavior: e.target.value})}
                    className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-olive min-h-[80px]"
                    placeholder="Např. zakrývání uší, pláč..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">C - Co následovalo?</label>
                  <textarea 
                    required
                    value={newLog.consequence}
                    onChange={e => setNewLog({...newLog, consequence: e.target.value})}
                    className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-olive min-h-[80px]"
                    placeholder="Např. odchod z obchodu, uklidnění..."
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-brand-olive text-white py-4 rounded-2xl font-bold shadow-md disabled:opacity-50"
                >
                  {loading ? 'Analyzuji...' : 'Uložit a analyzovat'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {logs.map((log, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-black/5"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-mono text-slate-400">
                {new Date(log.timestamp).toLocaleString('cs-CZ')}
              </span>
              <Brain size={16} className="text-brand-olive" />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="block font-bold text-[10px] text-slate-400 uppercase">A</span>
                {log.antecedent}
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="block font-bold text-[10px] text-slate-400 uppercase">B</span>
                {log.behavior}
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="block font-bold text-[10px] text-slate-400 uppercase">C</span>
                {log.consequence}
              </div>
            </div>
            {log.analysis && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Heart size={14} className="text-rose-400" />
                  <span className="text-xs font-bold text-brand-olive uppercase tracking-widest">SI Analýza</span>
                </div>
                <div className="text-sm text-slate-600 prose prose-sm max-w-none">
                  <Markdown>{log.analysis}</Markdown>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const SosScreen = () => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBreathing, setShowBreathing] = useState(true);

  const triggerSos = async () => {
    setLoading(true);
    setShowBreathing(false);
    try {
      const res = await getCrisisAdvice("Meltdown v obchodě, hluk, přetížení.");
      setAdvice(res || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 pb-32 min-h-screen bg-brand-sos/30">
      <header className="mb-12 text-center">
        <div className="w-20 h-20 bg-brand-sos rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <AlertCircle size={40} className="text-brand-sos-text" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-brand-sos-text mb-2">SOS Režim</h1>
        <p className="text-slate-600 italic">Okamžitá podpora v krizi</p>
      </header>

      <AnimatePresence mode="wait">
        {showBreathing && !advice && (
          <motion.div
            key="breathing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <h2 className="text-2xl font-serif text-brand-sos-text mb-12">Dýchej pomalu...</h2>
            
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.6, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-32 h-32 rounded-full bg-brand-sos-text/10 border-4 border-brand-sos-text"
              />
              <div className="absolute text-brand-sos-text font-serif italic text-sm">
                Soustřeď se
              </div>
            </div>

            <p className="mt-16 text-slate-500 text-center max-w-[200px]">
              Sleduj kruh a sjednoť svůj dech s jeho pohybem.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={triggerSos}
              disabled={loading}
              className="mt-12 w-full max-w-xs bg-brand-sos-text text-white py-6 rounded-3xl font-bold text-xl shadow-xl shadow-red-200 flex items-center justify-center gap-3"
            >
              {loading ? 'Načítám protokol...' : 'AKTIVOVAT POMOC'}
            </motion.button>
          </motion.div>
        )}

        {advice && (
          <motion.div 
            key="advice"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-[40px] shadow-2xl border-2 border-brand-sos"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl font-bold text-brand-sos-text">SI Krizový Protokol</h2>
              <button onClick={() => { setAdvice(null); setShowBreathing(true); }} className="text-slate-300 hover:text-slate-500">
                <X size={24} />
              </button>
            </div>
            <div className="prose prose-red max-w-none">
              <Markdown>{advice}</Markdown>
            </div>
            <button 
              onClick={() => { setAdvice(null); setShowBreathing(true); }}
              className="mt-8 w-full border-2 border-brand-sos text-brand-sos-text py-4 rounded-2xl font-bold"
            >
              Situace je pod kontrolou
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!advice && showBreathing && (
        <div className="grid grid-cols-1 gap-4 mt-8">
          <div className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-xs font-bold">1</div>
            <p className="text-sm text-slate-600 font-medium">Zajistěte bezpečí dítěte i okolí.</p>
          </div>
          <div className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-xs font-bold">2</div>
            <p className="text-sm text-slate-600 font-medium">Omezte senzorické podněty (světlo, hluk).</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('library');

  return (
    <div className="max-w-md mx-auto min-h-screen bg-brand-bg relative overflow-x-hidden">
      {/* Main Content Area */}
      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'library' && <LibraryScreen />}
            {activeTab === 'diary' && <DiaryScreen />}
            {activeTab === 'sos' && <SosScreen />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-black/5 px-6 pt-3 pb-8 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setActiveTab('library')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              activeTab === 'library' ? "text-brand-olive scale-110" : "text-slate-400"
            )}
          >
            <LayoutGrid size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Karty</span>
          </button>

          <div className="relative -top-8">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab('sos')}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all",
                activeTab === 'sos' 
                  ? "bg-brand-sos-text text-white ring-8 ring-brand-sos" 
                  : "bg-brand-sos text-brand-sos-text ring-8 ring-brand-bg"
              )}
            >
              <AlertCircle size={32} />
            </motion.button>
          </div>

          <button 
            onClick={() => setActiveTab('diary')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              activeTab === 'diary' ? "text-brand-olive scale-110" : "text-slate-400"
            )}
          >
            <BookOpen size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Deník</span>
          </button>
        </div>
      </nav>

      {/* Logo / Branding Overlay (Subtle) */}
      <div className="fixed top-6 right-6 opacity-20 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-olive" />
          <span className="font-serif italic font-bold text-brand-olive">SI</span>
        </div>
      </div>
    </div>
  );
}
