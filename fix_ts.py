import re

with open('src/lib/supabase.ts', 'r') as f:
    content = f.read()

# Fix the userProfile object instantiation
content = content.replace(
"""    const userProfile: UserProfile = {
      id: data.user.id,
      email,
      nome,
      sobrenome,
      telefone: '(11) 99999-0000',
      role,
      Status: 'ativo',
      pontos_fidelidade: 100
    };""",
"""    const userProfile: UserProfile = {
      id: data.user.id,
      email,
      nome,
      sobrenome,
      telefone: '(11) 99999-0000',
      role,
      Status: 'ativo',
      pontosFidelidade: 100
    };"""
)

with open('src/lib/supabase.ts', 'w') as f:
    f.write(content)
