import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

kanban_html = """
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-xl text-[var(--color-on-surface)]">
                Kanban de Pedidos
              </h3>
              <p className="text-sm text-[var(--color-outline)]">Gestão visual e em tempo real da esteira de produção e entrega.</p>
            </div>
            <div className="flex gap-2">
               <button className="px-4 py-2 rounded-xl bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] text-sm font-bold flex items-center gap-2 hover:bg-[var(--color-surface-container-highest)]">
                 <Filter className="w-4 h-4" />
                 Filtrar
               </button>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {/* Coluna 1: Pendentes */}
            <div className="min-w-[320px] w-[320px] bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 rounded-3xl p-4 flex flex-col snap-start shrink-0">
              <div className="flex items-center justify-between mb-4 px-2">
                <h4 className="font-extrabold text-[var(--color-on-surface)] flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  Pendentes
                </h4>
                <span className="bg-[var(--color-surface-container-high)] text-xs font-bold px-2 py-0.5 rounded-full">
                  {orders.filter(o => o.status === 'pendente_pix').length}
                </span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {orders.filter(o => o.status === 'pendente_pix').map(o => (
                  <div key={o.id} className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-[var(--color-primary)]/40 transition-all cursor-grab">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-[var(--color-primary)] text-sm">#{o.id}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600">Aguardando PIX</span>
                    </div>
                    <div className="space-y-1 mb-3">
                      <p className="font-bold text-[var(--color-on-surface)] text-sm">{o.cliente_nome}</p>
                      <p className="text-xs text-[var(--color-outline)] truncate">{o.itens.map(i => f"{i.quantidade}x {i.nomeProduto}").join(', ')}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--color-outline-variant)]/20 pt-3 mt-3">
                      <span className="font-extrabold text-sm">R$ {o.total.toFixed(2).replace('.', ',')}</span>
                      <select
                        value={o.status}
                        onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as any)}
                        className="text-xs font-bold bg-[var(--color-surface-container-high)] border-none rounded-lg p-1 cursor-pointer focus:ring-2 focus:ring-[var(--color-primary)]"
                      >
                        <option value="pendente_pix">Pendente</option>
                        <option value="em_preparo">Aprovar (Preparo)</option>
                        <option value="cancelado">Cancelar</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna 2: Em Preparo */}
            <div className="min-w-[320px] w-[320px] bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 rounded-3xl p-4 flex flex-col snap-start shrink-0">
              <div className="flex items-center justify-between mb-4 px-2">
                <h4 className="font-extrabold text-[var(--color-on-surface)] flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                  Em Preparo
                </h4>
                <span className="bg-[var(--color-surface-container-high)] text-xs font-bold px-2 py-0.5 rounded-full">
                  {orders.filter(o => o.status === 'em_preparo').length}
                </span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {orders.filter(o => o.status === 'em_preparo').map(o => (
                  <div key={o.id} className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all cursor-grab border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-blue-600 text-sm">#{o.id}</span>
                      <button onClick={() => setPrintingOrder(o)} className="text-xs p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Imprimir Comanda">
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1 mb-3">
                      <p className="font-bold text-[var(--color-on-surface)] text-sm">{o.cliente_nome}</p>
                      <p className="text-xs text-[var(--color-outline)] whitespace-pre-wrap">{o.itens.map(i => f"{i.quantidade}x {i.nomeProduto}").join('\\n')}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--color-outline-variant)]/20 pt-3 mt-3">
                       <span className="text-xs font-bold text-[var(--color-outline)]">{o.tipo_entrega === 'retirada' ? '🏪 Retirar' : '🛵 Entregar'}</span>
                       <select
                        value={o.status}
                        onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as any)}
                        className="text-xs font-bold bg-blue-50 text-blue-700 border-none rounded-lg p-1.5 cursor-pointer focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="em_preparo">Preparando...</option>
                        <option value="pronto_retirada">Pronto!</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna 3: Pronto para Expedição */}
            <div className="min-w-[320px] w-[320px] bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 rounded-3xl p-4 flex flex-col snap-start shrink-0">
              <div className="flex items-center justify-between mb-4 px-2">
                <h4 className="font-extrabold text-[var(--color-on-surface)] flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  Expedição
                </h4>
                <span className="bg-[var(--color-surface-container-high)] text-xs font-bold px-2 py-0.5 rounded-full">
                  {orders.filter(o => o.status === 'pronto_retirada').length}
                </span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {orders.filter(o => o.status === 'pronto_retirada').map(o => (
                  <div key={o.id} className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-500/40 transition-all cursor-grab border-l-4 border-l-purple-500">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-purple-600 text-sm">#{o.id}</span>
                      <span className="text-xs font-bold text-[var(--color-outline)]">{o.data_agendada}</span>
                    </div>
                    <div className="space-y-1 mb-3">
                      <p className="font-bold text-[var(--color-on-surface)] text-sm">{o.cliente_nome}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--color-outline-variant)]/20 pt-3 mt-3">
                       <span className="text-xs font-bold text-purple-600">{o.tipo_entrega === 'retirada' ? '🏪 Aguardando Cliente' : '🛵 Aguardando Motoboy'}</span>
                       <select
                        value={o.status}
                        onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as any)}
                        className="text-xs font-bold bg-purple-50 text-purple-700 border-none rounded-lg p-1.5 cursor-pointer focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="pronto_retirada">Expedição</option>
                        {o.tipo_entrega === 'retirada' ? (
                           <option value="entregue">Finalizar (Entregue)</option>
                        ) : (
                           <option value="saiu_entrega">Despachar (Em Rota)</option>
                        )}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna 4: Em Rota */}
            <div className="min-w-[320px] w-[320px] bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 rounded-3xl p-4 flex flex-col snap-start shrink-0">
              <div className="flex items-center justify-between mb-4 px-2">
                <h4 className="font-extrabold text-[var(--color-on-surface)] flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  Em Rota
                </h4>
                <span className="bg-[var(--color-surface-container-high)] text-xs font-bold px-2 py-0.5 rounded-full">
                  {orders.filter(o => o.status === 'saiu_entrega').length}
                </span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {orders.filter(o => o.status === 'saiu_entrega').map(o => (
                  <div key={o.id} className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/30 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all cursor-grab border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-emerald-600 text-sm">#{o.id}</span>
                      <Truck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="space-y-1 mb-3">
                      <p className="font-bold text-[var(--color-on-surface)] text-sm">{o.cliente_nome}</p>
                      <p className="text-xs text-[var(--color-outline)] line-clamp-2" title={o.endereco_entreg}>{o.endereco_entreg}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--color-outline-variant)]/20 pt-3 mt-3">
                       <select
                        value={o.status}
                        onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as any)}
                        className="text-xs font-bold bg-emerald-50 text-emerald-700 border-none rounded-lg p-1.5 cursor-pointer focus:ring-2 focus:ring-emerald-500 w-full text-center"
                      >
                        <option value="saiu_entrega">Em Rota...</option>
                        <option value="entregue">Confirmar Entrega ✅</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
"""

# Must fix python f-strings format before replacing
kanban_html = kanban_html.replace('f"{i.quantidade}x {i.nomeProduto}"', '`${i.quantidade}x ${i.nomeProduto}`')

content = re.sub(
    r"      \{activeTab === 'orders' && \(\n        <div className=\"space-y-4\">\n.*?        </div>\n      \)}",
    kanban_html.strip(),
    content,
    flags=re.DOTALL
)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)
