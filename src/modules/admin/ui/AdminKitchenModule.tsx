import React from 'react';
import { Box, Card, CardContent, Typography, Divider, ToggleButtonGroup, ToggleButton, FormControl, Select, MenuItem, Button, Chip } from '@mui/material';
import { Printer, ShoppingBag } from 'lucide-react';
import { Order } from '@/src/core/types/index';

interface AdminKitchenModuleProps {
  orders: Order[];
  paperWidth: '80mm' | '58mm';
  setPaperWidth: (w: '80mm' | '58mm') => void;
  receiptType: 'cozinha' | 'cliente';
  setReceiptType: (t: 'cozinha' | 'cliente') => void;
  printerProtocol: string;
  setPrinterProtocol: (p: string) => void;
  printerStatusMessage: string;
  setPrinterStatusMessage: (msg: string) => void;
  onPrintOrder: (order: Order) => void;
}

export const AdminKitchenModule: React.FC<AdminKitchenModuleProps> = ({
  orders,
  paperWidth,
  setPaperWidth,
  receiptType,
  setReceiptType,
  printerProtocol,
  setPrinterProtocol,
  printerStatusMessage,
  setPrinterStatusMessage,
  onPrintOrder
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Thermal Printer Hardware Configuration Panel */}
      <Card sx={{ borderRadius: 4, bgcolor: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)', borderWidth: 1, borderStyle: 'solid', boxShadow: 'none' }}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'var(--color-primary)', color: 'var(--color-on-primary)', display: 'flex' }}>
                <Printer className="w-5 h-5" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--color-on-surface)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                  Integração com Maquininhas e Impressoras Térmicas
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-outline)', fontSize: '0.75rem' }}>
                  Suporte nativo a protocolos ESC/POS, bobinas de 80mm/58mm e maquininhas Smart POS Android/Windows.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669' }}>
                {printerStatusMessage}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'var(--color-outline-variant)', opacity: 0.5 }} />

          {/* Config Controls */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-on-surface)', mb: 1, fontSize: '0.75rem' }}>Largura do Papel Térmico</Typography>
              <ToggleButtonGroup
                value={paperWidth}
                exclusive
                onChange={(_, val) => val && setPaperWidth(val)}
                aria-label="Largura do Papel Térmico"
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': { py: 1, textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderColor: 'var(--color-outline-variant)' },
                  '& .Mui-selected': { bgcolor: 'var(--color-primary) !important', color: 'var(--color-on-primary) !important' }
                }}
              >
                <ToggleButton value="80mm" aria-label="80mm (Padrão Cozinha)">80mm (Padrão)</ToggleButton>
                <ToggleButton value="58mm" aria-label="58mm (Maquininha POS)">58mm (POS)</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-on-surface)', mb: 1, fontSize: '0.75rem' }}>Via da Impressão</Typography>
              <ToggleButtonGroup
                value={receiptType}
                exclusive
                onChange={(_, val) => val && setReceiptType(val)}
                aria-label="Via da Impressão"
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': { py: 1, textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderColor: 'var(--color-outline-variant)' },
                  '& .Mui-selected': { bgcolor: 'var(--color-primary) !important', color: 'var(--color-on-primary) !important' }
                }}
              >
                <ToggleButton value="cozinha" aria-label="Via Cozinha">👨‍🍳 Cozinha</ToggleButton>
                <ToggleButton value="cliente" aria-label="Via Cliente / Balcão">🛍️ Cliente/Balcão</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-on-surface)', mb: 1, fontSize: '0.75rem' }}>Protocolo de Comunicação</Typography>
              <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-outline-variant)' } }}>
                <Select
                  value={printerProtocol}
                  onChange={(e) => {
                    const proto = e.target.value as any;
                    setPrinterProtocol(proto);
                    if (proto === 'escpos') setPrinterStatusMessage('Protocolo ESC/POS ativado via Spooler local');
                    else if (proto === 'usb') setPrinterStatusMessage('Conectado via WebUSB / Porta Serial COM');
                    else if (proto === 'bluetooth') setPrinterStatusMessage('Conectado via Bluetooth POS');
                    else setPrinterStatusMessage('Pronta para impressão (Driver do Sistema / Spooler)');
                  }}
                  sx={{ bgcolor: 'var(--color-surface-container-low)', fontWeight: 700, fontSize: '0.75rem', borderRadius: 2 }}
                  inputProps={{ 'aria-label': 'Protocolo de Comunicação' }}
                >
                  <MenuItem value="system" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>🖨️ Driver de Spooler do Sistema (Geral)</MenuItem>
                  <MenuItem value="escpos" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>⚡ ESC/POS Direto (USB / Serial RAW)</MenuItem>
                  <MenuItem value="bluetooth" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>📱 Bluetooth (Maquininhas Smart POS)</MenuItem>
                  <MenuItem value="usb" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>🔌 WebUSB Direct (Porta COM / POS)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'var(--color-outline-variant)', opacity: 0.5 }} />

          {/* Test Printing Trigger */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'var(--color-outline)', fontWeight: 500, fontSize: '0.875rem' }}>
              💡 As comandas são impressas em mono com suporte a caracteres acentuados, separador serrilhado e corte automático ESC/POS.
            </Typography>

            <Button
              variant="contained"
              onClick={() => {
                onPrintOrder({
                  id: 'TESTE-999',
                  cliente_nome: 'TESTE DE IMPRESSORA TÉRMICA',
                  cliente_telefone: '(11) 99999-0000',
                  tipo_entrega: 'retirada',
                  data_agendada: 'Hoje',
                  horario_agendado: 'Imediato',
                  status: 'em_preparo',
                  itens: [
                    { id: 9991, nomeProduto: 'Bolo de Pote Ninho com Nutella', quantidade: 2, preco_unitario: 22.0 },
                    { id: 9992, nomeProduto: 'Caixa de Brigadeiros Gourmet (6un)', quantidade: 1, preco_unitario: 38.0 }
                  ],
                  total: 82.0,
                  created_at: new Date().toISOString()
                } as any);
              }}
              startIcon={<Printer className="w-4 h-4" />}
              sx={{
                bgcolor: 'var(--color-surface-container-high)',
                color: 'var(--color-on-surface)',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 3,
                boxShadow: 'none',
                px: 3,
                py: 1,
                '&:hover': { bgcolor: 'var(--color-surface-container-highest)', boxShadow: 'none' },
                '& .MuiButton-startIcon': { color: 'var(--color-primary)' }
              }}
            >
              Testar Impressão de Exemplo
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Production Queue List */}
      <Card sx={{ borderRadius: 4, bgcolor: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)', borderWidth: 1, borderStyle: 'solid', boxShadow: 'none' }}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--color-on-surface)', fontSize: '1rem' }}>
              Fila de Produção da Confeitaria ({orders.length} pedidos)
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-outline)', fontSize: '0.75rem' }}>
              Selecione qualquer pedido para enviar a comanda direto para a bancada da cozinha ou balcão.
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            {orders.map((o) => (
              <Card key={o.id} sx={{ borderRadius: 4, bgcolor: 'var(--color-surface-container-low)', borderColor: 'var(--color-outline-variant)', borderWidth: 1, borderStyle: 'solid', boxShadow: 'none' }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'var(--color-primary)', fontSize: '0.875rem' }}>
                      PEDIDO #{o.id}
                    </Typography>
                    <Chip
                      label={o.status.toUpperCase()}
                      size="small"
                      sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}
                    />
                  </Box>

                  <Box sx={{ fontSize: '0.75rem', color: 'var(--color-on-surface)', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}><strong>Cliente:</strong> {o.cliente_nome} ({o.cliente_telefone})</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}><strong>Agendado:</strong> {o.data_agendada} às {o.horario_agendado}</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}><strong>Tipo:</strong> {o.tipo_entrega.toUpperCase()}</Typography>
                  </Box>

                  <Box sx={{ p: 1.5, bgcolor: 'var(--color-surface-container-lowest)', borderRadius: 2, border: '1px solid var(--color-outline-variant)', fontSize: '0.75rem', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {o.itens.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.quantidade}x {item.nomeProduto}</span>
                        <span>R$ {(item.preco_unitario * item.quantidade).toFixed(2)}</span>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mt: 1 }}>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setReceiptType('cozinha');
                        onPrintOrder(o);
                      }}
                      startIcon={<Printer className="w-4 h-4" />}
                      sx={{
                        bgcolor: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        borderRadius: 3,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: 'var(--color-primary)', opacity: 0.9, boxShadow: 'none' }
                      }}
                    >
                      Comanda Cozinha
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setReceiptType('cliente');
                        onPrintOrder(o);
                      }}
                      startIcon={<ShoppingBag className="w-4 h-4" />}
                      sx={{
                        bgcolor: 'var(--color-secondary)',
                        color: 'var(--color-on-secondary)',
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        borderRadius: 3,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: 'var(--color-secondary)', opacity: 0.9, boxShadow: 'none' }
                      }}
                    >
                      Via do Cliente
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>

    </Box>
  );
};
