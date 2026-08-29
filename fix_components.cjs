const fs = require('fs');

// Fix App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  /setThemeMode=\{setThemeMode\}/,
  `toggleTheme={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
        currentPath={location.pathname}
        onNavigate={(path) => navigate(path)}`
);
fs.writeFileSync('src/App.tsx', appContent);

// Fix ShopView.tsx
let shopContent = fs.readFileSync('src/modules/shop/ui/ShopView.tsx', 'utf8');

// Replace <Box textAlign="center" py={8}>
shopContent = shopContent.replace(
  /<Box textAlign="center" py=\{8\}>/g,
  `<Box sx={{ textAlign: 'center', py: 8 }}>`
);

// Replace <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
shopContent = shopContent.replace(
  /<Stack direction=\{\{ xs: 'column', sm: 'row' \}\} spacing=\{2\} justifyContent=\{\{ xs: 'center', md: 'flex-start' \}\}>/g,
  `<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>`
);

fs.writeFileSync('src/modules/shop/ui/ShopView.tsx', shopContent);
