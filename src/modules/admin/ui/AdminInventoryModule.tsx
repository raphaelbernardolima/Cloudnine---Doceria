import React, { useState } from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Box, Button as MuiButton, IconButton } from '@mui/material';
import { Package, Plus, Trash, Pencil, WarningCircle, CookingPot, Receipt, Tag } from '@phosphor-icons/react';
import { formatCurrency } from '@/src/core/utils/formatters';
import type { Product, Ingredient, RecipeItem } from '@/src/core/types/index';
import { useDataStore } from '@/src/core/store/useDataStore';
import { AdminRecipeModal } from './AdminRecipeModal';
import { AdminQuickPriceModal } from './AdminQuickPriceModal';

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
  const { categories, setCategories } = useDataStore();
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'ingredients' | 'categories'>('products');
  const [selectedProductForRecipe, setSelectedProductForRecipe] = useState<Product | null>(null);
  const [showQuickPriceModal, setShowQuickPriceModal] = useState(false);

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

  const [newCat, setNewCat] = useState('');
  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCat.trim() && !categories.includes(newCat.trim())) {
      setCategories([...categories, newCat.trim()]);
      setNewCat('');
    }
  };
  const handleRemoveCat = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="font-bold text-lg text-(--color-on-surface) flex items-center gap-2">
          <Package className="w-5 h-5 text-(--color-primary)" />
          Estoque & Catálogo
        </h3>

        <div className="flex bg-(--color-surface-container) p-1.5 rounded-2xl border border-(--color-outline-variant)/30 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('products')}
            className={`px-4 py-2 rounded-xl transition-all ${activeSubTab === 'products' ? 'bg-(--color-primary) text-white shadow-xs' : 'text-(--color-on-surface-variant)'}`}
          >
            Catálogo Final
          </button>
          <button
            onClick={() => setActiveSubTab('ingredients')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${activeSubTab === 'ingredients' ? 'bg-amber-500 text-white shadow-xs' : 'text-(--color-on-surface-variant)'}`}
          >
            <CookingPot className="w-4 h-4" />
            Insumos & Ficha Técnica
          </button>
          <button
            onClick={() => setActiveSubTab('categories')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${activeSubTab === 'categories' ? 'bg-purple-500 text-white shadow-xs' : 'text-(--color-on-surface-variant)'}`}
          >
            <Tag className="w-4 h-4" />
            Categorias
          </button>
        </div>
      </div>

      {activeSubTab === 'categories' && (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-(--color-surface-container-lowest) p-6 rounded-3xl border border-(--color-outline-variant)/30 shadow-xs">
            <h4 className="font-bold text-base text-(--color-on-surface) mb-4">Adicionar Nova Categoria</h4>
            <form onSubmit={handleAddCat} className="flex gap-2">
              <input
                type="text"
                required
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="Ex: Brownies"
                className="flex-1 p-3 rounded-xl bg-(--color-surface-container-low) border border-(--color-outline-variant)/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button type="submit" className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </form>
          </div>
          
          <div className="bg-(--color-surface-container-lowest) p-6 rounded-3xl border border-(--color-outline-variant)/30 shadow-xs">
            <h4 className="font-bold text-base text-(--color-on-surface) mb-4">Categorias Atuais</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <div key={c} className="flex items-center gap-2 bg-(--color-surface-container-low) border border-(--color-outline-variant)/40 px-3 py-1.5 rounded-full text-sm font-medium text-(--color-on-surface)">
                  {c}
                  {c !== 'Todos' && (
                    <button onClick={() => handleRemoveCat(c)} className="text-rose-500 hover:bg-rose-100 p-1 rounded-full transition-colors">
                      <Trash className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-(--color-on-surface-variant) mt-4">
              A categoria "Todos" não pode ser removida pois é a visualização padrão da vitrine.
            </p>
          </div>
        </div>
      )}

      {activeSubTab === 'products' && (
        <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex justify-end">
            <button onClick={onAddProduct} className="px-4 py-2.5 rounded-2xl bg-(--color-primary) text-(--color-on-primary) font-bold text-xs flex items-center space-x-2 shadow-xs">
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
                  <div className="flex items-start justify-between">
                    <Typography gutterBottom variant="subtitle1" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                      {p.nome}
                    </Typography>
                    {p.estoque <= 5 && (
                      <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 rounded-md text-[10px] font-black flex items-center shrink-0 ml-2">
                        <WarningCircle className="w-3 h-3 mr-1" /> Baixo
                      </span>
                    )}
                  </div>
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {formatCurrency(p.preco)}
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
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" color="primary" sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}>
                      <Pencil className="w-4 h-4" />
                    </IconButton>
                    <IconButton size="small" color="secondary" onClick={() => setSelectedProductForRecipe(p)} sx={{ bgcolor: 'secondary.light', '&:hover': { bgcolor: 'secondary.main', color: 'white' } }} title="Ficha Técnica">
                      <Receipt className="w-4 h-4" />
                    </IconButton>
                  </Box>
                  <IconButton aria-label="Excluir produto" size="small" color="error" onClick={() => { if(window.confirm('Tem certeza que deseja excluir este produto?')) onDeleteProduct(p.id) }} sx={{ bgcolor: 'error.light', '&:hover': { bgcolor: 'error.main', color: 'white' } }}>
                    <Trash className="w-4 h-4" />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'ingredients' && (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">

          <div className="flex justify-end">
            <MuiButton
              variant="contained"
              color="secondary"
              onClick={() => setShowQuickPriceModal(true)}
              sx={{ borderRadius: 2, fontWeight: 'bold', boxShadow: 'none' }}
            >
              Atualização Rápida de Preços
            </MuiButton>
          </div>

          {/* Add Ingredient Form */}
          <form onSubmit={handleAddIng} className="p-4 bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/30 rounded-3xl grid grid-cols-1 md:grid-cols-5 gap-3 items-end shadow-xs">
            <div className="md:col-span-2">
              <label className="text-sm font-bold uppercase text-(--color-outline) mb-1 block">Insumo (Matéria-prima)</label>
              <input required value={ingNome} onChange={e => setIngNome(e.target.value)} placeholder="Ex: Leite Moça..." className="w-full p-2.5 rounded-xl bg-(--color-surface-container-high) text-xs" />
            </div>
            <div>
              <label className="text-sm font-bold uppercase text-(--color-outline) mb-1 block">Unidade</label>
              <select value={ingUnidade} onChange={e => setIngUnidade(e.target.value as any)} className="w-full p-2.5 rounded-xl bg-(--color-surface-container-high) text-xs font-bold">
                <option value="g">Gramas (g)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="un">Unidade (un)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold uppercase text-(--color-outline) mb-1 block">Custo (R$)</label>
              <input required type="number" step="0.01" value={ingCusto} onChange={e => setIngCusto(e.target.value)} placeholder="Ex: 8.50" className="w-full p-2.5 rounded-xl bg-(--color-surface-container-high) text-xs" />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors">
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </form>

          {/* Ingredient List */}
          <div className="bg-(--color-surface-container-lowest) rounded-3xl border border-(--color-outline-variant)/30 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs block sm:table">
              <thead className="hidden sm:table-header-group">
                <tr className="bg-(--color-surface-container-low) border-b border-(--color-outline-variant)/20 text-sm uppercase font-bold text-(--color-outline)">
                  <th className="py-3 px-4">Insumo</th>
                  <th className="py-3 px-4">Custo Un.</th>
                  <th className="py-3 px-4">Estoque Atual</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="block sm:table-row-group space-y-4 sm:space-y-0 sm:divide-y divide-[var(--color-outline-variant)]/10 p-4 sm:p-0">
                {ingredients.map(ing => {
                  const isLow = ing.estoqueAtual <= ing.estoqueMinimo;
                  return (
                    <tr key={ing.id} className="block sm:table-row bg-[var(--color-surface-container-lowest)] sm:bg-transparent rounded-2xl border sm:border-0 border-[var(--color-outline-variant)]/20 shadow-xs sm:shadow-none p-4 sm:p-0 hover:bg-(--color-surface-container-lowest)/50 transition-colors">
                      <td className="flex sm:table-cell justify-between items-center py-2 sm:py-3 px-0 sm:px-4 sm:border-b border-[var(--color-outline-variant)]/10 before:content-['Insumo'] before:sm:hidden before:font-bold before:text-[var(--color-on-surface-variant)]">
                        <span className="font-bold flex items-center gap-2">
                          {isLow && <WarningCircle className="w-4 h-4 text-rose-500" />}
                          {ing.nome}
                        </span>
                      </td>
                      <td className="flex sm:table-cell justify-between items-center py-2 sm:py-3 px-0 sm:px-4 sm:border-b border-[var(--color-outline-variant)]/10 before:content-['Custo_Un.'] before:sm:hidden before:font-bold before:text-[var(--color-on-surface-variant)]">
                        {formatCurrency(ing.custoPorUnidade)} / {ing.unidadeMedida}
                      </td>
                      <td className="flex sm:table-cell justify-between items-center py-2 sm:py-3 px-0 sm:px-4 sm:border-b border-[var(--color-outline-variant)]/10 before:content-['Estoque'] before:sm:hidden before:font-bold before:text-[var(--color-on-surface-variant)]">
                        <div className="flex items-center gap-2">
                          <button onClick={() => onUpdateIngredientStock(ing.id, Math.max(0, ing.estoqueAtual - 100))} className="p-1 bg-(--color-surface-container-high) rounded-md font-bold" aria-label="Reduzir estoque">-</button>
                          <span className={`w-16 text-center font-black ${isLow ? 'text-rose-500' : 'text-(--color-on-surface)'}`}>
                            {ing.estoqueAtual} {ing.unidadeMedida}
                          </span>
                          <button onClick={() => onUpdateIngredientStock(ing.id, ing.estoqueAtual + 100)} className="p-1 bg-(--color-surface-container-high) rounded-md font-bold" aria-label="Aumentar estoque">+</button>
                        </div>
                      </td>
                      <td className="flex sm:table-cell justify-between items-center py-3 sm:py-3 px-0 sm:px-4 text-right sm:border-b border-[var(--color-outline-variant)]/10 before:content-['Ações'] before:sm:hidden before:font-bold before:text-[var(--color-on-surface-variant)] border-t border-[var(--color-outline-variant)]/10 sm:border-t-0 mt-2 sm:mt-0 pt-3 sm:pt-3">
                        <button onClick={() => { if(window.confirm('Tem certeza que deseja excluir este insumo?')) onDeleteIngredient(ing.id) }} className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors" aria-label="Excluir insumo">
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {ingredients.length === 0 && (
                  <tr className="block sm:table-row">
                    <td colSpan={4} className="block sm:table-cell py-8 px-4 text-center text-xs text-(--color-outline) font-bold italic">Nenhum insumo cadastrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {selectedProductForRecipe && (
        <AdminRecipeModal
          isOpen={!!selectedProductForRecipe}
          onClose={() => setSelectedProductForRecipe(null)}
          product={selectedProductForRecipe}
          ingredients={ingredients}
          onSave={(id, recipe, pkgCost, waste, targetMargin, suggestedPrice) => {
            // Ideally call a backend mutation here. For now we rely on the main state/props or dummy logic.
            // Since this is UI mockup level plus some real state, let's close it.
            // In a real scenario, we'd fire an 'onUpdateRecipe' prop.
            setSelectedProductForRecipe(null);
          }}
          onApplySuggestedPrice={(id, price) => {
            // Similarly, update the product price here via a prop like onUpdateProductPrice(id, price)
          }}
        />
      )}

      {showQuickPriceModal && (
        <AdminQuickPriceModal
          isOpen={showQuickPriceModal}
          onClose={() => setShowQuickPriceModal(false)}
          ingredients={ingredients}
          onSavePrices={(changed) => {
            // Ideally call a backend mutation here. 
            // e.g. updateIngredients(changed);
            setShowQuickPriceModal(false);
          }}
        />
      )}

    </div>
  );
};
