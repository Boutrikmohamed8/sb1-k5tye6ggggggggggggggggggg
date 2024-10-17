import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { getWilayaData, initDatabase } from '../services/dataService';
import { WilayaData } from '../types';
import { useAuth } from '../auth/AuthContext';
import InterventionForm from './InterventionForm';
import ErrorBoundary from './ErrorBoundary';
import { importFromSQLite } from '../utils/sqliteImport';

const WilayaDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [wilaya, setWilaya] = useState<WilayaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const { user } = useAuth();

  useEffect(() => {
    const initAndLoadData = async () => {
      try {
        await initDatabase();
        await loadData();
      } catch (err) {
        console.error('Error initializing database:', err);
        setError('فشل في تهيئة قاعدة البيانات. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
        setLoading(false);
      }
    };

    initAndLoadData();
  }, [id, selectedDate]);

  const loadData = async () => {
    if (!id) {
      setError('معرف الولاية غير صالح');
      setLoading(false);
      return;
    }

    try {
      const data = await getWilayaData(id, selectedDate);
      if (data) {
        setWilaya(data);
      } else {
        // If no data for the selected date, create a new empty wilaya data object
        setWilaya({
          id,
          name: '', // You might want to fetch the name from somewhere
          date: selectedDate,
          trafficAccidents: { interventions: 0, injured: 0, deaths: 0 },
          urbanIndustrialFires: { interventions: 0, suffocated: 0, burned: 0, injured: 0, deaths: 0 },
          medicalEvacuation: { interventions: 0, injured: 0, deaths: 0 },
          miscellaneousInterventions: { interventions: 0, injured: 0, deaths: 0 },
          carbonMonoxidePoisoning: { interventions: 0, suffocated: 0, deaths: 0 },
          securityCoverage: { interventions: 0, injured: 0, patients: 0, deaths: 0 },
        });
      }
    } catch (err) {
      console.error('Error loading wilaya data:', err);
      setError('فشل في تحميل بيانات الولاية. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleUpdate = (updatedData: WilayaData) => {
    setWilaya(updatedData);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        await importFromSQLite(arrayBuffer);
        await loadData(); // Reload data after import
      } catch (err) {
        console.error('Error importing SQLite file:', err);
        setError('فشل في استيراد ملف SQLite. يرجى التحقق من الملف والمحاولة مرة أخرى.');
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          إعادة تحميل الصفحة
        </button>
      </div>
    );
  }

  if (!wilaya) {
    return <Navigate to="/wilayas" replace />;
  }

  if (user?.role === 'user' && user.wilayaId !== id) {
    return <Navigate to="/" replace />;
  }

  return (
    <ErrorBoundary>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Link to="/wilayas" className="flex items-center text-blue-500 hover:underline">
            <ArrowLeft size={20} className="mr-1" />
            العودة إلى قائمة الولايات
          </Link>
          <h2 className="text-2xl font-bold">{wilaya.name}</h2>
          <div>
            <input
              type="file"
              accept=".sqlite"
              onChange={handleFileUpload}
              className="hidden"
              id="sqlite-upload"
            />
            <label
              htmlFor="sqlite-upload"
              className="flex items-center cursor-pointer bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              <Upload size={20} className="mr-2" />
              استيراد من SQLite
            </label>
          </div>
        </div>
        <InterventionForm
          wilaya={wilaya}
          onUpdate={handleUpdate}
          onDateSelect={handleDateSelect}
        />
      </div>
    </ErrorBoundary>
  );
};

export default WilayaDashboard;