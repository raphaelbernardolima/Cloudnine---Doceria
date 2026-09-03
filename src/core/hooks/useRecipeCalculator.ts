import { useMemo } from 'react';
import { RecipeItem, Ingredient } from '../types';

export interface UseRecipeCalculatorProps {
  recipeItems: RecipeItem[];
  ingredients: Ingredient[];
  packagingCost?: number;
  wastePercentage?: number;
  targetMargin?: number;
  currentSellingPrice?: number;
}

export function useRecipeCalculator({
  recipeItems,
  ingredients,
  packagingCost = 0,
  wastePercentage = 0,
  targetMargin = 0,
  currentSellingPrice = 0,
}: UseRecipeCalculatorProps) {
  const result = useMemo(() => {
    // 1. Calculate Base CMV
    const cmvBase = recipeItems.reduce((acc, item) => {
      const ingredient = ingredients.find((i) => String(i.id) === String(item.insumoId));
      if (!ingredient) return acc;
      
      // Se custoPorUnidade estiver em 0, tenta calcular a partir do preço da embalagem
      let custoReal = ingredient.custoPorUnidade;
      if (custoReal === 0 && ingredient.preco_embalagem && ingredient.tamanho_embalagem) {
         custoReal = ingredient.preco_embalagem / ingredient.tamanho_embalagem;
      }
      
      return acc + (item.quantidade * custoReal);
    }, 0);

    // 2. Calculate Total Cost
    const totalCost = (cmvBase * (1 + wastePercentage / 100)) + packagingCost;

    // 3. Calculate Suggested Price
    let suggestedPrice = totalCost;
    if (targetMargin < 100 && targetMargin >= 0) {
      suggestedPrice = totalCost / (1 - (targetMargin / 100));
    }

    // 4. Calculate Real Margin
    let realMargin = 0;
    if (currentSellingPrice > 0) {
      realMargin = ((currentSellingPrice - totalCost) / currentSellingPrice) * 100;
    }

    // 5. Margin Status
    let marginStatus: 'healthy' | 'warning' | 'critical' = 'critical';
    if (realMargin >= targetMargin && currentSellingPrice >= totalCost) {
      marginStatus = 'healthy';
    } else if (realMargin > 20) {
      marginStatus = 'warning';
    } else {
      marginStatus = 'critical';
    }

    return {
      cmvBase,
      totalCost,
      suggestedPrice,
      realMargin,
      marginStatus,
    };
  }, [recipeItems, ingredients, packagingCost, wastePercentage, targetMargin, currentSellingPrice]);

  return result;
}
