
export enum NeighborStatus {
  ACTIVE = 'ACTIVE',
  AWAY = 'AWAY',
  NEW = 'NEW'
}

export interface Neighbor {
  id: string;
  name: string;
  address: string; // Portal y Piso
  phone: string;
  status: NeighborStatus;
  createdAt: number;
  integrationPlan?: string[];
}

export interface User {
  name: string;
  joinedAt: number;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}

// Added TaskStatus and Task interface to fix compilation errors
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: number;
  steps?: string[];
}
