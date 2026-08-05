import re

with open('src/lib/supabase.ts', 'r') as f:
    content = f.read()

content = content.replace(
"""    const updateDataPerfis = {
      nome: updates.nome,
      sobrenome: updates.sobrenome,
      telefone: updates.telefone,
    };""",
"""    const updateDataPerfis: any = {
      nome: updates.nome,
      sobrenome: updates.sobrenome,
      telefone: updates.telefone,
    };
    if (updates.avatar_url !== undefined) {
      updateDataPerfis.avatar_url = updates.avatar_url;
    }"""
)

with open('src/lib/supabase.ts', 'w') as f:
    f.write(content)
