const fs = require('fs');

let content = fs.readFileSync('src/components/admin/AdminDashboard.tsx', 'utf8');

content = content.replace(
  "import { Product, Order, UserProfile, AuditLog, Ingredient, Driver, Coupon, LoyaltySettings } from '../../types/index';",
  "import { Product, Order, UserProfile, AuditLog, Ingredient, Driver, Coupon, LoyaltySettings, CustomCakeConfig } from '../../types/index';\nimport { AdminCustomCakeModule } from './AdminCustomCakeModule';"
);

content = content.replace(
  "loyaltySettings: LoyaltySettings;\n  onUpdateLoyalty: (settings: LoyaltySettings) => void;",
  "loyaltySettings: LoyaltySettings;\n  onUpdateLoyalty: (settings: LoyaltySettings) => void;\n  customCakeConfig: CustomCakeConfig;\n  onUpdateCustomCakeConfig: (config: CustomCakeConfig) => void;"
);

content = content.replace(
  "onUpdateLoyalty,\n}) => {",
  "onUpdateLoyalty,\n  customCakeConfig,\n  onUpdateCustomCakeConfig,\n}) => {"
);

content = content.replace(
  "const [activeModule, setActiveModule] = useState<'dashboard' | 'finance' | 'orders' | 'inventory' | 'marketing' | 'delivery' | 'calendar' | 'staff'>('dashboard');",
  "const [activeModule, setActiveModule] = useState<'dashboard' | 'finance' | 'orders' | 'inventory' | 'marketing' | 'delivery' | 'calendar' | 'staff' | 'custom_cake'>('dashboard');"
);

content = content.replace(
  "{ id: 'marketing', label: 'Marketing', icon: Gift },",
  "{ id: 'marketing', label: 'Marketing', icon: Gift },\n    { id: 'custom_cake', label: 'Bolos Sob Medida', icon: Cake },"
);

const marketingRender = `{activeModule === 'marketing' && (
          <AdminMarketingModule
            coupons={coupons}
            onAddCoupon={onAddCoupon}
            onToggleCoupon={onToggleCoupon}
            loyaltySettings={loyaltySettings}
            onUpdateLoyalty={onUpdateLoyalty}
          />
        )}`;

const newCakeRender = `{activeModule === 'custom_cake' && (
          <AdminCustomCakeModule
            config={customCakeConfig}
            onUpdateConfig={onUpdateCustomCakeConfig}
          />
        )}`;

content = content.replace(marketingRender, marketingRender + '\n\n        ' + newCakeRender);

fs.writeFileSync('src/components/admin/AdminDashboard.tsx', content);
