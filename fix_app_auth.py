import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("handleOpenAuthModal('Para acessar a Área de Gestão, faça login com sua conta autorizada.');", "handleOpenAuthModal('Acesso Administrativo: Por favor, entre com sua conta de colaborador para acessar o painel de gestão.');")
content = content.replace("handleOpenAuthModal('Faça login com sua conta autorizada para acessar a Área de Gestão.')", "handleOpenAuthModal('Acesso Administrativo: Por favor, entre com sua conta de colaborador para acessar o painel de gestão.')")

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/components/AuthModal.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "<h2 className=\"font-black text-xl text-[var(--color-on-surface)] text-center\">Acesso Cloudnine</h2>",
    "<h2 className=\"font-black text-xl text-[var(--color-on-surface)] text-center\">Identificação</h2>"
)
content = content.replace(
    "<p className=\"text-xs text-[var(--color-outline)] text-center max-w-sm\">\n              Faça login para acompanhar seus pedidos, ganhar pontos de fidelidade e montar bolos personalizados.\n            </p>",
    "<p className=\"text-xs text-[var(--color-outline)] text-center max-w-sm\">\n              {requiredRoleMessage || 'Faça login para acompanhar seus pedidos, acumular pontos no clube de vantagens e salvar suas preferências.'}\n            </p>"
)

with open('src/components/AuthModal.tsx', 'w') as f:
    f.write(content)
