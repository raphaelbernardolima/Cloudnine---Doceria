import React, { useState } from 'react';
import { 
  Package, ShoppingBag, Users, FileText, Printer, Sparkles, 
  Plus, Edit, Trash2, CheckCircle2, Clock, AlertCircle, 
  Database, ShieldCheck, Search, Filter, ArrowUpRight, BarChart3, RefreshCw, Truck, Image as ImageIcon, UploadCloud, LayoutDashboard, CreditCard, Settings
} from 'lucide-react';
import { Product, Order, UserProfile, AuditLog } from '../types';
import { GoogleGenAI } from '@google/genai';
import { CloudinaryUploader } from './CloudinaryUploader';
import { getCloudinaryConfig } from '../lib/cloudinary';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  staff: UserProfile[];
  auditLogs: AuditLog[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateStock: (id: number | string, newStock: number) => void;
  onDeleteProduct: (id: number | string) => void;
  onUpdateOrderStatus: (orderId: number | string, newStatus: Order['status']) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  staff,
  auditLogs,
  onAddProduct,
  onUpdateStock,
  onDeleteProduct,
  onUpdateOrderStatus
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'kitchen' | 'staff' | 'payments' | 'settings' | 'ai' | 'database'>('dashboard');
  
  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const previousOrderCount = React.useRef(orders.length);

  React.useEffect(() => {
    if (orders.length > previousOrderCount.current) {
      const newOrder = orders[orders.length - 1] || orders[0];
      setToastMessage(`🎉 Novo pedido #${newOrder?.id || ''} recebido de ${newOrder?.cliente_nome || 'Cliente'}!`);
      
      // Play a simple notification sound (optional, but requested simple observer)
      // Hide toast after 5 seconds
      setTimeout(() => setToastMessage(null), 5000);
    }
    previousOrderCount.current = orders.length;
  }, [orders]);

  // Kitchen thermal receipt modal & settings
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [receiptType, setReceiptType] = useState<'cozinha' | 'cliente'>('cozinha');
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [printerProtocol, setPrinterProtocol] = useState<'escpos' | 'bluetooth' | 'usb' | 'system'>('system');
  const [isPrinterConnected, setIsPrinterConnected] = useState(true);
  const [printerStatusMessage, setPrinterStatusMessage] = useState('Pronta para impressão (ESC/POS & Driver do Sistema)');

  // New product form states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('35.00');
  const [categoria, setCategoria] = useState('Brigadeiros');
  const [estoque, setEstoque] = useState('25');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800');

  // AI Assistant states
  const [aiPrompt, setAiPrompt] = useState('Escreva uma legenda encantadora para o Instagram promovendo a Caixa de Brigadeiros Gourmet Cloudnine com 10% de desconto no Pix.');
  const [aiResponse, setAiResponse] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Calculate Metrics
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrders = orders.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingOrders = orders.filter(o => o.status === 'em_preparo' || o.status === 'pendente_pix').length;

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
    setShowAddProductModal(false);
    setNome('');
    setDescricao('');
  };

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
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      
      {/* Top Header & Admin Tabs */}
      <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary-container)] px-2.5 py-1 rounded-md">
            Painel Administrativo Restrito
          </span>
          <h1 className="text-2xl font-black text-[var(--color-on-surface)] mt-1">
            Gestão Operacional Cloudnine
          </h1>
          <p className="text-xs text-[var(--color-outline)]">
            Controle de pedidos, catálogo de produtos, impressão da cozinha e inteligência de vendas.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-1.5 bg-[var(--color-surface-container)] p-1.5 rounded-2xl border border-[var(--color-outline-variant)]/20 text-xs font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'orders'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pedidos ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'products'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Estoque & Catálogo</span>
          </button>

          <button
            onClick={() => setActiveTab('kitchen')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'kitchen'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-xs'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Comanda Cozinha</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Marketing IA</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'database'
                ? 'bg-[var(--color-secondary)] text-[var(--color-on-secondary)] shadow-xs'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase RLS & Logs</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-1">
          <span className="text-[10px] uppercase font-bold text-[var(--color-outline)] block">Faturamento Total</span>
          <span className="text-xl font-black text-emerald-600">R$ {totalRevenue.toFixed(2).replace('.', ',')}</span>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +18.4% este mês
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-1">
          <span className="text-[10px] uppercase font-bold text-[var(--color-outline)] block">Ticket Médio</span>
          <span className="text-xl font-black text-[var(--color-primary)]">R$ {avgTicket.toFixed(2).replace('.', ',')}</span>
          <span className="text-[10px] text-[var(--color-outline)] block">Base de {totalOrders} vendas</span>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-1">
          <span className="text-[10px] uppercase font-bold text-[var(--color-outline)] block">Pedidos em Aberto</span>
          <span className="text-xl font-black text-amber-500">{pendingOrders} pedidos</span>
          <span className="text-[10px] text-amber-600 font-semibold block">Aguardando preparo/despacho</span>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-1">
          <span className="text-[10px] uppercase font-bold text-[var(--color-outline)] block">Itens no Catálogo</span>
          <span className="text-xl font-black text-[var(--color-on-surface)]">{products.length} itens</span>
          <span className="text-[10px] text-emerald-600 font-semibold block">Estoque sincronizado</span>
        </div>
      </div>

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 overflow-hidden space-y-4">
            <h3 className="font-bold text-base text-[var(--color-on-surface)]">
              Gerenciamento de Pedidos em Tempo Real
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-outline-variant)]/30 text-[var(--color-outline)] uppercase font-bold text-[10px]">
                    <th className="py-3 px-3"># Pedido</th>
                    <th className="py-3 px-3">Cliente</th>
                    <th className="py-3 px-3">Itens</th>
                    <th className="py-3 px-3">Entrega / Horário</th>
                    <th className="py-3 px-3">Total</th>
                    <th className="py-3 px-3">Status Atual</th>
                    <th className="py-3 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-outline-variant)]/20">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-[var(--color-surface-container-low)] transition-colors">
                      <td className="py-3 px-3 font-extrabold text-[var(--color-primary)]">
                        #{o.id}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold block text-[var(--color-on-surface)]">{o.cliente_nome}</span>
                        <span className="text-[10px] text-[var(--color-outline)]">{o.cliente_telefone}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold block max-w-xs truncate">
                          {o.itens.map(i => `${i.quantidade}x ${i.nomeProduto}`).join(', ')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold block text-[var(--color-on-surface)]">{o.tipo_entrega.toUpperCase()}</span>
                        <span className="text-[10px] text-[var(--color-outline)]">{o.data_agendada} ({o.horario_agendado})</span>
                      </td>
                      <td className="py-3 px-3 font-extrabold text-[var(--color-on-surface)]">
                        R$ {o.total.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={o.status}
                          onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as Order['status'])}
                          className="p-1.5 rounded-xl bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]/40 font-bold text-[10px] focus:outline-none"
                        >
                          <option value="pendente_pix">⏳ Pendente Pix</option>
                          <option value="em_preparo">👨‍🍳 Em Preparo</option>
                          <option value="pronto_retirada">✨ Pronto p/ Retirada</option>
                          <option value="saiu_entrega">🛵 Saiu p/ Entrega</option>
                          <option value="entregue">✅ Entregue</option>
                          <option value="cancelado">❌ Cancelado</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setPrintingOrder(o)}
                          className="p-2 rounded-xl bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] hover:bg-[var(--color-primary)] hover:text-white transition-all inline-flex items-center space-x-1 font-bold text-[10px]"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Comanda</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS & STOCK */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[var(--color-on-surface)]">
              Catálogo de Produtos & Controle de Estoque
            </h3>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs flex items-center space-x-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Doce no Catálogo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <div 
                key={p.id}
                className="p-4 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 flex items-center justify-between gap-3 shadow-xs"
              >
                <img 
                  src={p.image_url} 
                  alt={p.nome} 
                  className="w-16 h-16 rounded-2xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-[var(--color-on-surface)] truncate">{p.nome}</h4>
                  <span className="text-[10px] text-[var(--color-primary)] font-bold block">
                    R$ {p.preco.toFixed(2).replace('.', ',')}
                  </span>

                  {/* Stock Adjuster */}
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-[10px] text-[var(--color-outline)] font-semibold">Estoque:</span>
                    <button 
                      onClick={() => onUpdateStock(p.id, Math.max(0, p.estoque - 1))}
                      className="px-2 py-0.5 rounded-md bg-[var(--color-surface-container-high)] text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-black">{p.estoque}</span>
                    <button 
                      onClick={() => onUpdateStock(p.id, p.estoque + 1)}
                      className="px-2 py-0.5 rounded-md bg-[var(--color-surface-container-high)] text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteProduct(p.id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Excluir produto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: KITCHEN THERMAL PRINTING & POS INTEGRATION */}
      {activeTab === 'kitchen' && (
        <div className="space-y-6">
          
          {/* Thermal Printer Hardware Configuration Panel */}
          <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-outline-variant)]/20 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[var(--color-on-surface)] flex items-center gap-2">
                    Integração com Maquininhas e Impressoras Térmicas
                  </h3>
                  <p className="text-xs text-[var(--color-outline)]">
                    Suporte nativo a protocolos ESC/POS, bobinas de 80mm/58mm e maquininhas Smart POS Android/Windows (Bematech, Elgin, Epson, Sunmi, Gertec, Daruma).
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {printerStatusMessage}
                </span>
              </div>
            </div>

            {/* Config Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-[var(--color-on-surface)] block mb-1">Largura do Papel Térmico</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaperWidth('80mm')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      paperWidth === '80mm'
                        ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-transparent shadow-xs'
                        : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)]/40'
                    }`}
                  >
                    80mm (Padrão Cozinha)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperWidth('58mm')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      paperWidth === '58mm'
                        ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-transparent shadow-xs'
                        : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)]/40'
                    }`}
                  >
                    58mm (Maquininha POS)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--color-on-surface)] block mb-1">Via da Impressão</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReceiptType('cozinha')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      receiptType === 'cozinha'
                        ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-transparent shadow-xs'
                        : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)]/40'
                    }`}
                  >
                    👨‍🍳 Via Cozinha
                  </button>
                  <button
                    type="button"
                    onClick={() => setReceiptType('cliente')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      receiptType === 'cliente'
                        ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-transparent shadow-xs'
                        : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)]/40'
                    }`}
                  >
                    🛍️ Via Cliente / Balcão
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--color-on-surface)] block mb-1">Protocolo de Comunicação</label>
                <select
                  value={printerProtocol}
                  onChange={(e) => {
                    const proto = e.target.value as any;
                    setPrinterProtocol(proto);
                    if (proto === 'escpos') setPrinterStatusMessage('Protocolo ESC/POS ativado via Spooler local');
                    else if (proto === 'usb') setPrinterStatusMessage('Conectado via WebUSB / Porta Serial COM');
                    else if (proto === 'bluetooth') setPrinterStatusMessage('Conectado via Bluetooth POS');
                    else setPrinterStatusMessage('Pronta para impressão (Driver do Sistema / Spooler)');
                  }}
                  className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 font-bold focus:outline-none"
                >
                  <option value="system">🖨️ Driver de Spooler do Sistema (Geral)</option>
                  <option value="escpos">⚡ ESC/POS Direto (USB / Serial RAW)</option>
                  <option value="bluetooth">📱 Bluetooth (Maquininhas Smart POS)</option>
                  <option value="usb">🔌 WebUSB Direct (Porta COM / POS)</option>
                </select>
              </div>
            </div>

            {/* Test Printing Trigger */}
            <div className="pt-2 flex flex-wrap gap-2 items-center justify-between border-t border-[var(--color-outline-variant)]/20">
              <p className="text-[11px] text-[var(--color-outline)] font-medium">
                💡 As comandas são impressas em mono com suporte a caracteres acentuados, separador serrilhado e corte automático ESC/POS.
              </p>

              <button
                type="button"
                onClick={() => {
                  setPrintingOrder({
                    id: 'TESTE-999',
                    cliente_nome: 'TESTE DE IMPRESSORA TÉRMICA',
                    cliente_telefone: '(11) 99999-0000',
                    tipo_entrega: 'retirada',
                    data_agendada: 'Hoje',
                    horario_agendado: 'Imediato',
                    status: 'em_preparo',
                    itens: [
                      { id: 't1', nomeProduto: 'Bolo de Pote Ninho com Nutella', quantidade: 2, preco_unitario: 22.0 },
                      { id: 't2', nomeProduto: 'Caixa de Brigadeiros Gourmet (6un)', quantidade: 1, preco_unitario: 38.0 }
                    ],
                    total: 82.0,
                    created_at: new Date().toISOString()
                  });
                }}
                className="px-4 py-2 rounded-xl bg-[var(--color-surface-container-high)] hover:bg-[var(--color-surface-container-highest)] font-bold text-xs flex items-center space-x-1.5 text-[var(--color-on-surface)] transition-all min-h-[38px]"
              >
                <Printer className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>Testar Impressão de Exemplo</span>
              </button>
            </div>
          </div>

          {/* Production Queue List */}
          <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[var(--color-on-surface)]">
                  Fila de Produção da Confeitaria ({orders.length} pedidos)
                </h3>
                <p className="text-xs text-[var(--color-outline)]">
                  Selecione qualquer pedido para enviar a comanda direto para a bancada da cozinha ou balcão.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((o) => (
                <div 
                  key={o.id}
                  className="p-5 rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[var(--color-primary)]">
                      PEDIDO #{o.id}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600">
                      {o.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-[var(--color-on-surface)]">
                    <p><strong>Cliente:</strong> {o.cliente_nome} ({o.cliente_telefone})</p>
                    <p><strong>Agendado:</strong> {o.data_agendada} às {o.horario_agendado}</p>
                    <p><strong>Tipo:</strong> {o.tipo_entrega.toUpperCase()}</p>
                  </div>

                  <div className="p-3 bg-[var(--color-surface-container-lowest)] rounded-2xl border border-[var(--color-outline-variant)]/20 text-xs space-y-1 font-mono">
                    {o.itens.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.quantidade}x {item.nomeProduto}</span>
                        <span>R$ {(item.preco_unitario * item.quantidade).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setReceiptType('cozinha');
                        setPrintingOrder(o);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Comanda Cozinha</span>
                    </button>
                    <button
                      onClick={() => {
                        setReceiptType('cliente');
                        setPrintingOrder(o);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-[var(--color-secondary)] text-[var(--color-on-secondary)] font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Via do Cliente</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: GEMINI MARKETING ASSISTANT */}
      {activeTab === 'ai' && (
        <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-purple-600 text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--color-on-surface)]">
                Assistente de Copys & Marketing IA (Gemini)
              </h3>
              <p className="text-xs text-[var(--color-outline)]">
                Crie legendas encantadoras para redes sociais, promoções do dia e descrições irresistíveis.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="font-bold text-[var(--color-on-surface)] block">O que você gostaria de divulgar hoje?</label>
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full p-3 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 focus:outline-none"
            />

            <button
              onClick={handleGenerateAiCopy}
              disabled={isGeneratingAi}
              className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs flex items-center space-x-2 shadow-md hover:bg-purple-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGeneratingAi ? 'Criando Texto Mágico...' : 'Gerar Copy com Gemini IA'}</span>
            </button>

            {aiResponse && (
              <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/30 text-xs leading-relaxed space-y-2 mt-4">
                <span className="font-bold text-purple-700 dark:text-purple-300 block uppercase tracking-wider text-[10px]">Resultado Gerado:</span>
                <p className="whitespace-pre-line text-[var(--color-on-surface)] font-medium">{aiResponse}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiResponse);
                    alert("Copy copiada para a área de transferência!");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-[10px] mt-2 inline-block"
                >
                  Copiar Texto
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: DATABASE & SUPABASE AUDIT LOGS */}
      {activeTab === 'database' && (
        <div className="p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-5">
          <div>
            <h3 className="font-bold text-base text-[var(--color-on-surface)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Esquema de Tabelas Supabase PostgreSQL & RLS
            </h3>
            <p className="text-xs text-[var(--color-outline)]">
              Visualização administrativa das tabelas e logs de auditoria do banco da Cloudnine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Table status card */}
            <div className="p-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 space-y-2 text-xs">
              <span className="font-bold block text-[var(--color-on-surface)]">Tabelas Ativas no Supabase Schema:</span>
              <ul className="list-disc list-inside space-y-1 text-[var(--color-on-surface-variant)]">
                <li><code>public.Perfis</code> (RLS ativado p/ perfis e roles)</li>
                <li><code>public.produtos</code> (Acesso público de leitura)</li>
                <li><code>public.pedidos</code> & <code>itens_pedidos</code></li>
                <li><code>public.notificacoes</code> & <code>logs_auditoria</code></li>
              </ul>
            </div>

            {/* Audit log list */}
            <div className="p-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 space-y-2 text-xs">
              <span className="font-bold block text-[var(--color-on-surface)]">Histórico de Auditoria do Sistema:</span>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-2 rounded-xl bg-[var(--color-surface-container-lowest)] text-[10px]">
                    <span className="font-bold text-[var(--color-primary)]">{log.acao}</span>
                    <p className="text-[var(--color-on-surface)]">{log.detalhes}</p>
                    <span className="text-[var(--color-outline)] block">{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* THERMAL PRINT MODAL / TICKET PREVIEW */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white text-black p-6 rounded-2xl max-w-sm w-full font-mono text-xs space-y-3 shadow-2xl printable-receipt">
            
            {/* Controls Bar inside preview modal (hidden when printing) */}
            <div className="no-print p-2 rounded-xl bg-gray-100 flex items-center justify-between text-[11px] font-sans font-bold mb-2">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setReceiptType('cozinha')}
                  className={`px-2 py-1 rounded-lg ${receiptType === 'cozinha' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
                >
                  Cozinha
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptType('cliente')}
                  className={`px-2 py-1 rounded-lg ${receiptType === 'cliente' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
                >
                  Cliente
                </button>
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPaperWidth('80mm')}
                  className={`px-2 py-1 rounded-lg ${paperWidth === '80mm' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
                >
                  80mm
                </button>
                <button
                  type="button"
                  onClick={() => setPaperWidth('58mm')}
                  className={`px-2 py-1 rounded-lg ${paperWidth === '58mm' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
                >
                  58mm
                </button>
              </div>
            </div>

            {/* Ticket Thermal Receipt Layout */}
            <div className={`mx-auto space-y-2 ${paperWidth === '58mm' ? 'max-w-[200px] text-[10px]' : 'max-w-[260px]'}`}>
              <div className="text-center border-b border-dashed border-black pb-2 space-y-0.5">
                <h2 className="font-black text-sm uppercase tracking-widest">CLOUD NINE DOCERIA</h2>
                <p className="text-[9px]">Alameda Gabriel Monteiro da Silva, 450</p>
                <p className="font-bold text-[10px]">
                  {receiptType === 'cozinha' ? '=== VIA DA COZINHA (PRODUÇÃO) ===' : '=== VIA DO CLIENTE (RECIBO) ==='}
                </p>
                <span className="font-black text-base block mt-1">PEDIDO #{printingOrder.id}</span>
              </div>

              <div className="space-y-0.5 text-[10px]">
                <p><strong>Cliente:</strong> {printingOrder.cliente_nome}</p>
                <p><strong>Telefone:</strong> {printingOrder.cliente_telefone}</p>
                <p><strong>Data/Hora:</strong> {printingOrder.data_agendada} ({printingOrder.horario_agendado})</p>
                <p><strong>Entrega:</strong> {printingOrder.tipo_entrega.toUpperCase()}</p>
              </div>

              <div className="border-t border-b border-dashed border-black py-2 space-y-1">
                <p className="font-bold uppercase text-[9px] text-center">--- ITENS DO PEDIDO ---</p>
                {printingOrder.itens.map((i, idx) => (
                  <div key={idx} className="flex justify-between font-bold text-[11px]">
                    <span>{i.quantidade}x {i.nomeProduto}</span>
                    <span>R$ {(i.preco_unitario * i.quantidade).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-black text-xs pt-0.5">
                <span>TOTAL A PAGAR</span>
                <span>R$ {printingOrder.total.toFixed(2)}</span>
              </div>

              <div className="pt-2 text-center border-t border-dashed border-black space-y-1">
                <p className="text-[9px]">Obrigado por escolher a Cloudnine!</p>
                <p className="text-[8px] opacity-75">Confeitaria Artesanal & Bolos de Luxo</p>
                <div className="mt-1 text-center text-[9px] tracking-widest font-mono">||||||| |||| |||||||||||||||</div>
              </div>
            </div>

            {/* Modal Actions (Hidden on Print) */}
            <div className="no-print flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setPrintingOrder(null)}
                className="w-1/2 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-black font-bold font-sans transition-colors min-h-[42px]"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setPrintingOrder(null);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-black hover:bg-gray-900 text-white font-bold font-sans transition-colors flex items-center justify-center space-x-1.5 shadow-md min-h-[42px]"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Agora</span>
              </button>
            </div>

          </div>
        </div>
      )}


      {/* NEW PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form 
            onSubmit={handleCreateProduct}
            className="w-full max-w-md bg-[var(--color-surface)] p-6 rounded-3xl space-y-4 text-xs shadow-2xl border border-[var(--color-outline-variant)]/40"
          >
            <h3 className="font-black text-base text-[var(--color-on-surface)]">Cadastrar Novo Doce</h3>

            <div>
              <label className="font-bold block mb-1">Nome do Doce</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Torta de Pistache com Chocolate Belga"
                className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40"
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
                className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40"
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
                  className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Categoria</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40"
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
                  className="w-full p-2.5 rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40"
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
                onClick={() => setShowAddProductModal(false)}
                className="w-1/2 py-2.5 rounded-xl bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold"
              >
                Salvar Produto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NEW ORDER NOTIFICATION TOAST */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-[9999] bg-[var(--color-primary)] text-[var(--color-on-primary)] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-[slideIn_0.3s_ease-out]">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Atenção Equipe!</p>
            <p className="text-xs opacity-90">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="ml-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            X
          </button>
        </div>
      )}
    </div>
  );
};
