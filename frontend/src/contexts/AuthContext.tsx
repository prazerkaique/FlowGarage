import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  garageId: number;
  phone?: string;
  company?: string;
  profileImage?: string;
}

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      console.log('AuthContext: Iniciando carregamento...');
      
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          console.log('AuthContext: Usuário encontrado no localStorage');
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          setUser(JSON.parse(storedUser));
        } else {
          console.log('AuthContext: Fazendo auto-login com usuário padrão');
          // Auto-login com usuário padrão para demonstração
          const defaultUser = {
            id: 1,
            name: 'Admin',
            email: 'admin@garage.com',
            role: 'admin',
            garageId: 1
          };
          const defaultToken = 'demo-token';
          
          try {
            localStorage.setItem('token', defaultToken);
            localStorage.setItem('user', JSON.stringify(defaultUser));
          } catch (storageError) {
            console.warn('Erro ao salvar dados padrão no localStorage:', storageError);
          }
          
          api.defaults.headers.common['Authorization'] = `Bearer ${defaultToken}`;
          setUser(defaultUser);
        }
      } catch (error) {
        console.error('AuthContext: Erro ao carregar dados:', error);
      } finally {
        console.log('AuthContext: Carregamento finalizado');
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function signIn(email: string, password: string) {
    try {
      const response = await api.post('/login', { email, password });
      const { token, user } = response.data;

      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } catch (storageError) {
        console.warn('Erro ao salvar dados de login no localStorage:', storageError);
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
    } catch (error) {
      throw error;
    }
  }

  function signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  function updateUser(userData: Partial<User>) {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Função para comprimir imagem base64 se necessário
      const compressImageIfNeeded = (imageData: string): string => {
        if (!imageData || !imageData.startsWith('data:image/')) return imageData;
        
        // Se a imagem for muito grande (> 500KB), vamos reduzir a qualidade
        const sizeInBytes = (imageData.length * 3) / 4;
        if (sizeInBytes > 500000) { // 500KB
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            return new Promise<string>((resolve) => {
              img.onload = () => {
                // Redimensionar para máximo 300x300
                const maxSize = 300;
                let { width, height } = img;
                
                if (width > height) {
                  if (width > maxSize) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                  }
                } else {
                  if (height > maxSize) {
                    width = (width * maxSize) / height;
                    height = maxSize;
                  }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); // Qualidade 70%
              };
              img.src = imageData;
            }).then(compressedImage => {
              return compressedImage;
            }).catch(() => imageData);
          } catch {
            return imageData;
          }
        }
        return imageData;
      };

      // Preparar dados para salvar
      const userToSave = { ...updatedUser };
      if (userToSave.profileImage) {
        // Não comprimir aqui pois é síncrono, apenas limitar o tamanho
        const sizeInBytes = (userToSave.profileImage.length * 3) / 4;
        if (sizeInBytes > 1000000) { // 1MB
          console.warn('Imagem muito grande, removendo para evitar erro de quota');
          userToSave.profileImage = undefined;
        }
      }
      
      // Tentar salvar no localStorage com tratamento de erro robusto
      try {
        localStorage.setItem('user', JSON.stringify(userToSave));
      } catch (error) {
        console.warn('Erro ao salvar no localStorage:', error);
        
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          try {
            // Estratégia 1: Limpar dados desnecessários
            const keysToKeep = ['token', 'user'];
            const allKeys = Object.keys(localStorage);
            allKeys.forEach(key => {
              if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
              }
            });
            
            // Tentar salvar novamente
            localStorage.setItem('user', JSON.stringify(userToSave));
          } catch (retryError) {
            console.warn('Erro após limpeza, tentando sem imagem:', retryError);
            
            try {
              // Estratégia 2: Salvar sem a imagem
              const userWithoutImage = { ...userToSave };
              delete userWithoutImage.profileImage;
              localStorage.setItem('user', JSON.stringify(userWithoutImage));
              
              // Mostrar aviso ao usuário
              console.warn('Imagem do perfil não foi salva devido ao limite de armazenamento');
            } catch (finalError) {
              console.error('Erro crítico no localStorage:', finalError);
              // Como último recurso, manter apenas dados essenciais
              try {
                const essentialUser = {
                  id: userToSave.id,
                  name: userToSave.name,
                  email: userToSave.email,
                  role: userToSave.role,
                  garageId: userToSave.garageId
                };
                localStorage.setItem('user', JSON.stringify(essentialUser));
              } catch {
                console.error('Não foi possível salvar nenhum dado no localStorage');
              }
            }
          }
        }
      }
    }
  }

  console.log('AuthContext: Renderizando com loading:', loading, 'user:', user);

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}