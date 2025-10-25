'use client';

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  initialized: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const saveSession = (sessionUser: User | null) => {
    if (typeof window === 'undefined') {
      return;
    }

    if (sessionUser) {
      localStorage.setItem('user', JSON.stringify(sessionUser));
      document.cookie = `user=${encodeURIComponent(JSON.stringify(sessionUser))}; path=/; max-age=${7 * 24 * 60 * 60}`;
    } else {
      localStorage.removeItem('user');
      document.cookie = 'user=; path=/; max-age=0';
    }
  };

  useEffect(() => {
    console.log('AuthContext: Iniciando carregamento do usuário do localStorage');
    
    const loadUser = () => {
      if (typeof window === 'undefined') {
        console.log('AuthContext: Fora do navegador (SSR), pulando carregamento');
        setLoading(false);
        setInitialized(true);
        return;
      }
      
      try {
        console.log('AuthContext: Tentando carregar usuário do localStorage');
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('AuthContext: Usuário encontrado no localStorage:', parsedUser);
          
          if (parsedUser?.id && parsedUser?.email) {
            console.log('AuthContext: Usuário válido, definindo estado');
            setUser(parsedUser);
          } else {
            console.error('AuthContext: Dados de usuário inválidos no localStorage');
            localStorage.removeItem('user');
          }
        } else {
          console.log('AuthContext: Nenhum usuário encontrado no localStorage');
        }
      } catch (error) {
        console.error('AuthContext: Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem('user');
      } finally {
        console.log('AuthContext: Carregamento concluído');
        setLoading(false);
        setInitialized(true);
      }
    };
    
    loadUser();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        console.log('AuthContext: Evento de alteração do localStorage detectado');
        loadUser();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('AuthContext: Iniciando login para:', email);
    
    if (!email || !password) {
      console.log('AuthContext: Falha no login - email ou senha ausentes');
      return false;
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          console.log('AuthContext: Credenciais válidas, criando usuário mock');
          const mockUser: User = {
            id: '1',
            name: email.split('@')[0],
            email,
            phone: '0000000000',
            address: 'Rua Exemplo, 123',
            city: 'São Paulo',
            state: 'SP',
            postalCode: '00000-000',
          };
          
          console.log('AuthContext: Salvando sessão do usuário');
          saveSession(mockUser);

          setUser(mockUser);
          console.log('AuthContext: Estado do usuário atualizado');
          
          resolve(true);
        } catch (error) {
          console.error('AuthContext: Erro durante o login:', error);
          resolve(false);
        }
      }, 500); 
    });
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    if (!name || !email || !password) {
      console.log('AuthContext: Falha no registro - campos obrigatórios ausentes');
      return false;
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          console.log('AuthContext: Criando novo usuário');
          const mockUser: User = {
            id: '1',
            name,
            email,
            phone: '0000000000',
            address: 'Rua Exemplo, 123',
            city: 'São Paulo',
            state: 'SP',
            postalCode: '00000-000',
          };
          
          console.log('AuthContext: Salvando sessão do usuário registrado');
          saveSession(mockUser);
          
          setUser(mockUser);
          console.log('AuthContext: Usuário registrado com sucesso');
          
          resolve(true);
        } catch (error) {
          console.error('AuthContext: Erro durante o registro:', error);
          resolve(false);
        }
      }, 500);
    });
  };

  const logout = () => {
    console.log('AuthContext: Efetuando logout');
    setUser(null);
    saveSession(null);
    
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
      console.log('AuthContext: Redirecionando para a página de login');
      window.location.href = '/auth';
    }
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
    initialized,
  }), [user, loading, initialized, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
