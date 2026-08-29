import re

with open("src/core/ui/layout/Header.tsx", "r") as f:
    content = f.read()

# Replace the Mobile Drawer list
find_list = """        <List sx={{ flexGrow: 1 }}>
          <ListItem disablePadding>
            <ListItemButton selected={currentPath === '/'} onClick={() => handleNavClick('/')}>
              <ListItemIcon><ShoppingBag className="w-5 h-5" /></ListItemIcon>
              <ListItemText primary="Cardápio de Doces" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton onClick={() => { onOpenCustomCakeModal(); setIsMobileMenuOpen(false); }}>
              <ListItemIcon><Sparkles className="w-5 h-5 text-amber-500" /></ListItemIcon>
              <ListItemText primary="Monte seu Bolo" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton selected={currentPath === '/profile'} onClick={() => { currentUser ? handleNavClick('/profile') : onOpenAuthModal('Acesse sua conta para ver seus pedidos e pontos.'); }}>
              <ListItemIcon><User className="w-5 h-5" /></ListItemIcon>
              <ListItemText primary="Meu Perfil" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
            </ListItemButton>
          </ListItem>

          {currentUser && ['admin', 'confeiteiro', 'atendente', 'ADMIN', 'CAIXA', 'COZINHA', 'LIMPEZA', 'ATENDIMENTO'].includes(currentUser.role) && (
            <ListItem disablePadding>
              <ListItemButton selected={currentPath === '/admin'} onClick={handleAdminClick}>
                <ListItemIcon><Settings2 className="w-5 h-5" /></ListItemIcon>
                <ListItemText primary="Painel Admin" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
              </ListItemButton>
            </ListItem>
          )}
        </List>"""

replace_list = """        <List sx={{ flexGrow: 1 }}>
          {/* Admin Navigation Only */
          currentUser && ['admin', 'confeiteiro', 'atendente', 'ADMIN', 'CAIXA', 'COZINHA', 'LIMPEZA', 'ATENDIMENTO'].includes(currentUser.role) ? (
            <>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=dashboard')}>
                  <ListItemText primary="Financeiro & Dashboard" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=orders')}>
                  <ListItemText primary="Pedidos" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=calendar')}>
                  <ListItemText primary="Calendário de Encomendas" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=products')}>
                  <ListItemText primary="Estoque & Catálogo" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=kitchen')}>
                  <ListItemText primary="Comanda Cozinha" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=delivery')}>
                  <ListItemText primary="Despacho & Logística" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=marketing')}>
                  <ListItemText primary="Marketing & Fidelidade" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=staff')}>
                  <ListItemText primary="Equipe & Permissões" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=ai')}>
                  <ListItemText primary="Marketing IA" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=store-config')}>
                  <ListItemText primary="Configurações da Loja" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavClick('/admin?tab=payment-config')}>
                  <ListItemText primary="Configurações de Pagamento" sx={{ "& .MuiListItemText-primary": { fontWeight: 600 } }} />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
             <ListItem disablePadding>
                <ListItemText primary="Navegue pelas abas inferiores!" sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }} />
             </ListItem>
          )}
        </List>"""

content = content.replace(find_list, replace_list)

# Hide Hamburger menu for non-admins
content = content.replace(
    """<IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setIsMobileMenuOpen(true)}
              sx={{ display: { md: 'none' } }}
            >""",
    """{currentUser && ['admin', 'confeiteiro', 'atendente', 'ADMIN', 'CAIXA', 'COZINHA', 'LIMPEZA', 'ATENDIMENTO'].includes(currentUser.role) && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setIsMobileMenuOpen(true)}
              sx={{ display: { md: 'none' } }}
            >
              <Menu />
            </IconButton>
            )}"""
)

content = content.replace("""<IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setIsMobileMenuOpen(true)}
              sx={{ display: { md: 'none' } }}
            >
              <Menu />
            </IconButton>""", "") # Remove duplicate original

with open("src/core/ui/layout/Header.tsx", "w") as f:
    f.write(content)
