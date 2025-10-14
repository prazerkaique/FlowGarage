import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, 
  Button, IconButton, Chip, CardMedia, AppBar, Toolbar,
  Dialog, DialogContent, DialogTitle, DialogActions,
  Drawer, useMediaQuery, useTheme, Tabs, Tab, ThemeProvider, createTheme
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  WhatsApp as WhatsAppIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn as LocationOnIcon,
  FilterList as FilterListIcon,
  Info as InfoIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Assessment as AssessmentIcon,
  AccountBalance as FinancingIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import VehicleDetailModal from '../components/VehicleDetailModal';
import CarWheelLoader from '../components/CarWheelLoader';
import VehicleFilters, { type FilterValues } from '../components/VehicleFilters';
import SmartSearch from '../components/SmartSearch';
import VehicleEvaluationForm from '../components/VehicleEvaluationForm';
import FinancingForm from '../components/FinancingForm';
import Home from '../components/Home';

interface Vehicle {
  id: number;
  vehicleId?: string;
  category?: string;
  brand: string;
  model: string;
  licensePlate?: string;
  year: number;
  modelYear?: number;
  price: number;
  mileage?: number;
  color: string;
  bodyType?: string;
  doors?: number;
  transmission?: string;
  steering?: string;
  fuel?: string;
  features?: string[];
  optionalFeatures?: string[];
  armored?: boolean;
  auction?: boolean;
  ipvaPaid?: boolean;
  licensingUpToDate?: boolean;
  status?: string;
  description?: string;
  observations?: string;
  media?: { 
    photos: string[];
    videos?: string[];
    inspection?: string | null;
  };
  createdAt?: string;
}

// Utilitários para normalização dos dados vindos da API/mocks
const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

const toBool = (value: unknown): boolean => {
  return value === true || value === 'true' || value === '1';
};

const normalizeVehiclesData = (data: any[]): Vehicle[] => {
  return (Array.isArray(data) ? data : []).map((v: any, idx: number) => {
    const featuresArr: string[] = Array.isArray(v?.features)
      ? v.features
      : typeof v?.features === 'string'
        ? v.features.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
    const optionalArr: string[] = Array.isArray(v?.optionalFeatures)
      ? v.optionalFeatures
      : typeof v?.optionalFeatures === 'string'
        ? v.optionalFeatures.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
    const combinedFeatures = Array.from(new Set([...
      featuresArr,
      ...optionalArr,
    ]));

    const photos: string[] = Array.isArray(v?.media?.photos) ? v.media.photos : [];
    const videos: string[] = Array.isArray(v?.media?.videos) ? v.media.videos : [];

    const idNum = typeof v?.id === 'number' ? v.id : (parseInt(String(v?.id)) || idx + 1);

    const normalized: Vehicle = {
      id: idNum,
      vehicleId: v?.vehicleId,
      category: v?.category,
      brand: v?.brand ?? '',
      model: v?.model ?? '',
      licensePlate: v?.licensePlate,
      year: toNumber(v?.year),
      modelYear: v?.modelYear !== undefined ? toNumber(v?.modelYear) : undefined,
      price: toNumber(v?.price),
      mileage: v?.mileage !== undefined ? toNumber(v?.mileage) : undefined,
      color: v?.color ?? '',
      bodyType: v?.bodyType,
      doors: v?.doors !== undefined ? toNumber(v?.doors) : undefined,
      transmission: v?.transmission,
      steering: v?.steering,
      fuel: v?.fuel,
      features: combinedFeatures,
      optionalFeatures: optionalArr,
      armored: toBool(v?.armored),
      auction: toBool(v?.auction),
      ipvaPaid: toBool(v?.ipvaPaid),
      licensingUpToDate: toBool(v?.licensingUpToDate),
      status: v?.status,
      description: v?.description,
      observations: v?.observations,
      media: {
        photos,
        videos,
        inspection: v?.media?.inspection ?? null,
      },
      createdAt: v?.createdAt,
    };

    return normalized;
  });
};

