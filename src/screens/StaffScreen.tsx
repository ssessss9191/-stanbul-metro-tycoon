import React, { useMemo } from 'react';
import { useGame } from '../game/GameContext';
import { motion } from 'motion/react';
import { Users, UserPlus, Shield, Wrench, Sparkles, TrendingUp, TrendingDown, Trash2, BookOpen, Banknote, HeartPulse } from 'lucide-react';
import { StaffRole } from '../types';

const ROLE_CONFIG = {
  driver: { label: 'Makinist', icon: Users, color: 'blue', bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
  security: { label: 'Güvenlik', icon: Shield, color: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
  technician: { label: 'Teknisyen', icon: Wrench, color: 'orange', bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
  cleaner: { label: 'Temizlikçi', icon: Sparkles, color: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
};

export default function StaffScreen() {
  const { state, hireStaff, fireStaff, trainStaff, adjustSalary, canAfford } = useGame();
  
  const totalStaff = state.staff.length;
  const monthlySalary = state.staff.reduce((acc, s) => acc + s.salary, 0);
  const avgMorale = totalStaff > 0 ? Math.round(state.staff.reduce((acc, s) => acc + s.morale, 0) / totalStaff) : 0;

  const hireCost = 15000;
  const trainCost = 25000;

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-32 max-w-2xl mx-auto w-full">
      <motion.div 
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6"
      >
        <div className="flex items-center space-x-4 mb-4">
           <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
             <UserPlus className="w-6 h-6" />
           </div>
           <div>
             <h2 className="text-xl font-black text-slate-800 tracking-tight">Personel Yönetim Merkezi</h2>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">İnsan Kaynakları & Vardiya</p>
           </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
           <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Toplam Çalışan</span>
              <span className="text-xl font-black text-slate-700 font-mono mt-1">{totalStaff}</span>
           </div>
           <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-purple-400/80 uppercase tracking-widest">Aylık Yük</span>
              <span className="text-[14px] font-black text-purple-700 font-mono mt-1">₺{(monthlySalary / 1000).toFixed(1)}k</span>
           </div>
           <div className={`border rounded-2xl p-3 flex flex-col justify-center ${avgMorale < 50 ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Genel Moral</span>
              <span className="text-xl font-black font-mono mt-1">%{avgMorale}</span>
           </div>
        </div>
      </motion.div>

      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Yeni İşe Alım (₺15k)</h3>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {(Object.keys(ROLE_CONFIG) as StaffRole[]).map((role) => {
           const conf = ROLE_CONFIG[role];
           const Icon = conf.icon;
           return (
              <button 
                key={role}
                disabled={!canAfford(hireCost)}
                onClick={() => hireStaff(role)}
                className={`flex items-center p-3 rounded-2xl border-2 transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 border-${conf.color}-200 bg-white shadow-[0_4px_0_var(--tw-shadow-color)] shadow-${conf.color}-200`}
              >
                  <div className={`p-2 rounded-xl mr-3 ${conf.bg} ${conf.text}`}>
                     <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                     <span className="font-bold text-sm tracking-wide text-slate-800">{conf.label}</span>
                     <span className="text-[9px] font-bold text-slate-400 uppercase">Al</span>
                  </div>
              </button>
           )
        })}
      </div>

      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Personel Kadrosu</h3>
      <div className="space-y-4">
        {state.staff.map(member => {
           const conf = ROLE_CONFIG[member.role];
           const Icon = conf.icon;
           return (
              <motion.div 
                 key={member.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className={`flex flex-col p-4 rounded-3xl border-2 transition-all bg-white ${conf.border} shadow-sm`}
              >
                 <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                       <div className={`p-2 rounded-xl mr-3 ${conf.bg} ${conf.text}`}>
                         <Icon className="w-5 h-5" />
                       </div>
                       <div>
                          <h4 className="font-bold text-sm text-slate-800">{member.name}</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${conf.text}`}>{conf.label}</span>
                       </div>
                    </div>
                    <div className="flex space-x-1">
                       <button onClick={() => fireStaff(member.id)} className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-slate-50 rounded-xl p-2 text-center">
                       <div className="flex justify-center items-center text-amber-500 mb-1">
                          <HeartPulse className="w-3 h-3 mr-1" />
                          <span className="text-[10px] font-bold uppercase">Enerji</span>
                       </div>
                       <span className={`font-mono text-xs font-black ${member.energy < 30 ? 'text-rose-500' : 'text-slate-700'}`}>%{Math.round(member.energy)}</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2 text-center">
                       <div className="flex justify-center items-center text-blue-500 mb-1">
                          <Sparkles className="w-3 h-3 mr-1" />
                          <span className="text-[10px] font-bold uppercase">Beceri</span>
                       </div>
                       <span className="font-mono text-xs font-black text-slate-700">{member.skill}/10</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2 text-center">
                       <div className="flex justify-center items-center text-emerald-500 mb-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          <span className="text-[10px] font-bold uppercase">Moral</span>
                       </div>
                       <span className={`font-mono text-xs font-black ${member.morale < 40 ? 'text-rose-500' : 'text-slate-700'}`}>%{member.morale}</span>
                    </div>
                 </div>

                 <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div className="flex items-center">
                       <Banknote className="w-4 h-4 text-slate-400 mr-2" />
                       <span className="font-mono text-xs font-black text-slate-700 mr-2">₺{member.salary.toLocaleString()}</span>
                    </div>
                    <div className="flex space-x-1">
                       <button onClick={() => adjustSalary(member.id, -2000)} className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 font-bold active:bg-slate-100">-</button>
                       <button onClick={() => adjustSalary(member.id, 2000)} className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 font-bold active:bg-slate-100">+</button>
                       <button 
                         onClick={() => trainStaff(member.id)}
                         disabled={!canAfford(trainCost) || member.skill >= 10}
                         className="ml-2 flex items-center space-x-1 bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-1 rounded-lg disabled:opacity-50 active:bg-indigo-100 transition-colors"
                       >
                          <BookOpen className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase">Eğit</span>
                       </button>
                    </div>
                 </div>
              </motion.div>
           )
        })}
        {state.staff.length === 0 && (
           <div className="text-center p-6 text-slate-400 font-bold text-sm bg-slate-50 rounded-3xl border border-slate-100">
              Şu an çalışanınız bulunmuyor.
           </div>
        )}
      </div>
    </div>
  )
}
