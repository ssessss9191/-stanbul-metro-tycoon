import React from 'react';
import { useGame } from '../game/GameContext';
import { UPGRADE_COSTS } from '../game/constants';
import { Wallet, Settings, ActivitySquare, AlertTriangle, PlusCircle, Megaphone, Train } from 'lucide-react';
import { motion } from 'motion/react';

export default function EconomyScreen() {
  const { state, maintenance, canAfford, acceptAdOffer, declineAdOffer } = useGame();

  const maintenanceCost = UPGRADE_COSTS.maintenance;
  const newLineCost = UPGRADE_COSTS.newLine;

  return (
    <div className="absolute inset-0 bg-transparent overflow-auto pt-32 pb-24 px-4">
      <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center uppercase tracking-tight">
        <Wallet className="mr-2 text-slate-800" /> Ekonomi & Şirket
      </h2>

      {/* Main Stats Card */}
      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-xl mb-6 relative overflow-hidden"
      >
        {/* Playful accent */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full opacity-20 blur-2xl pointer-events-none"></div>

        <div className="text-center mb-6 relative z-10">
           <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Toplam Bütçe</p>
           <h3 className="text-4xl font-black text-slate-900 font-mono">
              ₺{Math.floor(state.budget).toLocaleString()}
           </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t-2 border-slate-100 pt-6 relative z-10">
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Bilet Geliri</span>
              <span className="text-xl font-black text-emerald-600 font-mono">₺{Math.floor(state.ticketRevenueTotal).toLocaleString()}</span>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Reklam Geliri</span>
              <span className="text-xl font-black text-blue-600 font-mono">₺{Math.floor(state.adRevenueTotal).toLocaleString()}</span>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t-2 border-slate-100 pt-4 mt-4 relative z-10">
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Toplam Yolcu</span>
              <span className="text-lg font-black text-slate-800">{Math.floor(state.passengers).toLocaleString()}</span>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Şebeke Enerjisi</span>
              <div className="flex items-center">
                 <ActivitySquare className={`w-4 h-4 mr-1 ${state.energy < 30 ? 'text-rose-500' : 'text-emerald-500'}`} />
                 <span className={`text-lg font-black ${state.energy < 30 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    %{Math.round(state.energy)}
                 </span>
              </div>
           </div>
        </div>
      </motion.div>

      <div className="flex justify-between items-end mb-4 px-2">
         <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Reklam ve Gelir Yönetimi</h3>
         <div className="flex gap-2">
           <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">İstasyon: {state.activeAdContracts}</span>
           <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Vagon: {state.wrappedTrains}</span>
         </div>
      </div>

      <div className="space-y-4 mb-6">
         {state.adOffers.length === 0 && state.activeContracts?.length === 0 ? (
            <div className="bg-slate-50 border-2 border-slate-200 border-dashed rounded-3xl p-6 text-center">
               <p className="text-sm font-bold text-slate-500">Şu an aktif teklif veya sözleşme yok.</p>
               <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">Teklifler Rastgele Gelir</p>
            </div>
         ) : (
            <>
               {state.activeContracts?.map(contract => (
                  <motion.div 
                     key={`act_${contract.id}`}
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="w-full flex items-center justify-between p-4 rounded-3xl border-2 transition-all bg-emerald-50 border-emerald-200 text-slate-800 shadow-sm opacity-80"
                  >
                     <div className="flex items-center">
                        <div className="p-2 bg-emerald-100 rounded-xl mr-4 text-emerald-600">
                           {contract.type === 'station' ? <Megaphone className="w-5 h-5" /> : <Train className="w-5 h-5" />}
                        </div>
                        <div className="flex flex-col items-start text-left">
                           <span className="font-bold text-sm tracking-wide text-emerald-900 uppercase">Akti̇f: {contract.companyName}</span>
                           <span className="text-[10px] font-bold text-emerald-600/70 mt-1 uppercase">
                              {contract.type === 'station' ? `İstasyon (+₺${contract.amount}/sn)` : `Vagon (+₺${contract.amount.toLocaleString()})`}
                           </span>
                        </div>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-emerald-700 font-mono">{Math.floor(contract.durationSeconds / 60)}:{(contract.durationSeconds % 60).toString().padStart(2, '0')}</span>
                        <span className="text-[9px] uppercase tracking-widest text-emerald-500/70">Kaldı</span>
                     </div>
                  </motion.div>
               ))}
               {state.adOffers.map(offer => (
               <motion.div 
                  key={offer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="w-full flex flex-col p-4 rounded-3xl border-2 transition-all bg-white border-blue-200 text-slate-800 shadow-[0_4px_0_rgb(191,219,254)]"
               >
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center">
                        <div className="p-3 bg-blue-50 rounded-2xl mr-4 shadow-sm border border-blue-100 text-blue-500">
                           {offer.type === 'station' ? <Megaphone className="w-6 h-6" /> : <Train className="w-6 h-6" />}
                        </div>
                        <div className="flex flex-col items-start text-left">
                           <span className="font-black text-base tracking-wide text-blue-900 uppercase">{offer.companyName}</span>
                           <span className="text-[10px] font-bold text-blue-600/70 mt-1 uppercase">
                              {offer.type === 'station' ? `İstasyon Reklamı (+₺${offer.amount}/sn)` : `Vagon Giydirme (+₺${offer.amount.toLocaleString()})`}
                           </span>
                        </div>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-rose-500 font-mono">{offer.durationSeconds}sn</span>
                        <span className="text-[9px] uppercase tracking-widest text-slate-400">Kaldı</span>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button 
                        onClick={() => declineAdOffer(offer.id)}
                        className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold tracking-wide uppercase text-xs active:bg-slate-200 transition-colors"
                     >
                        Reddet
                     </button>
                     <button 
                        onClick={() => acceptAdOffer(offer.id)}
                        className="flex-1 py-3 rounded-2xl bg-blue-500 text-white font-black tracking-wide uppercase text-xs active:bg-blue-600 transition-colors shadow-sm"
                     >
                        Kabul Et
                     </button>
                  </div>
               </motion.div>
            ))}
            </>
         )}
      </div>

      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Operasyonel Aksiyonlar</h3>

      <div className="space-y-4">
         {/* Maintenance Action */}
         <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={maintenance}
            disabled={!canAfford(maintenanceCost)}
            className="w-full flex items-center justify-between p-4 rounded-3xl border-2 transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:active:translate-y-0 disabled:cursor-not-allowed bg-amber-500 border-amber-400 text-white shadow-[0_4px_0_rgb(217,119,6)] relative overflow-hidden"
         >
            {state.energy < 30 && (
               <div className="absolute inset-0 bg-rose-500/20 animate-pulse pointer-events-none" />
            )}
            <div className="flex items-center relative z-10">
               <div className={`p-3 rounded-2xl mr-4 ${state.energy < 30 ? 'bg-rose-500/20' : 'bg-white/20'}`}>
                  {state.energy < 30 ? <AlertTriangle className="w-6 h-6 text-white" /> : <Settings className="w-6 h-6 text-white" />}
               </div>
               <div className="flex flex-col items-start">
                  <span className={`font-black text-base tracking-wide ${state.energy < 30 ? 'text-white' : 'text-white'}`}>SİSTEM BAKIMI YAP</span>
               </div>
            </div>
            <span className="font-mono font-black text-sm bg-amber-700/50 px-3 py-2 rounded-xl border border-amber-400/50 text-white relative z-10 w-[85px] text-center">
               ₺{(maintenanceCost / 1000).toFixed(0)}k
            </span>
         </motion.button>

         {/* New Line Action */}
         <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            disabled={true}
            className="w-full flex items-center justify-between p-4 rounded-3xl border-2 transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:active:translate-y-0 disabled:cursor-not-allowed bg-slate-200 border-slate-300 text-slate-800 shadow-[0_4px_0_rgb(203,213,225)]"
         >
            <div className="flex items-center">
               <div className="p-3 bg-white rounded-2xl mr-4 shadow-sm border border-slate-200">
                  <PlusCircle className="w-6 h-6 text-slate-400" />
               </div>
               <div className="flex flex-col items-start">
                  <span className="font-black text-base tracking-wide">YENİ HAT AÇ</span>
                  <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase">M7 Yıldız - Mahmutbey (Yakında)</span>
               </div>
            </div>
            <span className="font-mono font-black text-sm bg-white px-3 py-2 rounded-xl border border-slate-300 text-slate-500 w-[85px] text-center shadow-inner">
               ₺{(newLineCost / 1000).toFixed(0)}k
            </span>
         </motion.button>
      </div>

    </div>
  );
}
