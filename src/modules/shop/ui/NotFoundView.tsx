import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost, House } from '@phosphor-icons/react';
import { SEO } from '@/src/core/ui/shared/SEO';

export const NotFoundView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-300">
      <SEO title="Página Não Encontrada" />
      <div className="w-24 h-24 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center mb-6 shadow-inner">
        <Ghost className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-black text-(--color-on-surface) mb-4">404</h1>
      <h2 className="text-2xl font-bold text-(--color-on-surface) mb-2">Página não encontrada</h2>
      <p className="text-(--color-on-surface-variant) max-w-md mx-auto mb-8">
        Ops! Parece que você se perdeu. A página que você está procurando não existe ou foi movida.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-8 py-4 rounded-full bg-(--color-primary) text-white font-bold flex items-center space-x-2 hover:bg-(--color-primary)/90 transition-transform transform hover:scale-105 shadow-lg"
      >
        <House className="w-5 h-5" />
        <span>Voltar para o Cardápio</span>
      </button>
    </div>
  );
};
