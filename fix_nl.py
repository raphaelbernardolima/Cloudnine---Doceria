import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# Fix the broken line
# Because there's a literal newline inside join(' ... ')
content = re.sub(r"join\('\n'\)\}</p>", "join(', ')}</p>", content)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)
