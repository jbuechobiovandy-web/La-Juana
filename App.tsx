
import React, { useState, useEffect, useCallback } from 'react';
import { Neighbor, NeighborStatus, User } from './types';
import { neighborService } from './services/neighborService';
import { aiService } from './services/aiService';
import { NeighborCard } from './components/NeighborCard';
import { NeighborForm } from './components/NeighborForm';
import { NeighborListView } from './components/NeighborListView';
import { NeighborDetailsModal } from './components/NeighborDetailsModal';
import { AuthForm } from './components/AuthForm';
import { Button } from './components/Button';
import { HealthCheck } from './components/HealthCheck';

type ViewMode = 'board' | 'list';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [neighbors, setNeighbors] = useState<Neighbor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNeighbor, setEditingNeighbor] = useState<Neighbor | null>(null);
  const [selectedNeighbor, setSelectedNeighbor] = useState<Neighbor | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('taskflow_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchNeighbors();
  }, []);

  const fetchNeighbors = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await neighborService.getNeighbors();
      setNeighbors(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el censo vecinal de Torrejón.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddOrEditNeighbor = async (data: { name: string; address: string; phone: string }) => {
    try {
      if (editingNeighbor) {
        const updated = { ...editingNeighbor, ...data };
        const result = await neighborService.updateNeighbor(updated);
        setNeighbors(prev => prev.map(n => n.id === editingNeighbor.id ? result : n));
        setEditingNeighbor(null);
      } else {
        const welcomePlan = await aiService.generateWelcomePlan(data.name, data.address);
        const newNeighbor = await neighborService.saveNeighbor({
          ...data,
          integrationPlan: welcomePlan
        });
        setNeighbors(prev => [newNeighbor, ...prev]);
      }
    } catch (err) {
      setError('Error al procesar los datos del vecino.');
    }
  };

  const handleUpdateStatus = async (id: string, status: NeighborStatus) => {
    try {
      const updated = await neighborService.updateNeighborStatus(id, status);
      setNeighbors(prev => prev.map(n => n.id === id ? updated : n));
    } catch (err) {
      setError('Error al actualizar estado.');
    }
  };

  const handleDeleteNeighbor = async (id: string) => {
    try {
      await neighborService.deleteNeighbor(id);
      setNeighbors(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      setError('Error al dar de baja al vecino.');
    }
  };

  const openEditForm = (neighbor: Neighbor) => {
    setEditingNeighbor(neighbor);
    setIsFormOpen(true);
  };

  const handleLogoutClick = () => {
    if (isLoggingOut) {
      localStorage.removeItem('taskflow_user');
      setUser(null);
      setIsLoggingOut(false);
    } else {
      setIsLoggingOut(true);
      setTimeout(() => setIsLoggingOut(false), 3000);
    }
  };

  if (!user) {
    return <AuthForm onLogin={setUser} />;
  }

  const columns = [
    { id: NeighborStatus.NEW, label: 'Nuevos en Torrejón', icon: 'fa-sparkles', color: 'bg-indigo-500' },
    { id: NeighborStatus.ACTIVE, label: 'Activos', icon: 'fa-house-user', color: 'bg-emerald-500' },
    { id: NeighborStatus.AWAY, label: 'Ausentes', icon: 'fa-plane', color: 'bg-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <i className="fa-solid fa-users-viewfinder text-xl"></i>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black leading-none text-slate-800 tracking-tight">
                VecinoRed <span className="text-indigo-600">Torrejón</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Gestión Municipal de {user.name}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="hidden md:flex bg-slate-100 p-1 rounded-xl mr-2">
              <button 
                onClick={() => setViewMode('board')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'board' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <i className="fa-solid fa-table-columns mr-1.5"></i> Tablero
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <i className="fa-solid fa-list-ul mr-1.5"></i> Listado
              </button>
            </div>

            <Button 
              variant={isLoggingOut ? "danger" : "ghost"} 
              onClick={handleLogoutClick}
              className="text-xs px-3 py-1.5 hidden sm:flex"
            >
              <i className={`fa-solid ${isLoggingOut ? 'fa-check' : 'fa-right-from-bracket'}`}></i>
              {isLoggingOut ? '¿Salir?' : 'Salir'}
            </Button>

            <Button 
              variant="primary" 
              onClick={() => { setEditingNeighbor(null); setIsFormOpen(true); }}
              className="px-6 py-2.5 rounded-xl text-sm font-bold"
            >
              <i className="fa-solid fa-user-plus"></i>
              <span className="hidden sm:inline">Nuevo Vecino</span>
            </Button>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 px-4 py-3 rounded-r-xl flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-circle-exclamation text-lg"></i>
              <span className="font-medium">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="hover:scale-110"><i className="fa-solid fa-xmark"></i></button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Sincronizando censo...</p>
          </div>
        ) : (
          <>
            {viewMode === 'board' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {columns.map(column => (
                  <div key={column.id} className="flex flex-col gap-6">
                    <div className="flex items-center justify-between px-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                        <h2 className="font-black text-slate-800 uppercase tracking-tight text-sm">{column.label}</h2>
                      </div>
                      <span className="bg-white border border-slate-200 text-slate-600 text-xs px-2.5 py-1 rounded-full font-black">
                        {neighbors.filter(n => n.status === column.id).length}
                      </span>
                    </div>

                    <div className="flex flex-col gap-5 min-h-[300px] p-4 bg-slate-200/30 rounded-[2rem] border-2 border-dashed border-slate-300/40">
                      {neighbors.filter(n => n.status === column.id).map(neighbor => (
                        <NeighborCard 
                          key={neighbor.id} 
                          neighbor={neighbor} 
                          onUpdateStatus={handleUpdateStatus} 
                          onDelete={handleDeleteNeighbor}
                        />
                      ))}
                      {neighbors.filter(n => n.status === column.id).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400/40">
                          <i className={`fa-solid ${column.icon} text-2xl mb-2`}></i>
                          <p className="text-[10px] uppercase font-black tracking-widest">Sin registros</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <NeighborListView 
                neighbors={neighbors} 
                onEdit={openEditForm}
                onDelete={handleDeleteNeighbor}
                onShowDetails={setSelectedNeighbor}
              />
            )}
          </>
        )}
      </main>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in zoom-in-95 duration-300">
            <NeighborForm 
              onAdd={handleAddOrEditNeighbor} 
              onCancel={() => { setIsFormOpen(false); setEditingNeighbor(null); }} 
              initialData={editingNeighbor || undefined}
            />
          </div>
        </div>
      )}

      {selectedNeighbor && (
        <NeighborDetailsModal 
          neighbor={selectedNeighbor} 
          onClose={() => setSelectedNeighbor(null)} 
        />
      )}

      <HealthCheck />
    </div>
  );
};

export default App;
