import axios from 'axios';

// Chaves para localStorage
const VEHICLES_STORAGE_KEY = 'vehicles_data';
const USERS_STORAGE_KEY = 'users_data';
const COMPANY_STORAGE_KEY = 'company_data';

// Função para carregar LISTAS do localStorage
const loadFromStorage = (key: string, defaultData: any[]) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
  } catch (error) {
    console.error(`Erro ao carregar dados do localStorage (${key}):`, error);
    return defaultData;
  }
};

// Função para carregar OBJETOS do localStorage
const loadObjectFromStorage = (key: string, defaultData: any) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
  } catch (error) {
    console.error(`Erro ao carregar dados do localStorage (${key}):`, error);
    return defaultData;
  }
};

// Função para salvar dados no localStorage (lista ou objeto)
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erro ao salvar dados no localStorage (${key}):`, error);
  }
};

// Mock data inicial para demonstração
const initialMockVehicles = [
  {
    id: 1,
    brand: 'Toyota',
    model: 'Corolla',
    year: 2023,
    price: 85000,
    mileage: 15000,
    color: 'Branco',
    type: 'Sedan',
    doors: 4,
    transmission: 'Automático',
    steering: 'Hidráulica',
    fuel: 'Flex',
    features: ['Ar Condicionado', 'Direção Elétrica', 'Vidros Elétricos'],
    armored: false,
    auction: false,
    status: 'Disponível',
    media: [{ id: 1, type: 'image', url: '/vite.svg' }]
  },
  {
    id: 2,
    brand: 'Honda',
    model: 'Civic',
    year: 2022,
    price: 95000,
    mileage: 25000,
    color: 'Preto',
    type: 'Sedan',
    doors: 4,
    transmission: 'Manual',
    steering: 'Elétrica',
    fuel: 'Gasolina',
    features: ['Ar Condicionado', 'Central Multimídia', 'Câmera de Ré'],
    armored: false,
    auction: false,
    status: 'Disponível',
    media: [{ id: 2, type: 'image', url: '/vite.svg' }]
  },
  {
    id: 3,
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2021,
    price: 75000,
    mileage: 35000,
    color: 'Azul',
    type: 'Hatchback',
    doors: 4,
    transmission: 'Automático',
    steering: 'Elétrica',
    fuel: 'Flex',
    features: ['Ar Condicionado', 'Direção Elétrica', 'Freios ABS'],
    armored: false,
    auction: true,
    status: 'Vendido',
    media: [{ id: 3, type: 'image', url: '/vite.svg' }]
  },
  {
    id: 4,
    brand: 'Ford',
    model: 'Ka',
    year: 2020,
    price: 45000,
    mileage: 50000,
    color: 'Vermelho',
    type: 'Hatchback',
    doors: 4,
    transmission: 'Manual',
    steering: 'Hidráulica',
    fuel: 'Flex',
    features: ['Ar Condicionado'],
    armored: false,
    auction: false,
    status: 'Disponível',
    media: { photos: [], videos: [], inspection: null }
  },
  {
    id: 5,
    brand: 'Chevrolet',
    model: 'Onix',
    year: 2019,
    price: 52000,
    mileage: 65000,
    color: 'Branco',
    type: 'Hatchback',
    doors: 4,
    transmission: 'Automático',
    steering: 'Elétrica',
    fuel: 'Flex',
    features: ['Ar Condicionado', 'Central Multimídia'],
    armored: false,
    auction: false,
    status: 'Disponível',
    media: { photos: [], videos: [], inspection: null }
  }
];

const initialMockUsers = [
  { id: 1, name: 'Admin', email: 'admin@garage.com', role: 'admin' },
  { id: 2, name: 'João Silva', email: 'joao@email.com', role: 'user' }
];

// Carregar dados do localStorage ou usar dados iniciais
let mockVehicles = loadFromStorage(VEHICLES_STORAGE_KEY, initialMockVehicles);
let mockUsers = loadFromStorage(USERS_STORAGE_KEY, initialMockUsers);
let mockCompany = loadObjectFromStorage(COMPANY_STORAGE_KEY, {
  name: 'Flow Garage',
  address: 'Rua Marechal Floriano Peixoto, 1546, Centro - Maringá, PR - CEP: 87013-060',
  phone: '(44) 3025-4567',
  whatsapp: 'https://wa.me/5544999887766',
  email: 'contato@iadecarro.com.br',
  facebook: 'https://facebook.com/iadecarro',
  instagram: 'https://instagram.com/iadecarro',
  logo: null,
  summary: 'Seu próximo carro com procedência, garantia e atendimento humanizado.',
  publicCatalog: {
    hero: {
      title: 'Seu próximo carro, com procedência e garantia.',
      subtitle: 'Aproveite ofertas exclusivas, condições de financiamento e avaliação online.',
      backgroundUrl: '/banner-hero.jpg',
      backgroundVideoUrl: ''
    },
    reasons: [
      { title: 'Garantia e procedência', description: 'Garantia de 90 dias para motor e câmbio' },
      { title: 'Documentação sem dor de cabeça', description: 'Cuidamos de toda a burocracia' },
      { title: 'Parcelamos em até 18x', description: 'Condições especiais no cartão' },
      { title: 'Aceitamos seu usado na troca', description: 'Avaliação justa e rápida' },
      { title: 'Atendimento humanizado', description: 'Equipe especializada e dedicada' },
      { title: 'Resposta rápida no WhatsApp', description: 'Atendimento ágil e personalizado' }
    ],
    testimonials: [
      {
        name: 'João Silva',
        location: 'SP',
        rating: 5,
        comment: 'Comprei meu Sandero com eles. Atendimento sensacional!',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Maria Santos',
        location: 'RJ',
        rating: 5,
        comment: 'Processo de financiamento muito rápido e transparente!',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Carlos Oliveira',
        location: 'MG',
        rating: 5,
        comment: 'Recomendo! Carro entregue exatamente como prometido.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      }
    ],
    tradeIn: {
      title: 'Quer dar seu carro como entrada?',
      subtitle: 'Envie os dados do seu carro em 2 minutos e receba nossa proposta.',
      backgroundUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&h=1080&fit=crop',
      backgroundVideoUrl: ''
    },
    businessHours: {
      weekdays: 'Segunda à Sexta: 8h às 18h',
      saturday: 'Sábado: 8h às 14h',
      sundayHolidays: 'Domingo: Fechado'
    },
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975!2d-46.6333824!3d-23.5505199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5a2b2ed7f3a1%3A0xab35da2f5ca62674!2sSão%20Paulo%2C%20SP!5e0!3m2!1spt!2sbr!4v1642000000000!5m2!1spt!2sbr',
    footerLinks: [
      { label: 'Catálogo de Veículos', url: '/catalog' },
      { label: 'Avalie seu veículo', url: '/catalog?tab=1' },
      { label: 'Financiamento', url: '/catalog?tab=2' }
    ]
  }
});

// Criar instância do axios
const api = axios.create({
  baseURL: '/api',
});

// Interceptor para simular respostas quando o backend não estiver disponível
api.interceptors.response.use(
  response => response,
  async error => {
    const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE !== 'production';
    const isNetwork = error.code === 'ERR_NETWORK' || (error.message || '').includes('Network Error');
    const isServerError = (error.response?.status || 0) >= 500;
    const isNotFound = (error.response?.status || 0) === 404;
    if (isNetwork || (isDev && (isServerError || isNotFound))) {
      // Simular respostas quando o backend não estiver disponível
      const { method, url } = error.config;
      
      if (method === 'post' && url?.includes('/login')) {
        return {
          data: {
            token: 'mock-jwt-token',
            user: { id: 1, name: 'Demo User', email: 'demo@garage.com', role: 'admin' }
          }
        };
      }
      
      if (method === 'post' && url?.includes('/register')) {
        return {
          data: {
            token: 'mock-jwt-token',
            user: { id: 2, name: 'New User', email: 'new@garage.com', role: 'user' }
          }
        };
      }
      
      // Listagem de veículos: garantir que não capture rota de detalhe (/vehicles/:id)
      if (method === 'get' && /\/vehicles(\?.*)?$/.test(url || '')) {
        // Filtrar por status se especificado
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        const statusFilter = urlParams.get('status');
        
        let filteredVehicles = mockVehicles;
        if (statusFilter) {
          filteredVehicles = mockVehicles.filter((v: any) => v.status === statusFilter);
        }
        
        return {
          data: {
            vehicles: filteredVehicles,
            totalPages: 1,
            currentPage: 1
          }
        };
      }

      // Compartilhar catálogo (mock)
      if (method === 'post' && url?.includes('/vehicles/share-catalog')) {
        const token = 'mock-public-token-' + Math.random().toString(36).slice(2);
        const publicUrl = `${window.location.origin}/public-catalog?token=${token}`;
        return { data: { token, publicUrl, expiresIn: '30 dias' } };
      }

      if (method === 'get' && url?.includes('/public/catalog') && url?.endsWith('/vehicles')) {
        return {
          data: {
            vehicles: mockVehicles,
            totalPages: 1,
            currentPage: 1
          }
        };
      }
      
      if (method === 'get' && url?.match(/\/vehicles\/\d+$/)) {
        // Buscar veículo específico por ID
        const vehicleId = parseInt(url.split('/').pop() || '0');
        const vehicle = mockVehicles.find((v: any) => v.id === vehicleId);
        
        if (vehicle) {
          return { data: vehicle };
        } else {
          return Promise.reject({ response: { status: 404, data: { error: 'Veículo não encontrado' } } });
        }
      }
      
      if (method === 'post' && url?.includes('/vehicles')) {
        const vehicleData = JSON.parse(error.config.data);
        const newVehicle = {
          id: Math.max(...mockVehicles.map((v: any) => v.id), 0) + 1,
          ...vehicleData,
          status: vehicleData.status || 'Disponível',
          media: vehicleData.media || []
        };
        
        mockVehicles.push(newVehicle);
        saveToStorage(VEHICLES_STORAGE_KEY, mockVehicles);
        
        return { data: newVehicle };
      }

      // Alternar destaque do veículo (mock para PATCH)
      if (method === 'patch' && url?.match(/\/vehicles\/\d+$/)) {
        const vehicleId = parseInt(url.split('/').pop() || '0');
        const patchData = JSON.parse(error.config.data || '{}');
        const vehicleIndex = mockVehicles.findIndex((v: any) => v.id === vehicleId);

        if (vehicleIndex !== -1) {
          mockVehicles[vehicleIndex] = {
            ...mockVehicles[vehicleIndex],
            ...patchData
          };
          saveToStorage(VEHICLES_STORAGE_KEY, mockVehicles);
          return { data: mockVehicles[vehicleIndex] };
        } else {
          return Promise.reject({ response: { status: 404, data: { error: 'Veículo não encontrado' } } });
        }
      }

      if (method === 'put' && url?.match(/\/vehicles\/\d+$/)) {
        // Atualizar veículo existente
        const vehicleId = parseInt(url.split('/').pop() || '0');
        const vehicleData = JSON.parse(error.config.data);
        const vehicleIndex = mockVehicles.findIndex((v: any) => v.id === vehicleId);
        
        if (vehicleIndex !== -1) {
          mockVehicles[vehicleIndex] = {
            ...mockVehicles[vehicleIndex],
            ...vehicleData,
            id: vehicleId // Manter o ID original
          };
          saveToStorage(VEHICLES_STORAGE_KEY, mockVehicles);
          
          return { data: mockVehicles[vehicleIndex] };
        } else {
          return Promise.reject({ response: { status: 404, data: { error: 'Veículo não encontrado' } } });
        }
      }
      
      if (method === 'get' && url?.includes('/users')) {
        return { data: mockUsers };
      }
      
      if (method === 'put' && url?.match(/\/users\/\d+$/)) {
        // Atualizar usuário existente
        const userId = parseInt(url.split('/').pop() || '0');
        const userData = JSON.parse(error.config.data);
        const userIndex = mockUsers.findIndex((u: any) => u.id === userId);
        
        if (userIndex !== -1) {
          mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            ...userData,
            id: userId // Manter o ID original
          };
          saveToStorage(USERS_STORAGE_KEY, mockUsers);
          
          // Atualizar também no localStorage se for o usuário logado
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (currentUser.id === userId) {
            const updatedUser = { ...currentUser, ...userData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          
          return { data: mockUsers[userIndex] };
        } else {
          return Promise.reject({ response: { status: 404, data: { error: 'Usuário não encontrado' } } });
        }
      }
      
      if (method === 'put' && url?.includes('/profile')) {
        // Atualizar perfil do usuário logado
        const userData = JSON.parse(error.config.data);
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (currentUser.id) {
          const userIndex = mockUsers.findIndex((u: any) => u.id === currentUser.id);
          
          if (userIndex !== -1) {
            mockUsers[userIndex] = {
              ...mockUsers[userIndex],
              ...userData,
              id: currentUser.id // Manter o ID original
            };
            saveToStorage(USERS_STORAGE_KEY, mockUsers);
            
            // Atualizar também no localStorage
            const updatedUser = { ...currentUser, ...userData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            return { data: mockUsers[userIndex] };
          }
        }
        
        return Promise.reject({ response: { status: 401, data: { error: 'Usuário não autenticado' } } });
      }

      // Dados da empresa (GET)
      if (method === 'get' && url?.includes('/company')) {
        return { data: mockCompany };
      }

      // Atualizar dados da empresa (PUT)
      if (method === 'put' && url?.includes('/company')) {
        const incoming = JSON.parse(error.config.data || '{}');
        mockCompany = { ...mockCompany, ...incoming };
        // Mesclar publicCatalog se vier parcial
        if (incoming.publicCatalog) {
          mockCompany.publicCatalog = {
            ...mockCompany.publicCatalog,
            ...incoming.publicCatalog,
            hero: {
              ...mockCompany.publicCatalog.hero,
              ...(incoming.publicCatalog.hero || {})
            },
            tradeIn: {
              ...mockCompany.publicCatalog.tradeIn,
              ...(incoming.publicCatalog.tradeIn || {})
            },
            businessHours: {
              ...mockCompany.publicCatalog.businessHours,
              ...(incoming.publicCatalog.businessHours || {})
            },
            reasons: incoming.publicCatalog.reasons || mockCompany.publicCatalog.reasons,
            testimonials: incoming.publicCatalog.testimonials || mockCompany.publicCatalog.testimonials,
            footerLinks: incoming.publicCatalog.footerLinks || mockCompany.publicCatalog.footerLinks,
            mapEmbedUrl: incoming.publicCatalog.mapEmbedUrl || mockCompany.publicCatalog.mapEmbedUrl
          };
        }
        // Campo de WhatsApp na raiz
        if (typeof incoming.whatsapp !== 'undefined') {
          mockCompany.whatsapp = incoming.whatsapp;
        }
        saveToStorage(COMPANY_STORAGE_KEY, mockCompany);
        return { data: { company: mockCompany } };
      }
    }
    
    return Promise.reject(error);
  }
);

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;