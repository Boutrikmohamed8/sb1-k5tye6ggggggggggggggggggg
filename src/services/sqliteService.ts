import initSqlJs from 'sql.js';
import { WilayaData } from '../types';

let db: any;
let isInitialized = false;

export const initDatabase = async () => {
  if (isInitialized) return;

  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });

  db = new SQL.Database();
  db.run(`
    CREATE TABLE IF NOT EXISTS wilaya_data (
      id TEXT,
      name TEXT,
      data TEXT,
      date TEXT,
      PRIMARY KEY (id, date)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS historical_data (
      id TEXT PRIMARY KEY,
      data TEXT
    )
  `);

  isInitialized = true;
};

export const saveWilayaData = async (wilayaData: WilayaData) => {
  await initDatabase();
  const { id, name, date } = wilayaData;
  const data = JSON.stringify(wilayaData);
  
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO wilaya_data (id, name, data, date)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run([id, name, data, date]);
  stmt.free();
};

export const getWilayaData = async (id: string, date: string): Promise<WilayaData | null> => {
  await initDatabase();
  const stmt = db.prepare(`
    SELECT data FROM wilaya_data
    WHERE id = ? AND date = ?
  `);
  const result = stmt.getAsObject([id, date]);
  stmt.free();

  if (result.data) {
    return JSON.parse(result.data as string);
  }
  return null;
};

export const getAllWilayaData = async (id: string): Promise<WilayaData[]> => {
  await initDatabase();
  const result = db.exec(`
    SELECT data, date FROM wilaya_data
    WHERE id = ?
    ORDER BY date DESC
  `, [id]);

  if (result[0]?.values) {
    return result[0].values.map((row: any[]) => ({
      ...JSON.parse(row[0] as string),
      date: row[1] as string
    }));
  }
  return [];
};

export const saveHistoricalData = async (id: string, history: WilayaData[]): Promise<void> => {
  await initDatabase();
  const data = JSON.stringify(history);
  
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO historical_data (id, data)
    VALUES (?, ?)
  `);
  stmt.run([id, data]);
  stmt.free();
};

export const getHistoricalData = async (id: string): Promise<WilayaData[]> => {
  await initDatabase();
  const stmt = db.prepare(`
    SELECT data FROM historical_data
    WHERE id = ?
  `);
  const result = stmt.getAsObject([id]);
  stmt.free();

  if (result.data) {
    return JSON.parse(result.data as string);
  }
  return [];
};