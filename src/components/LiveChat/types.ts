export interface Message {
  id: number;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}
