import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  organizationId: string | null;
  signUp: (email: string, password: string, orgName: string, sector: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchOrganizationId(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchOrganizationId(session.user.id);
      } else {
        setOrganizationId(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchOrganizationId = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          userId: userId
        });

        // PGRST116 = no rows returned (user_profile doesn't exist)
        if (error.code === 'PGRST116') {
          console.warn('No user_profile found for user:', userId);
          console.warn('This user needs to complete onboarding or have their profile created manually.');
          setOrganizationId(null);
          setLoading(false);
          return;
        }

        throw error;
      }

      setOrganizationId(data?.organization_id ?? null);
    } catch (error) {
      console.error('Unexpected error fetching organization:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      setOrganizationId(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, orgName: string, sector: string) => {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from signup');

      // 2. Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          sector: sector as 'food' | 'education' | 'healthcare' | 'animal' | 'other',
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // 3. Create user profile
      const { error: profileError } = await supabase.from('user_profiles').insert({
        id: authData.user.id,
        organization_id: orgData.id,
        full_name: '',
      });

      if (profileError) throw profileError;

      setOrganizationId(orgData.id);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error instanceof Error ? error : new Error('Failed to sign up');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error instanceof Error ? error : new Error('Failed to sign in');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setOrganizationId(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error instanceof Error ? error : new Error('Failed to sign out');
    }
  };

  const value = {
    user,
    session,
    loading,
    organizationId,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
