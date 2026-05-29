import React from 'react';
import { useGame } from '../game/GameContext';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Info, Zap } from 'lucide-react';

export default function TopPanel() {
  const { state } = useGame();

  const formatTime = (h: number, m: number) => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const isPeak = (state.timeHour >= 7 && state.timeHour <= 9) || (state.timeHour >= 17 && state.timeHour <= 19);

  return (
    <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="bg-slate-900 border-b-4 border-yellow-400 p-4 shadow-xl pointer-events-auto">
        
        {/* Top Row: Clock and Main Stats */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black font-mono text-white">
              {formatTime(state.timeHour, state.timeMinute)}
            </span>
            {isPeak && (
              <span className="text-[10px] uppercase font-black text-white bg-rose-600 border-2 border-rose-400 px-1.5 py-0.5 rounded animate-pulse shadow-md">
                PİK SAAT
              </span>
            )}
          </div>
          
          <div className="flex items-center text-sm font-black text-slate-200">
             MEMNUNIYET: <span className={`ml-1 ${state.satisfaction < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>%{Math.round(state.satisfaction)}</span>
          </div>
        </div>

        {/* Bottom Row: Economy */}
        <div className="flex justify-between items-center border-t border-slate-700 pt-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Bütçe</span>
            <span className="text-lg font-black text-white leading-none">₺{Math.floor(state.budget).toLocaleString()}</span>
          </div>
          
          <div className="flex flex-col text-right">
             <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Yolcu</span>
             <span className="text-sm font-black text-white leading-none">{Math.floor(state.passengers).toLocaleString()}</span>
          </div>
        </div>

        <div className="w-full bg-slate-700 h-2 mt-3 rounded-full overflow-hidden border border-slate-600">
           <div className={`h-full ${state.energy < 30 ? 'bg-rose-500' : 'bg-emerald-400'}`} style={{ width: `${state.energy}%`, transition: 'width 0.5s ease-out' }}></div>
        </div>
      </div>

      {/* Alerts Overlay */}
      <div className="mt-2 space-y-2 pointer-events-auto px-4">
        <AnimatePresence>
          {state.alerts.map(alert => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`flex items-start gap-3 p-3 rounded-2xl shadow-2xl border-l-8 font-medium bg-white/95 backdrop-blur-md ${
                alert.type === 'urgent' ? 'border-rose-500 text-rose-600' :
                alert.type === 'warning' ? 'border-amber-500 text-amber-600' :
                alert.type === 'success' ? 'border-emerald-500 text-emerald-600' :
                'border-blue-500 text-blue-600'
              }`}
            >
              <div className="mt-0.5">
                {alert.type === 'urgent' && <AlertTriangle className="w-4 h-4 shrink-0" />}
                {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0" />}
                {alert.type === 'success' && <Zap className="w-4 h-4 shrink-0" />}
                {alert.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
              </div>
              <span className="text-sm font-black mt-0.5 leading-snug">{alert.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
