import { WilayaData, GlobalStats } from './types';
import { wilayas } from './data/wilayas';

const createEmptyWilayaData = (): Omit<WilayaData, 'id' | 'name'> => ({
  totalInterventions: 0,
  securityCoverage: { deaths: 0, patients: 0, injured: 0, interventions: 0 },
  carbonMonoxidePoisoning: { deaths: 0, poisoned: 0, interventions: 0 },
  miscellaneousInterventions: { deaths: 0, injured: 0, interventions: 0 },
  medicalEvacuation: { deaths: 0, injured: 0, patients: 0, interventions: 0 },
  urbanIndustrialFires: { deaths: 0, burned: 0, poisoned: 0, interventions: 0 },
  trafficAccidents: { deaths: 0, injured: 0, interventions: 0 },
  dailyStats: [],
  monthlyStats: [],
  annualStats: []
});

export const wilayaData: WilayaData[] = wilayas.map(wilaya => ({
  id: wilaya.id,
  name: wilaya.name,
  ...createEmptyWilayaData()
}));

export const globalStats: GlobalStats = {
  totalInterventions: 0,
  totalDeaths: 0,
  totalInjured: 0,
  totalPatients: 0
};

export const loadWilayaData = async (): Promise<WilayaData[]> => {
  // In a real application, you would fetch this data from an API
  // For now, we'll just return the static data
  return wilayaData;
};