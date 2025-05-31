import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<{
    full_name: string;
    avatar_url: string;
    bio: string;
    phone: string;
    address: string;
  }>) => Promise<boolean>;
  showProfileOnFirstLogin: boolean;
  setShowProfileOnFirstLogin: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  updateProfile: async () => false,
  showProfileOnFirstLogin: false,
  setShowProfileOnFirstLogin: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // State for user authentication
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileOnFirstLogin, setShowProfileOnFirstLogin] = useState(false);
  const { toast } = useToast();

  // Function to clear all user-specific data from localStorage
  const clearUserData = useCallback(() => {
    // Clear user's cart
    if (user) {
      localStorage.removeItem(`cart_${user.id}`);
    }
    // Clear any other user-specific data as needed
  }, [user]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );
    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        setProfile(null);
        return;
      }
      
      setProfile(data);
      
      // Check if this is a first login or if required fields are missing
      // We consider it a first login if phone or address is missing
      if (!data.phone || !data.address) {
        // Mark that we should show the profile popup
        setShowProfileOnFirstLogin(true);
      } else {
        setShowProfileOnFirstLogin(false);
      }
    } catch (error) {
      setProfile(null);
    }
  };

  const signOut = async () => {
    try {
      // Clear user data before signing out
      clearUserData();
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (profileData: Partial<{
    full_name: string;
    avatar_url: string;
    bio: string;
    phone: string;
    address: string;
  }>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Fetch the updated profile
      fetchProfile(user.id);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };
  const value = {
    user,
    session,
    profile,
    loading,
    signOut,
    updateProfile,
    showProfileOnFirstLogin,
    setShowProfileOnFirstLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
