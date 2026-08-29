import re

with open("src/modules/admin/ui/AdminDashboard.tsx", "r") as f:
    content = f.read()

# Add MUI imports
if "from '@mui/x-data-grid'" not in content:
    content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { DataGrid, GridColDef } from '@mui/x-data-grid';\nimport { Box, Chip, Select, MenuItem, IconButton } from '@mui/material';")

# Find Orders block
orders_start = content.find("{activeTab === 'orders' && (")
if orders_start != -1:
    orders_end = content.find("      {/* TAB: CALENDAR */}", orders_start)
    if orders_end != -1:
        orders_replacement = """{activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-xl text-[var(--color-on-surface)]">
                Pedidos
              </h3>
              <p className="text-sm text-[var(--color-outline)]">Gestão visual e em tempo real usando DataGrid.</p>
            </div>
          </div>
          <Box sx={{ height: 600, width: '100%', bgcolor: 'surfaceContainerLowest', borderRadius: 4, overflow: 'hidden' }}>
            <DataGrid
              rows={orders}
              columns={[
                { field: 'id', headerName: 'ID', width: 90 },
                { field: 'cliente_nome', headerName: 'Cliente', width: 200 },
                { 
                  field: 'itens', 
                  headerName: 'Itens', 
                  width: 300,
                  valueGetter: (params) => {
                    const val = params;
                    return Array.isArray(val) ? val.map(i => `${i.quantidade}x ${i.nomeProduto}`).join(', ') : '';
                  }
                },
                { 
                  field: 'total', 
                  headerName: 'Total', 
                  width: 130,
                  renderCell: (params) => `R$ ${Number(params.value || 0).toFixed(2).replace('.', ',')}`
                },
                { 
                  field: 'created_at', 
                  headerName: 'Data', 
                  width: 180,
                  renderCell: (params) => new Date(params.value).toLocaleString('pt-BR')
                },
                {
                  field: 'status',
                  headerName: 'Status',
                  width: 200,
                  renderCell: (params) => (
                    <Select
                      size="small"
                      value={params.row.status}
                      onChange={(e) => onUpdateOrderStatus(params.row.id, e.target.value as any)}
                      sx={{ width: '100%', height: 32, fontSize: '0.875rem' }}
                    >
                      <MenuItem value="pendente_pix">Pendente PIX</MenuItem>
                      <MenuItem value="preparo">Em Preparo</MenuItem>
                      <MenuItem value="pronto">Pronto p/ Entrega</MenuItem>
                      <MenuItem value="rota">Em Rota</MenuItem>
                      <MenuItem value="entregue">Entregue</MenuItem>
                    </Select>
                  )
                },
                {
                  field: 'actions',
                  headerName: 'Ações',
                  width: 120,
                  renderCell: (params) => (
                    <IconButton size="small" onClick={() => handlePrintOrder(params.row)}>
                      <Printer className="w-4 h-4 text-gray-500" />
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
              sx={{ border: 'none', '& .MuiDataGrid-cell': { borderColor: 'var(--color-outline-variant)' } }}
            />
          </Box>
        </div>
      )}
"""
        content = content[:orders_start] + orders_replacement + content[orders_end:]

# Find Logs/Database block
database_start = content.find("{activeTab === 'database' && (")
if database_start != -1:
    database_end = content.find("      {/* THERMAL PRINT MODAL / TICKET PREVIEW */}", database_start)
    if database_end != -1:
        database_replacement = """{activeTab === 'database' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-xl text-[var(--color-on-surface)] flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                Logs de Auditoria
              </h3>
              <p className="text-sm text-[var(--color-outline)]">Histórico de ações e eventos do sistema.</p>
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
              sx={{ border: 'none' }}
            />
          </Box>
        </div>
      )}
"""
        content = content[:database_start] + database_replacement + content[database_end:]

with open("src/modules/admin/ui/AdminDashboard.tsx", "w") as f:
    f.write(content)

