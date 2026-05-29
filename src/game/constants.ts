import { LineStats } from '../types';

export const INITIAL_M2: LineStats = {
  id: 'M2',
  name: 'M2 Yenikapı - Hacıosman',
  color: '#009739', // Green
  trains: 2,
  trainHealths: [100, 100],
  speedLevel: 1,
  capacityLevel: 1,
  stations: [
    { id: 'yenikapi', name: 'Yenikapı', x: 200, y: 700 },
    { id: 'vezneciler', name: 'Vezneciler', x: 225, y: 660 },
    { id: 'halic', name: 'Haliç', x: 250, y: 620 },
    { id: 'sishane', name: 'Şişhane', x: 280, y: 550 },
    { id: 'taksim', name: 'Taksim', x: 320, y: 480 },
    { id: 'osmanbey', name: 'Osmanbey', x: 335, y: 440 },
    { id: 'mecidiyekoy', name: 'Şişli-Mecidiyeköy', x: 350, y: 400 },
    { id: 'gayrettepe_m2', name: 'Gayrettepe', x: 375, y: 360 },
    { id: 'levent', name: 'Levent', x: 400, y: 320 },
    { id: '4levent', name: '4. Levent', x: 420, y: 280 },
    { id: 'sanayi', name: 'Sanayi Mahallesi', x: 440, y: 240 },
    { id: 'itu', name: 'İTÜ-Ayazağa', x: 460, y: 200 },
    { id: 'darussafaka', name: 'Darüşşafaka', x: 480, y: 175 },
    { id: 'haciosman', name: 'Hacıosman', x: 500, y: 150 },
  ],
};

export const INITIAL_M11: LineStats = {
  id: 'M11',
  name: 'M11 Gayrettepe - İstanbul Hvl',
  color: '#8A2BE2', // Magenta/Purple
  trains: 1,
  trainHealths: [100],
  speedLevel: 1,
  capacityLevel: 1,
  stations: [
    { id: 'gayrettepe', name: 'Gayrettepe', x: 375, y: 360 },
    { id: 'kagithane', name: 'Kağıthane', x: 280, y: 300 },
    { id: 'hasdal', name: 'Hasdal', x: 240, y: 260 },
    { id: 'kemerburgaz', name: 'Kemerburgaz', x: 200, y: 220 },
    { id: 'gokturk', name: 'Göktürk', x: 150, y: 150 },
    { id: 'ihsaniye', name: 'İhsaniye', x: 100, y: 100 },
    { id: 'ist_havalimani', name: 'İstanbul Havalimanı', x: 50, y: 50 },
  ],
};

export const INITIAL_MARMARAY: LineStats = {
  id: 'MARMARAY',
  name: 'Marmaray (Halkalı - Gebze)',
  color: '#005b9f', // Marmaray blue
  trains: 2,
  trainHealths: [100, 100],
  speedLevel: 1,
  capacityLevel: 1,
  stations: [
    { id: 'kazlicesme', name: 'Kazlıçeşme', x: 70, y: 720 },
    { id: 'yenikapi_mar', name: 'Yenikapı', x: 200, y: 700 }, // M2 Aktarma
    { id: 'sirkeci', name: 'Sirkeci', x: 320, y: 710 },
    { id: 'uskudar', name: 'Üsküdar', x: 450, y: 680 }, // Boğaz altı
    { id: 'ayrilik_cesmesi', name: 'Ayrılık Çeşmesi', x: 550, y: 700 },
    { id: 'sogutlucesme', name: 'Söğütlüçeşme', x: 670, y: 730 },
  ],
};

export const UPGRADE_COSTS = {
  newTrain: 75000,
  capacity: 125000,
  speed: 100000,
  maintenance: 25000, // Bakım Yap
  newLine: 500000,
};

export const TICKET_PRICE = 15; // ₺ per passenger
