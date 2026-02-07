
import React from 'react';
import { NeighborStatus, TaskStatus } from './types';

export const STATUS_CONFIG = {
  [NeighborStatus.NEW]: {
    label: 'Recién Llegado',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    icon: <i className="fa-solid fa-sparkles"></i>
  },
  [NeighborStatus.ACTIVE]: {
    label: 'Residente Activo',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: <i className="fa-solid fa-house-chimney-user"></i>
  },
  [NeighborStatus.AWAY]: {
    label: 'Temporalmente Ausente',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    icon: <i className="fa-solid fa-plane-departure"></i>
  },
  // Added configurations for TaskStatus to resolve potential runtime and type errors in TaskCard
  [TaskStatus.PENDING]: {
    label: 'Pendiente',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    icon: <i className="fa-solid fa-clock"></i>
  },
  [TaskStatus.IN_PROGRESS]: {
    label: 'En Curso',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    icon: <i className="fa-solid fa-spinner fa-spin-pulse"></i>
  },
  [TaskStatus.COMPLETED]: {
    label: 'Completada',
    color: 'bg-green-100 text-green-700 border-green-200',
    dot: 'bg-green-500',
    icon: <i className="fa-solid fa-check-double"></i>
  }
};
