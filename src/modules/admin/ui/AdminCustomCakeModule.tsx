import React, { useState } from 'react';
import { CustomCakeConfig } from '@/src/core/types/index';
import { Box, Typography, Button, TextField, IconButton, Grid, Paper, Divider } from '@mui/material';
import { Plus, Trash2, Save, Cake, Sparkles } from 'lucide-react';

interface AdminCustomCakeModuleProps {
  config: CustomCakeConfig;
  onUpdateConfig: (newConfig: CustomCakeConfig) => void;
}

export function AdminCustomCakeModule({ config, onUpdateConfig }: AdminCustomCakeModuleProps) {
  const [localConfig, setLocalConfig] = useState<CustomCakeConfig>(config);

  const handleUpdateItem = (category: keyof CustomCakeConfig, index: number, field: 'label' | 'preco_base' | 'preco_adicional', value: string) => {
    const updated = { ...localConfig };
    updated[category] = [...updated[category]];
    updated[category][index] = {
      ...updated[category][index],
      [field]: field !== 'label' ? Number(value) || 0 : value
    };
    setLocalConfig(updated);
  };

  const handleAddItem = (category: keyof CustomCakeConfig) => {
    const updated = { ...localConfig };
    updated[category] = [...updated[category], { id: `c_${Date.now()}`, label: 'Novo Item', preco_adicional: 0 }];
    setLocalConfig(updated);
  };

  const handleRemoveItem = (category: keyof CustomCakeConfig, index: number) => {
    const updated = { ...localConfig };
    updated[category] = updated[category].filter((_, i) => i !== index);
    setLocalConfig(updated);
  };

  const handleSave = () => {
    onUpdateConfig(localConfig);
  };

  const renderSection = (title: string, category: keyof CustomCakeConfig) => (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'surfaceContainerLow', border: '1px solid', borderColor: 'outlineVariant' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Cake className="w-5 h-5 text-(--color-primary)" />
          {title}
        </Typography>
        <IconButton size="small" onClick={() => handleAddItem(category)} sx={{ bgcolor: 'surfaceContainerHigh', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}>
          <Plus className="w-4 h-4" />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {localConfig[category].map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'surfaceContainerLowest', p: 2, borderRadius: 3, border: '1px solid', borderColor: 'outlineVariant' }}>
            <TextField
              size="small"
              label="Nome da Opção"
              value={item.label || ''}
              onChange={(e) => handleUpdateItem(category, index, 'label', e.target.value)}
              sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              size="small"
              label="Valor (R$)"
              type="number"
              value={category === 'tamanhos' ? (item.preco_base || 0) : (item.preco_adicional || 0)}
              onChange={(e) => handleUpdateItem(category, index, category === 'tamanhos' ? 'preco_base' : 'preco_adicional', e.target.value)}
              sx={{ width: 120, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <IconButton size="small" color="error" onClick={() => handleRemoveItem(category, index)} sx={{ bgcolor: 'error.light', '&:hover': { bgcolor: 'error.main', color: 'white' } }}>
              <Trash2 className="w-4 h-4" />
            </IconButton>
          </Box>
        ))}
        {localConfig[category].length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            Nenhuma opção cadastrada.
          </Typography>
        )}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, animation: 'fadeIn 0.3s ease-out' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'black', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Sparkles className="w-6 h-6 text-(--color-primary)" />
            Configurador de Bolos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 600 }}>
            Gerencie as opções de tamanho, massas, recheios e coberturas oferecidas no construtor de bolos customizados para os clientes.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<Save className="w-4 h-4" />}
          sx={{ borderRadius: 3, fontWeight: 'bold', px: 4, py: 1.5, boxShadow: 'none' }}
        >
          Salvar Alterações
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          {renderSection('Tamanhos e Porções', 'tamanhos')}
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          {renderSection('Opções de Massa', 'massas')}
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          {renderSection('Recheios Disponíveis', 'recheios')}
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          {renderSection('Coberturas e Acabamentos', 'coberturas')}
        </Grid>
      </Grid>
    </Box>
  );
}
