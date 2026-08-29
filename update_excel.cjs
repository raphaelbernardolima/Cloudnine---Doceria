const fs = require('fs');

let content = fs.readFileSync('src/modules/admin/ui/AdminFinanceModule.tsx', 'utf8');

content = content.replace("import * as XLSX from 'xlsx';", "import ExcelJS from 'exceljs';");

const newExport = `
  const handleExportExcel = async () => {
    const wb = new ExcelJS.Workbook();
    
    // Aba 1: Resumo Executivo
    const wsResumo = wb.addWorksheet("Resumo Executivo");
    wsResumo.columns = [
      { header: 'Metrica', key: 'metrica', width: 25 },
      { header: 'Valor', key: 'valor', width: 20 }
    ];
    wsResumo.addRows([
      { metrica: "Faturamento Bruto", valor: financeData.rawRevenue },
      { metrica: "Receita Líquida", valor: financeData.netRevenue },
      { metrica: "CMV (Custo Mercadoria)", valor: financeData.totalCMV },
      { metrica: "Margem Bruta (R$)", valor: financeData.grossMargin },
      { metrica: "Margem Bruta (%)", valor: financeData.grossMarginPercent.toFixed(2) + '%' },
      { metrica: "Custos Fixos", valor: FIXED_COSTS },
      { metrica: "Resultado (EBITDA)", valor: financeData.ebitda }
    ]);

    // Aba 2: Detalhamento Vendas
    const wsVendas = wb.addWorksheet("Vendas");
    wsVendas.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Data', key: 'data', width: 20 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Pagamento', key: 'pagamento', width: 20 },
      { header: 'Canal', key: 'canal', width: 15 }
    ];
    wsVendas.addRows(
      filteredOrders.map(o => ({
        id: o.id,
        data: o.created_at,
        cliente: o.cliente_nome,
        total: o.total,
        pagamento: o.metodo_pagamento,
        canal: o.tipo_entrega
      }))
    );

    // Aba 3: Curva ABC Produtos
    const wsABC = wb.addWorksheet("Curva ABC Produtos");
    if (financeData.scatterData && financeData.scatterData.length > 0) {
      wsABC.columns = Object.keys(financeData.scatterData[0]).map(k => ({ header: k, key: k, width: 20 }));
      wsABC.addRows(financeData.scatterData);
    }

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`Relatorio_Financeiro_Cloudnine_\${new Date().getTime()}.xlsx\`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
`;

content = content.replace(/const handleExportExcel = \(\) => \{[\s\S]*?XLSX\.writeFile\(wb, [^\)]+\);\s*\};/, newExport.trim());

fs.writeFileSync('src/modules/admin/ui/AdminFinanceModule.tsx', content);
