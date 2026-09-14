import React, { useState } from 'react';
import { useDataStore } from '@/src/core/store/useDataStore';
import { Table, Order } from '@/src/core/types/index';
import { Monitor, QrCode, Users, Clock, CheckCircle, X, DownloadSimple, Plus } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useTableMutations } from '@/src/core/hooks/useTableMutations';

export const AdminTablesModule: React.FC = () => {
  const { tables, setTables } = useDataStore();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const { handleAddTable, handleUpdateTableStatus, handleDeleteTable } = useTableMutations();
  const [isAdding, setIsAdding] = useState(false);
  const [newTableNumero, setNewTableNumero] = useState('');
  const [newTableSeats, setNewTableSeats] = useState(4);

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

  const toggleStatus = async (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    
    const nextStatus = table.status === 'livre' ? 'ocupada' : (table.status === 'ocupada' ? 'aguardando_pagamento' : 'livre');
    await handleUpdateTableStatus(tableId, nextStatus as Table['status']);
  };

  const handleCreateNewTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumero.trim()) {
      toast.error('Informe o número/nome da mesa');
      return;
    }
    const success = await handleAddTable(newTableNumero, newTableSeats);
    if (success) {
      setIsAdding(false);
      setNewTableNumero('');
      setNewTableSeats(4);
    }
  };

  const generateQRCodeURL = (numero: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?mesa=${numero}`;
  };

  const handleDownloadQR = async (numero: string) => {
    try {
      toast.loading('Gerando imagem em alta resolução...');
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(generateQRCodeURL(numero))}`;
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `QR_Mesa_${numero}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      toast.dismiss();
      toast.success('Download concluído!');
    } catch (err) {
      toast.dismiss();
      toast.error('Erro ao baixar QR Code.');
    }
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
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl font-bold hover:opacity-90 flex items-center gap-2 transition-opacity"
        >
          <Plus className="w-5 h-5" /> Adicionar Mesa
        </button>
      </div>

      {isAdding && (
        <div className="bg-[var(--color-surface-container-low)] p-6 rounded-3xl shadow-sm border border-[var(--color-outline-variant)]/20 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-bold mb-4">Nova Mesa</h3>
          <form onSubmit={handleCreateNewTable} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-[var(--color-on-surface-variant)] mb-2">
                Número / Identificador
              </label>
              <input
                type="text"
                required
                value={newTableNumero}
                onChange={(e) => setNewTableNumero(e.target.value)}
                placeholder="Ex: 01, Deck, Varanda..."
                className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
              />
            </div>
            <div className="w-full sm:w-32">
              <label className="block text-sm font-bold text-[var(--color-on-surface-variant)] mb-2">
                Lugares
              </label>
              <input
                type="number"
                min="1"
                required
                value={newTableSeats}
                onChange={(e) => setNewTableSeats(Number(e.target.value))}
                className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[var(--color-primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="w-full sm:w-auto px-6 py-3 bg-[var(--color-surface-container)] text-[var(--color-on-surface)] font-bold rounded-xl hover:bg-[var(--color-surface-container-high)] transition-colors"
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {tables.length === 0 && !isAdding && (
        <div className="text-center py-12 bg-[var(--color-surface-container-lowest)] rounded-3xl border border-dashed border-[var(--color-outline-variant)]">
          <Monitor className="w-12 h-12 text-[var(--color-outline)] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[var(--color-on-surface)] mb-2">Nenhuma mesa cadastrada</h3>
          <p className="text-[var(--color-on-surface-variant)]">Comece adicionando as mesas do seu salão.</p>
        </div>
      )}

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
              
              <button
                onClick={async () => {
                  if (confirm('Tem certeza que deseja excluir esta mesa?')) {
                    await handleDeleteTable(selectedTable.id);
                    setSelectedTable(null);
                  }
                }}
                className="w-full py-3 rounded-xl bg-rose-100 text-rose-700 font-bold hover:bg-rose-200 transition-colors"
              >
                Excluir Mesa
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
                <button 
                  onClick={() => handleDownloadQR(String(selectedTable.numero))}
                  className="mt-2 w-full py-2 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-bold text-sm flex items-center justify-center gap-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <DownloadSimple className="w-5 h-5" /> Baixar em Alta Resolução (Impressão)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
