const fs = require('fs');

let content = fs.readFileSync('src/modules/admin/ui/AdminDashboard.tsx', 'utf8');

// Import useSearchParams
if (!content.includes('useSearchParams')) {
  content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useSearchParams } from 'react-router-dom';");
}

// Replace const [activeTab, setActiveTab] = useState<string>('dashboard');
// with useSearchParams logic
content = content.replace(
  "const [activeTab, setActiveTab] = useState<string>('dashboard');",
  `const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setActiveTab = (tab: string) => setSearchParams({ tab });`
);

fs.writeFileSync('src/modules/admin/ui/AdminDashboard.tsx', content);
