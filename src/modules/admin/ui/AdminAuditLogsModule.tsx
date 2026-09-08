import React from 'react';
import { Box, Chip } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { ShieldCheck } from 'lucide-react';
import { AuditLog } from '@/src/core/types/index';

interface AdminAuditLogsModuleProps {
  auditLogs: AuditLog[];
}

export const AdminAuditLogsModule: React.FC<AdminAuditLogsModuleProps> = ({ auditLogs }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-xl text-(--color-on-surface) flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Logs de Auditoria
          </h3>
          <p className="text-sm text-(--color-outline)">Histórico de ações e eventos do sistema.</p>
        </div>
      </div>
      <Box sx={{ height: 500, width: '100%', bgcolor: 'surfaceContainerLowest', borderRadius: 4, overflow: 'hidden' }}>
        <DataGrid
          rows={auditLogs}
          columns={[
            { field: 'id', headerName: 'ID', width: 90 },
            {
              field: 'acao',
              headerName: 'Ação',
              width: 250,
              renderCell: (params) => (
                <Chip label={params.value} size="small" color="primary" variant="outlined" />
              )
            },
            { field: 'detalhes', headerName: 'Detalhes', flex: 1, minWidth: 300 },
            { field: 'user_id', headerName: 'Usuário', width: 150 },
            {
              field: 'created_at',
              headerName: 'Data',
              width: 180,
              renderCell: (params) => new Date(params.value).toLocaleString('pt-BR')
            }
          ]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 15 },
            },
            sorting: {
              sortModel: [{ field: 'created_at', sort: 'desc' }],
            },
          }}
          pageSizeOptions={[15, 30, 50]}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          sx={{ border: 'none' }}
        />
      </Box>
    </div>
  );
};
