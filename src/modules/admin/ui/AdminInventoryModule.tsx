import React, { useState } from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Box, Button as MuiButton, IconButton } from '@mui/material';
import { Package, Plus, Trash2, Edit, AlertCircle, ChefHat } from 'lucide-react';
import type { Product, Ingredient } from '@/src/core/types/index';

interface AdminInventoryModuleProps {
  products: Product[];
  onAddProduct: () => void; // Trigger modal
  onUpdateStock: (id: number | string, newStock: number) => void;
  onDeleteProduct: (id: number | string) => void;
  // Raw materials
  ingredients: Ingredient[];
  onAddIngredient: (ing: Omit<Ingredient, 'id'>) => void;
  onUpdateIngredientStock: (id: string, newStock: number) => void;
  onDeleteIngredient: (id: string) => void;
}

export const AdminInventoryModule: React.FC<AdminInventoryModuleProps> = ({
  products,
  onAddProduct,
  onUpdateStock,
  onDeleteProduct,
  ingredients,
  onAddIngredient,
  onUpdateIngredientStock,
  onDeleteIngredient
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'ingredients'>('products');

  // Dummy form states for quick ingredient add
  const [ingNome, setIngNome] = useState('');
  const [ingUnidade, setIngUnidade] = useState<'g' | 'ml' | 'un'>('g');
  const [ingCusto, setIngCusto] = useState('');
  const [ingEstoque, setIngEstoque] = useState('');

  const handleAddIng = (e: React.FormEvent) => {
    e.preventDefault();
    onAddIngredient({
      nome: ingNome,
      unidadeMedida: ingUnidade,
      custoPorUnidade: parseFloat(ingCusto),
      estoqueAtual: parseFloat(ingEstoque),
      estoqueMinimo: 1000 // default 1kg/1L
    });
    setIngNome(''); setIngCusto(''); setIngEstoque('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="font-bold text-lg text-[var(--color-on-surface)] flex items-center gap-2">
          <Package className="w-5 h-5 text-[var(--color-primary)]" />
          Estoque & Catálogo
        </h3>

        <div className="flex bg-[var(--color-surface-container)] p-1.5 rounded-2xl border border-[var(--color-outline-variant)]/30 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('products')}
            className={`px-4 py-2 rounded-xl transition-all ${activeSubTab === 'products' ? 'bg-[var(--color-primary)] text-white shadow-xs' : 'text-[var(--color-on-surface-variant)]'}`}
          >
            Catálogo Final
          </button>
          <button
            onClick={() => setActiveSubTab('ingredients')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${activeSubTab === 'ingredients' ? 'bg-amber-500 text-white shadow-xs' : 'text-[var(--color-on-surface-variant)]'}`}
          >
            <ChefHat className="w-4 h-4" />
            Insumos & Ficha Técnica
          </button>
        </div>
      </div>

      {activeSubTab === 'products' && (
        <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex justify-end">
            <button onClick={onAddProduct} className="px-4 py-2.5 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs flex items-center space-x-2 shadow-xs">
              <Plus className="w-4 h-4" />
              <span>Novo Doce no Catálogo</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <Card key={p.id} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 4, bgcolor: 'surfaceContainerLowest', border: '1px solid', borderColor: 'outlineVariant' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={p.image_url}
                  alt={p.nome}
                  sx={{ objectFit: 'cover', height: 160 }}
                />
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography gutterBottom variant="subtitle1" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                    {p.nome}
                  </Typography>
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold', mb: 2 }}>
                    R$ {p.preco.toFixed(2).replace('.', ',')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'surfaceContainerHigh', p: 1, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      ESTOQUE
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MuiButton size="small" variant="outlined" color="primary" onClick={() => onUpdateStock(p.id, Math.max(0, p.estoque - 1))} sx={{ minWidth: 32, p: 0.5 }}>-1</MuiButton>
                      <Typography variant="body2" sx={{ fontWeight: 'black', minWidth: 32, textAlign: 'center' }}>
                        {p.estoque}
                      </Typography>
                      <MuiButton size="small" variant="contained" color="primary" disableElevation onClick={() => onUpdateStock(p.id, p.estoque + 1)} sx={{ minWidth: 32, p: 0.5 }}>+1</MuiButton>
                      <MuiButton size="small" variant="contained" color="secondary" disableElevation onClick={() => onUpdateStock(p.id, p.estoque + 10)} sx={{ minWidth: 40, p: 0.5, ml: 0.5 }}>+10</MuiButton>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, pt: 0 }}>
                  <IconButton size="small" color="primary" sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}>
                    <Edit className="w-4 h-4" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onDeleteProduct(p.id)} sx={{ bgcolor: 'error.light', '&:hover': { bgcolor: 'error.main', color: 'white' } }}>
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'ingredients' && (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

          {/* Add Ingredient Form */}
          <form onSubmit={handleAddIng} className="p-4 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 rounded-3xl grid grid-cols-1 md:grid-cols-5 gap-3 items-end shadow-xs">
            <div className="md:col-span-2">
              <label className="text-sm font-bold uppercase text-[var(--color-outline)] mb-1 block">Insumo (Matéria-prima)</label>
              <input required value={ingNome} onChange={e => setIngNome(e.target.value)} placeholder="Ex: Leite Moça..." className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-high)] text-xs" />
            </div>
            <div>
              <label className="text-sm font-bold uppercase text-[var(--color-outline)] mb-1 block">Unidade</label>
              <select value={ingUnidade} onChange={e => setIngUnidade(e.target.value as any)} className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-high)] text-xs font-bold">
                <option value="g">Gramas (g)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="un">Unidade (un)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold uppercase text-[var(--color-outline)] mb-1 block">Custo (R$)</label>
              <input required type="number" step="0.01" value={ingCusto} onChange={e => setIngCusto(e.target.value)} placeholder="Ex: 8.50" className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-high)] text-xs" />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors">
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </form>

          {/* Ingredient List */}
          <div className="bg-[var(--color-surface-container-lowest)] rounded-3xl border border-[var(--color-outline-variant)]/30 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)]/20 text-sm uppercase font-bold text-[var(--color-outline)]">
                  <th className="py-3 px-4">Insumo</th>
                  <th className="py-3 px-4">Custo Un.</th>
                  <th className="py-3 px-4">Estoque Atual</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map(ing => {
                  const isLow = ing.estoqueAtual <= ing.estoqueMinimo;
                  return (
                    <tr key={ing.id} className="border-b border-[var(--color-outline-variant)]/10 hover:bg-[var(--color-surface-container-lowest)]/50 transition-colors">
                      <td className="py-3 px-4 font-bold flex items-center gap-2">
                        {isLow && <AlertCircle className="w-4 h-4 text-rose-500" />}
                        {ing.nome}
                      </td>
                      <td className="py-3 px-4">R$ {ing.custoPorUnidade.toFixed(2)} / {ing.unidadeMedida}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => onUpdateIngredientStock(ing.id, Math.max(0, ing.estoqueAtual - 100))} className="p-1 bg-[var(--color-surface-container-high)] rounded-md font-bold">-</button>
                          <span className={`w-16 text-center font-black ${isLow ? 'text-rose-500' : 'text-[var(--color-on-surface)]'}`}>
                            {ing.estoqueAtual} {ing.unidadeMedida}
                          </span>
                          <button onClick={() => onUpdateIngredientStock(ing.id, ing.estoqueAtual + 100)} className="p-1 bg-[var(--color-surface-container-high)] rounded-md font-bold">+</button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => onDeleteIngredient(ing.id)} className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {ingredients.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-[var(--color-outline)] font-bold italic">Nenhum insumo cadastrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};
