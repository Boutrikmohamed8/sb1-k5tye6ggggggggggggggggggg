import { WilayaData } from '../types';
import * as XLSX from 'xlsx';

export const exportToExcel = (data: WilayaData, date: string): void => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet([
    {
      Date: date,
      'Wilaya': data.name,
      'Total Interventions': calculateTotalInterventions(data),
      'Traffic Accidents - Interventions': data.trafficAccidents.interventions,
      'Traffic Accidents - Injured': data.trafficAccidents.injured,
      'Traffic Accidents - Deaths': data.trafficAccidents.deaths,
      'Urban/Industrial Fires - Interventions': data.urbanIndustrialFires.interventions,
      'Urban/Industrial Fires - Suffocated': data.urbanIndustrialFires.suffocated,
      'Urban/Industrial Fires - Burned': data.urbanIndustrialFires.burned,
      'Urban/Industrial Fires - Injured': data.urbanIndustrialFires.injured,
      'Urban/Industrial Fires - Deaths': data.urbanIndustrialFires.deaths,
      'Medical Evacuation - Interventions': data.medicalEvacuation.interventions,
      'Medical Evacuation - Injured': data.medicalEvacuation.injured,
      'Medical Evacuation - Deaths': data.medicalEvacuation.deaths,
      'Miscellaneous - Interventions': data.miscellaneousInterventions.interventions,
      'Miscellaneous - Injured': data.miscellaneousInterventions.injured,
      'Miscellaneous - Deaths': data.miscellaneousInterventions.deaths,
      'Carbon Monoxide - Interventions': data.carbonMonoxidePoisoning.interventions,
      'Carbon Monoxide - Suffocated': data.carbonMonoxidePoisoning.suffocated,
      'Carbon Monoxide - Deaths': data.carbonMonoxidePoisoning.deaths,
      'Security Coverage - Interventions': data.securityCoverage.interventions,
      'Security Coverage - Injured': data.securityCoverage.injured,
      'Security Coverage - Patients': data.securityCoverage.patients,
      'Security Coverage - Deaths': data.securityCoverage.deaths,
    }
  ]);

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Statistics');
  XLSX.writeFile(workbook, `${data.name}_statistics_${date}.xlsx`);
};

const calculateTotalInterventions = (data: WilayaData): number => {
  return Object.values(data).reduce((total, category) => {
    if (typeof category === 'object' && 'interventions' in category) {
      return total + (category.interventions || 0);
    }
    return total;
  }, 0);
};