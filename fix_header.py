import re

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

# Replace the logo image with a stylish icon and fix text sizing
new_logo = """          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-tertiary)] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
            <Cake className="w-5 h-5 text-[var(--color-on-primary)]" />
          </div>"""
          
content = re.sub(
    r'<div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-\[var\(--color-primary-container\)\].*?</style>\n          </div>',
    new_logo,
    content,
    flags=re.DOTALL
)

with open('src/components/Header.tsx', 'w') as f:
    f.write(content)
