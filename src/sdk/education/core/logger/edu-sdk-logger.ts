import Dexie, { IndexableType, IndexableTypeArrayReadonly, Table } from 'dexie';
import moment from 'moment';

const DATABASE_NAME = `AgoraEduLogger`
const TABLE_NAME = `logs`

type Timestamp = number

type LogSchema = {
  content: string
  created_at: Timestamp
  timestamp: string
}

export class EduSDKLogger extends Dexie {
  logs: Table<LogSchema, number>;

  constructor() {
    super(DATABASE_NAME);
    this.openDatabase()
    this.logs = this.table(TABLE_NAME)
  }

  openDatabase() {
    const timeStr = moment().format("YYYY-MM-DD HH:mm:sss")
    console.log(`时间: ${timeStr}, ${DATABASE_NAME} database: 1`)
    this.version(1).stores({
      logs: '++id, content, created_at',
    })
    console.log(`时间: ${timeStr}, ${DATABASE_NAME} database: 2`)
  }

  async readAndDeleteBy(time: number) {
    return this.resetByKeys(time)
  }

  async resetByKeys(time: number) {
    const db = this

    return await db.transaction('rw!', db.tables, () => {
      const {currentTransaction: trans} = Dexie

      return Promise.all(
        trans.storeNames.map((tableName: string) => {
          const logs: string[] = []
          const pk: IndexableType[] = []
          return db.table(tableName).where('created_at').belowOrEqual(time)
            .each((item, cursor) => {
              logs.push(item)
              pk.push(cursor.primaryKey)
            }).then(() => {
              return db.table(tableName)
                .bulkDelete(pk as IndexableTypeArrayReadonly)
                .then(() => {
                  return logs
                })
            })
        })
      )
    })
  }
}