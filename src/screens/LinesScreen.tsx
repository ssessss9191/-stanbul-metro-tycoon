import React from 'react';
import { useGame } from '../game/GameContext';
import { UPGRADE_COSTS } from '../game/constants';
import { Train, Zap, Users, ArrowUpCircle, Wrench } from 'lucide-react';
import { motion } from 'motion/react';
import { LineStats } from '../types';

export default function LinesScreen() {
  const { state, buyTrain, upgradeCapacity, upgradeSpeed, repairTrain, getLogarithmicCost, canAfford } = useGame();
  
  const lines = Object.values(state.lines) as LineStats[];
  const trainStates = state.trainStates;

  return (
    <div className="absolute inset-0 overflow-auto pt-32 pb-24 px-4 bg-transparent">
      <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Hat Yönetimi & Geliştirme</h2>
      
      <div className="space-y-6">
        {lines.map((line) => {
          const lineStates = trainStates[line.id] || {};
          const hangarCount = Object.values(lineStates).filter(s => s === 'in_hangar' || s === 'going_to_hangar' || s === 'returning_from_hangar').length;
          const activeCount = line.trains - hangarCount;

          const currentTrainCost = getLogarithmicCost(UPGRADE_COSTS.newTrain, line.trains);
          const currentCapCost = getLogarithmicCost(UPGRADE_COSTS.capacity, line.capacityLevel);
          const currentSpeedCost = getLogarithmicCost(UPGRADE_COSTS.speed, line.speedLevel);

          return (
          <motion.div 
             key={line.id}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xl relative overflow-hidden"
          >
            {/* Color Accent Indicator */}
            <div className="absolute top-0 left-0 bottom-0 w-3" style={{ backgroundColor: line.color }} />
            
            <div className="flex justify-between items-start mb-4 pl-4">
              <div>
                <h3 className="text-lg font-black" style={{ color: line.color }}>
                  {line.name}
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase">{line.stations.length} İstasyon Aktif</p>
              </div>
            </div>

            {/* Shift Status */}
            <div className="flex items-center gap-2 mb-4 pl-4 flex-wrap">
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vardiya Durumu:</div>
               <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                 <span className="text-[10px] font-bold text-emerald-700">{activeCount} Seferde</span>
               </div>
               <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                 <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                 <span className="text-[10px] font-bold text-amber-700">{hangarCount} Hangarda</span>
               </div>
            </div>

            {/* Current Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6 pl-4">
               <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center justify-center border-2 border-slate-100">
                  <Train className="w-5 h-5 text-slate-600 mb-1" />
                  <span className="text-lg font-black text-slate-900">{line.trains}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tren</span>
               </div>
               <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center justify-center border-2 border-slate-100">
                  <Users className="w-5 h-5 text-slate-600 mb-1" />
                  <span className="text-lg font-black text-slate-900">Sv {line.capacityLevel}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Kapasite</span>
               </div>
               <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center justify-center border-2 border-slate-100">
                  <Zap className="w-5 h-5 text-slate-600 mb-1" />
                  <span className="text-lg font-black text-slate-900">Sv {line.speedLevel}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Hız</span>
               </div>
            </div>

            {/* Health Info */}
            <div className="ml-4 mb-4 grid grid-cols-2 gap-2">
              {line.trainHealths.map((health, index) => {
                const repairCost = Math.floor(UPGRADE_COSTS.newTrain * 0.5);
                return (
                <div key={index} className="bg-slate-50 border border-slate-100 rounded-xl p-2 flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vagon {index + 1} Sağlığı</span>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-black ${health < 40 ? 'text-rose-500' : 'text-emerald-500'} font-mono`}>%{health}</span>
                    {health === 0 && (
                      <button 
                         onClick={() => repairTrain(line.id, index)}
                         disabled={!canAfford(repairCost)}
                         className="flex items-center bg-rose-100 text-rose-600 px-2 py-1 rounded-md text-[10px] font-bold hover:bg-rose-200 active:bg-rose-300 disabled:opacity-50"
                      >
                         Tamir Et
                      </button>
                    )}
                  </div>
                </div>
              )})}
            </div>

            {/* Upgrade Actions */}
            <div className="space-y-3 pl-4">
               <button 
                 onClick={() => buyTrain(line.id)}
                 disabled={!canAfford(currentTrainCost)}
                 className="w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:active:translate-y-0 disabled:cursor-not-allowed bg-emerald-500 border-emerald-400 text-white shadow-[0_4px_0_rgb(16,185,129)]"
               >
                 <div className="flex items-center">
                    <div className="p-2 bg-white/20 rounded-xl mr-3">
                       <Train className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col items-start">
                       <span className="font-black text-sm tracking-wide">SEFERİ ARTIR (YENİ TREN)</span>
                    </div>
                 </div>
                 <span className="font-mono font-black text-sm bg-emerald-700/50 px-3 py-1.5 rounded-lg border border-emerald-400/50 text-white w-[85px] text-center">
                    ₺{(currentTrainCost / 1000).toFixed(0)}k
                 </span>
               </button>

               <button 
                 onClick={() => upgradeCapacity(line.id)}
                 disabled={!canAfford(currentCapCost)}
                 className="w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:active:translate-y-0 disabled:cursor-not-allowed bg-sky-500 border-sky-400 text-white shadow-[0_4px_0_rgb(14,165,233)]"
               >
                 <div className="flex items-center">
                    <div className="p-2 bg-white/20 rounded-xl mr-3">
                       <ArrowUpCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col items-start">
                       <span className="font-black text-sm tracking-wide">ÜST DÜZEY VAGON EKLE</span>
                    </div>
                 </div>
                 <span className="font-mono font-black text-sm bg-sky-700/50 px-3 py-1.5 rounded-lg border border-sky-400/50 text-white w-[85px] text-center">
                    ₺{(currentCapCost / 1000).toFixed(0)}k
                 </span>
               </button>

               <button 
                 onClick={() => upgradeSpeed(line.id)}
                 disabled={!canAfford(currentSpeedCost)}
                 className="w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:active:translate-y-0 disabled:cursor-not-allowed bg-purple-500 border-purple-400 text-white shadow-[0_4px_0_rgb(168,85,247)]"
               >
                 <div className="flex items-center">
                    <div className="p-2 bg-white/20 rounded-xl mr-3">
                       <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col items-start">
                       <span className="font-black text-sm tracking-wide">SİNYALİZASYON YENİLE</span>
                    </div>
                 </div>
                 <span className="font-mono font-black text-sm bg-purple-700/50 px-3 py-1.5 rounded-lg border border-purple-400/50 text-white w-[85px] text-center">
                   ₺{(currentSpeedCost / 1000).toFixed(0)}k
                 </span>
               </button>
            </div>
          </motion.div>
        )})}
      </div>
    </div>
  );
}
