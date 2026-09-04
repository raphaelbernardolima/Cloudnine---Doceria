import React, { useState, useEffect } from 'react';
import { Box, Typography, Modal, IconButton, TextField, Button, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { X, Save, DollarSign, TrendingUp } from 'lucide-react';
import { Ingredient } from '@/src/core/types/index';

interface AdminQuickPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
  onSavePrices: (updatedIngredients: Partial<Ingredient>[]) => void;
}

export const AdminQuickPriceModal: React.FC<AdminQuickPriceModalProps> = ({
  isOpen,
  onClose,
  ingredients,
  onSavePrices
}) => {
  const [editedPrices, setEditedPrices] = useState<Record<string, { preco_embalagem: number; tamanho_embalagem: number }>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, { preco_embalagem: number; tamanho_embalagem: number }> = {};
      ingredients.forEach(i => {
        initial[i.id] = {
          preco_embalagem: i.preco_embalagem || (i.custoPorUnidade * (i.tamanho_embalagem || 1)),
          tamanho_embalagem: i.tamanho_embalagem || 1
        };
      });
      setEditedPrices(initial);
      setSearch('');
    }
  }, [isOpen, ingredients]);

  const handlePriceChange = (id: string, field: 'preco_embalagem' | 'tamanho_embalagem', value: string) => {
    const num = parseFloat(value) || 0;
    setEditedPrices(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: num
      }
    }));
  };

  const handleSave = () => {
    const updates = Object.keys(editedPrices).map(id => ({
      id,
      preco_embalagem: editedPrices[id].preco_embalagem,
      tamanho_embalagem: editedPrices[id].tamanho_embalagem,
      custoPorUnidade: editedPrices[id].preco_embalagem / (editedPrices[id].tamanho_embalagem || 1)
    }));
    
    // Filtra apenas os que mudaram
    const changed = updates.filter(u => {
      const orig = ingredients.find(i => String(i.id) === String(u.id));
      if (!orig) return false;
      return orig.preco_embalagem !== u.preco_embalagem || orig.tamanho_embalagem !== u.tamanho_embalagem;
    });

    onSavePrices(changed);
    onClose();
  };

  const filtered = ingredients.filter(i => i.nome.toLowerCase().includes(search.toLowerCase()));

  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={onClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ 
        bgcolor: 'surfaceContainerLowest', 
        width: '100%', 
        maxWidth: 700, 
        maxHeight: '90vh',
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        outline: 'none',
        boxShadow: 24,
      }}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'outlineVariant', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'surfaceContainerLow' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: 'secondary.main', borderRadius: 2, color: 'secondary.contrastText' }}>
              <TrendingUp className="w-5 h-5" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Atualização Rápida de Preços</Typography>
              <Typography variant="body2" color="text.secondary">Ajuste os valores pagos no mercado hoje para recálculo automático.</Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ bgcolor: 'surfaceContainerHigh' }}>
            <X className="w-5 h-5" />
          </IconButton>
        </Box>

        {/* Search */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'outlineVariant' }}>
          <TextField 
            fullWidth
            size="small"
            placeholder="Buscar insumo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>

        {/* Body */}
        <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 2 }}>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'outlineVariant', borderRadius: 3 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'surfaceContainerLow' }}>Insumo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'surfaceContainerLow' }}>Tamanho Emb.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'surfaceContainerLow' }}>Preço Emb. (R$)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'surfaceContainerLow' }}>Custo Un. Atualizado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(ing => {
                  const state = editedPrices[ing.id];
                  if (!state) return null;
                  const currentUnitCost = state.tamanho_embalagem > 0 ? (state.preco_embalagem / state.tamanho_embalagem) : 0;
                  
                  return (
                    <TableRow key={ing.id} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>{ing.nome} ({ing.unidadeMedida})</TableCell>
                      <TableCell>
                        <TextField 
                          size="small"
                          type="number"
                          value={state.tamanho_embalagem}
                          onChange={e => handlePriceChange(ing.id, 'tamanho_embalagem', e.target.value)}
                          sx={{ width: 100, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField 
                          size="small"
                          type="number"
                          value={state.preco_embalagem}
                          onChange={e => handlePriceChange(ing.id, 'preco_embalagem', e.target.value)}
                          slotProps={{
                            input: {
                              startAdornment: <InputAdornment position="start"><DollarSign className="w-3 h-3"/></InputAdornment>,
                            }
                          }}
                          sx={{ width: 120, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'black', color: 'primary.main' }}>
                          R$ {currentUnitCost.toFixed(4)} / {ing.unidadeMedida}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Footer */}
        <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'outlineVariant', display: 'flex', justifyContent: 'flex-end', gap: 2, bgcolor: 'surfaceContainerLowest' }}>
          <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2, fontWeight: 'bold', px: 4 }}>
            Cancelar
          </Button>
          <Button variant="contained" color="secondary" onClick={handleSave} startIcon={<Save className="w-4 h-4" />} sx={{ borderRadius: 2, fontWeight: 'bold', px: 4, boxShadow: 'none' }}>
            Atualizar Custos
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
