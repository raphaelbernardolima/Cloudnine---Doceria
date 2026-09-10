import React, { useState } from 'react';
import { Product } from '@/src/core/types/index';
import { CloudinaryUploader } from '@/src/core/ui/shared/CloudinaryUploader';
import { useDataStore } from '@/src/core/store/useDataStore';

interface AdminAddProductModalProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onClose: () => void;
}

export const AdminAddProductModal: React.FC<AdminAddProductModalProps> = ({
  onAddProduct,
  onClose
}) => {
  const { categories } = useDataStore();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('35.00');
  const [categoria, setCategoria] = useState(categories[1] || 'Brigadeiros');
  const [estoque, setEstoque] = useState('25');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800');

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({
      nome,
      descricao,
      preco: parseFloat(preco) || 0,
      categoria,
      estoque: parseInt(estoque) || 0,
      image_url: imageUrl,
      rating: 5.0,
      reviews_count: 1
    });
    setNome('');
    setDescricao('');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-end sm:justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <form
        onSubmit={handleCreateProduct}
        className="w-full max-w-md bg-(--color-surface) p-6 rounded-t-3xl sm:rounded-3xl space-y-4 shadow-2xl border border-(--color-outline-variant)/40 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 duration-200"
      >
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-2 sm:hidden"></div>
        
        <h3 className="font-black text-lg text-(--color-on-surface)">Cadastrar Novo Doce</h3>

        <div>
          <label className="font-bold block mb-1 text-sm">Nome do Doce</label>
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Torta de Pistache com Chocolate Belga"
            className="w-full p-3 rounded-xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/40 text-sm focus:ring-2 focus:ring-(--color-primary) outline-none transition-all"
          />
        </div>

        <div>
          <label className="font-bold block mb-1 text-sm">Descrição</label>
          <textarea
            required
            rows={2}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Deliciosa massa folhada com ganache nobre..."
            className="w-full p-3 rounded-xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/40 text-sm focus:ring-2 focus:ring-(--color-primary) outline-none transition-all"
          />
        </div>

        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3">
          <div>
            <label className="font-bold block mb-1 text-sm">Preço (R$)</label>
            <input
              type="number"
              step="0.10"
              required
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className="w-full p-3 rounded-xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/40 text-sm focus:ring-2 focus:ring-(--color-primary) outline-none transition-all"
            />
          </div>

          <div>
            <label className="font-bold block mb-1 text-sm">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full p-3 rounded-xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/40 text-sm focus:ring-2 focus:ring-(--color-primary) outline-none transition-all"
            >
              {categories.filter(c => c !== 'Todos').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold block mb-1 text-sm">Estoque Inicial</label>
            <input
              type="number"
              required
              value={estoque}
              onChange={(e) => setEstoque(e.target.value)}
              className="w-full p-3 rounded-xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/40 text-sm focus:ring-2 focus:ring-(--color-primary) outline-none transition-all"
            />
          </div>
        </div>

        {/* Image Uploader */}
        <div className="pt-2">
          <CloudinaryUploader
            onImageUploaded={(url) => setImageUrl(url)}
            currentImageUrl={imageUrl}
            label="Foto do Doce"
          />
        </div>

        <div className="flex gap-3 pt-4 pb-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-3.5 rounded-xl bg-(--color-surface-container-high) text-(--color-on-surface) font-bold cursor-pointer hover:bg-(--color-surface-container-highest) transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-1/2 py-3.5 rounded-xl bg-(--color-primary) text-(--color-on-primary) font-bold cursor-pointer hover:opacity-90 shadow-md transition-all active:scale-95"
          >
            Salvar Produto
          </button>
        </div>
      </form>
    </div>
  );
};
