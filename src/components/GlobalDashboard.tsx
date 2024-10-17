import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { WilayaData } from '../types';
import { getAllWilayaData } from '../services/dataService';
import { wilayas } from '../data/wilayas';

const GlobalDashboard: React.FC = () => {
  const [globalStats, setGlobalStats] = useState({
    totalInterventions: 0,
    totalDeaths: 0,
    totalInjured: 0,
    totalPatients: 0,
  });
  const [interventionsByType, setInterventionsByType] = useState<{ name: string; value: number }[]>([]);
  const [monthlyInterventions, setMonthlyInterventions] = useState<{ month: string; interventions: number }[]>([]);
  const [wilayaInterventions, setWilayaInterventions] = useState<{ name: string; interventions: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  const fetchGlobalStats = async () => {
    try {
      let totalInterventions = 0;
      let totalDeaths = 0;
      let totalInjured = 0;
      let totalPatients = 0;
      let interventionTypes = {
        trafficAccidents: 0,
        urbanIndustrialFires: 0,
        medicalEvacuation: 0,
        miscellaneousInterventions: 0,
        carbonMonoxidePoisoning: 0,
        securityCoverage: 0,
      };
      let monthlyData: { [key: string]: number } = {};
      let wilayaData: { [key: string]: number } = {};

      for (const wilaya of wilayas) {
        const wilayaDataList = await getAllWilayaData(wilaya.id);
        let wilayaTotalInterventions = 0;

        wilayaDataList.forEach((data: WilayaData) => {
          const interventions = calculateTotalInterventions(data);
          wilayaTotalInterventions += interventions;
          totalInterventions += interventions;
          totalDeaths += calculateTotalDeaths(data);
          totalInjured += calculateTotalInjured(data);
          totalPatients += data.securityCoverage.patients;

          // Accumulate interventions by type
          interventionTypes.trafficAccidents += data.trafficAccidents.interventions;
          interventionTypes.urbanIndustrialFires += data.urbanIndustrialFires.interventions;
          interventionTypes.medicalEvacuation += data.medicalEvacuation.interventions;
          interventionTypes.miscellaneousInterventions += data.miscellaneousInterventions.interventions;
          interventionTypes.carbonMonoxidePoisoning += data.carbonMonoxidePoisoning.interventions;
          interventionTypes.securityCoverage += data.securityCoverage.interventions;

          // Accumulate monthly data
          const month = new Date(data.date).toLocaleString('ar-DZ', { month: 'long' });
          monthlyData[month] = (monthlyData[month] || 0) + interventions;
        });

        wilayaData[wilaya.name] = wilayaTotalInterventions;
      }

      setGlobalStats({
        totalInterventions,
        totalDeaths,
        totalInjured,
        totalPatients,
      });

      setInterventionsByType(Object.entries(interventionTypes).map(([name, value]) => ({ name, value })));

      setMonthlyInterventions(Object.entries(monthlyData).map(([month, interventions]) => ({ month, interventions })));

      setWilayaInterventions(Object.entries(wilayaData).map(([name, interventions]) => ({ name, interventions })));

      setLoading(false);
    } catch (err) {
      console.error('Error fetching global stats:', err);
      setError('فشل في تحميل الإحصائيات العامة. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  const calculateTotalInterventions = (data: WilayaData): number => {
    return Object.values(data).reduce((total, category) => {
      if (typeof category === 'object' && 'interventions' in category) {
        return total + (category.interventions || 0);
      }
      return total;
    }, 0);
  };

  const calculateTotalDeaths = (data: WilayaData): number => {
    return (
      data.trafficAccidents.deaths +
      data.urbanIndustrialFires.deaths +
      data.medicalEvacuation.deaths +
      data.miscellaneousInterventions.deaths +
      data.carbonMonoxidePoisoning.deaths +
      data.securityCoverage.deaths
    );
  };

  const calculateTotalInjured = (data: WilayaData): number => {
    return (
      data.trafficAccidents.injured +
      data.urbanIndustrialFires.injured +
      data.medicalEvacuation.injured +
      data.miscellaneousInterventions.injured +
      data.carbonMonoxidePoisoning.suffocated +
      data.securityCoverage.injured
    );
  };

  const chartData = [
    { name: 'التدخلات', value: globalStats.totalInterventions },
    { name: 'الوفيات', value: globalStats.totalDeaths },
    { name: 'الجرحى', value: globalStats.totalInjured },
    { name: 'المرضى', value: globalStats.totalPatients },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return <div className="p-6 text-center">جاري تحميل الإحصائيات العامة...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchGlobalStats}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">الإحصائيات العامة</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {chartData.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-2 text-gray-700">{stat.name}</h3>
            <p className="text-3xl font-bold text-blue-600">{stat.value.toLocaleString('ar-DZ')}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">توزيع التدخلات حسب النوع</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={interventionsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {interventionsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">نظرة عامة على الإحصائيات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800">التدخلات الشهرية</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyInterventions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="interventions" stroke="#8884d8" name="عدد التدخلات" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800">إجمالي التدخلات لكل ولاية</h3>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={wilayaInterventions} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="interventions" fill="#82ca9d" name="عدد التدخلات" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GlobalDashboard;