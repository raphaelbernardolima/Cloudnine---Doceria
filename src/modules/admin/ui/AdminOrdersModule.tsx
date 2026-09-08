import React from 'react';
import { Box, Select, MenuItem, IconButton } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Printer } from 'lucide-react';
import { Order } from '@/src/core/types/index';

interface AdminOrdersModuleProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: number | string, newStatus: Order['status']) => void;
  onPrintOrder: (order: Order) => void;
}

export const AdminOrdersModule: React.FC<AdminOrdersModuleProps> = ({
  orders,
  onUpdateOrderStatus,
  onPrintOrder
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-2xl text-[var(--color-on-surface)]" style={{ fontFamily: '"Libre Caslon Text", serif', fontStyle: 'italic' }}>
            Pedidos Recentes
          </h3>
          <p className="text-sm text-[var(--color-on-surface-variant)]">Acompanhe e atualize o status das entregas em tempo real.</p>
        </div>
      </div>

      {/* Desktop Table View */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, height: 600, width: '100%', bgcolor: 'background.paper', borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)', border: '1px solid var(--color-outline-variant)' }}>
        <DataGrid
          rows={orders}
          columns={[
            { field: 'id', headerName: 'ID', width: 70 },
            { field: 'cliente_nome', headerName: 'Cliente', flex: 1.2, minWidth: 140 },
            {
              field: 'itens',
              headerName: 'Itens',
              flex: 1.8,
              minWidth: 180,
              valueGetter: (value: any) => {
                return Array.isArray(value) ? value.map((i: any) => `${i.quantidade}x ${i.nomeProduto || i.nome || 'Item'}`).join(', ') : '';
              }
            },
            {
              field: 'total',
              headerName: 'Total',
              flex: 0.8,
              minWidth: 100,
              renderCell: (params) => (
                <span className="font-bold text-[var(--color-primary)]">
                  R$ {Number(params.value || 0).toFixed(2).replace('.', ',')}
                </span>
              )
            },
            {
              field: 'created_at',
              headerName: 'Data',
              flex: 1,
              minWidth: 130,
              renderCell: (params) => new Date(params.value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
            },
            {
              field: 'status',
              headerName: 'Status',
              flex: 1.2,
              minWidth: 150,
              renderCell: (params) => (
                <Select
                  size="small"
                  value={params.row.status}
                  onChange={(e) => onUpdateOrderStatus(params.row.id, e.target.value as any)}
                  sx={{ width: '100%', height: 36, fontSize: '0.875rem', borderRadius: 2, bgcolor: 'var(--color-surface-container-lowest)' }}
                >
                  <MenuItem value="pendente_pix">Pendente PIX</MenuItem>
                  <MenuItem value="em_preparo">Em Preparo</MenuItem>
                  <MenuItem value="pronto_retirada">Pronto p/ Retirada</MenuItem>
                  <MenuItem value="saiu_entrega">Em Rota</MenuItem>
                  <MenuItem value="entregue">Entregue</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                </Select>
              )
            },
            {
              field: 'actions',
              headerName: 'Imprimir',
              width: 90,
              align: 'center',
              sortable: false,
              filterable: false,
              renderCell: (params) => (
                <IconButton size="small" onClick={() => onPrintOrder(params.row)} sx={{ color: 'var(--color-primary)' }}>
                  <Printer className="w-4 h-4" />
                </IconButton>
              )
            }
          ]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, sx: { p: 2, borderBottom: '1px solid var(--color-outline-variant)' } } }}
          sx={{ 
            border: 'none', 
            width: '100%',
            '& .MuiDataGrid-main': { width: '100%' },
            '& .MuiDataGrid-cell': { borderColor: 'var(--color-outline-variant)', display: 'flex', alignItems: 'center' },
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'var(--color-surface-container-low)', borderColor: 'var(--color-outline-variant)', fontWeight: 'bold' },
            '& .MuiDataGrid-footerContainer': { borderColor: 'var(--color-outline-variant)' }
          }}
        />
      </Box>

      {/* Mobile Card View */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
        {orders.map((o) => (
          <Box key={o.id} sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid var(--color-outline-variant)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-[var(--color-primary)]">PEDIDO #{o.id}</span>
                <h4 className="font-bold text-[var(--color-on-surface)] mt-1">{o.cliente_nome}</h4>
                <span className="text-xs text-[var(--color-on-surface-variant)]">{new Date(o.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="font-bold text-[var(--color-primary)]">
                R$ {Number(o.total || 0).toFixed(2).replace('.', ',')}
              </div>
            </div>
            
            <div className="text-sm text-[var(--color-on-surface)] bg-[var(--color-surface-container-lowest)] p-2 rounded-xl border border-[var(--color-outline-variant)]/50">
              {o.itens.map((i: any, idx: number) => (
                <div key={idx} className="flex justify-between py-1">
                  <span>{i.quantidade}x {i.nomeProduto || i.nome || 'Item'}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-outline-variant)]/30">
              <Select
                size="small"
                value={o.status}
                onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as any)}
                sx={{ flex: 1, height: 36, fontSize: '0.875rem', borderRadius: 2, bgcolor: 'var(--color-surface-container-lowest)' }}
              >
                <MenuItem value="pendente_pix">Pendente PIX</MenuItem>
                <MenuItem value="em_preparo">Em Preparo</MenuItem>
                <MenuItem value="pronto_retirada">Pronto p/ Retirada</MenuItem>
                <MenuItem value="saiu_entrega">Em Rota</MenuItem>
                <MenuItem value="entregue">Entregue</MenuItem>
                <MenuItem value="cancelado">Cancelado</MenuItem>
              </Select>
              <IconButton size="small" onClick={() => onPrintOrder(o)} sx={{ color: 'var(--color-primary)', bgcolor: 'var(--color-primary-container)', borderRadius: 2 }}>
                <Printer className="w-5 h-5" />
              </IconButton>
            </div>
          </Box>
        ))}
      </Box>
    </div>
  );
};
