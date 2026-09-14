import React, { useState, useMemo, useEffect } from 'react';
import { Collapse } from '@mui/material';
import { 
  Printer, Tote, MapPin, CaretDown, CaretUp, Check, ArrowUUpLeft, X, 
  CookingPot, Clock, MagnifyingGlass, SpeakerHigh, SpeakerSimpleSlash, 
  CornersOut, CornersIn, Warning, CheckCircle, Lightning, Fire, Timer,
  Package
} from '@phosphor-icons/react';
import { Order } from '@/src/core/types/index';

/*
╔══════════════════════════════════════════════════════════════╗
║                   LEGENDA DE CORES DO KDS                    ║
╠══════════════════════════════════════════════════════════════╣
║  🔵 AZUL    = NOVO pedido (aguardando início do preparo)     ║
║  🟠 LARANJA = EM PREPARO (confeiteiro trabalhando)           ║
║  🟢 VERDE   = PRONTO (esperando retirada/entrega)           ║
║  🔴 VERMELHO= CANCELADO ou ATRASADO (>15min de espera)      ║
║  🟡 AMARELO = ATENÇÃO / Observações do cliente               ║
╚══════════════════════════════════════════════════════════════╝
*/

interface AdminKitchenModuleProps {
  orders: Order[];
  paperWidth: '80mm' | '58mm';
  setPaperWidth: (w: '80mm' | '58mm') => void;
  receiptType: 'cozinha' | 'cliente';
  setReceiptType: (t: 'cozinha' | 'cliente') => void;
  printerProtocol: string;
  setPrinterProtocol: (p: string) => void;
  printerStatusMessage: string;
  setPrinterStatusMessage: (msg: string) => void;
  onPrintOrder: (order: Order) => void;
  onUpdateOrderStatus?: (orderId: string, status: Order['status']) => void;
}

