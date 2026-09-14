import React, { useState } from 'react';
import { CustomCakeConfig, CustomCakeOption } from '@/src/core/types/index';
import { 
  Box, Typography, Button, TextField, IconButton, Grid, Paper, 
  Divider, Accordion, AccordionSummary, AccordionDetails, Switch, 
  FormControlLabel, MenuItem, Select, Chip, OutlinedInput, InputLabel, FormControl
} from '@mui/material';
import { Plus, Trash, FloppyDisk, Cake, Sparkle, CaretDown, Star, WarningCircle, Drop } from '@phosphor-icons/react';

interface AdminCustomCakeModuleProps {
  config: CustomCakeConfig;
  onUpdateConfig: (newConfig: CustomCakeConfig) => void;
}

const ALLERGEN_TAGS = ['Contém Glúten', 'Zero Lactose', 'Vegano', 'Contém Nozes', 'Amendoim'];

export function AdminCustomCakeModule({ config, onUpdateConfig }: AdminCustomCakeModuleProps) {
  const [localConfig, setLocalConfig] = useState<CustomCakeConfig>({
    tamanhos: config.tamanhos || [],
    massas: config.massas || [],
    recheios: config.recheios || [],
    coberturas: config.coberturas || [],
    extras: config.extras || []
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateItem = (category: keyof CustomCakeConfig, index: number, field: keyof CustomCakeOption, value: any) => {
    const updated = { ...localConfig };
    updated[category] = [...(updated[category] as CustomCakeOption[])];
    updated[category]![index] = {
      ...updated[category]![index],
      [field]: value
    };
    setLocalConfig(updated);
  };

  const handleAddItem = (category: keyof CustomCakeConfig) => {
    const updated = { ...localConfig };
    const arr = updated[category] as CustomCakeOption[] || [];
    updated[category] = [...arr, { 
      id: `c_${Date.now()}`, 
      label: 'Novo Item', 
      preco_adicional: 0,
      multiplicador_preco: category === 'tamanhos' ? 1 : undefined,
      max_recheios: category === 'tamanhos' ? 2 : undefined
    }];
    setLocalConfig(updated);
  };

  const handleRemoveItem = (category: keyof CustomCakeConfig, index: number) => {
    const updated = { ...localConfig };
    updated[category] = (updated[category] as CustomCakeOption[]).filter((_, i) => i !== index);
    setLocalConfig(updated);
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simula tempo de requisição para preencher o Abismo de Avaliação
    setTimeout(() => {
      onUpdateConfig(localConfig);
      setIsSaving(false);
    }, 600);
  };

  const renderSection = (
    title: string, 
    category: keyof CustomCakeConfig, 
    icon: React.ReactNode, 
    description: string
  ) => {
    const items = (localConfig[category] as CustomCakeOption[]) || [];

    return (
      <Accordion 
        defaultExpanded={category === 'tamanhos'}
        sx={{ 
          mb: 2, 
          borderRadius: '16px !important', 
          '&:before': { display: 'none' },
          bgcolor: 'surfaceContainerLow',
          border: '1px solid',
          borderColor: 'outlineVariant'
        }}
        elevation={0}
      >
        <AccordionSummary expandIcon={<CaretDown className="w-5 h-5" />} sx={{ px: 3, py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
              {icon}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{title}</Typography>
              <Typography variant="body2" color="text.secondary">{description}</Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {items.map((item, index) => (
              <Paper key={item.id} elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'surfaceContainerLowest', border: '1px solid', borderColor: 'outlineVariant' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Opção {index + 1}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => handleRemoveItem(category, index)} sx={{ bgcolor: 'error.light', '&:hover': { bgcolor: 'error.main', color: 'white' } }}>
                    <Trash className="w-4 h-4" />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: category === 'tamanhos' ? 4 : 6 }}>
                    <TextField
                      fullWidth size="small" label="Nome da Opção" value={item.label || ''}
                      onChange={(e) => handleUpdateItem(category, index, 'label', e.target.value)}
                    />
                  </Grid>

                  {category === 'tamanhos' ? (
                    <>
                      <Grid size={{ xs: 6, md: 4 }}>
                        <TextField
                          fullWidth size="small" label="Preço Base (R$)" type="number" value={item.preco_base || 0}
                          onChange={(e) => handleUpdateItem(category, index, 'preco_base', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 4 }}>
                        <TextField
                          fullWidth size="small" label="Multiplicador Preço Premium (ex: 1.5)" type="number" slotProps={{ htmlInput: { step: "0.1" } }} value={item.multiplicador_preco || 1}
                          onChange={(e) => handleUpdateItem(category, index, 'multiplicador_preco', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <TextField
                          fullWidth size="small" label="Máx. Recheios" type="number" value={item.max_recheios || 1}
                          onChange={(e) => handleUpdateItem(category, index, 'max_recheios', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <TextField
                          fullWidth size="small" label="Rendimento (Fatias)" type="number" value={item.fatias || ''}
                          onChange={(e) => handleUpdateItem(category, index, 'fatias', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <TextField
                          fullWidth size="small" label="Peso Estimado (kg)" type="number" slotProps={{ htmlInput: { step: "0.1" } }} value={item.peso_estimado_kg || ''}
                          onChange={(e) => handleUpdateItem(category, index, 'peso_estimado_kg', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <TextField
                          fullWidth size="small" label="Antecedência Mín. (Dias)" type="number" value={item.dias_antecedencia || 1}
                          onChange={(e) => handleUpdateItem(category, index, 'dias_antecedencia', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth size="small" label="Limite Mensagem (Caracteres)" type="number" value={item.limite_caracteres || 20}
                          onChange={(e) => handleUpdateItem(category, index, 'limite_caracteres', Number(e.target.value))}
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid size={{ xs: 12, md: category === 'coberturas' ? 4 : 6 }}>
                        <TextField
                          fullWidth size="small" label="Preço Adicional (R$)" type="number" value={item.preco_adicional || 0}
                          onChange={(e) => handleUpdateItem(category, index, 'preco_adicional', Number(e.target.value))}
                          helperText="Sofre efeito do multiplicador de tamanho"
                        />
                      </Grid>
                      
                      {category === 'coberturas' && (
                        <Grid size={{ xs: 12, md: 2 }}>
                          <TextField
                            fullWidth size="small" label="Cor (Hex)" type="color" value={item.color_hex || '#FFFFFF'}
                            onChange={(e) => handleUpdateItem(category, index, 'color_hex', e.target.value)}
                          />
                        </Grid>
                      )}

                      {(category === 'massas' || category === 'recheios') && (
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Avisos Alergênicos</InputLabel>
                            <Select
                              multiple
                              value={item.tags_alergenicos || []}
                              onChange={(e) => handleUpdateItem(category, index, 'tags_alergenicos', e.target.value)}
                              input={<OutlinedInput label="Avisos Alergênicos" />}
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {(selected as string[]).map((value) => (
                                    <Chip key={value} label={value} size="small" color="error" variant="outlined" />
                                  ))}
                                </Box>
                              )}
                            >
                              {ALLERGEN_TAGS.map((name) => (
                                <MenuItem key={name} value={name}>{name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      )}

                      {category !== 'extras' && category !== 'coberturas' && (
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={item.is_premium || false} 
                                onChange={(e) => handleUpdateItem(category, index, 'is_premium', e.target.checked)} 
                                color="warning"
                              />
                            }
                            label={<Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Star className="text-yellow-500" /> Ingrediente Premium</Typography>}
                          />
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<Plus className="w-4 h-4" />}
              onClick={() => handleAddItem(category)}
              sx={{ borderStyle: 'dashed', borderWidth: 2, borderRadius: 3, py: 2 }}
            >
              Adicionar nova opção
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, animation: 'fadeIn 0.3s ease-out', pb: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'black', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Sparkle className="w-8 h-8 text-(--color-primary)" />
            Configurador de Bolos
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 600 }}>
            Painel avançado de engenharia de bolos. Defina regras precisas de preparo, multiplicadores de lucro e avisos alérgicos.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          startIcon={isSaving ? <Spinner className="w-5 h-5 animate-spin" /> : <FloppyDisk className="w-5 h-5" />}
          size="large"
          sx={{ borderRadius: 3, fontWeight: 'black', px: 4, boxShadow: '0 8px 16px rgba(220, 160, 145, 0.4)' }}
        >
          {isSaving ? 'Salvando...' : 'Salvar Arquitetura'}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {renderSection(
          '1. Tamanhos e Estrutura', 
          'tamanhos', 
          <Cake className="w-6 h-6" />, 
          'Base da precificação, regras de limite de recheios e tempo de antecedência.'
        )}
        
        {renderSection(
          '2. Massas Disponíveis', 
          'massas', 
          <Box component="span" sx={{ fontSize: '20px' }}>🍞</Box>, 
          'Tipos de massa. Marque como premium para destacar no cardápio.'
        )}
        
        {renderSection(
          '3. Recheios Premium', 
          'recheios', 
          <Drop className="w-6 h-6" />, 
          'O valor adicional será multiplicado pelo fator de tamanho escolhido pelo cliente.'
        )}
        
        {renderSection(
          '4. Coberturas e Paleta', 
          'coberturas', 
          <Box component="span" sx={{ fontSize: '20px' }}>🎨</Box>, 
          'Selecione a cor visual (hexadecimal) para o cliente interagir na montagem.'
        )}

        {renderSection(
          '5. Adicionais de Upsell (Extras)', 
          'extras', 
          <Sparkle className="w-6 h-6" />, 
          'Itens lucrativos adicionados com 1 clique (Velas, Topper, Folha de Ouro).'
        )}
      </Box>
    </Box>
  );
}
