export interface InterventionData {
  interventions: number;
  injured: number;
  deaths: number;
}

export interface UrbanIndustrialFireData extends InterventionData {
  suffocated: number;
  burned: number;
}

export interface CarbonMonoxidePoisoningData extends InterventionData {
  suffocated: number;
}

export interface SecurityCoverageData extends InterventionData {
  patients: number;
}

export interface WilayaData {
  id: string;
  name: string;
  date: string;
  trafficAccidents: InterventionData;
  urbanIndustrialFires: UrbanIndustrialFireData;
  medicalEvacuation: InterventionData;
  miscellaneousInterventions: InterventionData;
  carbonMonoxidePoisoning: CarbonMonoxidePoisoningData;
  securityCoverage: SecurityCoverageData;
}

export type InterventionCategory = 'trafficAccidents' | 'urbanIndustrialFires' | 'medicalEvacuation' | 'miscellaneousInterventions' | 'carbonMonoxidePoisoning' | 'securityCoverage';