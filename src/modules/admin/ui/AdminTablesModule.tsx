import React, { useState } from 'react';
import { useDataStore } from '@/src/core/store/useDataStore';
import { Table, Order } from '@/src/core/types/index';
import { Monitor, QrCode, Users, Clock, CheckCircle, X, DownloadSimple } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const AdminTablesModule: React.FC = () => {
  const { tables, setTables } = useDataStore();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Fake orders just to simulate if a table is occupied
  // In a real scenario, this would come from the backend or the orders list filtering by `numero_mesa`
  
  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'livre': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ocupada': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'aguardando_pagamento': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-[var(--color-surface-container)] text-[var(--color-on-surface)] border-gray-200';
    }
  };

  const getStatusText = (status: Table['status']) => {
    switch (status) {
      case 'livre': return 'Livre';
      case 'ocupada': return 'Ocupada';
      case 'aguardando_pagamento': return 'Fechando';
      default: return status;
    }
  };

  const toggleStatus = (tableId: string) => {
    const updated = tables.map(t => {
      if (t.id === tableId) {
        const nextStatus = t.status === 'livre' ? 'ocupada' : (t.status === 'ocupada' ? 'aguardando_pagamento' : 'livre');
        return { ...t, status: nextStatus as Table['status'] };
      }
      return t;
    });
    setTables(updated);
    toast.success('Status da mesa atualizado!');
  };

  const generateQRCodeURL = (numero: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?mesa=${numero}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center bg-[var(--color-surface-container-lowest)] p-6 rounded-3xl shadow-sm border border-[var(--color-outline-variant)]/20">
        <div>
          <h2 className="text-2xl font-black text-[var(--color-on-surface)] flex items-center gap-2">
            <Monitor className="w-8 h-8 text-[var(--color-primary)]" />
            Gestão de Mesas
          </h2>
          <p className="text-[var(--color-on-surface-variant)] mt-1">
            Controle o salão, libere mesas e gere QR Codes para os clientes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map(table => (
          <div 
            key={table.id}
            onClick={() => setSelectedTable(table)}
            className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center transition-transform hover:scale-105 ${getStatusColor(table.status)}`}
          >
            <span className="text-3xl font-black mb-2">{table.numero}</span>
            <span className="text-xs font-bold uppercase tracking-wider">{getStatusText(table.status)}</span>
            <div className="mt-2 flex items-center gap-1 opacity-70">
              <Users className="w-3 h-3" />
              <span className="text-[10px] font-bold">{table.seats} Lugares</span>
            </div>
          </div>
        ))}
      </div>

      {selectedTable && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--color-surface-container-lowest)] rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setSelectedTable(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-surface-container)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--color-outline)]" />
            </button>
            
            <h3 className="text-2xl font-black mb-1">Mesa {selectedTable.numero}</h3>
            <p className="text-sm font-bold text-[var(--color-outline)] mb-6 uppercase">Status Atual: {getStatusText(selectedTable.status)}</p>

            <div className="space-y-3 mb-8">
              <button
                onClick={() => {
                  toggleStatus(selectedTable.id);
                  setSelectedTable(null);
                }}
                className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:opacity-90 transition-opacity"
              >
                Avançar Status
              </button>
            </div>

            <div className="border-t border-[var(--color-outline-variant)]\/30 pt-6">
              <h4 className="font-bold text-[var(--color-on-surface)] flex items-center gap-2 mb-4">
                <QrCode className="w-5 h-5" /> QR Code da Mesa
              </h4>
              <div className="flex flex-col items-center gap-4 bg-[var(--color-surface-container-low)] p-4 rounded-2xl border border-[var(--color-outline-variant)]\/30">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRCodeURL(String(selectedTable.numero)))}`} 
                  alt={`QR Code Mesa ${selectedTable.numero}`} 
                  className="rounded-xl shadow-sm"
                />
                <p className="text-xs text-[var(--color-outline)] text-center">
                  O cliente escaneia este código para pedir diretamente da mesa.
                </p>
                <a 
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(generateQRCodeURL(String(selectedTable.numero)))}`}
                  target="_blank"
                  download
                  className="mt-2 text-[var(--color-primary)] font-bold text-sm flex items-center gap-1 hover:underline"
                >
                  <DownloadSimple className="w-4 h-4" /> Baixar em Alta Resolução
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
