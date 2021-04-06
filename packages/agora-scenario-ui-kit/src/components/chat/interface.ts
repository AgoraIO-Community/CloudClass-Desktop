export interface Message {
  id: string;
  uid: string | number;
  username: string;
  role: string;
  timestamp: number;
  content: string;
  isOwn: boolean;
}
