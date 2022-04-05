import {
  enablePromise,
  openDatabase,
  SQLiteDatabase,
} from "react-native-sqlite-storage";
import { newPairLunch } from "../models";

const tableName = "pairLunchData";

enablePromise(true);

export const getDBConnection = async () => {
  return openDatabase({ name: "pair-lunch.db", location: "default" });
};

export const createTable = async (db: SQLiteDatabase) => {
  // create table if not exists
  const query = `CREATE TABLE IF NOT EXISTS ${tableName}(
        rowid TEXT PRIMARY KEY,
        atom TEXT NOT NULL,
        date TEXT NOT NULL,
        restaurant TEXT NOT NULL,
        color TEXT NOT NULL,
        column INTEGER NOT NULL
    );`;

  await db.executeSql(query);
};

export const getPairLunches = async (
  db: SQLiteDatabase
): Promise<newPairLunch[]> => {
  try {
    const newPairLunch: newPairLunch[] = [];
    const results = await db.executeSql(
      `SELECT rowid as id,atom,date,restaurant,color,column FROM ${tableName}`
    );
    results.forEach((result) => {
      for (let index = 0; index < result.rows.length; index++) {
        newPairLunch.push(result.rows.item(index));
      }
    });
    return newPairLunch;
  } catch (error) {
    console.error(error);
    throw Error("Failed to get todoItems !!!");
  }
};

export const getPairLunch = async (
  db: SQLiteDatabase,
  name: string
): Promise<newPairLunch[]> => {
  try {
    const newPairLunch: newPairLunch[] = [];
    const results = await db.executeSql(
      `SELECT rowid as id,atom,date,restaurant,color,column FROM ${tableName} WHERE atom = '${name}'`
    );
    results.forEach((result) => {
      for (let index = 0; index < result.rows.length; index++) {
        newPairLunch.push(result.rows.item(index));
      }
    });
    return newPairLunch;
  } catch (error) {
    console.error(error);
    throw Error("Failed to get todoItems !!!");
  }
};

export const savePairLunches = async (
  db: SQLiteDatabase,
  pairLunch: newPairLunch[]
) => {
  const insertQuery =
    `INSERT OR REPLACE INTO ${tableName}(rowid, atom, date, restaurant, color, column) values` +
    pairLunch
      .map(
        (i) =>
          `('${i.id}', '${i.atom}', '${i.date}', '${i.restaurant}', '${i.color}', ${i.column})`
      )
      .join(",");

  return db.executeSql(insertQuery);
};

export const deletePairLunch = async (db: SQLiteDatabase, id: number) => {
  const deleteQuery = `DELETE from ${tableName} where rowid = ${id}`;
  await db.executeSql(deleteQuery);
};

export const deleteTable = async (db: SQLiteDatabase) => {
  const query = `drop table ${tableName}`;

  await db.executeSql(query);
};
