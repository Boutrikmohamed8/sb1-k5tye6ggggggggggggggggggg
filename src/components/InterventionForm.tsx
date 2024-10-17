import React, { useState, useEffect } from 'react';
import { WilayaData, InterventionCategory } from '../types';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { saveWilayaData, getAllWilayaData } from '../services/dataService';
import { exportToExcel } from '../utils/dataManagement';

interface InterventionFormProps {
  wilaya: WilayaData;
  onUpdate: (data: WilayaData) => void;
  onDateSelect: (date: string) => void;
}

const InterventionForm: React.FC<InterventionFormProps> = ({ wilaya, onUpdate, onDateSelect }) => {
  const [formData, setFormData] = useState<WilayaData>(wilaya);
  const [selectedDate, setSelectedDate] = useState<string>(wilaya.date);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<WilayaData[]>([]);
  const [chartType, setChartType] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  useEffect(() => {
    setFormData(wilaya);
    setSelectedDate(wilaya.date);
    loadData();
  }, [wilaya]);

  const loadData = async () => {
    try {
      const data = await getAllWilayaData(wilaya.id);
      setHistoricalData(data);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('فشل في تحميل البيانات');
    }
  };

  const handleInputChange = (category: InterventionCategory, field: string, value: number) => {
    setFormData(prevData => ({
      ...prevData,
      [category]: {
        ...prevData[category],
        [field]: value
      }
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    onDateSelect(newDate);
  };

  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);
    try {
      await saveWilayaData({...formData, date: selectedDate});
      onUpdate(formData);
      setSuccessMessage('تم حفظ البيانات بنجاح');
      loadData();
    } catch (error) {
      console.error('Error saving data:', error);
      setError('فشل في حفظ البيانات');
    }
  };

  const handleExport = () => {
    exportToExcel(formData, selectedDate);
  };

  const renderInputSection = (category: InterventionCategory, title: string, fields: { [key: string]: string }) => (
    <div className="mb-6 p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {Object.entries(fields).map(([field, label]) => (
        <div key={field} className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <input
            type="number"
            min="0"
            value={formData[category][field as keyof typeof formData[typeof category]]}
            onChange={(e) => handleInputChange(category, field, parseInt(e.target.value) || 0)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
      ))}
    </div>
  );

  const calculateTotalInterventions = () => {
    return Object.values(formData).reduce((total, category) => {
      if (typeof category === 'object' && 'interventions' in category) {
        return total + (category.interventions || 0);
      }
      return total;
    }, 0);
  };

  const renderCharts = () => {
    const pieChartData = [
      { name: 'حوادث الطرق', value: formData.trafficAccidents.interventions },
      { name: 'حرائق المدن والصناعية', value: formData.urbanIndustrialFires.interventions },
      { name: 'الإخلاء الطبي', value: formData.medicalEvacuation.interventions },
      { name: 'التدخلات المتنوعة', value: formData.miscellaneousInterventions.interventions },
      { name: 'حوادث التسمم بأول أكسيد الكربون', value: formData.carbonMonoxidePoisoning.interventions },
      { name: 'التغطية الأمنية', value: formData.securityCoverage.interventions },
    ];

    const barChartData = [
      { name: 'الوفيات', trafficAccidents: formData.trafficAccidents.deaths, urbanIndustrialFires: formData.urbanIndustrialFires.deaths, medicalEvacuation: formData.medicalEvacuation.deaths, miscellaneousInterventions: formData.miscellaneousInterventions.deaths, carbonMonoxidePoisoning: formData.carbonMonoxidePoisoning.deaths, securityCoverage: formData.securityCoverage.deaths },
      { name: 'المصابين', trafficAccidents: formData.trafficAccidents.injured, urbanIndustrialFires: formData.urbanIndustrialFires.injured, medicalEvacuation: formData.medicalEvacuation.injured, miscellaneousInterventions: formData.miscellaneousInterventions.injured, carbonMonoxidePoisoning: formData.carbonMonoxidePoisoning.suffocated, securityCoverage: formData.securityCoverage.injured },
    ];

    const timeSeriesData = historicalData.map(data => ({
      date: data.date,
      interventions: calculateTotalInterventions(),
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">إحصائيات التدخلات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-medium mb-2">توزيع التدخلات</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-2">الوفيات والمصابين حسب نوع التدخل</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="trafficAccidents" name="حوادث الطرق" stackId="a" fill="#8884d8" />
                <Bar dataKey="urbanIndustrialFires" name="حرائق المدن والصناعية" stackId="a" fill="#82ca9d" />
                <Bar dataKey="medicalEvacuation" name="الإخلاء الطبي" stackId="a" fill="#ffc658" />
                <Bar dataKey="miscellaneousInterventions" name="التدخلات المتنوعة" stackId="a" fill="#ff7300" />
                <Bar dataKey="carbonMonoxidePoisoning" name="حوادث التسمم بأول أكسيد الكربون" stackId="a" fill="#0088FE" />
                <Bar dataKey="securityCoverage" name="التغطية الأمنية" stackId="a" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-8">
          <h4 className="text-lg font-medium mb-2">تطور التدخلات عبر الزمن</h4>
          <div className="mb-4">
            <button
              onClick={() => setChartType('daily')}
              className={`mr-2 px-3 py-1 rounded ${chartType === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              يومي
            </button>
            <button
              onClick={() => setChartType('monthly')}
              className={`mr-2 px-3 py-1 rounded ${chartType === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              شهري
            </button>
            <button
              onClick={() => setChartType('yearly')}
              className={`px-3 py-1 rounded ${chartType === 'yearly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              سنوي
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="interventions" name="التدخلات" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          التاريخ
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>

      {renderInputSection('trafficAccidents', 'حوادث الطرق', {
        interventions: 'عدد التدخلات',
        injured: 'عدد المصابين',
        deaths: 'عدد الوفيات'
      })}
      {renderInputSection('urbanIndustrialFires', 'حرائق المدن والصناعية', {
        interventions: 'عدد التدخلات',
        suffocated: 'عدد حالات الاختناق',
        burned: 'عدد ضحايا الحروق',
        injured: 'عدد المصابين',
        deaths: 'عدد الوفيات'
      })}
      {renderInputSection('medicalEvacuation', 'الإخلاء الطبي', {
        interventions: 'عدد التدخلات',
        injured: 'عدد المصابين',
        deaths: 'عدد الوفيات'
      })}
      {renderInputSection('miscellaneousInterventions', 'التدخلات المتنوعة', {
        interventions: 'عدد التدخلات',
        injured: 'عدد المصابين',
        deaths: 'عدد الوفيات'
      })}
      {renderInputSection('carbonMonoxidePoisoning', 'حوادث التسمم بأول أكسيد الكربون', {
        interventions: 'عدد التدخلات',
        suffocated: 'عدد حالات الاختناق',
        deaths: 'عدد الوفيات'
      })}
      {renderInputSection('securityCoverage', 'التغطية الأمنية', {
        interventions: 'عدد التدخلات',
        injured: 'عدد المصابين',
        patients: 'عدد المرضى',
        deaths: 'عدد الوفيات'
      })}

      <div className="mb-6 p-4 bg-white rounded shadow">
        <h3 className="text-lg font-semibold mb-3">إجمالي التدخلات</h3>
        <p className="text-2xl font-bold text-blue-600">{calculateTotalInterventions()}</p>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

      <div className="flex justify-between mb-8">
        <button
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          حفظ الإحصائيات
        </button>
        <button
          onClick={handleExport}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          تصدير إلى Excel
        </button>
      </div>

      {renderCharts()}
    </div>
  );
};

export default InterventionForm;