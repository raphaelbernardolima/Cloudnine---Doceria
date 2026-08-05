import re

with open('src/lib/supabase.ts', 'r') as f:
    content = f.read()

# Fix upsert inside signUpWithSupabase
content = content.replace("pontosFidelidade: 100", "pontos_fidelidade: 100")

# Fix mapping in signInWithSupabase
content = content.replace("pontosFidelidade: profile?.pontosFidelidade || 100,", "pontosFidelidade: profile?.pontos_fidelidade || 100,")

# Fix mapping in getCurrentSupabaseUser
content = content.replace("pontosFidelidade: profile?.pontosFidelidade || 100,", "pontosFidelidade: profile?.pontos_fidelidade || 100,")

# Actually, I should just use regex or exact replacement to be safe.
with open('src/lib/supabase.ts', 'w') as f:
    f.write(content)
