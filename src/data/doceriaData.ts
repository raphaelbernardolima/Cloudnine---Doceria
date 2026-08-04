import { Product, Order, UserProfile, AuditLog } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    nome: 'Caixa Degustação Brigadeiros Gourmet Cloudnine (12 un)',
    categoria: 'Brigadeiros',
    preco: 48.90,
    estoque: 45,
    descricao: 'Nossa caixa assinatura com 12 brigadeiros gourmet enrolados individualmente. Sabores: Pistache Bronte, Belgui ao Leite 70%, Ninho com Nutella e Caramelo Flor de Sal.',
    image_url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviews_count: 142,
    is_best_seller: true,
    ingredients: ['Chocolate Belga Callebaut', 'Leite Condensado Artesanal', 'Pistache Siciliano', 'Flor de Sal'],
    variacoes: {
      tamanhos: [
        { nome: 'Caixa com 6 un', precoAdicional: -20 },
        { nome: 'Caixa com 12 un (Padrão)', precoAdicional: 0 },
        { nome: 'Caixa com 24 un', precoAdicional: 42 }
      ],
      sabores: ['Mix Clássico', 'Somente Pistache', 'Somente Belga 70%']
    }
  },
  {
    id: 2,
    nome: 'Bolo de Pote Red Velvet Cloudnine',
    categoria: 'Bolos de Pote',
    preco: 19.90,
    estoque: 30,
    descricao: 'Massa aveludada com toque suave de cacau nobre, recheada com autêntico frosting de cream cheese Philadephia e geleia natural artesanal de amoras e morangos.',
    image_url: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviews_count: 98,
    is_best_seller: true,
    ingredients: ['Farinha de Trigo Especial', 'Cacau em Pó 100%', 'Cream Cheese Philadelphia', 'Morango & Amora Organicos']
  },
  {
    id: 3,
    nome: 'Torre de Macarons Franceses Cloudnine (8 un)',
    categoria: 'Macarons',
    preco: 39.90,
    estoque: 20,
    descricao: 'Macarons super crocantes por fora e macios por dentro. Preparados com farinha de amêndoas pura. Sabores: Frutas Vermelhas, Baunilha Bourbon, Cacau Amargo e Limão Siciliano.',
    image_url: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviews_count: 81,
    is_gluten_free: true,
    ingredients: ['Farinha de Amêndoas Pura', 'Açúcar de Confeiteiro', 'Ganache Belga', 'Fava de Baunilha Madagascar']
  },
  {
    id: 4,
    nome: 'Torta Holandesa Speziale de Chocolate e Avelã',
    categoria: 'Tortas & Mousse',
    preco: 92.00,
    estoque: 12,
    descricao: 'Base crocante de biscoitos banhados no cacau belga, creme leve e aveludado de baunilha e cobertura espelhada de ganache de avelãs torradas.',
    image_url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    reviews_count: 56,
    ingredients: ['Creme de Leite Fresco', 'Avelãs Torradas', 'Chocolate 54% Callebaut', 'Manteiga Extra']
  },
  {
    id: 5,
    nome: 'Kit Gift Luxo Cloudnine Aniversário',
    categoria: 'Kits & Presentes',
    preco: 129.00,
    estoque: 15,
    descricao: 'Presente inesquecível! Inclui: 1 Mini Bolo Vulcão Ninho com Nutella, 6 Brigadeiros Gourmet Selecionados, 1 Vela Aromática Doce e Cartão Dedicatória com Caligrafia.',
    image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    reviews_count: 47,
    is_best_seller: true,
    ingredients: ['Nutella Importada', 'Leite Ninho', 'Cacau Belga', 'Amor de Confeiteiro']
  },
  {
    id: 6,
    nome: 'Torta Mousse de Morango Fresco & Suspiros',
    categoria: 'Tortas & Mousse',
    preco: 79.90,
    estoque: 10,
    descricao: 'Mousse leve e aerada feita com redução natural de morangos orgânicos, entrelaçada por camadas de suspiros artesanais e pedaços frescos de morango.',
    image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviews_count: 41,
    is_gluten_free: true,
    ingredients: ['Morangos Orgânicos', 'Claras em Neve', 'Açúcar Demerara', 'Creme de Leite Fresco']
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 1001,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    cliente_id: 'usr-001',
    cliente_nome: 'Mariana Silva',
    cliente_telefone: '(11) 98765-4321',
    total: 88.80,
    status: 'em_preparo',
    metodo_pagamento: 'pix',
    tipo_entrega: 'entrega',
    data_agendada: '2026-07-26',
    horario_agendado: '16:00 - 17:00',
    endereco_entreg: 'Av. Paulista, 1500 - Apt 82 - Bela Vista, São Paulo - SP',
    impressoCozinha: true,
    itens: [
      { produto_id: 1, nomeProduto: 'Caixa Degustação Brigadeiros Gourmet Cloudnine (12 un)', quantidade: 1, preco_unitario: 48.90 },
      { produto_id: 3, nomeProduto: 'Torre de Macarons Franceses Cloudnine (8 un)', quantidade: 1, preco_unitario: 39.90 }
    ]
  },
  {
    id: 1002,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    cliente_id: 'usr-002',
    cliente_nome: 'Carlos Eduardo',
    cliente_telefone: '(11) 97123-8899',
    total: 129.00,
    status: 'pronto_retirada',
    metodo_pagamento: 'cartao_credito',
    tipo_entrega: 'retirada',
    data_agendada: '2026-07-26',
    horario_agendado: '15:30',
    endereco_entreg: 'Retirada no Balcão Cloudnine (Al. Gabriel Monteiro da Silva, 450)',
    impressoCozinha: true,
    itens: [
      { produto_id: 5, nomeProduto: 'Kit Gift Luxo Cloudnine Aniversário', quantidade: 1, preco_unitario: 129.00, detalhesCustomizados: 'Escrever "Parabéns Kátia!" no cartão' }
    ]
  }
];

