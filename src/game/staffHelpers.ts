import { Staff, StaffRole } from '../types';

const FIRST_NAMES = ['Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Mustafa', 'Emre', 'Burak', 'Cem', 'Deniz', 'Eda', 'Gizem', 'Hakan', 'Selin', 'Kerem', 'Zeynep'];
const LAST_NAMES = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Çetin'];

export function generateRandomName() {
    return FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)] + ' ' + LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
}

export function generateStaff(role: StaffRole, count: number): Staff[] {
   const output: Staff[] = [];
   const baseSalaries = { driver: 35000, security: 20000, technician: 40000, cleaner: 18000 };
   for (let i = 0; i < count; i++) {
     output.push({
        id: `staff_${role}_${Date.now()}_${Math.random()}`,
        name: generateRandomName(),
        role: role,
        energy: 100,
        salary: baseSalaries[role] + Math.floor(Math.random() * 5000),
        skill: 1 + Math.floor(Math.random() * 5),
        morale: 80,
     });
   }
   return output;
}

export const INITIAL_STAFF: Staff[] = [
    ...generateStaff('driver', 6),
    ...generateStaff('security', 5),
    ...generateStaff('technician', 4),
    ...generateStaff('cleaner', 5)
];
