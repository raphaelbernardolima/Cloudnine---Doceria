import re

with open('src/components/CartDrawer.tsx', 'r') as f:
    content = f.read()

# Make sure buttons have larger targets
content = content.replace("w-5 h-5", "w-6 h-6")
content = content.replace("w-4 h-4", "w-5 h-5")
content = content.replace("px-2 py-1", "px-3 py-2")

with open('src/components/CartDrawer.tsx', 'w') as f:
    f.write(content)
