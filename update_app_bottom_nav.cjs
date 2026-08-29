const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('MobileBottomNav')) {
  content = content.replace(
    "import { Header } from '@/src/core/ui/layout/Header';",
    "import { Header } from '@/src/core/ui/layout/Header';\nimport { MobileBottomNav } from '@/src/core/ui/layout/MobileBottomNav';"
  );

  content = content.replace(
    "      {/* Footer */}",
    `      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        onOpenCustomCakeModal={() => setIsCustomCakeOpen(true)}
        onOpenAuthModal={handleOpenAuthModal}
        isAuthenticated={!!currentUser}
      />
      
      {/* Footer */}`
  );

  fs.writeFileSync('src/App.tsx', content);
}
