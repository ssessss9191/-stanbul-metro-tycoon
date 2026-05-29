import React from 'react';
import { TabScreen } from '../types';
import { Map, Train, Wallet, Activity, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  currentTab: TabScreen;
  setTab: (tab: TabScreen) => void;
}

export default function BottomNav({ currentTab, setTab }: BottomNavProps) {
  const tabs = [
    { id: 'map', label: 'Harita', icon: Map },
    { id: 'lines', label: 'Hatlar', icon: Activity },
    { id: 'staff', label: 'Personel', icon: Users },
    { id: 'economy', label: 'Ekonomi', icon: Wallet },
  ] as const;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t-4 border-slate-200 pb-safe pt-2 px-4 shadow-xl z-50">
      <div className="flex justify-between items-center max-w-sm mx-auto mb-2">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const actualTabId = tab.id as TabScreen;
          
          return (
            <button
              key={tab.id}
              onClick={() => setTab(actualTabId)}
              className={`relative flex flex-col items-center justify-center p-2 w-16 h-16 rounded-2xl border-b-4 transition-all ${
                isActive ? 'bg-slate-200 border-slate-400 shadow-inner' : 'bg-slate-100 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <tab.icon className={`w-6 h-6 mb-1 relative z-10 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
              <span className={`text-[9px] relative z-10 font-black uppercase tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
