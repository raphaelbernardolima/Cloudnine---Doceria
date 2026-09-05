import React, { useState } from 'react';
import { Product } from '@/src/core/types/index';
import { CloudinaryUploader } from '@/src/core/ui/shared/CloudinaryUploader';

interface AdminAddProductModalProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onClose: () => void;
}

export const AdminAddProductModal: React.FC<AdminAddProductModalProps> = ({
  onAddProduct,
  onClose
}) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('35.00');
  const [categoria, setCategoria] = useState('Brigadeiros');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <form
        onSubmit={handleCreateProduct}
        className="w-full max-w-md bg-(--color-surface) p-6 rounded-3xl space-y-4 text-xs shadow-2xl border border-(--color-outline-variant)/40"
      >
        <h3 className="font-black text-base text-(--color-on-surface)">Cadastrar Novo Doce</h3>

        <div>
          <label className="font-bold block mb-1">Nome do Doce</label>
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Torta de Pistache com Chocolate Belga"
            className="w-full p-2.5 rounded-xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/40"
          />
        </div>

        <div>
          <label className="font-bold block mb-1">Descrição</label>
          <textarea
            required
            rows={2}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Deliciosa massa folhada com ganache nobre..."
            className="w-full p-2.5 rounded-xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/40"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="font-bold block mb-1">Preço (R$)</label>
            <input
              type="number"
              step="0.10"
              required
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/40"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/40"
            >
              <option value="Brigadeiros">Brigadeiros</option>
              <option value="Bolos de Pote">Bolos de Pote</option>
              <option value="Macarons">Macarons</option>
              <option value="Tortas & Mousse">Tortas & Mousse</option>
              <option value="Kits & Presentes">Kits & Presentes</option>
            </select>
          </div>

          <div>
            <label className="font-bold block mb-1">Estoque Inicial</label>
            <input
              type="number"
              required
              value={estoque}
              onChange={(e) => setEstoque(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/40"
            />
          </div>
        </div>

        {/* Image Uploader */}
        <CloudinaryUploader
          onImageUploaded={(url) => setImageUrl(url)}
          currentImageUrl={imageUrl}
          label="Foto do Doce (Upload Direto / Galeria)"
        />

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 rounded-xl bg-(--color-surface-container-high) text-(--color-on-surface) font-bold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-1/2 py-2.5 rounded-xl bg-(--color-primary) text-(--color-on-primary) font-bold cursor-pointer hover:opacity-90"
          >
            Salvar Produto
          </button>
        </div>
      </form>
    </div>
  );
};
