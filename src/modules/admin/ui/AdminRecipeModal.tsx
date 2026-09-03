import React, { useState, useEffect } from 'react';
import { Box, Typography, Modal, IconButton, TextField, Button, Grid, Divider, Chip, MenuItem, Select } from '@mui/material';
import { X, Save, AlertCircle, ChefHat, CheckCircle2 } from 'lucide-react';
import { Product, Ingredient, RecipeItem } from '@/src/core/types/index';
import { useRecipeCalculator } from '@/src/core/hooks/useRecipeCalculator';

interface AdminRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  ingredients: Ingredient[];
  onSave: (
    productId: string | number, 
    recipeItems: RecipeItem[],
    packagingCost: number,
    wastePercentage: number,
    targetMargin: number,
    suggestedPrice: number
  ) => void;
  onApplySuggestedPrice: (productId: string | number, newPrice: number) => void;
}

export const AdminRecipeModal: React.FC<AdminRecipeModalProps> = ({
  isOpen,
  onClose,
  product,
  ingredients,
  onSave,
  onApplySuggestedPrice
}) => {
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>(product.receita || []);
  const [packagingCost, setPackagingCost] = useState(product.packaging_cost || 0);
  const [wastePercentage, setWastePercentage] = useState(product.waste_percentage || 0);
  const [targetMargin, setTargetMargin] = useState(product.target_margin || 0);
  
  // New item state
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [newQuantity, setNewQuantity] = useState('');

  // Auto-sync if product changes
  useEffect(() => {
    if (isOpen) {
      setRecipeItems(product.receita || []);
      setPackagingCost(product.packaging_cost || 0);
      setWastePercentage(product.waste_percentage || 0);
      setTargetMargin(product.target_margin || 0);
    }
  }, [isOpen, product]);

  const {
    cmvBase,
    totalCost,
    suggestedPrice,
    realMargin,
    marginStatus
  } = useRecipeCalculator({
    recipeItems,
    ingredients,
    packagingCost,
    wastePercentage,
    targetMargin,
    currentSellingPrice: product.preco
  });

  const handleAddIngredient = () => {
    if (!selectedIngredient || !newQuantity) return;
    const ingId = selectedIngredient;
    const qty = parseFloat(newQuantity);
    
    setRecipeItems(prev => {
      const existing = prev.find(i => String(i.insumoId) === String(ingId));
      if (existing) {
        return prev.map(i => String(i.insumoId) === String(ingId) ? { ...i, quantidade: i.quantidade + qty } : i);
      }
      return [...prev, { insumoId: ingId, quantidade: qty }];
    });
    
    setSelectedIngredient('');
    setNewQuantity('');
  };

  const handleRemoveIngredient = (ingId: string) => {
    setRecipeItems(prev => prev.filter(i => String(i.insumoId) !== String(ingId)));
  };

  const handleSave = () => {
    onSave(product.id, recipeItems, packagingCost, wastePercentage, targetMargin, suggestedPrice);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={onClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ 
        bgcolor: 'surfaceContainerLowest', 
        width: '100%', 
        maxWidth: 800, 
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
            <Box sx={{ p: 1.5, bgcolor: 'primary.main', borderRadius: 2, color: 'primary.contrastText' }}>
              <ChefHat className="w-5 h-5" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Ficha Técnica & Precificação</Typography>
              <Typography variant="body2" color="text.secondary">{product.nome}</Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ bgcolor: 'surfaceContainerHigh' }}>
            <X className="w-5 h-5" />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 7 }}>
              {/* Recipe Items Section */}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, textTransform: 'uppercase', color: 'text.secondary' }}>
                Composição do Produto (BOM)
              </Typography>

              {/* Add New Ingredient */}
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Select
                  size="small"
                  value={selectedIngredient}
                  onChange={(e) => setSelectedIngredient(e.target.value)}
                  displayEmpty
                  sx={{ flexGrow: 1, borderRadius: 2 }}
                >
                  <MenuItem value="" disabled>Selecione um insumo...</MenuItem>
                  {ingredients.map(ing => (
                    <MenuItem key={ing.id} value={ing.id}>{ing.nome} ({ing.unidadeMedida})</MenuItem>
                  ))}
                </Select>
                <TextField 
                  size="small"
                  type="number"
                  placeholder="Qtd."
                  value={newQuantity}
                  onChange={e => setNewQuantity(e.target.value)}
                  sx={{ width: 100, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <Button variant="contained" onClick={handleAddIngredient} sx={{ borderRadius: 2, minWidth: 'auto', px: 3 }}>
                  Add
                </Button>
              </Box>

              {/* Current Ingredients List */}
              <Box sx={{ border: '1px solid', borderColor: 'outlineVariant', borderRadius: 3, overflow: 'hidden' }}>
                {recipeItems.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                    Nenhum insumo adicionado ainda.
                  </Box>
                ) : (
                  recipeItems.map((item, idx) => {
                    const ing = ingredients.find(i => String(i.id) === String(item.insumoId));
                    if (!ing) return null;
                    const itemCost = (ing.custoPorUnidade === 0 && ing.preco_embalagem && ing.tamanho_embalagem) 
                                      ? (ing.preco_embalagem / ing.tamanho_embalagem) * item.quantidade
                                      : ing.custoPorUnidade * item.quantidade;
                    
                    return (
                      <Box key={idx} sx={{ 
                        p: 2, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderBottom: idx === recipeItems.length - 1 ? 'none' : '1px solid',
                        borderColor: 'outlineVariant',
                        bgcolor: idx % 2 === 0 ? 'surfaceContainerLowest' : 'surfaceContainerLow'
                      }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{ing.nome}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.quantidade} {ing.unidadeMedida}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            R$ {itemCost.toFixed(2)}
                          </Typography>
                          <IconButton size="small" color="error" onClick={() => handleRemoveIngredient(ing.id)}>
                            <X className="w-4 h-4" />
                          </IconButton>
                        </Box>
                      </Box>
                    );
                  })
                )}
                
                {recipeItems.length > 0 && (
                  <Box sx={{ p: 2, bgcolor: 'surfaceContainerHigh', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Custo Base (CMV):</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'black', color: 'primary.main' }}>
                      R$ {cmvBase.toFixed(2)}
                    </Typography>
                  </Box>
                )}
              </Box>

            </Grid>
            
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, textTransform: 'uppercase', color: 'text.secondary' }}>
                Precificação & Margens
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField 
                  label="Custo Embalagem/Fixos (R$)" 
                  type="number" 
                  size="small"
                  value={packagingCost}
                  onChange={e => setPackagingCost(parseFloat(e.target.value) || 0)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField 
                  label="Taxa de Perdas (%)" 
                  type="number" 
                  size="small"
                  value={wastePercentage}
                  onChange={e => setWastePercentage(parseFloat(e.target.value) || 0)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField 
                  label="Margem Líquida Alvo (%)" 
                  type="number" 
                  size="small"
                  value={targetMargin}
                  onChange={e => setTargetMargin(parseFloat(e.target.value) || 0)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                <Divider />

                {/* Dashboard Metrics */}
                <Box sx={{ p: 2, bgcolor: 'surfaceContainerLow', borderRadius: 3, border: '1px solid', borderColor: 'outlineVariant' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Custo Total (c/ perdas):</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>R$ {totalCost.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Preço Venda Atual:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>R$ {product.preco.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Margem Real:</Typography>
                    <Chip 
                      label={`${realMargin.toFixed(1)}%`} 
                      size="small"
                      color={marginStatus === 'healthy' ? 'success' : marginStatus === 'warning' ? 'warning' : 'error'}
                      icon={marginStatus === 'healthy' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      sx={{ fontWeight: 'bold', height: 20 }}
                    />
                  </Box>

                  <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>PREÇO SUGERIDO (REVERSO)</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'black', color: 'primary.dark' }}>
                      R$ {suggestedPrice.toFixed(2)}
                    </Typography>
                    {product.preco !== suggestedPrice && (
                      <Button 
                        variant="contained" 
                        size="small" 
                        color="primary"
                        onClick={() => onApplySuggestedPrice(product.id, suggestedPrice)}
                        sx={{ mt: 1, borderRadius: 2, fontWeight: 'bold', boxShadow: 'none' }}
                      >
                        Aplicar Sugestão
                      </Button>
                    )}
                  </Box>

                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Footer */}
        <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'outlineVariant', display: 'flex', justifyContent: 'flex-end', gap: 2, bgcolor: 'surfaceContainerLowest' }}>
          <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2, fontWeight: 'bold', px: 4 }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave} startIcon={<Save className="w-4 h-4" />} sx={{ borderRadius: 2, fontWeight: 'bold', px: 4, boxShadow: 'none' }}>
            Salvar Ficha Técnica
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
