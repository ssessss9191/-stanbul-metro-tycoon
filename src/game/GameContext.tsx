import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { GameState, GameEvent, StaffRole, Staff, LineStats } from '../types';
import { INITIAL_M2, INITIAL_M11, INITIAL_MARMARAY, TICKET_PRICE, UPGRADE_COSTS } from './constants';
import { INITIAL_STAFF, generateStaff } from './staffHelpers';

interface GameContextType {
  state: GameState;
  addAlert: (message: string, type?: GameEvent['type']) => void;
  buyTrain: (lineId: string) => boolean;
  upgradeCapacity: (lineId: string) => boolean;
  upgradeSpeed: (lineId: string) => boolean;
  repairTrain: (lineId: string, index: number) => boolean;
  getLogarithmicCost: (baseCost: number, count: number) => number;
  maintenance: () => boolean;
  canAfford: (amount: number) => boolean;
  reportTrainStatus: (lineId: string, trainIndex: number, status: string) => void;
  acceptAdOffer: (id: string) => void;
  declineAdOffer: (id: string) => void;
  hireStaff: (role: StaffRole) => void;
  fireStaff: (id: string) => void;
  trainStaff: (id: string) => void;
  adjustSalary: (id: string, amount: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>({
    budget: 150000,
    ticketRevenueTotal: 0,
    adRevenueTotal: 0,
    activeAdContracts: 0,
    adRevenuePerTick: 0,
    wrappedTrains: 0,
    energy: 100,
    satisfaction: 80,
    passengers: 0,
    timeHour: 6,
    timeMinute: 0,
    tickCount: 0,
    lines: {
      M2: INITIAL_M2,
      M11: INITIAL_M11,
      MARMARAY: INITIAL_MARMARAY,
    },
    events: [],
    alerts: [],
    adOffers: [],
    activeContracts: [],
    staff: INITIAL_STAFF,
    trainStates: {},
  });

  const addAlert = useCallback((message: string, type: GameEvent['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setState((prev) => ({
      ...prev,
      alerts: [...prev.alerts, { id, message, type, durationSeconds: 5 }],
    }));
  }, []);

  const canAfford = (amount: number) => state.budget >= amount;

  const reportTrainStatus = useCallback((lineId: string, trainIndex: number, status: string) => {
    setState((prev) => {
      if (prev.trainStates[lineId]?.[trainIndex] === status) return prev;
      return {
        ...prev,
        trainStates: {
          ...prev.trainStates,
          [lineId]: {
            ...(prev.trainStates[lineId] || {}),
            [trainIndex]: status,
          },
        },
      };
    });
  }, []);

  const acceptAdOffer = (id: string) => {
    setState(prev => {
      const offer = prev.adOffers.find(o => o.id === id);
      if (!offer) return prev;

      const newOffers = prev.adOffers.filter(o => o.id !== id);
      
      const newActiveContract = {
        id: offer.id,
        type: offer.type,
        amount: offer.amount,
        companyName: offer.companyName,
        durationSeconds: 120, // 2 real minutes
      };

      if (offer.type === 'station') {
        addAlert(`${offer.companyName} ile istasyon reklam sözleşmesi imzalandı.`, 'success');
        return {
          ...prev,
          adOffers: newOffers,
          activeContracts: [...prev.activeContracts, newActiveContract],
          activeAdContracts: prev.activeAdContracts + 1,
          adRevenuePerTick: prev.adRevenuePerTick + offer.amount
        };
      } else {
        addAlert(`Vagon ${offer.companyName} renklerine giydirildi. ₺${offer.amount.toLocaleString()} bütçeye eklendi!`, 'info');
        return {
          ...prev,
          adOffers: newOffers,
          activeContracts: [...prev.activeContracts, newActiveContract],
          budget: prev.budget + offer.amount,
          adRevenueTotal: prev.adRevenueTotal + offer.amount,
          wrappedTrains: prev.wrappedTrains + 1,
          satisfaction: Math.max(0, prev.satisfaction - 2)
        };
      }
    });
  };

  const declineAdOffer = (id: string) => {
    setState(prev => ({
      ...prev,
      adOffers: prev.adOffers.filter(o => o.id !== id)
    }));
  };

  const adjustSalary = (id: string, amount: number) => {
     setState(prev => ({
        ...prev,
        staff: prev.staff.map(s => {
           if (s.id === id) {
               const newSalary = Math.max(10000, s.salary + amount);
               const moraleChange = amount > 0 ? 10 : -15;
               return { ...s, salary: newSalary, morale: Math.min(100, Math.max(0, s.morale + moraleChange)) }
           }
           return s;
        })
     }));
  };

  const trainStaff = (id: string) => {
    const trainingCost = 25000;
    if (!canAfford(trainingCost)) {
        addAlert('Eğitim için yeterli bütçe yok!', 'warning');
        return;
    }
    setState(prev => ({
      ...prev,
      budget: prev.budget - trainingCost,
      staff: prev.staff.map(s => {
         if (s.id === id) {
             return { ...s, skill: Math.min(10, s.skill + 2), morale: Math.min(100, s.morale + 10) };
         }
         return s;
      })
    }));
    addAlert('Personel eğitimi tamamlandı.', 'success');
  };

  const fireStaff = (id: string) => {
    setState(prev => {
       const staffToFire = prev.staff.find(s => s.id === id);
       if (!staffToFire) return prev;
       
       const severance = Math.floor(staffToFire.salary * 0.5); // 50% salary severance
       if (prev.budget < severance) {
          addAlert('Tazminat ödemek için bütçe yetersiz!', 'urgent');
          return prev;
       }

       addAlert(`${staffToFire.name} işten çıkarıldı. (-₺${severance} Tazminat)`, 'warning');
       return {
          ...prev,
          budget: prev.budget - severance,
          staff: prev.staff.filter(s => s.id !== id)
       }
    });
  };

  const hireStaff = (role: StaffRole) => {
    const hiringCost = 15000; 
    if (!canAfford(hiringCost)) {
       addAlert('İşe alım için yeterli bütçe yok!', 'warning');
       return;
    }
    const newStaff = generateStaff(role, 1)[0];
    setState(prev => ({
       ...prev,
       budget: prev.budget - hiringCost,
       staff: [...prev.staff, newStaff]
    }));
    const TR_ROLE = { driver: 'Makinist', security: 'Güvenlik', technician: 'Teknisyen', cleaner: 'Temizlikçi' };
    addAlert(`Yeni ${TR_ROLE[role]} işe alındı: ${newStaff.name}`, 'success');
  };

  const buyTrain = (lineId: string) => {
    if (!canAfford(UPGRADE_COSTS.newTrain)) return false;
    setState((prev) => ({
      ...prev,
      budget: prev.budget - UPGRADE_COSTS.newTrain,
      lines: {
        ...prev.lines,
        [lineId]: {
          ...prev.lines[lineId],
          trains: prev.lines[lineId].trains + 1,
          trainHealths: [...prev.lines[lineId].trainHealths, 100],
        },
      },
    }));
    return true;
  };

  const getLogarithmicCost = (baseCost: number, count: number) => {
    // Or exponential, as per the issue "Yani ilk istasyon 1.000₺ ise, 10. istasyon 50.000₺ olsun"
    // Using a simple multiplier: price = baseCost * (count ^ 1.7) roughly.
    return Math.floor(baseCost * Math.pow(count, 1.7));
  };

  const upgradeCapacity = (lineId: string) => {
    if (!canAfford(UPGRADE_COSTS.capacity)) return false;
    setState((prev) => ({
      ...prev,
      budget: prev.budget - UPGRADE_COSTS.capacity,
      lines: {
        ...prev.lines,
        [lineId]: {
          ...prev.lines[lineId],
          capacityLevel: prev.lines[lineId].capacityLevel + 1,
        },
      },
    }));
    return true;
  };

  const upgradeSpeed = (lineId: string) => {
    if (!canAfford(UPGRADE_COSTS.speed)) return false;
    setState((prev) => ({
      ...prev,
      budget: prev.budget - UPGRADE_COSTS.speed,
      lines: {
        ...prev.lines,
        [lineId]: {
          ...prev.lines[lineId],
          speedLevel: prev.lines[lineId].speedLevel + 1,
        },
      },
    }));
    return true;
  };

  const repairTrain = (lineId: string, index: number) => {
    const repairCost = Math.floor(UPGRADE_COSTS.newTrain * 0.5); // Repair cost is 50% of a new train
    if (!canAfford(repairCost)) return false;
    setState((prev) => {
      const newLineHealths = [...prev.lines[lineId].trainHealths];
      newLineHealths[index] = 100;
      return {
        ...prev,
        budget: prev.budget - repairCost,
        lines: {
          ...prev.lines,
          [lineId]: {
            ...prev.lines[lineId],
            trainHealths: newLineHealths,
          },
        },
      };
    });
    addAlert(`${state.lines[lineId]?.name || 'Hat'} treni tamir edildi.`, 'success');
    return true;
  };

  const maintenance = () => {
    if (!canAfford(UPGRADE_COSTS.maintenance)) return false;
    setState((prev) => ({
      ...prev,
      budget: prev.budget - UPGRADE_COSTS.maintenance,
      energy: Math.min(100, prev.energy + 30),
      satisfaction: Math.min(100, prev.satisfaction + 10),
    }));
    addAlert('Bakım Tamamlandı, enerji yükseldi.', 'success');
    return true;
  };

  // Game Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        let newMin = prev.timeMinute + 15; // 1 real second = 15 game minutes
        let newHour = prev.timeHour;
        let newTick = prev.tickCount + 1;
        
        let cycleExpenses = 0;
        let didHourChange = false;
        let didDayChange = false;

        if (newMin >= 60) {
          newMin = 0;
          if (newHour === 23) {
            didDayChange = true;
          }
          newHour = (newHour + 1) % 24;
          didHourChange = true;
        }

        // Peak hours: 07:00-09:30 and 17:00-19:30
        const isPeak = (newHour >= 7 && newHour <= 9) || (newHour >= 17 && newHour <= 19);

        let newLines = { ...prev.lines };
        let newAlerts = prev.alerts.filter((a) => a.durationSeconds > 0).map((a) => ({ ...a, durationSeconds: a.durationSeconds - 1 }));
        let newStaff = [...prev.staff];
        let hasStrikeRisk = false;
        let newSat = prev.satisfaction;

        if (didHourChange) {
           let driversWorking = 0;
           let securityWorking = 0;
           let cleanersWorking = 0;
           let techWorking = 0;

           const isNightRest = (newHour >= 0 && newHour < 7);

           newStaff = newStaff.map(s => {
              let nextEnergy = s.energy;
              if (isNightRest) {
                 nextEnergy = Math.min(100, nextEnergy + 20); // sleep
              } else {
                 if (nextEnergy > 20) {
                   nextEnergy = Math.max(0, nextEnergy - 5); // work
                 }
              }

              if (nextEnergy > 20) {
                 if (s.role === 'driver') driversWorking++;
                 if (s.role === 'security') securityWorking++;
                 if (s.role === 'cleaner') cleanersWorking++;
                 if (s.role === 'technician') techWorking++;
              }
              
              if (s.morale < 30) {
                 hasStrikeRisk = true;
              }

              return { ...s, energy: nextEnergy };
           });
           
           const allLines = Object.values(prev.lines) as LineStats[];
           const totalTrains = allLines.reduce((acc, l) => acc + l.trains, 0);
           const totalStations = allLines.reduce((acc, l) => acc + l.stations.length, 0);

           if (driversWorking < totalTrains && newTick % 30 === 0 && !isNightRest) {
              newAlerts.push({ id: `err_driv_${newTick}`, message: `Makinist Eksik! Trenler bekletiliyor.`, type: 'urgent', durationSeconds: 5 });
           }

           const requiredSecurity = Math.ceil(totalStations / 2);
           if (securityWorking < requiredSecurity && newTick % 45 === 0 && !isNightRest) {
              newAlerts.push({ id: `err_sec_${newTick}`, message: `Güvenlik Yetersiz! İstasyonlarda kaçak geçiş var.`, type: 'warning', durationSeconds: 5 });
           }

           const requiredCleaners = Math.ceil(totalStations / 2);
           if (cleanersWorking < requiredCleaners && newTick % 45 === 0) {
              newAlerts.push({ id: `err_cln_${newTick}`, message: `Temizlik Görevlisi Yetersiz! İstasyonlar kirleniyor.`, type: 'warning', durationSeconds: 5 });
              newSat = Math.max(0, newSat - 1);
           }
           
           if (hasStrikeRisk && Math.random() < 0.2 && newTick % 60 === 0) {
               newAlerts.push({ id: `strk_${newTick}`, message: `Personel Grev Hazırlığında! Maaşları ve moralleri yükseltin.`, type: 'urgent', durationSeconds: 8 });
           }

           // Train Health Degradation
           const techEffect = Math.min(1.0, (techWorking / Math.max(1, totalTrains * 0.5))); // 1 tech per 2 trains is perfect
           const degradationBase = 1.0 + (1.0 - techEffect); // if 0 techs, degrades by 2%

           Object.keys(newLines).forEach(lineId => {
              const line = newLines[lineId];
              const updatedHealths = line.trainHealths.map(h => Math.max(0, h - degradationBase)); // degraded
              
              const brokenTrainsCount = updatedHealths.filter(h => h === 0).length;
              if (brokenTrainsCount > 0 && newTick % 10 === 0) {
                 newAlerts.push({ id: `brk_${lineId}_${newTick}`, message: `${line.name} hattında ${brokenTrainsCount} tren arızalı!`, type: 'urgent', durationSeconds: 5 });
              }

              newLines[lineId] = {
                 ...line,
                 trainHealths: updatedHealths
              };
           });
        }
        
        if (didDayChange) {
           const allLines = Object.values(prev.lines) as LineStats[];
           const totalTrains = allLines.reduce((acc, l) => acc + l.trains, 0);
           const totalStations = allLines.reduce((acc, l) => acc + l.stations.length, 0);
           const mArmarayTrains = prev.lines.MARMARAY?.trains || 0;

           const electricityCost = totalTrains * 1500;
           // Deduct daily fraction of monthly salary
           const dailyStaffSalaries = Math.floor(newStaff.reduce((sum, s) => sum + s.salary, 0) / 30);
           const stationMaint = totalStations * 600;
           const marmarayCost = mArmarayTrains * 5000; // Marmaray 3x as expensive logic applies

           cycleExpenses = electricityCost + dailyStaffSalaries + stationMaint + marmarayCost;
           
           if (cycleExpenses > 0) {
             newAlerts.push({ id: `exp_${newTick}`, message: `Günlük Giderler Ödendi: -₺${cycleExpenses.toLocaleString()} (Maaş: ₺${dailyStaffSalaries.toLocaleString()})`, type: 'warning', durationSeconds: 5 });
           }
        }

        // Check active events
        const hasMatchDay = prev.events.some(e => e.effect === 'peak_m2');
        const hasM11Failure = prev.events.some(e => e.effect === 'energy_m11');
        const hasMarFailure = prev.events.some(e => e.effect === 'energy_mar');

        let totalCapacity = 0;
        let newEvents = [...prev.events];

        // Random Events logic (1% chance every tick)
        if (newTick % 60 === 0 && Math.random() < 0.3 && newEvents.length === 0) {
          const rand = Math.random();
          if (rand < 0.33) {
            newEvents.push({ id: 'e1', message: 'M2 Hattında Maç Günü Yoğunluğu!', type: 'warning', durationSeconds: 20, effect: 'peak_m2' });
            newAlerts.push({ id: 'a1', message: 'Maç Günü Yoğunluğu (M2)!', type: 'warning', durationSeconds: 5 });
          } else if (rand < 0.66) {
            newEvents.push({ id: 'e2', message: 'M11 Hattında Enerji Kesintisi!', type: 'urgent', durationSeconds: 15, effect: 'energy_m11' });
            newAlerts.push({ id: 'a2', message: 'M11 Hattında Enerji Kesintisi!', type: 'urgent', durationSeconds: 5 });
          } else {
            newEvents.push({ id: 'e3', message: 'Boğaz Geçişinde Teknik Arıza! Marmaray M2\'ye yük bindiriyor.', type: 'urgent', durationSeconds: 15, effect: 'energy_mar' });
            newAlerts.push({ id: 'a3', message: 'Marmaray Seferleri Durduruldu, Yolcular M2 Hattına Yöneliyor!', type: 'urgent', durationSeconds: 8 });
          }
        }
        
        // Expire events
        newEvents = newEvents.map(e => ({ ...e, durationSeconds: e.durationSeconds - 1 })).filter(e => e.durationSeconds > 0);

        // Ad Offers Logic
        let newAdOffers = prev.adOffers.map(o => ({ ...o, durationSeconds: o.durationSeconds - 1 })).filter(o => o.durationSeconds > 0);
        if (newTick % 45 === 0 && Math.random() < 0.4 && newAdOffers.length < 2) {
          const isTrain = Math.random() > 0.5;
          const adCompanies = ["NexGen Tech", "Burger King", "Trendyol", "Getir", "Ziraat Bankası", "Cola Turka"];
          const comp = adCompanies[Math.floor(Math.random() * adCompanies.length)];
          newAdOffers.push({
            id: `of_${newTick}`,
            type: isTrain ? 'train' : 'station',
            amount: isTrain ? (50000 + Math.floor(Math.random() * 50000)) : (250 + Math.floor(Math.random() * 500)),
            companyName: comp,
            durationSeconds: 30, // 30 ticks to accept/decline
          });
          newAlerts.push({ id: `aol_${newTick}`, message: `Yeni Sponsorluk Teklifi: ${comp}`, type: 'info', durationSeconds: 5 });
        }

        // Active Contracts Logic
        let newActiveContracts = prev.activeContracts.map(c => ({ ...c, durationSeconds: c.durationSeconds - 1 }));
        const expiredContracts = newActiveContracts.filter(c => c.durationSeconds <= 0);
        newActiveContracts = newActiveContracts.filter(c => c.durationSeconds > 0);

        let activeAdContractsOffset = 0;
        let adRevenuePerTickOffset = 0;
        let wrappedTrainsOffset = 0;

        expiredContracts.forEach(c => {
           if (c.type === 'station') {
              activeAdContractsOffset -= 1;
              adRevenuePerTickOffset -= c.amount;
              newAlerts.push({ id: `exp_${c.id}`, message: `${c.companyName} reklam sözleşmesi sona erdi.`, type: 'info', durationSeconds: 5 });
           } else {
              wrappedTrainsOffset -= 1;
              newAlerts.push({ id: `exp_${c.id}`, message: `${c.companyName} vagon reklam süresi doldu, kaplamalar söküldü.`, type: 'info', durationSeconds: 5 });
           }
        });

        let passengersThisTick = 0;
        const isNight = newHour >= 0 && newHour < 7;
        
        const activeM2Trains = newLines.M2.trainHealths.filter(h => h > 0).length;
        const activeM11Trains = newLines.M11.trainHealths.filter(h => h > 0).length;
        const activeMarTrains = newLines.MARMARAY?.trainHealths.filter(h => h > 0).length || 0;

        // M2 Logic
        let m2BaseDmd = isNight ? 0 : 15 * (isPeak ? 2.5 : 1.0) * (hasMatchDay ? 2.0 : 1.0);
        if (hasMarFailure) m2BaseDmd *= 1.5;

        let m2Cap = activeM2Trains * 15 * newLines.M2.capacityLevel;
        
        if (m2BaseDmd > m2Cap) {
            passengersThisTick += m2Cap;
            if (newTick % 30 === 0 && !isNight) newAlerts.push({ id: 'ol_m2_'+newTick, message: 'M2 Aşırı Dolu!', type: 'warning', durationSeconds: 4 });
        } else {
            passengersThisTick += Math.floor(m2BaseDmd);
        }

        // M11 Logic
        let m11BaseDmd = isNight ? 0 : 5 * (isPeak ? 2.0 : 1.0);
        let m11Cap = activeM11Trains * 10 * newLines.M11.capacityLevel * (hasM11Failure ? 0.3 : 1.0);
        
        if (m11BaseDmd > m11Cap) {
            passengersThisTick += Math.floor(m11Cap);
            if (newTick % 30 === 0 && !isNight) newAlerts.push({ id: 'ol_m11_'+newTick, message: 'M11 Aşırı Dolu!', type: 'warning', durationSeconds: 4 });
        } else {
            passengersThisTick += Math.floor(m11BaseDmd);
        }

        // MARMARAY Logic
        let marBaseDmd = isNight ? 0 : 20 * (isPeak ? 3.0 : 1.0);
        let marCap = activeMarTrains * 20 * (newLines.MARMARAY?.capacityLevel || 1);
        if (hasMarFailure) marCap *= 0.1;

        let marPax = 0;
        if (marBaseDmd > marCap) {
            marPax += Math.floor(marCap);
            if (newTick % 30 === 0 && !isNight && !hasMarFailure) newAlerts.push({ id: 'ol_mar_'+newTick, message: 'Marmaray Aşırı Dolu!', type: 'warning', durationSeconds: 4 });
        } else {
            marPax += Math.floor(marBaseDmd);
        }

        const tickAdRevenue = prev.adRevenuePerTick;
        const normalTicketRev = passengersThisTick * TICKET_PRICE;
        const marTicketRev = marPax * (TICKET_PRICE * 2);

        passengersThisTick += marPax;

        // Satisfaction logic
        let totalDmd = m2BaseDmd + m11BaseDmd + marBaseDmd;
        let capacityMetRatio = isNight ? 1.0 : passengersThisTick / Math.max(1, totalDmd);
        
        if (capacityMetRatio < 0.8) {
            newSat -= 0.5;
        } else if (capacityMetRatio >= 0.95 && newSat < 100) {
            newSat += 0.5;
        }
        newSat = Math.max(0, Math.min(100, newSat));

        // Energy logic
        let newEnergy = prev.energy - (prev.lines.M2.trains + prev.lines.M11.trains) * 0.1 - ((prev.lines.MARMARAY?.trains || 0) * 0.15);
        if (hasM11Failure) newEnergy -= 1.0;
        if (hasMarFailure) newEnergy -= 1.5;
        newEnergy = Math.max(0, Math.min(100, newEnergy));
        
        if (newEnergy < 20 && newTick % 30 === 0) {
           newAlerts.push({ id: 'en_low', message: 'Enerji Kritik Seviyede, Bakım Yap!', type: 'urgent', durationSeconds: 4 });
        }

        return {
          ...prev,
          timeMinute: newMin,
          timeHour: newHour,
          tickCount: newTick,
          passengers: prev.passengers + passengersThisTick,
          budget: prev.budget + normalTicketRev + marTicketRev + tickAdRevenue - cycleExpenses,
          ticketRevenueTotal: prev.ticketRevenueTotal + normalTicketRev + marTicketRev,
          adRevenueTotal: prev.adRevenueTotal + tickAdRevenue,
          activeAdContracts: prev.activeAdContracts + activeAdContractsOffset,
          adRevenuePerTick: prev.adRevenuePerTick + adRevenuePerTickOffset,
          wrappedTrains: prev.wrappedTrains + wrappedTrainsOffset,
          activeContracts: newActiveContracts,
          satisfaction: newSat,
          energy: newEnergy,
          events: newEvents,
          alerts: newAlerts,
          adOffers: newAdOffers,
          staff: newStaff,
          lines: newLines,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <GameContext.Provider value={{ state, addAlert, buyTrain, upgradeCapacity, upgradeSpeed, repairTrain, getLogarithmicCost, maintenance, canAfford, reportTrainStatus, acceptAdOffer, declineAdOffer }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};
