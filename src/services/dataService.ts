import { WilayaData } from '../types';
import * as indexedDBService from './indexedDBService';
import * as sqliteService from './sqliteService';

export const saveWilayaData = async (wilayaData: WilayaData): Promise<void> => {
  try {
    await Promise.all([
      indexedDBService.saveWilayaData(wilayaData),
      sqliteService.saveWilayaData(wilayaData)
    ]);

    // Save historical data
    await saveHistoricalData(wilayaData);
  } catch (error) {
    console.error('Error saving wilaya data:', error);
    throw new Error('Failed to save wilaya data');
  }
};

export const getWilayaData = async (id: string, date: string): Promise<WilayaData | null> => {
  try {
    const indexedDBData = await indexedDBService.getWilayaData(id, date);
    const sqliteData = await sqliteService.getWilayaData(id, date);
    
    // Prefer SQLite data if available, otherwise use IndexedDB data
    return sqliteData || indexedDBData;
  } catch (error) {
    console.error('Error getting wilaya data:', error);
    throw new Error('Failed to get wilaya data');
  }
};

export const getAllWilayaData = async (id: string): Promise<WilayaData[]> => {
  try {
    const indexedDBData = await indexedDBService.getAllWilayaData(id);
    const sqliteData = await sqliteService.getAllWilayaData(id);
    
    // Merge and deduplicate data from both sources
    const mergedData = [...indexedDBData, ...sqliteData];
    const uniqueData = mergedData.reduce((acc, current) => {
      const x = acc.find(item => item.id === current.id && item.date === current.date);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, [] as WilayaData[]);
    
    return uniqueData;
  } catch (error) {
    console.error('Error getting all wilaya data:', error);
    throw new Error('Failed to get all wilaya data');
  }
};

export const initDatabase = async (): Promise<void> => {
  try {
    await Promise.all([
      indexedDBService.initDatabase(),
      sqliteService.initDatabase()
    ]);
  } catch (error) {
    console.error('Error initializing database:', error);
    throw new Error('Failed to initialize database');
  }
};

export const saveHistoricalData = async (wilayaData: WilayaData): Promise<void> => {
  try {
    const existingData = await getAllWilayaData(wilayaData.id);
    const updatedData = [...existingData, wilayaData];
    await Promise.all([
      indexedDBService.saveHistoricalData(wilayaData.id, updatedData),
      sqliteService.saveHistoricalData(wilayaData.id, updatedData)
    ]);
  } catch (error) {
    console.error('Error saving historical data:', error);
    throw new Error('Failed to save historical data');
  }
};

export const getHistoricalData = async (id: string): Promise<WilayaData[]> => {
  try {
    const indexedDBData = await indexedDBService.getHistoricalData(id);
    const sqliteData = await sqliteService.getHistoricalData(id);
    
    // Merge and deduplicate data from both sources
    const mergedData = [...indexedDBData, ...sqliteData];
    const uniqueData = mergedData.reduce((acc, current) => {
      const x = acc.find(item => item.date === current.date);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, [] as WilayaData[]);
    
    return uniqueData;
  } catch (error) {
    console.error('Error getting historical data:', error);
    throw new Error('Failed to get historical data');
  }
};