export const INITIAL_STAFF: UserProfile[] = [
  {
    id: 'usr-admin',
    nome: 'Raphael',
    sobrenome: 'Lima',
    email: 'raphael.lima@cloudnine.com',
    telefone: '(11) 99999-0000',
    role: 'admin',
    Status: 'ativo',
    pontosFidelidade: 550
  },
  {
    id: 'usr-confeiteiro-1',
    nome: 'Chef Beatriz',
    sobrenome: 'Santos',
    email: 'beatriz.confeitaria@cloudnine.com',
    telefone: '(11) 98888-1111',
    role: 'confeiteiro',
    Status: 'ativo'
  },
  {
    id: 'usr-atendente-1',
    nome: 'Lucas',
    sobrenome: 'Mendes',
    email: 'lucas.atendimento@cloudnine.com',
    telefone: '(11) 97777-2222',
    role: 'atendente',
    Status: 'ativo'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    admin_id: 'usr-admin',
    admin_nome: 'Raphael Lima',
    acao: 'PRODUTO_ATUALIZADO',
    detalhes: 'Ajustou estoque do produto "Caixa Degustação Brigadeiros Gourmet Cloudnine" para 45 unidades'
  },
  {
    id: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    admin_id: 'usr-admin',
    admin_nome: 'Raphael Lima',
    acao: 'CUPOM_CRIADO',
    detalhes: 'Ativou o cupom promocional "CLOUDNINE10" com 10% de desconto na primeira compra'
  }
];

export const INITIAL_INGREDIENTS = [
  { id: 'ing1', nome: 'Leite Condensado Moça', unidadeMedida: 'g' as const, custoPorUnidade: 0.02, estoqueAtual: 5000, estoqueMinimo: 1000 },
  { id: 'ing2', nome: 'Chocolate Belga Callebaut 70%', unidadeMedida: 'g' as const, custoPorUnidade: 0.15, estoqueAtual: 2000, estoqueMinimo: 500 },
];

export const INITIAL_DRIVERS = [
  { id: 'd1', nome: 'João Pedro', telefone: '(11) 99999-1111', taxaPorEntrega: 8.00, totalGanhos: 48.00, pedidosEntregues: 6, status: 'disponivel' as const },
  { id: 'd2', nome: 'Carlos Silva', telefone: '(11) 98888-2222', taxaPorEntrega: 10.00, totalGanhos: 120.00, pedidosEntregues: 12, status: 'em_entrega' as const },
];

export const INITIAL_COUPONS = [
  { id: 'c1', codigo: 'BEMVINDO10', tipoDesconto: 'porcentagem' as const, valor: 10, ativo: true, minimoCompra: 50 },
  { id: 'c2', codigo: 'FRETEGRATIS', tipoDesconto: 'frete_gratis' as const, valor: 0, ativo: true, minimoCompra: 100 },
];

export const INITIAL_LOYALTY_SETTINGS = {
  pontosPorReal: 1,
  valorResgatePorPonto: 0.05
};
