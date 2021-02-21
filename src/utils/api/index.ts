import uuidv4 from 'uuid/v4';

export function genUUID (): string {
  let uuid = localStorage.getItem('demo_edu_uuid');
  if (uuid) {
    return uuid;
  }
  uuid = uuidv4();
  localStorage.setItem('demo_edu_uuid', uuid);
  return uuid;
}