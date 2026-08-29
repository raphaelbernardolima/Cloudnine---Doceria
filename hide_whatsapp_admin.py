import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Find the WhatsApp button block
target = """      {/* Floating WhatsApp Support Button */}
      {(() => {"""

replacement = """      {/* Floating WhatsApp Support Button */}
      {(!currentUser || !['admin', 'confeiteiro', 'atendente', 'ADMIN', 'CAIXA', 'COZINHA', 'LIMPEZA', 'ATENDIMENTO'].includes(currentUser.role)) && (() => {"""

if target in content:
    content = content.replace(target, replacement)
    
    # We also need to add a closing brace `)}` instead of just `}` for the IIFE if it was closed with `})()`
    # Let's check how the IIFE is closed
    
with open("src/App.tsx", "w") as f:
    f.write(content)
