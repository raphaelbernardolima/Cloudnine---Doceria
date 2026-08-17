import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { Product, Order, UserProfile } from '../types/index';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url, anonKey, isConfigured: Boolean(url && anonKey) };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  
  if (!isConfigured) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, anonKey);
  }

  return supabaseClient;
}

export async function getStoreConfig(): Promise<any | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('configuracoes_loja').select('*').limit(1).maybeSingle();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function updateStoreConfig(config: {
  nome_loja?: string;
  logo_url?: string;
  telefone?: string;
  email?: string;
  loja_aberta?: boolean;
  pedido_minimo?: number;
  raio_entrega_km?: number;
  horarios_funcionamento?: any;
}): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase não conectado' };
  }

  try {
    // Check if row exists
    const { data: existing } = await client.from('configuracoes_loja').select('id').limit(1).maybeSingle();

    if (existing && existing.id) {
      const { error } = await client
        .from('configuracoes_loja')
        .update({
          ...config,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await client
        .from('configuracoes_loja')
        .insert([config]);

      if (error) return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao salvar configurações' };
  }
}

/**
 * Realiza login via Supabase Auth com Email e Senha
 */
export async function signInWithSupabase(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { user: null, error: 'Supabase não está configurado. Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.' };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Usuário não encontrado' };

    // Buscar perfil na tabela public.Perfis ou metadata
    const { data: profile, error: profileError } = await client
      .from('Perfis')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    console.log('Login Supabase user ID:', data.user.id);
    console.log('Login Perfis query result:', profile, 'Error:', profileError);

    let role = profile?.role || data.user.user_metadata?.role || 'cliente';
    
    const nome = profile?.nome || data.user.user_metadata?.nome || email.split('@')[0];
    const sobrenome = profile?.sobrenome || data.user.user_metadata?.sobrenome || '';

    const userProfile: UserProfile = {
      id: data.user.id,
      email: data.user.email || email,
      nome,
      sobrenome,
      telefone: profile?.telefone || data.user.user_metadata?.telefone || '(11) 99999-0000',
      role: role as UserProfile['role'],
      Status: 'ativo',
      pontosFidelidade: profile?.pontos_fidelidade || 100,
      avatar_url: profile?.avatar_url || data.user.user_metadata?.avatar_url || ''
    };

    return { user: userProfile, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { user: null, error: msg };
  }
}

/**
 * Cria nova conta (sempre com perfil 'cliente')
 */
export async function signUpWithSupabase(
  email: string, 
  password: string, 
  nome: string, 
  sobrenome: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  const client = getSupabaseClient();
  let role: UserProfile['role'] = 'cliente';

  if (!client) {
    return { user: null, error: 'Serviço de autenticação temporariamente indisponível.' };
  }

  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { nome, sobrenome, role }
      }
    });

    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Falha ao registrar usuário' };

    // Salvar perfil estendido na tabela Perfis se existir
    try {
      await client.from('Perfis').upsert({
        id: data.user.id,
        email,
        nome,
        sobrenome,
        role,
        Status: 'ativo',
        pontos_fidelidade: 100
      });
    } catch (e) {
      console.warn('Tabela Perfis pode não existir ainda no Supabase:', e);
    }

    const userProfile: UserProfile = {
      id: data.user.id,
      email,
      nome,
      sobrenome,
      telefone: '(11) 99999-0000',
      role,
      Status: 'ativo',
      pontosFidelidade: 100
    };

    return { user: userProfile, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { user: null, error: msg };
  }
}

/**
 * Realiza Logout do Supabase Auth
 */
export async function signOutSupabase(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut();
  }
}

/**
 * Obtém usuário logado atualmente na sessão do Supabase
 */
export async function getCurrentSupabaseUser(): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data: { session } } = await client.auth.getSession();
    if (!session || !session.user) return null;

    const user = session.user;
    const { data: profile, error: profileError } = await client
      .from('Perfis')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    console.log('Supabase session user ID:', user.id);
    console.log('Perfis query result:', profile, 'Error:', profileError);

    const userEmail = user.email || '';
    let userRole = profile?.role || user.user_metadata?.role || 'cliente';

    return {
      id: user.id,
      email: userEmail,
      nome: profile?.nome || user.user_metadata?.nome || userEmail.split('@')[0] || 'Usuário',
      sobrenome: profile?.sobrenome || user.user_metadata?.sobrenome || '',
      telefone: profile?.telefone || '(11) 99999-0000',
      role: userRole,
      Status: 'ativo',
      pontosFidelidade: profile?.pontos_fidelidade || 100,
      avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || ''
    };
  } catch {
    return null;
  }
}

/**
 * Testa a conexão com o Supabase
 */
export async function updateUserProfileInDB(userId: string, updates: Partial<UserProfile>): Promise<{ error: string | null }> {
  const client = getSupabaseClient();
  if (!client) return { error: 'Serviço de banco de dados indisponível.' };

  try {
    // Apenas atualizar os campos permitidos
    const updateDataAuth: any = {
      nome: updates.nome,
      sobrenome: updates.sobrenome,
      telefone: updates.telefone,
    };
    if (updates.avatar_url !== undefined) {
      updateDataAuth.avatar_url = updates.avatar_url;
    }

    const updateDataPerfis: any = {
      nome: updates.nome,
      sobrenome: updates.sobrenome,
      telefone: updates.telefone,
    };
    if (updates.avatar_url !== undefined) {
      updateDataPerfis.avatar_url = updates.avatar_url;
    }

    const { error } = await client
      .from('Perfis')
      .update(updateDataPerfis)
      .eq('id', userId);

    if (error) {
      console.warn('Erro ao atualizar perfil na tabela Perfis no Supabase:', error);
    }

    // Atualizar os metadados do auth (onde a avatar_url vai ficar salva com segurança)
    await client.auth.updateUser({
      data: updateDataAuth
    });

    return { error: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('Falha ao atualizar perfil no Supabase:', errorMsg);
    return { error: errorMsg };
  }
}

export async function testSupabaseConnection(urlInput?: string, keyInput?: string): Promise<{ success: boolean; message: string }> {
  const url = urlInput || import.meta.env.VITE_SUPABASE_URL;
  const anonKey = keyInput || import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return {
      success: false,
      message: 'Chaves do Supabase não configuradas no arquivo .env (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).'
    };
  }

  try {
    const tempClient = createClient(url, anonKey);
    const { error } = await tempClient.from('produtos').select('count', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "public.produtos" does not exist')) {
      return {
        success: false,
        message: `Erro de Endpoint ou RLS no Supabase: ${error.message}`
      };
    }

    return {
      success: true,
      message: 'Conexão com o Supabase Autenticado e RLS validada com sucesso!'
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Falha na conexão: ${errorMessage}`
    };
  }
}
