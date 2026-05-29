/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameProvider } from './game/GameContext';
import { TabScreen } from './types';
import TopPanel from './components/TopPanel';
import BottomNav from './components/BottomNav';
import MapScreen from './screens/MapScreen';
import LinesScreen from './screens/LinesScreen';
import EconomyScreen from './screens/EconomyScreen';
import StaffScreen from './screens/StaffScreen';

function MainScreen() {
  const [currentTab, setCurrentTab] = useState<TabScreen>('map');

  return (
    <div className="w-full h-full max-w-md mx-auto relative bg-[#f0f2f5] font-sans text-slate-900 overflow-hidden sm:border-x sm:border-slate-300 shadow-2xl flex flex-col">
      <TopPanel />
      
      <div className="flex-1 relative">
         <div style={{ display: currentTab === 'map' ? 'block' : 'none', width: '100%', height: '100%' }}>
           <MapScreen />
         </div>
         {currentTab === 'lines' && <LinesScreen />}
         {currentTab === 'staff' && <StaffScreen />}
         {currentTab === 'economy' && <EconomyScreen />}
      </div>

      <BottomNav currentTab={currentTab} setTab={setCurrentTab} />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <MainScreen />
    </GameProvider>
  );
}
