export class BatchRecord<E> {
  private static _batchRecords: Map<number, BatchRecord<any>> = new Map();

  static getBatchRecord<T>(
    batch: { batchId: number; total: number; current: number },
    cb: (dataChunk: T[]) => void,
  ) {
    if (!this._batchRecords.has(batch.batchId)) {
      this._batchRecords.set(
        batch.batchId,
        new BatchRecord(batch.batchId, batch.total, batch.current, cb),
      );
    }

    const batchRecord = this._batchRecords.get(batch.batchId) as BatchRecord<T>;

    batchRecord._setCallback(cb);

    return batchRecord;
  }

  private _dataChunk: E[] = [];

  constructor(
    private _batchId: number,
    private _total: number,
    private _current: number,
    private _cb?: (dataChunk: E[]) => void,
  ) {}

  addBatch(data: E) {
    this._dataChunk.push(data);

    if (this._total === this._current) {
      this._endBatch();
    }
  }

  private _setCallback(cb: (dataChunk: E[]) => void) {
    this._cb = cb;
  }

  private _endBatch() {
    if (this._cb) {
      this._cb.apply(this, [this._dataChunk]);
    }

    BatchRecord._batchRecords.delete(this._batchId);
  }
}
