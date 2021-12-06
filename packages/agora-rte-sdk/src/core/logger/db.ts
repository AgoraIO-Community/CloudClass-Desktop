import Dexie, { Table } from 'dexie';

const DATABASE_NAME = `AgoraLogger`;
const TABLE_NAME = `logs`;

type Timestamp = number;

type LogSchema = {
  content: string;
  created_at: Timestamp;
  timestamp: string;
};

export class LoggerDB extends Dexie {
  logs: Table<LogSchema, number>;

  constructor() {
    super(DATABASE_NAME);
    this.openDatabase();
    this.logs = this.table(TABLE_NAME);
  }

  openDatabase() {
    this.version(1).stores({
      logs: '++id, content, created_at',
    });
  }
}

export const db = new LoggerDB();
