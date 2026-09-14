import { getSupabaseClient } from '@/src/core/services/supabase';
import { Table } from '@/src/core/types/index';
import { toast } from 'sonner';

export function useTableMutations() {
  const handleAddTable = async (numero: string, seats: number = 4) => {
    const client = getSupabaseClient();
    if (!client) {
      toast.error('Cliente Supabase não inicializado.');
      return false;
    }

    try {
      const { error } = await client.from('mesas').insert([{ numero, seats, status: 'livre' }]);
      if (error) throw error;
      toast.success(`Mesa ${numero} criada com sucesso!`);
      return true;
    } catch (error: any) {
      toast.error(`Erro ao criar mesa: ${error.message}`);
      return false;
    }
  };

  const handleUpdateTableStatus = async (id: string, newStatus: Table['status']) => {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client.from('mesas').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast.success('Status da mesa atualizado!');
      return true;
    } catch (error: any) {
      toast.error(`Erro ao atualizar status: ${error.message}`);
      return false;
    }
  };

  const handleDeleteTable = async (id: string) => {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client.from('mesas').delete().eq('id', id);
      if (error) throw error;
      toast.success('Mesa removida com sucesso!');
      return true;
    } catch (error: any) {
      toast.error(`Erro ao remover mesa: ${error.message}`);
      return false;
    }
  };

  return {
    handleAddTable,
    handleUpdateTableStatus,
    handleDeleteTable
  };
}