export const AdminKitchenModule: React.FC<AdminKitchenModuleProps> = ({
  orders,
  paperWidth,
  setPaperWidth,
  receiptType,
  setReceiptType,
  printerProtocol,
  setPrinterProtocol,
  printerStatusMessage,
  setPrinterStatusMessage,
  onPrintOrder,
  onUpdateOrderStatus
}) => {
  const [showPrinterSettings, setShowPrinterSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'abertos' | 'finalizados' | 'cancelados'>('abertos');
  const [filterType, setFilterType] = useState<'todos' | 'presencial' | 'delivery'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [nowTime, setNowTime] = useState(Date.now());
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Clock tick every 15s for live wait timers
  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const playAlertSound = () => {
    try {
      new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
    } catch {}
  };

  const toggleItemCheck = (orderId: string | number, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isPresencial = (tipo: string) => tipo === 'mesa' || tipo === 'retirada';

  // ─── KPI Metrics ──────────────────────────────────────────
  const activeOrdersCount = useMemo(() => 
    orders.filter(o => ['em_preparo', 'pendente_pix'].includes(o.status)).length, [orders]);
  
  const urgentOrdersCount = useMemo(() => 
    orders.filter(o => {
      if (!['em_preparo', 'pendente_pix'].includes(o.status)) return false;
      return (nowTime - new Date(o.created_at).getTime()) / 60000 > 15;
    }).length, [orders, nowTime]);

  const completedTodayCount = useMemo(() => 
    orders.filter(o => ['pronto', 'pronto_retirada', 'entregue'].includes(o.status)).length, [orders]);

  const cancelledCount = useMemo(() => 
    orders.filter(o => o.status === 'cancelado').length, [orders]);

  // ─── Filtering & Sorting ─────────────────────────────────
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      let tabMatch = false;
      if (activeTab === 'abertos') tabMatch = ['em_preparo', 'pendente_pix'].includes(o.status);
      else if (activeTab === 'finalizados') tabMatch = ['pronto', 'pronto_retirada', 'saiu_entrega', 'entregue'].includes(o.status);
      else if (activeTab === 'cancelados') tabMatch = o.status === 'cancelado';
      if (!tabMatch) return false;

      if (filterType === 'presencial' && !isPresencial(o.tipo_entrega)) return false;
      if (filterType === 'delivery' && isPresencial(o.tipo_entrega)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = String(o.id).includes(q) || o.cliente_nome.toLowerCase().includes(q) || (o.mesa && String(o.mesa).includes(q));
        if (!match) return false;
      }
      return true;
    }).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [orders, activeTab, filterType, searchQuery]);

  // ─── Semantic Color Functions ─────────────────────────────
  // Each status has a DISTINCT color so the cook can identify at a glance
  const getCardBorderColor = (status: string, elapsedMin: number) => {
    if (elapsedMin > 20 && ['em_preparo', 'pendente_pix'].includes(status)) return 'border-rose-500 dark:border-rose-600';
    if (elapsedMin > 15 && ['em_preparo', 'pendente_pix'].includes(status)) return 'border-amber-400 dark:border-amber-600';
    switch (status) {
      case 'pendente_pix': return 'border-blue-400 dark:border-blue-700';
      case 'em_preparo': return 'border-orange-400 dark:border-orange-700';
      case 'pronto': case 'pronto_retirada': case 'entregue': case 'saiu_entrega': return 'border-emerald-400 dark:border-emerald-700';
      case 'cancelado': return 'border-rose-400 dark:border-rose-700';
      default: return 'border-neutral-300 dark:border-neutral-700';
    }
  };

  const getHeaderBg = (status: string, elapsedMin: number) => {
    if (elapsedMin > 20 && ['em_preparo', 'pendente_pix'].includes(status)) return 'bg-rose-500 dark:bg-rose-700';
    if (elapsedMin > 15 && ['em_preparo', 'pendente_pix'].includes(status)) return 'bg-amber-500 dark:bg-amber-700';
    switch (status) {
      case 'pendente_pix': return 'bg-blue-500 dark:bg-blue-700';
      case 'em_preparo': return 'bg-orange-500 dark:bg-orange-700';
      case 'pronto': case 'pronto_retirada': case 'entregue': case 'saiu_entrega': return 'bg-emerald-500 dark:bg-emerald-700';
      case 'cancelado': return 'bg-rose-500 dark:bg-rose-700';
      default: return 'bg-neutral-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente_pix': return { label: 'NOVO', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
      case 'em_preparo': return { label: 'EM PREPARO', bg: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' };
      case 'pronto': case 'pronto_retirada': return { label: 'PRONTO ✓', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
      case 'saiu_entrega': return { label: 'SAIU ENTREGA', bg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' };
      case 'entregue': return { label: 'ENTREGUE', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
      case 'cancelado': return { label: 'CANCELADO', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' };
      default: return { label: status.toUpperCase(), bg: 'bg-neutral-100 text-neutral-700' };
    }
  };

  const getProgressBarColor = (percent: number) => {
    if (percent === 100) return 'bg-emerald-500';
    if (percent >= 50) return 'bg-blue-500';
    if (percent > 0) return 'bg-orange-400';
    return 'bg-neutral-300';
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5 font-sans">
      
      {/* ═══ KPI BAR ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Fila na Cozinha — LARANJA */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-3 sm:p-4 border-l-4 border-orange-500 border-t border-r border-b border-t-neutral-200/80 border-r-neutral-200/80 border-b-neutral-200/80 dark:border-t-neutral-800 dark:border-r-neutral-800 dark:border-b-neutral-800 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center shrink-0">
            <CookingPot className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-neutral-600 dark:text-neutral-400 truncate">Fila Cozinha</p>
            <h4 className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 leading-tight">{activeOrdersCount}</h4>
          </div>
        </div>

        {/* Atrasados (>15min) — VERMELHO */}
        <div className={`bg-white dark:bg-neutral-900 rounded-2xl p-3 sm:p-4 border-l-4 ${urgentOrdersCount > 0 ? 'border-rose-500' : 'border-emerald-500'} border-t border-r border-b border-t-neutral-200/80 border-r-neutral-200/80 border-b-neutral-200/80 dark:border-t-neutral-800 dark:border-r-neutral-800 dark:border-b-neutral-800 shadow-xs flex items-center gap-3`}>
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${urgentOrdersCount > 0 ? 'bg-rose-50 dark:bg-rose-950/50' : 'bg-emerald-50 dark:bg-emerald-950/50'}`}>
            {urgentOrdersCount > 0 ? <Fire className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" /> : <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-neutral-600 dark:text-neutral-400 truncate">Atrasados &gt;15m</p>
            <h4 className={`text-xl sm:text-2xl font-black leading-tight ${urgentOrdersCount > 0 ? 'text-rose-600 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {urgentOrdersCount}
            </h4>
          </div>
        </div>

        {/* Concluídos — VERDE */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-3 sm:p-4 border-l-4 border-emerald-500 border-t border-r border-b border-t-neutral-200/80 border-r-neutral-200/80 border-b-neutral-200/80 dark:border-t-neutral-800 dark:border-r-neutral-800 dark:border-b-neutral-800 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-neutral-600 dark:text-neutral-400 truncate">Concluídos Hoje</p>
            <h4 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">{completedTodayCount}</h4>
          </div>
        </div>

        {/* Controles do KDS */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-3 sm:p-4 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <p className="text-[10px] sm:text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-2">Controles KDS</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border transition-colors ${soundEnabled ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950 dark:border-blue-800' : 'bg-neutral-100 border-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:border-neutral-700'}`}
              title={soundEnabled ? "Som Ativado" : "Som Mudo"}
            >
              {soundEnabled ? <SpeakerHigh className="w-4 h-4" /> : <SpeakerSimpleSlash className="w-4 h-4" />}
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
              title="Tela Cheia (TV)"
            >
              {isFullscreen ? <CornersIn className="w-4 h-4" /> : <CornersOut className="w-4 h-4" />}
            </button>
            <button 
              onClick={playAlertSound}
              className="px-2.5 py-2 bg-amber-100 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 hover:bg-amber-200 text-amber-700 dark:text-amber-300 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
            >
              🔔 Teste
            </button>
          </div>
        </div>
      </div>

      {/* ═══ CONTROL HEADER ═══ */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xs border border-neutral-200/80 dark:border-neutral-800 flex flex-col gap-3 sm:gap-4">
        
        {/* Row 1: Title + Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="p-1.5 sm:p-2 bg-orange-500 text-white rounded-xl shadow-xs">
              <CookingPot className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-neutral-900 dark:text-white leading-none">
                KDS Cozinha
              </h2>
              <span className="text-[10px] sm:text-[11px] font-bold text-orange-600 dark:text-orange-400">Display Operacional</span>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-neutral-200 dark:bg-neutral-800 mx-1 shrink-0"></div>

          {/* Tab Pills — scrollable on mobile */}
          <div className="flex bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-xl gap-0.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveTab('abertos')}
              className={`min-h-[44px] min-w-[44px] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-black whitespace-nowrap transition-all ${
                activeTab === 'abertos' 
                ? 'bg-orange-500 text-white shadow-xs' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              🔥 Ativos ({activeOrdersCount})
            </button>
            <button
              onClick={() => setActiveTab('finalizados')}
              className={`min-h-[44px] min-w-[44px] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-black whitespace-nowrap transition-all ${
                activeTab === 'finalizados' 
                ? 'bg-emerald-500 text-white shadow-xs' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              ✅ Prontos ({completedTodayCount})
            </button>
            <button
              onClick={() => setActiveTab('cancelados')}
              className={`min-h-[44px] min-w-[44px] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-black whitespace-nowrap transition-all ${
                activeTab === 'cancelados' 
                ? 'bg-rose-500 text-white shadow-xs' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              ❌ Cancelados ({cancelledCount})
            </button>
          </div>
        </div>

        {/* Row 2: Search + Channel Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text"
              placeholder="Buscar # comanda, nome ou mesa..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setFilterType('todos')}
              className={`min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'todos' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('presencial')}
              className={`min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'presencial' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
              }`}
            >
              🪑 Mesa
            </button>
            <button
              onClick={() => setFilterType('delivery')}
              className={`min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'delivery' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
              }`}
            >
              🛵 Delivery
            </button>
          </div>
        </div>

        {/* Color Legend (compact) */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 pt-2.5">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Novo</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span> Em Preparo</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Pronto</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-pulse"></span> Atenção (&gt;15m)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Atrasado/Cancelado</span>
        </div>
      </div>

      {/* ═══ PRINTER SETTINGS ═══ */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl shadow-xs border border-neutral-200/80 dark:border-neutral-800 overflow-hidden">
        <button 
          onClick={() => setShowPrinterSettings(!showPrinterSettings)}
          className="w-full px-4 sm:px-6 py-3 flex items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 sm:p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-neutral-600 dark:text-neutral-300">
              <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider truncate">Impressora Térmica</h3>
              <p className="text-[10px] sm:text-[11px] font-medium text-neutral-600 dark:text-neutral-400 truncate">{printerStatusMessage}</p>
            </div>
          </div>
          {showPrinterSettings ? <CaretUp className="w-4 h-4 text-neutral-400 shrink-0" /> : <CaretDown className="w-4 h-4 text-neutral-400 shrink-0" />}
        </button>
        
        <Collapse in={showPrinterSettings}>
          <div className="p-4 sm:p-5 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-2">Largura da Bobina</label>
                <div className="flex bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <button 
                    onClick={() => setPaperWidth('80mm')}
                    className={`flex-1 py-2 text-xs font-bold transition-colors ${paperWidth === '80mm' ? 'bg-blue-500 text-white' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'}`}
                  >
                    80mm
                  </button>
                  <button 
                    onClick={() => setPaperWidth('58mm')}
                    className={`flex-1 py-2 text-xs font-bold transition-colors border-l border-neutral-200 dark:border-neutral-700 ${paperWidth === '58mm' ? 'bg-blue-500 text-white' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'}`}
                  >
                    58mm (POS)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-2">Protocolo</label>
                <select
                  className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 dark:text-white outline-none focus:border-blue-500"
                  value={printerProtocol}
                  onChange={(e) => {
                    const proto = e.target.value;
                    setPrinterProtocol(proto);
                    if (proto === 'escpos') setPrinterStatusMessage('ESC/POS RAW ativado via Spooler Local');
                    else if (proto === 'usb') setPrinterStatusMessage('WebUSB / Porta Serial COM');
                    else if (proto === 'bluetooth') setPrinterStatusMessage('Bluetooth POS (PagBank / Mercado Pago)');
                    else setPrinterStatusMessage('Driver do Sistema / Spooler');
                  }}
                >
                  <option value="system">🖨️ Driver do Sistema</option>
                  <option value="escpos">⚡ ESC/POS Direto</option>
                  <option value="bluetooth">📱 Bluetooth POS</option>
                  <option value="usb">🔌 WebUSB Direct</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <button 
                  onClick={() => { if (orders.length > 0) { setReceiptType('cozinha'); onPrintOrder(orders[0]); } }}
                  className="py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Printer className="w-4 h-4" /> Testar Impressão
                </button>
              </div>
            </div>
          </div>
        </Collapse>
      </div>

      {/* ═══ KDS BOARD ═══ */}
      {filteredOrders.length === 0 ? (
        <div className="py-16 sm:py-20 text-center flex flex-col items-center justify-center bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800">
          <CookingPot className="w-12 h-12 sm:w-16 sm:h-16 mb-3 text-neutral-300 dark:text-neutral-600" />
          <h3 className="text-base sm:text-lg font-bold text-neutral-700 dark:text-neutral-300">Nenhuma comanda nesta aba</h3>
          <p className="text-xs text-neutral-400 max-w-xs mt-1 px-4">
            Pedidos do cardápio digital e mesas aparecerão aqui em tempo real.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-8 sm:pb-20 items-start">
          {filteredOrders.map((o) => {
            const isDelivery = o.tipo_entrega === 'entrega';
            const elapsedMinutes = Math.floor((nowTime - new Date(o.created_at).getTime()) / 60000);
            const timeSince = new Date(o.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            const deliveryAddressText = typeof o.endereco === 'object' 
              ? (o.endereco?.bairro || o.endereco?.rua || 'Endereço cadastrado') 
              : (o.endereco_entreg || 'Retirada Balcão');

            const checkedCount = o.itens.filter((_, idx) => checkedItems[`${o.id}-${idx}`]).length;
            const totalCount = o.itens.length;
            const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
            const isAllChecked = checkedCount === totalCount && totalCount > 0;

            const cardBorder = getCardBorderColor(o.status, elapsedMinutes);
            const headerBg = getHeaderBg(o.status, elapsedMinutes);
            const statusBadge = getStatusBadge(o.status);

            return (
              <div 
                key={o.id} 
                className={`rounded-2xl shadow-sm border-2 flex flex-col overflow-hidden transition-all duration-300 ${cardBorder} ${
                  isAllChecked ? 'ring-2 ring-emerald-400/40' : ''
                } ${elapsedMinutes > 20 && ['em_preparo', 'pendente_pix'].includes(o.status) ? 'animate-pulse' : ''}`}
              >
                {/* ──── CARD HEADER (colored by status) ──── */}
                <div className={`p-3 sm:p-4 text-white ${headerBg}`}>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <h3 className="font-black text-xl sm:text-2xl tracking-tight leading-none">#{o.id}</h3>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black tracking-wider uppercase ${statusBadge.bg} shrink-0`}>
                      {statusBadge.label}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                      {isDelivery ? <Tote className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      {isDelivery ? 'Delivery' : (o.mesa ? `Mesa ${o.mesa}` : 'Balcão')}
                    </span>
                    <span className="flex items-center gap-1 text-white/80 text-xs font-bold">
                      <Timer className="w-3.5 h-3.5" />
                      {elapsedMinutes}min
                    </span>
                  </div>
                  
                  <div className="mt-1 text-xs font-semibold text-white/80 line-clamp-1">
                    👤 {o.cliente_nome} {isDelivery && `· ${deliveryAddressText}`}
                  </div>

                  {/* Time alert strip */}
                  {['em_preparo', 'pendente_pix'].includes(o.status) && elapsedMinutes > 15 && (
                    <div className={`mt-2 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                      elapsedMinutes > 20 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/15 text-white/90'
                    }`}>
                      <Fire className="w-3 h-3" />
                      {elapsedMinutes > 20 ? 'ATRASADO! AÇÃO URGENTE' : 'ATENÇÃO: TEMPO ELEVADO'}
                    </div>
                  )}
                </div>

                {/* ──── PROGRESS BAR ──── */}
                <div className="px-3 sm:px-4 pt-3 bg-white dark:bg-neutral-900">
                  <div className="flex justify-between text-[10px] font-extrabold text-neutral-600 dark:text-neutral-400 mb-1">
                    <span>Progresso</span>
                    <span className={progressPercent === 100 ? 'text-emerald-600' : ''}>{checkedCount}/{totalCount} · {progressPercent}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`${getProgressBarColor(progressPercent)} h-full transition-all duration-500 ease-out`} 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* ──── ITEM CHECKLIST ──── */}
                <div className="p-3 sm:p-4 flex-1 overflow-y-auto bg-white dark:bg-neutral-900 min-h-[120px] max-h-[280px] sm:max-h-[320px]">
                  <div className="space-y-2">
                    {o.itens.map((item, idx) => {
                      const key = `${o.id}-${idx}`;
                      const isChecked = checkedItems[key] || false;
                      
                      return (
                        <label 
                          key={idx} 
                          className={`flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border-2 transition-all cursor-pointer select-none active:scale-[0.98] ${
                            isChecked 
                            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 opacity-60' 
                            : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 hover:border-orange-300 dark:hover:border-orange-700'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isChecked 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900'
                          }`}>
                            {isChecked && <Check className="w-3 h-3" weight="bold" />}
                          </div>
                          <input type="checkbox" checked={isChecked} onChange={() => toggleItemCheck(o.id, idx)} className="sr-only" />
                          
                          <div className="flex-1 leading-tight min-w-0">
                            <span className={`font-black text-[13px] sm:text-[0.95rem] block ${isChecked ? 'line-through text-neutral-400 dark:text-neutral-600' : 'text-neutral-900 dark:text-white'}`}>
                              {item.quantidade}x {item.nomeProduto || item.nome}
                            </span>
                            
                            {item.detalhesCustomizados && (
                              <div className="mt-1.5 p-1.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 rounded-lg text-[10px] sm:text-[11px] font-bold text-amber-800 dark:text-amber-300">
                                ⚠️ {item.detalhesCustomizados}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* ──── ACTIONS FOOTER ──── */}
                <div className="p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 flex flex-col gap-2">
                  {/* Print buttons row */}
                  <div className="flex gap-1.5 sm:gap-2">
                    <button
                      onClick={() => { setReceiptType('cozinha'); onPrintOrder(o); }}
                      className="flex-1 py-1.5 sm:py-2 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> Cozinha
                    </button>
                    <button
                      onClick={() => { setReceiptType('cliente'); onPrintOrder(o); }}
                      className="flex-1 py-1.5 sm:py-2 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> Cliente
                    </button>
                  </div>
                  
                  {/* Status action buttons */}
                  <div className="flex gap-1.5 sm:gap-2">
                    <button
                      onClick={() => {
                        const confirmCancel = window.confirm(`Atenção (Aversão à Perda):\n\nAo cancelar este pedido, a confeitaria perderá R$ ${(o.total || 0).toFixed(2)} em receita e o cliente será frustrado.\n\nDeseja realmente abortar o pedido #${o.id}?`);
                        if (confirmCancel) onUpdateOrderStatus?.(String(o.id), 'cancelado');
                      }}
                      className="min-w-[44px] min-h-[44px] py-2.5 sm:py-3 bg-white dark:bg-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-neutral-400 hover:text-rose-600 border border-neutral-200 dark:border-neutral-700 hover:border-rose-300 rounded-xl text-xs font-black flex items-center justify-center transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-blue-500 shrink-0"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {activeTab === 'abertos' && o.status === 'pendente_pix' && (
                      <button
                        onClick={() => onUpdateOrderStatus?.(String(o.id), 'em_preparo')}
                        className="flex-[3] py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-blue-500"
                      >
                        <Lightning className="w-4 h-4" /> Iniciar Preparo
                      </button>
                    )}
                    {activeTab === 'abertos' && o.status === 'em_preparo' && (
                      <button
                        onClick={() => onUpdateOrderStatus?.(String(o.id), 'pronto_retirada')}
                        className={`flex-[3] py-2.5 sm:py-3 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-blue-500 ${
                          isAllChecked 
                          ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400/50 shadow-emerald-500/20 shadow-lg' 
                          : 'bg-emerald-500 hover:bg-emerald-600'
                        }`}
                      >
                        <Check className="w-4 h-4" weight="bold" /> {isAllChecked ? '✓ Finalizar!' : 'Finalizar Comanda'}
                      </button>
                    )}
                    
                    {activeTab === 'finalizados' && (
                      <button
                        onClick={() => onUpdateOrderStatus?.(String(o.id), 'em_preparo')}
                        className="flex-[3] py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-blue-500"
                      >
                        <ArrowUUpLeft className="w-4 h-4" /> Reabrir
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
