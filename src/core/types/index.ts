export interface Product {
  id: number | string;
  created_at?: string;
  nome: string;
  descricao: string;
  preco: number;
  image_url: string;
  categoria: string;
  estoque: number;
  // Campos extras de exibição e personalização
  rating?: number;
  reviews_count?: number;
  is_best_seller?: boolean;
  receita?: RecipeItem[];
  is_gluten_free?: boolean;
  ingredients?: string[];
  variacoes?: {
    tamanhos?: { nome: string; precoAdicional: number }[];
    sabores?: string[];
    coberturas?: string[];
  };
}

export interface CustomCakeOption {
  nome: string;
  precoAdicional: number;
}

export interface CustomCakeConfig {
  tamanhos: CustomCakeOption[];
  massas: CustomCakeOption[];
  recheios: CustomCakeOption[];
  coberturas: CustomCakeOption[];
}

export interface CustomCakeBuilder {
  tamanho: string;
  massa: string;
  recheio1: string;
  recheio2?: string;
  cobertura: string;
  mensagemBolo: string;
  observacoes: string;
  precoCalculado: number;
  fotoReferenciaUrl?: string;
}

export interface CartItem {
  id: string;
  product?: Product;
  customCake?: CustomCakeBuilder;
  quantity: number;
  customNote?: string;
  unitPrice: number;
}

export interface UserProfile {
  id: string;
  created_at?: string;
  telefone: string;
  role: 'ADMIN' | 'CAIXA' | 'COZINHA' | 'LIMPEZA' | 'ATENDIMENTO' | 'USUARIO_PADRAO' | 'admin' | 'cliente' | 'confeiteiro' | 'atendente';
  Status: 'ativo' | 'suspenso' | 'inativo';
  nome: string;
  sobrenome: string;
  email: string;
  pontosFidelidade?: number;
  avatar_url?: string;
  endereco_rua?: string;
  endereco_numero?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_uf?: string;
  endereco_cep?: string;
  endereco_complemento?: string;
  endereco_referencia?: string;
}

export interface OrderItem {
  id?: number;
  pedido_id?: number;
  produto_id?: number | string;
  nomeProduto: string;
  quantidade: number;
  preco_unitario: number;
  detalhesCustomizados?: string;
}

export interface Order {
  id: number | string;
  created_at: string;
  cliente_id: string;
  cliente_nome: string;
  cliente_telefone: string;
  total: number;
  status: 'pendente_pix' | 'em_preparo' | 'pronto_retirada' | 'saiu_entrega' | 'entregue' | 'cancelado';
  metodo_pagamento: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro_retirada';
  tipo_entrega: 'entrega' | 'retirada';
  entregador_id?: string;
  data_agendada?: string;
  horario_agendado?: string;
  endereco_entreg: string;
  itens: OrderItem[];
  impressoCozinha?: boolean;
}

export interface LoyaltyAccount {
  clienteId: string;
  pontosAcumulados: number;
  nivel: 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';
  historicoResgates: { data: string; descricao: string; pontosUsados: number }[];
}

export interface NotificationItem {
  id: number | string;
  created_at: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  cliente_id?: string | null;
}

export interface AuditLog {
  id: number | string;
  created_at: string;
  acao: string;
  detalhes: string;
  admin_id: string;
  admin_nome?: string;
}

export type ThemeMode = 'light' | 'dark' | 'light-high-contrast' | 'dark-high-contrast';

export interface Ingredient {
  id: string;
  nome: string;
  unidadeMedida: 'g' | 'ml' | 'un';
  custoPorUnidade: number;
  estoqueAtual: number;
  estoqueMinimo: number;
}

export interface RecipeItem {
  insumoId: string;
  quantidade: number;
}

export interface Driver {
  id: string;
  nome: string;
  telefone: string;
  taxaPorEntrega: number;
  totalGanhos: number;
  pedidosEntregues: number;
  status: 'disponivel' | 'em_entrega' | 'indisponivel';
}

export interface Coupon {
  id: string;
  codigo: string;
  tipoDesconto: 'porcentagem' | 'fixo' | 'frete_gratis';
  valor: number;
  ativo: boolean;
  minimoCompra: number;
}

export interface LoyaltySettings {
  pontosPorReal: number;
  valorResgatePorPonto: number;
}
