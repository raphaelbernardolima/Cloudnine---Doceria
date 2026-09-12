import { UserProfile } from '@/src/core/types';
import { getSupabaseClient, updateUserProfileInDB } from '@/src/core/services/supabase';
import { useDataStore } from '@/src/core/store/useDataStore';
import { useUIStore } from '@/src/core/store/useUIStore';

export function useUserMutations() {
  const handleUpdateRole = async (userId: string, newRole: UserProfile['role']) => {
    if (!navigator.onLine) {
      useUIStore.getState().showToast('Você está offline. Não é possível alterar papéis agora.');
      return;
    }

    try {
      const { staff, setStaff, currentUser, setCurrentUser } = useDataStore.getState();
      
      const client = getSupabaseClient();
      if (client) {
        const { error } = await client.from('Perfis').update({ role: newRole }).eq('id', userId);
        if (error) throw new Error(error.message);
      }

      setStaff(staff.map(u => u.id === userId ? { ...u, role: newRole } : u));
      if (currentUser?.id === userId) {
        setCurrentUser({ ...currentUser, role: newRole });
      }
      useUIStore.getState().showToast('Papel do usuário atualizado com sucesso!');
    } catch (err: any) {
      console.error("Erro ao atualizar papel:", err);
      useUIStore.getState().showToast(`Erro ao atualizar papel: ${err.message}`);
    }
  };

  const handleUpdateUser = async (updated: UserProfile) => {
    if (!navigator.onLine) {
      useUIStore.getState().showToast('Você está offline. Suas alterações não foram salvas no servidor.');
      // Still update local store so user sees their changes
      const { setCurrentUser } = useDataStore.getState();
      setCurrentUser(updated);
      return;
    }

    try {
      const { setCurrentUser } = useDataStore.getState();
      setCurrentUser(updated);
      if (updated.id) {
        const { error } = await updateUserProfileInDB(updated.id, updated);
        if (error) {
          throw new Error(error);
        }
        useUIStore.getState().showToast('Perfil atualizado com sucesso!');
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      useUIStore.getState().showToast(`Erro ao atualizar perfil: ${err.message}`);
    }
  };

  return { handleUpdateRole, handleUpdateUser };
}
