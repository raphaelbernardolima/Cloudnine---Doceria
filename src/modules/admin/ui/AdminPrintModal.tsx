import React from 'react';
import { Printer } from 'lucide-react';
import { Order } from '@/src/core/types/index';

interface AdminPrintModalProps {
  printingOrder: Order;
  receiptType: 'cozinha' | 'cliente';
  paperWidth: '80mm' | '58mm';
  setReceiptType: (type: 'cozinha' | 'cliente') => void;
  setPaperWidth: (width: '80mm' | '58mm') => void;
  onClose: () => void;
}

export const AdminPrintModal: React.FC<AdminPrintModalProps> = ({
  printingOrder,
  receiptType,
  paperWidth,
  setReceiptType,
  setPaperWidth,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white text-black p-6 rounded-2xl max-w-sm w-full font-mono text-xs space-y-3 shadow-2xl printable-receipt">

        {/* Controls Bar inside preview modal (hidden when printing) */}
        <div className="no-print p-2 rounded-xl bg-gray-100 flex items-center justify-between text-sm font-sans font-bold mb-2">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setReceiptType('cozinha')}
              className={`px-2 py-1 rounded-lg ${receiptType === 'cozinha' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
            >
              Cozinha
            </button>
            <button
              type="button"
              onClick={() => setReceiptType('cliente')}
              className={`px-2 py-1 rounded-lg ${receiptType === 'cliente' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
            >
              Cliente
            </button>
          </div>

          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPaperWidth('80mm')}
              className={`px-2 py-1 rounded-lg ${paperWidth === '80mm' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
            >
              80mm
            </button>
            <button
              type="button"
              onClick={() => setPaperWidth('58mm')}
              className={`px-2 py-1 rounded-lg ${paperWidth === '58mm' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
            >
              58mm
            </button>
          </div>
        </div>

        {/* Ticket Thermal Receipt Layout */}
        <div className={`mx-auto space-y-2 ${paperWidth === '58mm' ? 'max-w-50 text-sm' : 'max-w-65'}`}>
          <div className="text-center border-b border-dashed border-black pb-2 space-y-0.5">
            <h2 className="font-black text-sm uppercase tracking-widest">CLOUD NINE DOCERIA</h2>
            <p className="text-xs">Alameda Gabriel Monteiro da Silva, 450</p>
            <p className="font-bold text-sm">
              {receiptType === 'cozinha' ? '=== VIA DA COZINHA (PRODUÇÃO) ===' : '=== VIA DO CLIENTE (RECIBO) ==='}
            </p>
            <span className="font-black text-base block mt-1">PEDIDO #{printingOrder.id}</span>
          </div>

          <div className="space-y-0.5 text-sm">
            <p><strong>Cliente:</strong> {printingOrder.cliente_nome}</p>
            <p><strong>Telefone:</strong> {printingOrder.cliente_telefone}</p>
            <p><strong>Data/Hora:</strong> {printingOrder.data_agendada} ({printingOrder.horario_agendado})</p>
            <p><strong>Entrega:</strong> {printingOrder.tipo_entrega.toUpperCase()}</p>
          </div>

          <div className="border-t border-b border-dashed border-black py-2 space-y-1">
            <p className="font-bold uppercase text-xs text-center">--- ITENS DO PEDIDO ---</p>
            {printingOrder.itens.map((i, idx) => (
              <div key={idx} className="flex justify-between font-bold text-sm">
                <span>{i.quantidade}x {i.nomeProduto}</span>
                <span>R$ {(i.preco_unitario * i.quantidade).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between font-black text-xs pt-0.5">
            <span>TOTAL A PAGAR</span>
            <span>R$ {Number(printingOrder.total).toFixed(2)}</span>
          </div>

          <div className="pt-2 text-center border-t border-dashed border-black space-y-1">
            <p className="text-xs">Obrigado por escolher a Cloudnine!</p>
            <p className="text-[8px] opacity-75">Confeitaria Artesanal & Bolos de Luxo</p>
            <div className="mt-1 text-center text-xs tracking-widest font-mono">||||||| |||| |||||||||||||||</div>
          </div>
        </div>

        {/* Modal Actions (Hidden on Print) */}
        <div className="no-print flex gap-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-black font-bold font-sans transition-colors min-h-10.5"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={() => {
              window.print();
              onClose();
            }}
            className="w-1/2 py-2.5 rounded-xl bg-black hover:bg-gray-900 text-white font-bold font-sans transition-colors flex items-center justify-center space-x-1.5 shadow-md min-h-10.5"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Agora</span>
          </button>
        </div>

      </div>
    </div>
  );
};
