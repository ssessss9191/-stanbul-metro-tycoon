export type TabScreen = 'map' | 'lines' | 'economy' | 'staff';

export interface Station {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface LineStats {
  id: string;
  name: string;
  color: string;
  stations: Station[];
  trains: number;
  trainHealths: number[];
  speedLevel: number;
  capacityLevel: number;
}

export interface GameEvent {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'urgent' | 'success';
  durationSeconds: number;
  effect?: 'peak_m2' | 'energy_m11' | 'bonus_budget' | 'energy_mar';
}

export interface AdOffer {
  id: string;
  type: 'station' | 'train';
  amount: number;
  companyName: string;
  durationSeconds: number;
}

export interface ActiveAdContract {
  id: string;
  type: 'station' | 'train';
  amount: number;
  companyName: string;
  durationSeconds: number;
}

export type StaffRole = 'driver' | 'security' | 'technician' | 'cleaner';

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  energy: number;
  salary: number;
  skill: number;
  morale: number;
}

export interface GameState {
  budget: number;
  ticketRevenueTotal: number;
  adRevenueTotal: number;
  activeAdContracts: number;
  adRevenuePerTick: number;
  activeContracts: ActiveAdContract[];
  wrappedTrains: number;
  energy: number;
  satisfaction: number;
  passengers: number;
  timeHour: number; // 0-23
  timeMinute: number; // 0-59
  tickCount: number;
  lines: Record<string, LineStats>;
  events: GameEvent[];
  alerts: GameEvent[];
  adOffers: AdOffer[];
  staff: Staff[];
  trainStates: Record<string, Record<number, string>>;
}

export interface DraggedTrain {
  isDragging: boolean;
  type: string; // 'standard', 'high-capacity'
}