const PublicCatalog: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token') || undefined;

  // Tema escuro para a página pública
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#667eea',
        light: '#8fa4f3',
        dark: '#4c63d2',
      },
      secondary: {
        main: '#764ba2',
        light: '#9575cd',
        dark: '#512da8',
      },
      background: {
        default: '#101012',
        paper: '#1C1C1F',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b0b0b0',
      },
    },
    typography: {
      fontFamily: '"Space Grotesk", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({});
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMediaIndex, setModalMediaIndex] = useState(0);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [company, setCompany] = useState<any>({
    name: '',
    address: '',
    phone: '',
    email: '',
    facebook: '',
    instagram: '',
    logo: null,
    summary: '',
    publicCatalog: { footerLinks: [] }
  });

  const [filters, setFilters] = useState<FilterValues>({
    category: '',
    brand: '',
    model: '',
    color: '',
    priceRange: [0, 500000],
    mileageRange: [0, 300000],
    status: '',
    bodyType: '',
    doors: '',
    transmission: '',
    steering: '',
    fuel: '',
    engine: '',
    features: [],
    specialFeatures: []
  });

  const displayVehicles = showWishlistOnly 
    ? (filteredVehicles || []).filter(vehicle => wishlist.includes(vehicle.id))
    : (filteredVehicles || []);

  useEffect(() => {
    fetchVehicles();
    loadWishlist();
    
    if (token) {
      console.log('Token recebido:', token);
    }
    // Carregar dados da empresa para rodapé
    (async () => {
      try {
        const res = await api.get('/company');
        setCompany(res.data || {});
      } catch (e) {
        console.error('Erro ao carregar dados da empresa:', e);
      }
    })();
  }, [token]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      if (token) {
        console.log('Fazendo requisição para:', `/public/catalog/${token}/vehicles`);
        const response = await api.get(`/public/catalog/${token}/vehicles`);
        console.log('Resposta da API:', response.data);
        const vehiclesData = Array.isArray(response.data) ? response.data : response.data?.vehicles || [];
        const normalized = normalizeVehiclesData(vehiclesData);
        setVehicles(normalized);
        setFilteredVehicles(normalized);
      } else {
        if (import.meta.env.MODE !== 'production') {
          const response = await api.get('/vehicles');
          const vehiclesData = Array.isArray(response.data) ? response.data : response.data?.vehicles || [];
          const normalized = normalizeVehiclesData(vehiclesData);
          setVehicles(normalized);
          setFilteredVehicles(normalized);
          setError(null);
        } else {
          setError('Token de acesso não encontrado.');
          return;
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar veículos:', error);
      console.error('Detalhes do erro:', error.response?.data);
      console.error('Status do erro:', error.response?.status);
      setError('Erro ao carregar veículos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = () => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  };

  const saveWishlist = (newWishlist: number[]) => {
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  const toggleWishlist = (vehicleId: number) => {
    const newWishlist = wishlist.includes(vehicleId)
      ? wishlist.filter(id => id !== vehicleId)
      : [...wishlist, vehicleId];
    setWishlist(newWishlist);
    saveWishlist(newWishlist);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'disponível':
        return 'success';
      case 'vendido':
        return 'error';
      case 'reservado':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleWhatsApp = (vehicle: Vehicle) => {
    const message = `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.year} por ${formatCurrency(vehicle.price)}`;
    const number = (company?.whatsapp || company?.phone || '').replace(/\D/g, '') || '5500000000000';
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getFooterIcon = (label: string) => {
    const l = (label || '').toLowerCase();
    if (l.includes('catálogo') || l.includes('estoque') || l.includes('home')) return <HomeIcon />;
    if (l.includes('avali') || l.includes('avalia')) return <AssessmentIcon />;
    if (l.includes('financia')) return <FinancingIcon />;
    return <HomeIcon />;
  };

  const handlePrevImage = (vehicleId: number) => {
    setCurrentImageIndex(prev => {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) return prev;
      
      const currentIndex = prev[vehicleId] || 0;
      const newIndex = currentIndex > 0 ? currentIndex - 1 : (vehicle.media?.photos?.length || 1) - 1;
      return { ...prev, [vehicleId]: newIndex };
    });
  };

  const handleNextImage = (vehicleId: number) => {
    setCurrentImageIndex(prev => {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) return prev;
      
      const currentIndex = prev[vehicleId] || 0;
      const newIndex = currentIndex < (vehicle.media?.photos?.length || 1) - 1 ? currentIndex + 1 : 0;
      return { ...prev, [vehicleId]: newIndex };
    });
  };

  const handleOpenModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setModalOpen(true);
    setModalMediaIndex(0);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleOpenDetailModal = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedVehicleId(null);
  };

  const applyFilters = () => {
    let filtered = vehicles;

    if (filters.category) {
      filtered = filtered.filter(vehicle => 
        vehicle.category?.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    if (filters.brand) {
      filtered = filtered.filter(vehicle => 
        vehicle.brand?.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    if (filters.model) {
      filtered = filtered.filter(vehicle => 
        vehicle.model?.toLowerCase().includes(filters.model.toLowerCase())
      );
    }

    if (filters.color) {
      filtered = filtered.filter(vehicle => 
        vehicle.color?.toLowerCase().includes(filters.color.toLowerCase())
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(vehicle => {
        const price = vehicle.price ?? 0;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }

    if (filters.mileageRange) {
      filtered = filtered.filter(vehicle => {
        const mileage = vehicle.mileage ?? 0;
        return mileage >= filters.mileageRange[0] && mileage <= filters.mileageRange[1];
      });
    }

    if (filters.status) {
      filtered = filtered.filter(vehicle => 
        vehicle.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.bodyType) {
      filtered = filtered.filter(vehicle => 
        vehicle.bodyType?.toLowerCase().includes(filters.bodyType.toLowerCase())
      );
    }

    if (filters.doors) {
      filtered = filtered.filter(vehicle => {
        const doorsStr = String(vehicle.doors ?? '');
        return doorsStr === filters.doors;
      });
    }

    if (filters.transmission) {
      filtered = filtered.filter(vehicle => 
        vehicle.transmission?.toLowerCase().includes(filters.transmission.toLowerCase())
      );
    }

    if (filters.steering) {
      filtered = filtered.filter(vehicle => 
        vehicle.steering?.toLowerCase().includes(filters.steering.toLowerCase())
      );
    }

    if (filters.fuel) {
      filtered = filtered.filter(vehicle => 
        vehicle.fuel?.toLowerCase().includes(filters.fuel.toLowerCase())
      );
    }

    if (filters.features && filters.features.length > 0) {
      filtered = filtered.filter(vehicle => {
        const vehicleFeatures: string[] = vehicle.features ?? [];
        return vehicleFeatures.length > 0 &&
          filters.features!.some(feature =>
            vehicleFeatures.some(vFeature =>
              vFeature && vFeature.toLowerCase().includes(feature.toLowerCase())
            )
          );
      });
    }

    if (filters.specialFeatures && filters.specialFeatures.length > 0) {
      filtered = filtered.filter(vehicle => {
        const armored = !!vehicle.armored;
        const auction = !!vehicle.auction;
        const ipvaPaid = !!vehicle.ipvaPaid;
        const licensingUpToDate = !!vehicle.licensingUpToDate;
        
        if (filters.specialFeatures.includes('armored') && !armored) return false;
        if (filters.specialFeatures.includes('auction') && !auction) return false;
        if (filters.specialFeatures.includes('ipvaPaid') && !ipvaPaid) return false;
        if (filters.specialFeatures.includes('licensingUpToDate') && !licensingUpToDate) return false;
        return true;
      });
    }

    setFilteredVehicles(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, vehicles]);

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      model: '',
      color: '',
      priceRange: [0, 500000],
      mileageRange: [0, 300000],
      status: '',
      bodyType: '',
      doors: '',
      transmission: '',
      steering: '',
      fuel: '',
      engine: '',
      features: [],
      specialFeatures: []
    });
  };

  const handleSearchResults = (results: Vehicle[]) => {
    setFilteredVehicles(results);
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CarWheelLoader />
        <Typography variant="h6" color="text.secondary">
          Carregando veículos...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="error" textAlign="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <>
        {/* Header com abas */}
        <AppBar position="static" sx={{ mb: 0 }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src="/Flo Garage.png" 
              alt="Flo Garage" 
              style={{ 
                height: '40px', 
                width: 'auto'
              }} 
            />
          </Box>
          <Button 
            color="inherit" 
            onClick={() => setShowWishlistOnly(!showWishlistOnly)}
            startIcon={<FavoriteIcon />}
          >
            Favoritos ({wishlist.length})
          </Button>
        </Toolbar>
        
        {/* Abas de navegação */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs 
            value={currentTab} 
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{ 
              '& .MuiTab-root': { 
                color: 'text.primary',
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }
            }}
          >
            <Tab 
              label="Home" 
              icon={<HomeIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Catálogo de Veículos" 
              icon={<LocationOnIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Avalie Seu Veículo" 
              icon={<AssessmentIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Financiamento" 
              icon={<FinancingIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>
      </AppBar>

      <Container maxWidth="lg" sx={{ pb: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
        {/* Conteúdo das abas */}
        {currentTab === 0 ? (
          /* Aba Home */
          <Home />
        ) : currentTab === 1 ? (
          <>
            {/* Busca inteligente */}
            <Box sx={{ mb: 3 }}>
              <SmartSearch
                vehicles={vehicles}
                onSearchResults={handleSearchResults}
                placeholder="Busque por marca, modelo ou características..."
              />
            </Box>

            <Grid container spacing={3}>
              {/* Filtros laterais (desktop) */}
              {!isMobile && (
                <Grid item xs={12} md={3}>
                  <Box sx={{ 
                    position: 'sticky', 
                    top: 20,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    p: 2,
                    boxShadow: 1
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                      Filtros
                    </Typography>
                    <VehicleFilters
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      onClearFilters={handleClearFilters}
                    />
                  </Box>
                </Grid>
              )}

              {/* Lista de veículos */}
              <Grid item xs={12} md={!isMobile ? 9 : 12}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {displayVehicles.length} veículo{displayVehicles.length !== 1 ? 's' : ''} encontrado{displayVehicles.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {displayVehicles.map((vehicle) => (
                    <Grid item xs={12} sm={6} lg={4} key={vehicle.id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4
                          }
                        }}
                      >
                        {/* Botão de favorito */}
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            zIndex: 1,
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 1)'
                            }
                          }}
                          onClick={() => toggleWishlist(vehicle.id)}
                        >
                          {wishlist.includes(vehicle.id) ? (
                            <FavoriteIcon color="error" />
                          ) : (
                            <FavoriteBorderIcon />
                          )}
                        </IconButton>

                        {/* Imagem do veículo */}
                        <Box sx={{ position: 'relative', height: 200 }}>
                          {vehicle.media?.photos?.length > 0 ? (
                            <>
                              <CardMedia
                                component="img"
                                height="200"
                                image={
                                  (vehicle.media?.photos?.length ?? 0) > 0
                                    ? `http://localhost:3001${vehicle.media?.photos?.[currentImageIndex[vehicle.id] || 0] || ''}`
                                    : '/placeholder-car.jpg'
                                }
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                sx={{ objectFit: 'cover', height: '100%' }}
                              />
                              
                              {/* Navegação de imagens */}
                              {(vehicle.media?.photos?.length ?? 0) > 1 && (
                                <>
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentIndex = currentImageIndex[vehicle.id] || 0;
                                      const total = vehicle.media?.photos?.length ?? 0;
                                      const newIndex = total > 0 ? (currentIndex === 0 ? total - 1 : currentIndex - 1) : 0;
                                      setCurrentImageIndex(prev => ({ ...prev, [vehicle.id]: newIndex }));
                                    }}
                                    sx={{
                                      position: 'absolute',
                                      left: 8,
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      backgroundColor: 'rgba(0,0,0,0.5)',
                                      color: 'white',
                                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                                    }}
                                  >
                                    <ChevronLeftIcon />
                                  </IconButton>
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentIndex = currentImageIndex[vehicle.id] || 0;
                                      const total = vehicle.media?.photos?.length ?? 0;
                                      const newIndex = total > 0 ? (currentIndex === total - 1 ? 0 : currentIndex + 1) : 0;
                                      setCurrentImageIndex(prev => ({ ...prev, [vehicle.id]: newIndex }));
                                    }}
                                    sx={{
                                      position: 'absolute',
                                      right: 8,
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      backgroundColor: 'rgba(0,0,0,0.5)',
                                      color: 'white',
                                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                                    }}
                                  >
                                    <ChevronRightIcon />
                                  </IconButton>
                                </>
                              )}
                              
                              {/* Indicador de imagens */}
                              {(vehicle.media?.photos?.length ?? 0) > 1 && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    bottom: 8,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    gap: 0.5,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    borderRadius: 1,
                                    padding: 0.5
                                  }}
                                >
                                  {(vehicle.media?.photos ?? []).map((_, index) => (
                                    <Box
                                      key={index}
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: (currentImageIndex[vehicle.id] || 0) === index ? 'white' : 'rgba(255,255,255,0.5)'
                                      }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </>
                          ) : (
                            <Box
                              sx={{
                                height: 200,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'grey.200',
                                color: 'grey.500'
                              }}
                            >
                              <Typography>Sem imagem</Typography>
                            </Box>
                          )}
                        </Box>

                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          {/* Título e status */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {vehicle.brand} {vehicle.model}
                            </Typography>
                            {vehicle.status && (
                              <Chip
                                label={vehicle.status}
                                size="small"
                                color={getStatusColor(vehicle.status)}
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>

                          {/* Ano e preço */}
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {vehicle.year} • {vehicle.color}
                          </Typography>

                          <Typography variant="h5" color="primary" sx={{ fontWeight: 700, mb: 2 }}>
                            {formatCurrency(vehicle.price)}
                          </Typography>

                          {/* Características principais */}
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                            <Chip label={`${(vehicle.mileage || 0).toLocaleString()} km`} size="small" variant="outlined" />
                            <Chip label={vehicle.fuel || 'N/A'} size="small" variant="outlined" />
                            <Chip label={vehicle.transmission || 'N/A'} size="small" variant="outlined" />
                            <Chip label={`${vehicle.doors || 0} portas`} size="small" variant="outlined" />
                          </Box>

                          {/* Botões de ação */}
                          <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<InfoIcon />}
                              onClick={() => handleOpenDetailModal(vehicle.id)}
                              sx={{ flex: 1 }}
                            >
                              Detalhes
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<WhatsAppIcon />}
                              onClick={() => handleWhatsApp(vehicle)}
                              sx={{ 
                                flex: 1,
                                bgcolor: '#25D366',
                                '&:hover': {
                                  bgcolor: '#128C7E'
                                }
                              }}
                            >
                              WhatsApp
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {displayVehicles.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Nenhum veículo encontrado
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tente ajustar os filtros ou fazer uma nova busca
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </>
        ) : currentTab === 2 ? (
          /* Aba de Avaliação de Veículo */
          <VehicleEvaluationForm />
        ) : (
          /* Aba de Financiamento */
          <FinancingForm />
        )}
      </Container>

      {/* Drawer de filtros (mobile) */}
      <Drawer
        anchor="right"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 300,
            p: 2
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filtros
          </Typography>
          <IconButton onClick={() => setFiltersOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <VehicleFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
      </Drawer>

      {/* Modal de imagem */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedVehicle?.brand} {selectedVehicle?.model}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedVehicle && (
            <Box sx={{ textAlign: 'center' }}>
              {/* Conteúdo do modal será implementado conforme necessário */}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes do veículo */}
      {selectedVehicleId && (
        <VehicleDetailModal
          vehicleId={selectedVehicleId}
          open={detailModalOpen}
          onClose={handleCloseDetailModal}
          isPublic={true}
          token={token}
        />
      )}

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
          color: 'white',
          mt: 8,
          py: 6,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Logo e descrição */}
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 3 }}>
                <img 
                  src={company.logo || '/Flo Garage.png'} 
                  alt={(company.name || 'Flow Garage') + ' Logo'} 
                  style={{ 
                    height: '60px', 
                    filter: 'brightness(0) invert(1)',
                    marginBottom: '16px'
                  }} 
                />
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #ffffff 30%, #cccccc 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}>
                  {company.name || 'Flow Garage'}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#cccccc',
                  lineHeight: 1.6
                }}>
                  {company.summary || 'Sua concessionária de confiança. Oferecemos os melhores veículos com garantia e condições especiais de financiamento.'}
                </Typography>
              </Box>
            </Grid>

            {/* Informações de contato */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                mb: 3,
                background: 'linear-gradient(45deg, #ffffff 30%, #cccccc 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Contato
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon sx={{ color: '#666', fontSize: '20px' }} />
                  <Typography variant="body2" sx={{ color: '#cccccc' }}>
                    {company.address || 'Endereço não informado'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ color: '#666', fontSize: '20px' }} />
                  <Typography variant="body2" sx={{ color: '#cccccc' }}>
                    {company.phone || '(00) 0000-0000'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon sx={{ color: '#666', fontSize: '20px' }} />
                  <Typography variant="body2" sx={{ color: '#cccccc' }}>
                    {company.email || 'contato@empresa.com.br'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Redes sociais e horário */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                mb: 3,
                background: 'linear-gradient(45deg, #ffffff 30%, #cccccc 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Siga-nos
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <IconButton 
                  sx={{ 
                    background: 'linear-gradient(45deg, #1877f2 30%, #42a5f5 90%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #166fe5 30%, #1976d2 90%)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                  href={company.facebook || "https://facebook.com"}
                  target="_blank"
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton 
                  sx={{ 
                    background: 'linear-gradient(45deg, #e1306c 30%, #fd1d1d 90%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #c13584 30%, #e1306c 90%)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                  href={company.instagram || "https://instagram.com"}
                  target="_blank"
                >
                  <InstagramIcon />
                </IconButton>
                <IconButton 
                  sx={{ 
                    background: 'linear-gradient(45deg, #25d366 30%, #128c7e 90%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #128c7e 30%, #075e54 90%)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                  href={`https://wa.me/${((company.whatsapp || company.phone || '').replace(/\D/g,'')) || '5500000000000'}`}
                  target="_blank"
                >
                  <WhatsAppIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ 
                color: '#cccccc',
                mb: 1,
                fontWeight: 'bold'
              }}>
                Horário de Funcionamento:
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                {(company.publicCatalog?.businessHours?.weekdays) || 'Segunda à Sexta: 8h às 18h'}<br />
                {(company.publicCatalog?.businessHours?.saturday) || 'Sábado: 8h às 14h'}<br />
                {(company.publicCatalog?.businessHours?.sundayHolidays) || 'Domingo: Fechado'}
              </Typography>

              {/* Links úteis do rodapé */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold',
                  mb: 2,
                  background: 'linear-gradient(45deg, #ffffff 30%, #cccccc 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Links úteis
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {(company.publicCatalog?.footerLinks || []).map((link: any, idx: number) => (
                    <Button
                      key={idx}
                      href={link.url}
                      target={link.url?.startsWith('http') ? '_blank' : undefined}
                      startIcon={getFooterIcon(link.label)}
                      sx={{
                        justifyContent: 'flex-start',
                        color: '#cccccc',
                        textTransform: 'none',
                        '&:hover': {
                          color: 'white',
                          transform: 'translateX(2px)'
                        }
                      }}
                    >
                      {link.label}
                    </Button>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Copyright */}
          <Box sx={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            mt: 4,
            pt: 3,
            textAlign: 'center'
          }}>
            <Typography variant="body2" sx={{ 
              color: '#666',
              fontSize: '0.875rem'
            }}>
              © {new Date().getFullYear()} {company.name || 'Flow Garage'}. Todos os direitos reservados. |
              Desenvolvido com ❤️ para oferecer a melhor experiência em compra de veículos.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
    </ThemeProvider>
  );
};

export default PublicCatalog;