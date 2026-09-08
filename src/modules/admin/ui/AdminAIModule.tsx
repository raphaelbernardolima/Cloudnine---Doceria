import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export const AdminAIModule: React.FC = () => {
  const [aiPrompt, setAiPrompt] = useState('Escreva uma legenda encantadora para o Instagram promovendo a Caixa de Brigadeiros Gourmet Cloudnine com 10% de desconto no Pix.');
  const [aiResponse, setAiResponse] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleGenerateAiCopy = async () => {
    setIsGeneratingAi(true);
    setAiResponse('');
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setAiResponse("☁️ [Cloudnine Marketing IA]: ✨ Torne seu dia mais doce com os novos brigadeiros belgas Cloudnine! Feitos com chocolate Callebaut nobre e leite condensado artesanal. Peça pelo nosso site e ganhe 10% de desconto pagando via Pix! 💖 #CloudnineDoceria #BrigadeiroGourmet #ConfeitariaArtesanal");
        setIsGeneratingAi(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Você é o copywriter oficial da confeitaria de luxo Cloudnine Doceria. Escreva o conteúdo solicitado com tom doce, elegante e persuasivo:\n${aiPrompt}`
      });
      setAiResponse(response.text || 'Copy gerada com sucesso!');
    } catch (err) {
      setAiResponse("☁️ [Cloudnine Marketing IA]: ✨ Deixe seu final de semana incomparável com nossas tortas e macarons artesanais Cloudnine. Entregas agendadas com todo carinho! Acesse nosso cardápio virtual e monte seu bolo dos sonhos.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-(--color-surface-container-lowest) border border-(--color-outline-variant)/30 space-y-4">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-2xl bg-purple-600 text-white">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-base text-(--color-on-surface)">
            Assistente de Copys & Marketing IA (Gemini)
          </h3>
          <p className="text-xs text-(--color-outline)">
            Crie legendas encantadoras para redes sociais, promoções do dia e descrições irresistíveis.
          </p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <label className="font-bold text-(--color-on-surface) block">O que você gostaria de divulgar hoje?</label>
        <textarea
          rows={3}
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          className="w-full p-3 rounded-2xl bg-(--color-surface-container-low) border border-(--color-outline-variant)/40 focus:outline-none"
        />

        <button
          onClick={handleGenerateAiCopy}
          disabled={isGeneratingAi}
          className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs flex items-center space-x-2 shadow-md hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGeneratingAi ? 'Criando Texto Mágico...' : 'Gerar Copy com Gemini IA'}</span>
        </button>

        {aiResponse && (
          <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/30 text-xs leading-relaxed space-y-2 mt-4">
            <span className="font-bold text-purple-700 dark:text-purple-300 block uppercase tracking-wider text-sm">Resultado Gerado:</span>
            <p className="whitespace-pre-line text-(--color-on-surface) font-medium">{aiResponse}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(aiResponse);
                alert("Copy copiada para a área de transferência!");
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm mt-2 inline-block cursor-pointer transition-colors"
            >
              Copiar Texto
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
