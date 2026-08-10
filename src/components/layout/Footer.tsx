import React from 'react';
import { Cake } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-low)] py-8 text-xs text-[var(--color-on-surface-variant)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center font-black">
            <Cake className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-[var(--color-on-surface)]">Cloudnine Doceria</span>
          <span className="text-sm text-[var(--color-outline)]">© 2026 Todos os direitos reservados.</span>
        </div>

        <div className="flex items-center space-x-4 font-semibold text-sm">
          <span>Alameda Gabriel Monteiro da Silva, 450 - SP</span>
          <span>Atendimento: (11) 99999-0000</span>
        </div>
      </div>
    </footer>
  );
}
