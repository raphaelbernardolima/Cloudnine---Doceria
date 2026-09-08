import { UserProfile } from '@/src/core/types';
import { getSupabaseClient, updateUserProfileInDB } from '@/src/core/services/supabase';
import { useDataStore } from '@/src/core/store/useDataStore';

export function useUserMutations() {
  const handleUpdateRole = async (userId: string, newRole: UserProfile['role']) => {
    const { staff, setStaff, currentUser, setCurrentUser } = useDataStore.getState();
    
    const client = getSupabaseClient();
    if (client) {
      await client.from('Perfis').update({ role: newRole }).eq('id', userId);
    }

    setStaff(staff.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
  };

  const handleUpdateUser = async (updated: UserProfile) => {
    const { setCurrentUser } = useDataStore.getState();
    setCurrentUser(updated);
    if (updated.id) {
      const { error } = await updateUserProfileInDB(updated.id, updated);
      if (error) {
        console.error('Failed to update profile:', error);
      }
    }
  };

  return { handleUpdateRole, handleUpdateUser };
}
