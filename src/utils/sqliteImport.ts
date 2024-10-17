import initSqlJs from 'sql.js';
import { WilayaData } from '../types';
import { saveWilayaData } from '../services/indexedDBService';

export const importFromSQLite = async (sqliteFile: ArrayBuffer): Promise<void> => {
  try {
    const SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });

    const db = new SQL.Database(new Uint8Array(sqliteFile));

    const result = db.exec("SELECT * FROM wilaya_data");

    if (result.length > 0 && result[0].values) {
      for (const row of result[0].values) {
        const [id, name, data, date] = row;
        const wilayaData: WilayaData = {
          ...JSON.parse(data as string),
          id: id as string,
          name: name as string,
          date: date as string
        };
        await saveWilayaData(wilayaData);
      }
      console.log("Data imported successfully");
    } else {
      console.log("No data found in SQLite file");
    }

    db.close();
  } catch (error) {
    console.error("Error importing data from SQLite:", error);
    throw error;
  }
};