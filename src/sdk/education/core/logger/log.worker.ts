import {db} from './db';

const ctx: DedicatedWorkerGlobalScope = self as any;
ctx.onmessage = async (evt: any) => {
  if (evt.data && evt.data.type === 'log') {
    const now = new Date()
    db.logs.put({content: evt.data.data, created_at: +Date.now(), timestamp: `${now}`})
  }
};

export default null as any;
