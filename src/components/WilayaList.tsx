import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WilayaData } from '../types';
import { getAllWilayaData } from '../services/dataService';
import { useAuth } from '../auth/AuthContext';
import { wilayas } from '../data/wilayas';

const WilayaList: React.FC = () => {
  const [wilayaStats, setWilayaStats] = useState<{ [key: string]: WilayaData }>({});
  const [loading, setLoading] = useState(true);
  const [selectedWilaya, setSelectedWilaya] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadWilayaStats();
  }, [user]);

  const loadWilayaStats = async () => {
    setLoading(true);
    const stats: { [key: string]: WilayaData } = {};
    for (const wilaya of wilayas) {
      if (user?.role === 'user' && user.wilayaId && wilaya.id !== user.wilayaId) continue;
      const data = await getAllWilayaData(wilaya.id);
      if (data.length > 0) {
        stats[wilaya.id] = data[data.length - 1]; // Get the most recent data
      }
    }
    setWilayaStats(stats);
    setLoading(false);
  };

  const handleWilayaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const wilayaId = event.target.value;
    setSelectedWilaya(wilayaId);
    if (wilayaId) {
      navigate(`/wilaya/${wilayaId}`);
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

  if (loading) {
    return <div className="p-6 text-center">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">لوحات تحكم الولايات</h2>
      {user?.role === 'admin' && (
        <div className="mb-6">
          <label htmlFor="wilaya-select" className="block text-sm font-medium text-gray-700 mb-2">
            اختر ولاية
          </label>
          <select
            id="wilaya-select"
            value={selectedWilaya}
            onChange={handleWilayaChange}
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">اختر ولاية</option>
            {wilayas.map((wilaya) => (
              <option key={wilaya.id} value={wilaya.id}>
                {wilaya.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wilayas.map((wilaya) => {
          const stats = wilayaStats[wilaya.id];
          if (!stats) return null;
          const totalInterventions = calculateTotalInterventions(stats);
          const totalDeaths = calculateTotalDeaths(stats);
          return (
            <Link
              key={wilaya.id}
              to={`/wilaya/${wilaya.id}`}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2">{wilaya.name}</h3>
              <div className="text-sm text-gray-600">
                <p>إجمالي التدخلات: {totalInterventions}</p>
                <p>الوفيات: {totalDeaths}</p>
                <p>حوادث المرور: {stats.trafficAccidents.interventions}</p>
                <p>الحرائق: {stats.urbanIndustrialFires.interventions}</p>
              </div>
            </Link>
          )}
        )}
      </div>
    </div>
  );
};

export default WilayaList;