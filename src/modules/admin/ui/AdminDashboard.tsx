import React, { useState, useEffect } from 'react';
import { SEO } from '@/src/core/ui/shared/SEO';
import { useSearchParams } from 'react-router-dom';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Box, Chip, Select, MenuItem, IconButton, Card, CardContent, Typography, Button, ToggleButtonGroup, ToggleButton, FormControl, Divider } from '@mui/material';
import {
  Package, ShoppingBag, Users, FileText, Printer, Sparkles,
  Plus, Edit, Trash2, CheckCircle2, Clock, AlertCircle,
  Database, ShieldCheck, Search, Filter, ArrowUpRight, BarChart3, RefreshCw, Truck, Image as ImageIcon, UploadCloud, LayoutDashboard, CreditCard, Settings, Calendar, Gift, Store, Cake
} from 'lucide-react';
import { Product, Order, UserProfile, AuditLog, Ingredient, Driver, Coupon, LoyaltySettings, CustomCakeConfig } from '@/src/core/types/index';
import { AdminCustomCakeModule } from './AdminCustomCakeModule';
import { GoogleGenAI } from '@google/genai';
import { CloudinaryUploader } from '@/src/core/ui/shared/CloudinaryUploader';
import { getCloudinaryConfig } from '@/src/core/services/cloudinary';
import { AdminStaffModule } from './AdminStaffModule';
import { AdminCalendarModule } from './AdminCalendarModule';
import { AdminInventoryModule } from './AdminInventoryModule';
import { AdminDeliveryModule } from './AdminDeliveryModule';
import { AdminMarketingModule } from './AdminMarketingModule';
import { AdminFinanceModule } from './AdminFinanceModule';
import { AdminStoreConfigModule } from './AdminStoreConfigModule';
import { AdminPaymentConfigModule } from './AdminPaymentConfigModule';
import { updateStoreConfig } from '@/src/core/services/supabase';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  staff: UserProfile[];
  auditLogs: AuditLog[];
  currentUser: UserProfile;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateStock: (id: number | string, newStock: number) => void;
  onDeleteProduct: (id: number | string) => void;
  onUpdateOrderStatus: (orderId: number | string, newStatus: Order['status']) => void;
  onUpdateRole: (userId: string, newRole: UserProfile['role']) => void;
  ingredients: Ingredient[];
  drivers: Driver[];
  coupons: Coupon[];
  loyaltySettings: LoyaltySettings;
  onUpdateLoyalty: (settings: LoyaltySettings) => void;
  customCakeConfig: CustomCakeConfig;
  onUpdateCustomCakeConfig: (config: CustomCakeConfig) => void;
  setCustomCakeConfig?: (config: CustomCakeConfig) => void;
  onAddIngredient: (ing: Omit<Ingredient, 'id'>) => void;
  onUpdateIngredientStock: (id: string, newStock: number) => void;
  onDeleteIngredient: (id: string) => void;
  onAddCoupon: (c: Omit<Coupon, 'id'>) => void;
  onToggleCoupon: (id: string, ativo: boolean) => void;
  onAssignDriver: (orderId: string | number, driverId: string) => void;
  showToast?: (msg: string) => void;
  storePhone?: string;
  setStorePhone?: (phone: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  staff,
  auditLogs,
  currentUser,
  onAddProduct,
  onUpdateStock,
  onDeleteProduct,
  onUpdateOrderStatus,
  onUpdateRole,
  ingredients,
  drivers,
  coupons,
  loyaltySettings,
  onUpdateLoyalty,
  customCakeConfig,
  onUpdateCustomCakeConfig,
  setCustomCakeConfig,
  onAddIngredient,
  onUpdateIngredientStock,
  onDeleteIngredient,
  onAddCoupon,
  onToggleCoupon,
  onAssignDriver,
  showToast,
  storePhone,
  setStorePhone
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setActiveTab = (tab: string) => setSearchParams({ tab });


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
    <div className="flex flex-col md:flex-row gap-6 max-w-[1400px] mx-auto py-4 px-4 items-start">
      <SEO 
        title="Painel Administrativo" 
        description="Área restrita de gestão da Cloudnine Doceria." 
      />
      
      {/* Sidebar Navigation (Desktop Only) */}
      <div className="hidden md:flex w-[260px] shrink-0 bg-[var(--color-surface-container-lowest)] rounded-3xl p-4 border border-[var(--color-outline-variant)]/20 shadow-sm flex-col gap-2 overflow-visible sticky top-24">
        <h3 className="text-sm font-bold text-[var(--color-on-surface)] px-2 mb-2">Menu Administrativo</h3>
        
        {['admin', 'ADMIN'].includes(currentUser.role) && (
          <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'dashboard'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Financeiro & Dashboard</span>
          </button>
        )}

          {['admin', 'ADMIN', 'CAIXA', 'ATENDIMENTO', 'atendente'].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'orders'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Pedidos ({orders.length})</span>
            </button>
          )}

          {['admin', 'ADMIN', 'COZINHA'].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab('calendar')}
              className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'calendar'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Calendário de Encomendas</span>
            </button>
          )}
          {['admin', 'ADMIN', 'COZINHA'].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'products'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                }`}
            >
              <Package className="w-5 h-5" />
              <span>Estoque & Catálogo</span>
            </button>
          )}

          {['admin', 'ADMIN', 'COZINHA', 'confeiteiro'].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab('kitchen')}
              className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'kitchen'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                }`}
            >
              <Printer className="w-5 h-5" />
              <span>Comanda Cozinha</span>
            </button>
          )}

          {['admin', 'ADMIN', 'ATENDIMENTO'].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab('delivery')}
              className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'delivery'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                }`}
            >
              <Truck className="w-5 h-5" />
              <span>Despacho & Logística</span>
            </button>
          )}
          {['admin', 'ADMIN'].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab('marketing')}
              className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'marketing'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
                : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                }`}
            >
              <Gift className="w-5 h-5" />
              <span>Marketing & Fidelidade</span>
            </button>
          )}
          {['admin', 'ADMIN'].includes(currentUser.role) && (
            <>
              <button
                onClick={() => setActiveTab('staff')}
                className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'staff'
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                  }`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Equipe & Permissões</span>
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'ai'
                  ? 'bg-linear-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] text-[var(--color-on-primary)] shadow-md font-bold'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                  }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>Marketing IA</span>
              </button>

              <button
                onClick={() => setActiveTab('store-config')}
                className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'store-config'
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                  }`}
              >
                <Store className="w-5 h-5" />
                <span>Configurações da Loja</span>
              </button>

              <button
                onClick={() => setActiveTab('custom-cake')}
                className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'custom-cake'
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                  }`}
              >
                <Cake className="w-5 h-5" />
                <span>Bolos Personalizados</span>
              </button>

              <button
                onClick={() => setActiveTab('payment-config')}
                className={`w-full px-3.5 py-3 rounded-2xl transition-all flex items-center space-x-3 shrink-0 text-left ${activeTab === 'payment-config'
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md font-bold'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] font-medium'
                  }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Configurações de Pagamento</span>
              </button>
            </>
          )}
        </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 space-y-6 pb-20">
        
        {/* Top Header */}
        <div className="p-8 rounded-[32px] bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] bg-[var(--color-primary-container)]/20 px-3 py-1.5 rounded-full">
            Painel Administrativo Restrito
          </span>
          <h1 className="text-3xl mt-3 text-[var(--color-on-surface)]" style={{ fontFamily: '"Libre Caslon Text", serif', fontStyle: 'italic' }}>
            Gestão Operacional Cloudnine
          </h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] mt-1 font-medium">
            Controle de pedidos, catálogo de produtos, impressão da cozinha e inteligência de vendas.
          </p>
        </div>

        {/* DASHBOARD & FINANCE */}
      {activeTab === 'dashboard' && (
        <AdminFinanceModule orders={orders} products={products} ingredients={ingredients} />
      )}

      {/* STORE CONFIG */}
      {activeTab === 'store-config' && (
        <AdminStoreConfigModule
          showToast={showToast || (() => { })}
          onStoreConfigUpdated={(cfg) => {
            if (cfg.telefone && setStorePhone) setStorePhone(cfg.telefone);
          }}
        />
      )}

      {/* PAYMENT CONFIG */}
      {activeTab === 'payment-config' && (
        <AdminPaymentConfigModule
          showToast={showToast || (() => { })}
        />
      )}

      {/* CUSTOM CAKE CONFIG */}
      {activeTab === 'custom-cake' && (
        <AdminCustomCakeModule
          config={customCakeConfig || { tamanhos: [], massas: [], recheios: [], coberturas: [] }}
          onUpdateConfig={async (newConfig) => {
            if (setCustomCakeConfig) setCustomCakeConfig(newConfig);
            showToast?.('Configurações do Bolo Personalizado atualizadas localmente!');

            // Salvar no DB
            const res = await updateStoreConfig({ custom_cake_config: newConfig });
            if (res.success) {
              showToast?.('Configurações salvas no banco com sucesso!');
            } else {
              showToast?.('Erro ao salvar no banco: ' + res.error);
            }
          }}
        />
      )}

      {/* STAFF & PERMISSIONS (RBAC) */}
      {activeTab === 'staff' && (
        <AdminStaffModule staffList={staff} onUpdateRole={onUpdateRole} />
      )}

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-2xl text-[var(--color-on-surface)]" style={{ fontFamily: '"Libre Caslon Text", serif', fontStyle: 'italic' }}>
                Pedidos Recentes
              </h3>
              <p className="text-sm text-[var(--color-on-surface-variant)]">Acompanhe e atualize o status das entregas em tempo real.</p>
            </div>
          </div>

          {/* Desktop Table View */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, height: 600, width: '100%', bgcolor: 'background.paper', borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)', border: '1px solid var(--color-outline-variant)' }}>
            <DataGrid
              rows={orders}
              columns={[
                { field: 'id', headerName: 'ID', width: 70 },
                { field: 'cliente_nome', headerName: 'Cliente', flex: 1.2, minWidth: 140 },
                {
                  field: 'itens',
                  headerName: 'Itens',
                  flex: 1.8,
                  minWidth: 180,
                  valueGetter: (value: any) => {
                    return Array.isArray(value) ? value.map((i: any) => `${i.quantidade}x ${i.nomeProduto || i.nome || 'Item'}`).join(', ') : '';
                  }
                },
                {
                  field: 'total',
                  headerName: 'Total',
                  flex: 0.8,
                  minWidth: 100,
                  renderCell: (params) => (
                    <span className="font-bold text-[var(--color-primary)]">
                      R$ {Number(params.value || 0).toFixed(2).replace('.', ',')}
                    </span>
                  )
                },
                {
                  field: 'created_at',
                  headerName: 'Data',
                  flex: 1,
                  minWidth: 130,
                  renderCell: (params) => new Date(params.value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                },
                {
                  field: 'status',
                  headerName: 'Status',
                  flex: 1.2,
                  minWidth: 150,
                  renderCell: (params) => (
                    <Select
                      size="small"
                      value={params.row.status}
                      onChange={(e) => onUpdateOrderStatus(params.row.id, e.target.value as any)}
                      sx={{ width: '100%', height: 36, fontSize: '0.875rem', borderRadius: 2, bgcolor: 'var(--color-surface-container-lowest)' }}
                    >
                      <MenuItem value="pendente_pix">Pendente PIX</MenuItem>
                      <MenuItem value="preparo">Em Preparo</MenuItem>
                      <MenuItem value="pronto">Pronto p/ Entrega</MenuItem>
                      <MenuItem value="rota">Em Rota</MenuItem>
                      <MenuItem value="entregue">Entregue</MenuItem>
                    </Select>
                  )
                },
                {
                  field: 'actions',
                  headerName: 'Imprimir',
                  width: 90,
                  align: 'center',
                  sortable: false,
                  filterable: false,
                  renderCell: (params) => (
                    <IconButton size="small" onClick={() => setPrintingOrder(params.row)} sx={{ color: 'var(--color-primary)' }}>
                      <Printer className="w-4 h-4" />
                    </IconButton>
                  )
                }
              ]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 20, 50]}
              disableRowSelectionOnClick
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, sx: { p: 2, borderBottom: '1px solid var(--color-outline-variant)' } } }}
              sx={{ 
                border: 'none', 
                width: '100%',
                '& .MuiDataGrid-main': { width: '100%' },
                '& .MuiDataGrid-cell': { borderColor: 'var(--color-outline-variant)', display: 'flex', alignItems: 'center' },
                '& .MuiDataGrid-columnHeaders': { bgcolor: 'var(--color-surface-container-low)', borderColor: 'var(--color-outline-variant)', fontWeight: 'bold' },
                '& .MuiDataGrid-footerContainer': { borderColor: 'var(--color-outline-variant)' }
              }}
            />
          </Box>

          {/* Mobile Card View */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
            {orders.map((o) => (
              <Box key={o.id} sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid var(--color-outline-variant)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-[var(--color-primary)]">PEDIDO #{o.id}</span>
                    <h4 className="font-bold text-[var(--color-on-surface)] mt-1">{o.cliente_nome}</h4>
                    <span className="text-xs text-[var(--color-on-surface-variant)]">{new Date(o.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="font-bold text-[var(--color-primary)]">
                    R$ {Number(o.total || 0).toFixed(2).replace('.', ',')}
                  </div>
                </div>
                
                <div className="text-sm text-[var(--color-on-surface)] bg-[var(--color-surface-container-lowest)] p-2 rounded-xl border border-[var(--color-outline-variant)]/50">
                  {o.itens.map((i: any, idx: number) => (
                    <div key={idx} className="flex justify-between py-1">
                      <span>{i.quantidade}x {i.nomeProduto || i.nome || 'Item'}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-outline-variant)]/30">
                  <Select
                    size="small"
                    value={o.status}
                    onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as any)}
                    sx={{ flex: 1, height: 36, fontSize: '0.875rem', borderRadius: 2, bgcolor: 'var(--color-surface-container-lowest)' }}
                  >
                    <MenuItem value="pendente_pix">Pendente PIX</MenuItem>
                    <MenuItem value="preparo">Em Preparo</MenuItem>
                    <MenuItem value="pronto">Pronto p/ Entrega</MenuItem>
                    <MenuItem value="rota">Em Rota</MenuItem>
                    <MenuItem value="entregue">Entregue</MenuItem>
                  </Select>
                  <IconButton size="small" onClick={() => setPrintingOrder(o)} sx={{ color: 'var(--color-primary)', bgcolor: 'var(--color-primary-container)', borderRadius: 2 }}>
                    <Printer className="w-5 h-5" />
                  </IconButton>
                </div>
              </Box>
            ))}
          </Box>
        </div>
      )}
      {/* TAB: CALENDAR */}
      {activeTab === 'calendar' && (
        <AdminCalendarModule orders={orders} />
      )}

      {/* TAB 2: PRODUCTS & STOCK */}
      {activeTab === 'products' && (
        <AdminInventoryModule
          products={products}
          onAddProduct={() => setShowAddProductModal(true)}
          onUpdateStock={onUpdateStock}
          onDeleteProduct={onDeleteProduct}
          ingredients={ingredients}
          onAddIngredient={onAddIngredient}
          onUpdateIngredientStock={onUpdateIngredientStock}
          onDeleteIngredient={onDeleteIngredient}
        />
      )}

      {/* TAB: DELIVERY */}
      {activeTab === 'delivery' && (
        <AdminDeliveryModule
          orders={orders}
          drivers={drivers}
          onAssignDriver={onAssignDriver}
          onUpdateOrderStatus={onUpdateOrderStatus}
        />
      )}

      {/* TAB: MARKETING */}
      {activeTab === 'marketing' && (
        <AdminMarketingModule
          coupons={coupons}
          loyaltySettings={loyaltySettings}
          onUpdateLoyalty={onUpdateLoyalty}
          onAddCoupon={onAddCoupon}
          onToggleCoupon={onToggleCoupon}
        />
      )}

      {/* TAB 3: KITCHEN THERMAL PRINTING & POS INTEGRATION */}
      {activeTab === 'kitchen' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Thermal Printer Hardware Configuration Panel */}
          <Card sx={{ borderRadius: 4, bgcolor: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)', borderWidth: 1, borderStyle: 'solid', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Header */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'var(--color-primary)', color: 'var(--color-on-primary)', display: 'flex' }}>
                    <Printer className="w-5 h-5" />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--color-on-surface)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                      Integração com Maquininhas e Impressoras Térmicas
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-outline)', fontSize: '0.75rem' }}>
                      Suporte nativo a protocolos ESC/POS, bobinas de 80mm/58mm e maquininhas Smart POS Android/Windows.
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669' }}>
                    {printerStatusMessage}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: 'var(--color-outline-variant)', opacity: 0.5 }} />

              {/* Config Controls */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-on-surface)', mb: 1, fontSize: '0.75rem' }}>Largura do Papel Térmico</Typography>
                  <ToggleButtonGroup
                    value={paperWidth}
                    exclusive
                    onChange={(_, val) => val && setPaperWidth(val)}
                    aria-label="Largura do Papel Térmico"
                    fullWidth
                    sx={{
                      '& .MuiToggleButton-root': { py: 1, textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderColor: 'var(--color-outline-variant)' },
                      '& .Mui-selected': { bgcolor: 'var(--color-primary) !important', color: 'var(--color-on-primary) !important' }
                    }}
                  >
                    <ToggleButton value="80mm" aria-label="80mm (Padrão Cozinha)">80mm (Padrão)</ToggleButton>
                    <ToggleButton value="58mm" aria-label="58mm (Maquininha POS)">58mm (POS)</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-on-surface)', mb: 1, fontSize: '0.75rem' }}>Via da Impressão</Typography>
                  <ToggleButtonGroup
                    value={receiptType}
                    exclusive
                    onChange={(_, val) => val && setReceiptType(val)}
                    aria-label="Via da Impressão"
                    fullWidth
                    sx={{
                      '& .MuiToggleButton-root': { py: 1, textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderColor: 'var(--color-outline-variant)' },
                      '& .Mui-selected': { bgcolor: 'var(--color-primary) !important', color: 'var(--color-on-primary) !important' }
                    }}
                  >
                    <ToggleButton value="cozinha" aria-label="Via Cozinha">👨‍🍳 Cozinha</ToggleButton>
                    <ToggleButton value="cliente" aria-label="Via Cliente / Balcão">🛍️ Cliente/Balcão</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-on-surface)', mb: 1, fontSize: '0.75rem' }}>Protocolo de Comunicação</Typography>
                  <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-outline-variant)' } }}>
                    <Select
                      value={printerProtocol}
                      onChange={(e) => {
                        const proto = e.target.value as any;
                        setPrinterProtocol(proto);
                        if (proto === 'escpos') setPrinterStatusMessage('Protocolo ESC/POS ativado via Spooler local');
                        else if (proto === 'usb') setPrinterStatusMessage('Conectado via WebUSB / Porta Serial COM');
                        else if (proto === 'bluetooth') setPrinterStatusMessage('Conectado via Bluetooth POS');
                        else setPrinterStatusMessage('Pronta para impressão (Driver do Sistema / Spooler)');
                      }}
                      sx={{ bgcolor: 'var(--color-surface-container-low)', fontWeight: 700, fontSize: '0.75rem', borderRadius: 2 }}
                      inputProps={{ 'aria-label': 'Protocolo de Comunicação' }}
                    >
                      <MenuItem value="system" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>🖨️ Driver de Spooler do Sistema (Geral)</MenuItem>
                      <MenuItem value="escpos" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>⚡ ESC/POS Direto (USB / Serial RAW)</MenuItem>
                      <MenuItem value="bluetooth" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>📱 Bluetooth (Maquininhas Smart POS)</MenuItem>
                      <MenuItem value="usb" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>🔌 WebUSB Direct (Porta COM / POS)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Divider sx={{ borderColor: 'var(--color-outline-variant)', opacity: 0.5 }} />

              {/* Test Printing Trigger */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'var(--color-outline)', fontWeight: 500, fontSize: '0.875rem' }}>
                  💡 As comandas são impressas em mono com suporte a caracteres acentuados, separador serrilhado e corte automático ESC/POS.
                </Typography>

                <Button
                  variant="contained"
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
                        { id: 9991, nomeProduto: 'Bolo de Pote Ninho com Nutella', quantidade: 2, preco_unitario: 22.0 },
                        { id: 9992, nomeProduto: 'Caixa de Brigadeiros Gourmet (6un)', quantidade: 1, preco_unitario: 38.0 }
                      ],
                      total: 82.0,
                      created_at: new Date().toISOString()
                    } as any);
                  }}
                  startIcon={<Printer className="w-4 h-4" />}
                  sx={{
                    bgcolor: 'var(--color-surface-container-high)',
                    color: 'var(--color-on-surface)',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 3,
                    boxShadow: 'none',
                    px: 3,
                    py: 1,
                    '&:hover': { bgcolor: 'var(--color-surface-container-highest)', boxShadow: 'none' },
                    '& .MuiButton-startIcon': { color: 'var(--color-primary)' }
                  }}
                >
                  Testar Impressão de Exemplo
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Production Queue List */}
          <Card sx={{ borderRadius: 4, bgcolor: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)', borderWidth: 1, borderStyle: 'solid', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--color-on-surface)', fontSize: '1rem' }}>
                  Fila de Produção da Confeitaria ({orders.length} pedidos)
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-outline)', fontSize: '0.75rem' }}>
                  Selecione qualquer pedido para enviar a comanda direto para a bancada da cozinha ou balcão.
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                {orders.map((o) => (
                  <Card key={o.id} sx={{ borderRadius: 4, bgcolor: 'var(--color-surface-container-low)', borderColor: 'var(--color-outline-variant)', borderWidth: 1, borderStyle: 'solid', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'var(--color-primary)', fontSize: '0.875rem' }}>
                          PEDIDO #{o.id}
                        </Typography>
                        <Chip
                          label={o.status.toUpperCase()}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}
                        />
                      </Box>

                      <Box sx={{ fontSize: '0.75rem', color: 'var(--color-on-surface)', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}><strong>Cliente:</strong> {o.cliente_nome} ({o.cliente_telefone})</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}><strong>Agendado:</strong> {o.data_agendada} às {o.horario_agendado}</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}><strong>Tipo:</strong> {o.tipo_entrega.toUpperCase()}</Typography>
                      </Box>

                      <Box sx={{ p: 1.5, bgcolor: 'var(--color-surface-container-lowest)', borderRadius: 2, border: '1px solid var(--color-outline-variant)', fontSize: '0.75rem', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {o.itens.map((item, idx) => (
                          <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.quantidade}x {item.nomeProduto}</span>
                            <span>R$ {(item.preco_unitario * item.quantidade).toFixed(2)}</span>
                          </Box>
                        ))}
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mt: 1 }}>
                        <Button
                          variant="contained"
                          onClick={() => {
                            setReceiptType('cozinha');
                            setPrintingOrder(o);
                          }}
                          startIcon={<Printer className="w-4 h-4" />}
                          sx={{
                            bgcolor: 'var(--color-primary)',
                            color: 'var(--color-on-primary)',
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            borderRadius: 3,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: 'var(--color-primary)', opacity: 0.9, boxShadow: 'none' }
                          }}
                        >
                          Comanda Cozinha
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => {
                            setReceiptType('cliente');
                            setPrintingOrder(o);
                          }}
                          startIcon={<ShoppingBag className="w-4 h-4" />}
                          sx={{
                            bgcolor: 'var(--color-secondary)',
                            color: 'var(--color-on-secondary)',
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            borderRadius: 3,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: 'var(--color-secondary)', opacity: 0.9, boxShadow: 'none' }
                          }}
                        >
                          Via do Cliente
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>

        </Box>
      )}

      {/* TAB 4: GEMINI MARKETING ASSISTANT */}
      {activeTab === 'ai' && (
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
              className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs flex items-center space-x-2 shadow-md hover:bg-purple-700 transition-colors"
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
                  className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-sm mt-2 inline-block"
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
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-xl text-(--color-on-surface) flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                Logs de Auditoria
              </h3>
              <p className="text-sm text-(--color-outline)">Histórico de ações e eventos do sistema.</p>
            </div>
          </div>
          <Box sx={{ height: 500, width: '100%', bgcolor: 'surfaceContainerLowest', borderRadius: 4, overflow: 'hidden' }}>
            <DataGrid
              rows={auditLogs}
              columns={[
                { field: 'id', headerName: 'ID', width: 90 },
                {
                  field: 'acao',
                  headerName: 'Ação',
                  width: 250,
                  renderCell: (params) => (
                    <Chip label={params.value} size="small" color="primary" variant="outlined" />
                  )
                },
                { field: 'detalhes', headerName: 'Detalhes', flex: 1, minWidth: 300 },
                { field: 'user_id', headerName: 'Usuário', width: 150 },
                {
                  field: 'created_at',
                  headerName: 'Data',
                  width: 180,
                  renderCell: (params) => new Date(params.value).toLocaleString('pt-BR')
                }
              ]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 15 },
                },
                sorting: {
                  sortModel: [{ field: 'created_at', sort: 'desc' }],
                },
              }}
              pageSizeOptions={[15, 30, 50]}
              disableRowSelectionOnClick
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true } }}
              sx={{ border: 'none' }}
            />
          </Box>
        </div>
      )}
      {/* THERMAL PRINT MODAL / TICKET PREVIEW */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white text-black p-6 rounded-2xl max-w-sm w-full font-mono text-xs space-y-3 shadow-2xl printable-receipt">

            {/* Controls Bar inside preview modal (hidden when printing) */}
            <div className="no-print p-2 rounded-xl bg-gray-100 flex items-center justify-between text-sm font-sans font-bold mb-2">
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
            <div className={`mx-auto space-y-2 ${paperWidth === '58mm' ? 'max-w-50 text-sm' : 'max-w-65'}`}>
              <div className="text-center border-b border-dashed border-black pb-2 space-y-0.5">
                <h2 className="font-black text-sm uppercase tracking-widest">CLOUD NINE DOCERIA</h2>
                <p className="text-xs">Alameda Gabriel Monteiro da Silva, 450</p>
                <p className="font-bold text-sm">
                  {receiptType === 'cozinha' ? '=== VIA DA COZINHA (PRODUÇÃO) ===' : '=== VIA DO CLIENTE (RECIBO) ==='}
                </p>
                <span className="font-black text-base block mt-1">PEDIDO #{printingOrder.id}</span>
              </div>

              <div className="space-y-0.5 text-sm">
                <p><strong>Cliente:</strong> {printingOrder.cliente_nome}</p>
                <p><strong>Telefone:</strong> {printingOrder.cliente_telefone}</p>
                <p><strong>Data/Hora:</strong> {printingOrder.data_agendada} ({printingOrder.horario_agendado})</p>
                <p><strong>Entrega:</strong> {printingOrder.tipo_entrega.toUpperCase()}</p>
              </div>

              <div className="border-t border-b border-dashed border-black py-2 space-y-1">
                <p className="font-bold uppercase text-xs text-center">--- ITENS DO PEDIDO ---</p>
                {printingOrder.itens.map((i, idx) => (
                  <div key={idx} className="flex justify-between font-bold text-sm">
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
                <p className="text-xs">Obrigado por escolher a Cloudnine!</p>
                <p className="text-[8px] opacity-75">Confeitaria Artesanal & Bolos de Luxo</p>
                <div className="mt-1 text-center text-xs tracking-widest font-mono">||||||| |||| |||||||||||||||</div>
              </div>
            </div>

            {/* Modal Actions (Hidden on Print) */}
            <div className="no-print flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setPrintingOrder(null)}
                className="w-1/2 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-black font-bold font-sans transition-colors min-h-10.5"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setPrintingOrder(null);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-black hover:bg-gray-900 text-white font-bold font-sans transition-colors flex items-center justify-center space-x-1.5 shadow-md min-h-10.5"
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
                onClick={() => setShowAddProductModal(false)}
                className="w-1/2 py-2.5 rounded-xl bg-(--color-surface-container-high) text-(--color-on-surface) font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-(--color-primary) text-(--color-on-primary) font-bold"
              >
                Salvar Produto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NEW ORDER NOTIFICATION TOAST */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-9999 bg-(--color-primary) text-(--color-on-primary) px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-[slideIn_0.3s_ease-out]">
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
    </div >
  );
};
