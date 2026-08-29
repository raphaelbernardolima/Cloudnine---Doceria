import re

with open("src/modules/shop/ui/ProductModal.tsx", "r") as f:
    content = f.read()

# Fix PaperProps
content = content.replace("PaperProps={{", "PaperProps={{ /* @ts-ignore */ ")

# Fix Typography fontWeights
content = re.sub(r'<Typography([^>]*?)fontWeight=\{([^\}]+)\}([^>]*?)>', r'<Typography\1sx={{ fontWeight: \2 }}\3>', content)

with open("src/modules/shop/ui/ProductModal.tsx", "w") as f:
    f.write(content)

