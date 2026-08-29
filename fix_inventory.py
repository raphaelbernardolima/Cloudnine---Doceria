import re

with open("src/modules/admin/ui/AdminInventoryModule.tsx", "r") as f:
    content = f.read()

# Replace custom html buttons with MuiButton for rapid action restocking
find_str = """                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <button onClick={() => onUpdateStock(p.id, Math.max(0, p.estoque - 1))} className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 text-black font-bold hover:bg-gray-300">-</button>
                      <Typography variant="body2" sx={{ fontWeight: 'black', minWidth: 24, textAlign: 'center' }}>
                        {p.estoque}
                      </Typography>
                      <button onClick={() => onUpdateStock(p.id, p.estoque + 1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 text-black font-bold hover:bg-gray-300">+</button>
                    </Box>"""

replace_str = """                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MuiButton size="small" variant="outlined" color="primary" onClick={() => onUpdateStock(p.id, Math.max(0, p.estoque - 1))} sx={{ minWidth: 32, p: 0.5 }}>-1</MuiButton>
                      <Typography variant="body2" sx={{ fontWeight: 'black', minWidth: 32, textAlign: 'center' }}>
                        {p.estoque}
                      </Typography>
                      <MuiButton size="small" variant="contained" color="primary" disableElevation onClick={() => onUpdateStock(p.id, p.estoque + 1)} sx={{ minWidth: 32, p: 0.5 }}>+1</MuiButton>
                      <MuiButton size="small" variant="contained" color="secondary" disableElevation onClick={() => onUpdateStock(p.id, p.estoque + 10)} sx={{ minWidth: 40, p: 0.5, ml: 0.5 }}>+10</MuiButton>
                    </Box>"""

if find_str in content:
    content = content.replace(find_str, replace_str)
else:
    print("Could not find the target string to replace.")

with open("src/modules/admin/ui/AdminInventoryModule.tsx", "w") as f:
    f.write(content)

