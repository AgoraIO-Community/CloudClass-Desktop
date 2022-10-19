import { CourseWareItem } from '@/infra/api';
import { getLSStore, setLSStore } from '.';

class Courseware {
  private _lsKey = 'courseWare';
  public getList() {
    return getLSStore<CourseWareItem[]>(this._lsKey) || [];
  }

  public setList(list: CourseWareItem[]) {
    setLSStore(this._lsKey, list);
  }
}

export const courseware = new Courseware();
