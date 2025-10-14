import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, 
  Button, IconButton, Chip, CardMedia,
  Dialog, DialogContent, DialogTitle, DialogActions,
  Drawer, useTheme, useMediaQuery, Snackbar, Alert,
  Pagination
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Share as ShareIcon,
  CloudUpload as CloudUploadIcon,
  FilterList as FilterListIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import VehicleFilters, { type FilterValues } from '../components/VehicleFilters';
import VehicleDetailModal from '../components/VehicleDetailModal';
import VehicleImport from '../components/VehicleImport';
import SmartSearch from '../components/SmartSearch';
import CarWheelLoader from '../components/CarWheelLoader';

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
  mileage: number;
  color: string;
  bodyType?: string;
  doors: number;
  transmission: string;
  steering: string;
  fuel: string;
  engine?: string;
  features: string[];
  optionalFeatures?: string[];
  armored: boolean;
  auction: boolean;
  ipvaPaid?: boolean;
  licensingUpToDate?: boolean;
  status?: string;
  description?: string;
  observations?: string;
  highlighted?: boolean;
  media: { 
    photos: string[];
    videos: string[];
    inspection: string | null;
  };
  createdAt?: string;
}

const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: number]: number}>({});
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMediaIndex, setModalMediaIndex] = useState(0);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
  const [prevScrollY, setPrevScrollY] = useState<number | null>(null);
  const [company, setCompany] = useState<any>({ whatsapp: '', phone: '' });
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [itemsPerPage] = useState(10);
  
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
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, filters]);

  // Removido o efeito que causava duplo fetch ao mudar filtros

  useEffect(() => {
    applyFilters();
  }, [vehicles]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/company');
        setCompany(res.data || {});
      } catch (e) {
        console.error('Erro ao carregar dados da empresa:', e);
      }
    })();
  }, []);

  const applyFilters = () => {
    // Com paginação no servidor, não precisamos filtrar no frontend
    // Os filtros são aplicados na função fetchVehicles
    setFilteredVehicles(vehicles);
  };

  const handleFiltersChange = (newFilters: FilterValues) => {
    // Guardar posição atual para evitar salto ao topo durante requisições
    setPrevScrollY(window.scrollY);
    // Garantir que a paginação reseta antes de buscar, evitando duplo fetch
    setCurrentPage(1);
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

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      
      // Construir parâmetros da query
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });
      
      // Adicionar filtros aos parâmetros
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      
      const response = await api.get(`/vehicles?${params.toString()}`);
      
      // A API retorna um objeto com informações de paginação
      const { vehicles: vehiclesData, totalPages, currentPage: page, totalVehicles } = response.data;
      
      setVehicles(vehiclesData || []);
      setTotalPages(totalPages || 1);
      setCurrentPage(page || 1);
      setTotalVehicles(totalVehicles || 0);
      setError(null);
    } catch (error: any) {
      console.error('Erro ao buscar veículos:', error);
      setError('Erro ao carregar veículos. Tente novamente.');
      setVehicles([]);
      setTotalPages(1);
      setTotalVehicles(0);
    } finally {
      setLoading(false);
      // Restaurar a posição de scroll se foi capturada
      if (prevScrollY !== null) {
        window.scrollTo({ top: prevScrollY });
        setPrevScrollY(null);
      }
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      try {
        await api.delete(`/vehicles/${vehicleId}`);
        setVehicles(vehicles.filter(v => v.id !== vehicleId));
        setSuccessMessage('Veículo excluído com sucesso!');
      } catch (error: any) {
        console.error('Erro ao excluir veículo:', error);
        setError('Erro ao excluir veículo. Tente novamente.');
      }
    }
  };

  const handleToggleHighlight = async (vehicleId: number) => {
    try {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) return;

      const updatedHighlight = !vehicle.highlighted;
      await api.patch(`/vehicles/${vehicleId}`, { highlighted: updatedHighlight });
      
      setVehicles(vehicles.map(v => 
        v.id === vehicleId 
          ? { ...v, highlighted: updatedHighlight }
          : v
      ));
      
      setSuccessMessage(
        updatedHighlight 
          ? 'Veículo destacado com sucesso!' 
          : 'Destaque removido com sucesso!'
      );
    } catch (error: any) {
      console.error('Erro ao alterar destaque:', error);
      setError('Erro ao alterar destaque. Tente novamente.');
    }
  };

  const formatCurrency = (value: number | string | undefined | null) => {
    const safe = Number(value ?? 0);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(safe);
  };

  const normalizeVehicle = (data: any): Vehicle => {
    const mediaProp = data?.media;
    let photos: string[] = [];
    let videos: string[] = [];
    let inspection: string | null = null;

    if (Array.isArray(mediaProp)) {
      photos = mediaProp
        .filter((m: any) => m && (m.type === 'image' || m.type === 'photo') && m.url)
        .map((m: any) => String(m.url));
      videos = mediaProp
        .filter((m: any) => m && m.type === 'video' && m.url)
        .map((m: any) => String(m.url));
    } else if (mediaProp && typeof mediaProp === 'object') {
      photos = Array.isArray(mediaProp.photos) ? mediaProp.photos.map((p: any) => String(p)) : [];
      videos = Array.isArray(mediaProp.videos) ? mediaProp.videos.map((v: any) => String(v)) : [];
      inspection = mediaProp.inspection ?? null;
    }

    const features = Array.isArray(data?.features) ? data.features.map((f: any) => String(f)) : [];
    const optionalFeatures = Array.isArray(data?.optionalFeatures) ? data.optionalFeatures.map((f: any) => String(f)) : undefined;

    return {
      id: Number(data?.id ?? 0),
      vehicleId: data?.vehicleId,
      category: data?.category,
      brand: String(data?.brand ?? ''),
      model: String(data?.model ?? ''),
      licensePlate: data?.licensePlate,
      year: Number(data?.year ?? 0),
      modelYear: data?.modelYear != null ? Number(data.modelYear) : undefined,
      price: Number(data?.price ?? 0),
      mileage: Number(data?.mileage ?? 0),
      color: String(data?.color ?? ''),
      bodyType: data?.bodyType,
      doors: Number(data?.doors ?? 4),
      transmission: String(data?.transmission ?? ''),
      steering: String(data?.steering ?? ''),
      fuel: String(data?.fuel ?? ''),
      engine: data?.engine,
      features,
      optionalFeatures,
      armored: Boolean(data?.armored),
      auction: Boolean(data?.auction),
      ipvaPaid: data?.ipvaPaid ?? undefined,
      licensingUpToDate: data?.licensingUpToDate ?? undefined,
      status: data?.status,
      description: data?.description,
      observations: data?.observations,
      highlighted: Boolean(data?.highlighted),
      media: { photos, videos, inspection },
      createdAt: data?.createdAt
    } as Vehicle;
  };

  const handleShareCatalog = async () => {
    try {
      const response = await api.post('/vehicles/share-catalog');
      const shareUrl = `${window.location.origin}/public-catalog?token=${response.data.token}`;
      
      // Copia o link para a área de transferência
      try {
        await navigator.clipboard.writeText(shareUrl);
        setSuccessMessage('Link do catálogo copiado para a área de transferência!');
      } catch (clipboardError) {
        // Se clipboard falhar, mostra o link para o usuário copiar manualmente
        setSuccessMessage(`Link do catálogo: ${shareUrl}`);
      }
      
      // Abre o catálogo público em uma nova aba
      window.open(shareUrl, '_blank');
      
    } catch (error: any) {
      console.error('Erro ao compartilhar catálogo:', error);
      setError('Erro ao compartilhar catálogo. Tente novamente.');
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'disponível':
      case 'disponivel':
        return 'success';
      case 'vendido':
        return 'error';
      case 'reservado':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleOpenModal = async (vehicleId: number) => {
    try {
      const response = await api.get(`/vehicles/${vehicleId}`);
      const normalized = normalizeVehicle(response.data);
      setSelectedVehicle(normalized);
      setModalMediaIndex(0);
      setModalOpen(true);
    } catch (error: any) {
      console.error('Erro ao carregar detalhes do veículo:', error);
      setError('Erro ao carregar detalhes do veículo.');
    }
  };

  const handleShareWhatsApp = (vehicle: Vehicle) => {
    const vehicleType = vehicle.bodyType || 'veículo';
    const message = `Da uma olhada nesse ${vehicleType} que separamos pra voce: ` +
      `*${vehicle.brand} ${vehicle.model} ${vehicle.year}* - ` +
      `So ${Number(vehicle.mileage ?? 0).toLocaleString()} km rodados, ` +
      `${vehicle.transmission}, ${vehicle.color}, ${vehicle.fuel}. ` +
      `Por ${formatCurrency(vehicle.price)}. ` +
      `Ta novo demais! Quer ver pessoalmente? Vamos tomar um cafe aqui na Project Garage!`;
    
    const encodedMessage = encodeURIComponent(message);
    const number = (company?.whatsapp || company?.phone || '').replace(/\D/g, '');
    const whatsappUrl = number
      ? `https://wa.me/${number}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CarWheelLoader />
      </Container>
    );
  }

  // Removido o retorno em tela cheia ao ocorrer erro, para evitar tela branca.
  // Erros agora são comunicados apenas via Snackbar no rodapé.

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Veículos ({filteredVehicles.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<ShareIcon />}
              onClick={handleShareCatalog}
              sx={{ 
                backgroundColor: '#e3f2fd',
                borderColor: '#2196f3',
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: '#bbdefb',
                  borderColor: '#1976d2'
                }
              }}
            >
              Compartilhar Catálogo
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<CloudUploadIcon />}
              onClick={() => setImportModalOpen(true)}
            >
              Importação em Massa
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/vehicles/new')}
            >
              Novo Veículo
            </Button>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 3 }
        }}>

          {isMobile && (
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFiltersDrawerOpen(true)}
                fullWidth
                sx={{
                  py: 1.5,
                  borderColor: '#2196f3',
                  color: '#1976d2',
                  backgroundColor: '#e3f2fd',
                  '&:hover': {
                    backgroundColor: '#bbdefb',
                    borderColor: '#1976d2'
                  }
                }}
              >
                Filtros ({Object.values(filters).filter(value => 
                  Array.isArray(value) ? value.length > 0 : 
                  typeof value === 'string' ? value !== '' : 
                  Array.isArray(value) && value.length === 2 ? 
                    value[0] !== 0 || value[1] !== (value === filters.priceRange ? 500000 : 300000) : 
                  false
                ).length})
              </Button>
            </Box>
          )}

          {!isMobile && (
            <Box sx={{ 
              width: '300px'
            }}>
              <VehicleFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
            </Box>
          )}

          <Box sx={{ 
            flex: 1
          }}>
            <Box sx={{ mb: 3 }}>
              <SmartSearch
                vehicles={vehicles.map(v => ({
                  id: v.id,
                  brand: v.brand,
                  model: v.model,
                  year: v.year,
                  price: v.price,
                  color: v.color,
                  bodyType: v.bodyType
                }))}
                onSearchResults={(results) => {
                  const resultIds = results.map(r => r.id);
                  setFilteredVehicles(vehicles.filter(v => resultIds.includes(v.id)));
                }}
                placeholder="Busque por marca, modelo ou características... (ex: Toyota, Corolla, ctroen)"
              />
            </Box>

            {filteredVehicles.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  {vehicles.length === 0 ? 'Nenhum veículo encontrado' : 'Nenhum veículo corresponde aos filtros selecionados'}
                </Typography>
                {vehicles.length === 0 ? (
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/vehicles/new')}
                    sx={{ mt: 2 }}
                  >
                    Adicionar Primeiro Veículo
                  </Button>
                ) : (
                  <Button 
                    variant="outlined" 
                    onClick={handleClearFilters}
                    sx={{ mt: 2 }}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </Box>
            ) : (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: '1fr', 
                  sm: 'repeat(2, 1fr)', 
                  md: 'repeat(2, 1fr)', 
                  lg: 'repeat(3, 1fr)',
                  xl: 'repeat(4, 1fr)' 
                }, 
                gap: { xs: 2, sm: 2.5, md: 3 }
              }}>
                {filteredVehicles.map((vehicle) => {
                  // Normalizar mídia: aceitar array de objetos ou objeto com arrays
                  const mediaProp: any = vehicle.media as any;
                  let photos: string[] = [];
                  let videos: string[] = [];

                  if (Array.isArray(mediaProp)) {
                    photos = mediaProp
                      .filter((m: any) => m.type === 'image' || m.type === 'photo')
                      .map((m: any) => m.url);
                    videos = mediaProp
                      .filter((m: any) => m.type === 'video')
                      .map((m: any) => m.url);
                  } else if (mediaProp && typeof mediaProp === 'object') {
                    photos = Array.isArray(mediaProp.photos) ? mediaProp.photos : [];
                    videos = Array.isArray(mediaProp.videos) ? mediaProp.videos : [];
                  }

                  const totalMedia = photos.length + videos.length;
                  const currentIndex = currentImageIndex[vehicle.id] || 0;
                  
                  const isVideo = currentIndex >= photos.length;
                  const rawUrl = isVideo 
                    ? videos[currentIndex - photos.length]
                    : photos.length > 0 ? photos[currentIndex] : undefined;

                  const resolveUrl = (url?: string) => {
                    if (!url) return undefined;
                    const isAbsolute = /^https?:\/\//.test(url) || url.startsWith('data:');
                    if (isAbsolute) return url;
                    // Usar base de mídia para caminhos relativos/absolutos
                    const base = (import.meta as any)?.env?.VITE_MEDIA_BASE_URL || window.location.origin;
                    if (url.startsWith('/')) return `${base}${url}`;
                    return `${base}/${url}`;
                  };
                  const mediaUrl = resolveUrl(rawUrl);
                  
                  const handlePrevImage = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    const newIndex = currentIndex > 0 ? currentIndex - 1 : totalMedia - 1;
                    setCurrentImageIndex(prev => ({ ...prev, [vehicle.id]: newIndex }));
                  };
                  
                  const handleNextImage = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    const newIndex = currentIndex < totalMedia - 1 ? currentIndex + 1 : 0;
                    setCurrentImageIndex(prev => ({ ...prev, [vehicle.id]: newIndex }));
                  };

                  return (
                    <Card 
                      key={vehicle.id} 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                          '& .media-overlay': {
                            opacity: 1
                          }
                        },
                        ...(vehicle.highlighted && {
                          border: '2px solid #ffd700',
                          boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                        })
                      }}
                      onClick={() => handleOpenModal(vehicle.id)}
                    >
                      <Box sx={{ position: 'relative', height: { xs: 200, sm: 220, md: 240 } }}>
                        {mediaUrl ? (
                          isVideo ? (
                            <video
                              src={mediaUrl}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              muted
                              loop
                              autoPlay
                            />
                          ) : (
                            <CardMedia
                              component="img"
                              height="100%"
                              image={mediaUrl}
                              alt={`${vehicle.brand} ${vehicle.model}`}
                              onError={(e: any) => { try { e.currentTarget.src = '/banner-hero.jpg'; } catch {} }}
                              sx={{ 
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)'
                                }
                              }}
                            />
                          )
                        ) : (
                          <Box
                            sx={{
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: `
                                linear-gradient(135deg, 
                                  rgba(33, 150, 243, 0.1) 0%, 
                                  rgba(33, 150, 243, 0.05) 100%
                                )
                              `,
                              color: 'text.secondary'
                            }}
                          >
                            <Typography variant="body2">Sem imagem</Typography>
                          </Box>
                        )}

                        {totalMedia > 1 && (
                          <>
                            <IconButton
                              onClick={handlePrevImage}
                              className="media-overlay"
                              sx={{
                                position: 'absolute',
                                left: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                color: 'white',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)'
                                },
                                width: { xs: 32, sm: 40 },
                                height: { xs: 32, sm: 40 }
                              }}
                            >
                              <ChevronLeftIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={handleNextImage}
                              className="media-overlay"
                              sx={{
                                position: 'absolute',
                                right: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                color: 'white',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)'
                                },
                                width: { xs: 32, sm: 40 },
                                height: { xs: 32, sm: 40 }
                              }}
                            >
                              <ChevronRightIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}

                        {vehicle.highlighted && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              background: `
                                linear-gradient(45deg, 
                                  #ffd700 0%, 
                                  #ffed4e 100%
                                )
                              `,
                              color: '#000',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
                            }}
                          >
                            ⭐ DESTAQUE
                          </Box>
                        )}

                        {totalMedia > 1 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 8,
                              right: 8,
                              background: `
                                linear-gradient(135deg, 
                                  rgba(0, 0, 0, 0.8) 0%, 
                                  rgba(0, 0, 0, 0.6) 100%
                                )
                              `,
                              color: 'white',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              backdropFilter: 'blur(4px)'
                            }}
                          >
                            {currentIndex + 1}/{totalMedia}
                          </Box>
                        )}

                        {vehicle.status && (
                          <Chip
                            label={vehicle.status}
                            size="small"
                            color={getStatusColor(vehicle.status) as any}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              fontWeight: 'bold',
                              fontSize: '0.7rem'
                            }}
                          />
                        )}

                        {/* Estrela de Destaque */}
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleHighlight(vehicle.id);
                          }}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            color: vehicle.highlighted ? '#ffd700' : 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.3s ease',
                            width: 36,
                            height: 36
                          }}
                        >
                          {vehicle.highlighted ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                      </Box>

                      <CardContent sx={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        p: { xs: 1.5, sm: 2 }
                      }}>
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          sx={{ 
                            mb: 0.5,
                            fontSize: { xs: '1rem', sm: '1.1rem' },
                            fontWeight: 600,
                            lineHeight: 1.2
                          }}
                        >
                          {vehicle.brand} {vehicle.model}
                        </Typography>
                        
                        {vehicle.licensePlate && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              mb: 1,
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              fontFamily: 'monospace',
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                              px: 1,
                              py: 0.25,
                              borderRadius: 0.5,
                              display: 'inline-block'
                            }}
                          >
                            {vehicle.licensePlate}
                          </Typography>
                        )}
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            mb: { xs: 0.5, sm: 1 },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          {vehicle.year} • {Number(vehicle.mileage ?? 0).toLocaleString()} km
                        </Typography>
                        <Typography 
                          variant="h6" 
                          color="primary" 
                          sx={{ 
                            mt: { xs: 0.5, sm: 1 },
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                            fontWeight: 600
                          }}
                        >
                          {formatCurrency(vehicle.price)}
                        </Typography>
                        <Box sx={{ 
                          mt: { xs: 0.5, sm: 1 }, 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: { xs: 0.25, sm: 0.5 }
                        }}>
                          {vehicle.category && (
                            <Chip 
                              label={vehicle.category} 
                              size="small" 
                              color="secondary"
                              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                            />
                          )}
                          <Chip 
                            label={vehicle.transmission} 
                            size="small"
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                          />
                          <Chip 
                            label={vehicle.fuel} 
                            size="small"
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                          />
                          {vehicle.armored && (
                            <Chip 
                              label="Blindado" 
                              size="small" 
                              color="primary"
                              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                            />
                          )}
                          {vehicle.status && (
                            <Chip 
                              label={vehicle.status} 
                              size="small" 
                              color={getStatusColor(vehicle.status) as any}
                              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                            />
                          )}
                        </Box>
                      </CardContent>
                      <Box sx={{ 
                        p: { xs: 1, sm: 1 }, 
                        pt: 0,
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleHighlight(vehicle.id);
                            }}
                            sx={{ p: { xs: 0.5, sm: 1 } }}
                          >
                            {vehicle.highlighted ? (
                              <StarIcon fontSize="small" sx={{ color: '#ffd700' }} />
                            ) : (
                              <StarBorderIcon fontSize="small" />
                            )}
                          </IconButton>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareWhatsApp(vehicle);
                            }}
                            sx={{ p: { xs: 0.5, sm: 1 } }}
                          >
                            <ShareIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/vehicles/edit/${vehicle.id}`);
                            }}
                            sx={{ p: { xs: 0.5, sm: 1 } }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVehicle(vehicle.id);
                            }}
                            sx={{ p: { xs: 0.5, sm: 1 } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>

        <Dialog 
          open={modalOpen} 
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 1
          }}>
            <Typography variant="h5" component="div">
              {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : 'Detalhes do Veículo'}
            </Typography>
            <IconButton onClick={handleCloseModal} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0 }}>
            {selectedVehicle && (
              <Box>
                {(() => {
                  try {
                    const mediaProp: any = selectedVehicle.media as any;
                    let photos: string[] = [];
                    let videos: string[] = [];

                    if (Array.isArray(mediaProp)) {
                      photos = mediaProp
                        .filter((m: any) => m.type === 'image' || m.type === 'photo')
                        .map((m: any) => m.url);
                      videos = mediaProp
                        .filter((m: any) => m.type === 'video')
                        .map((m: any) => m.url);
                    } else if (mediaProp && typeof mediaProp === 'object') {
                      photos = Array.isArray(mediaProp.photos) ? mediaProp.photos : [];
                      videos = Array.isArray(mediaProp.videos) ? mediaProp.videos : [];
                    }
                    const totalMedia = photos.length + videos.length;
                    
                    if (totalMedia === 0) {
                      return (
                        <Box
                          sx={{
                            height: 400,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `
                              linear-gradient(135deg, 
                                rgba(33, 150, 243, 0.1) 0%, 
                                rgba(33, 150, 243, 0.05) 100%
                              )
                            `,
                            color: 'text.secondary'
                          }}
                        >
                          <Typography variant="h6">Sem mídia disponível</Typography>
                        </Box>
                      );
                    }

                    const isVideo = modalMediaIndex >= photos.length;
                    const rawUrl = isVideo 
                      ? videos[modalMediaIndex - photos.length]
                      : photos[modalMediaIndex];
                    const resolveUrl = (url?: string) => {
                      if (!url) return undefined as any;
                      const isAbsolute = /^https?:\/\//.test(url) || url.startsWith('data:');
                      if (isAbsolute) return url as any;
                      const base = (import.meta as any)?.env?.VITE_MEDIA_BASE_URL || window.location.origin;
                      if (url.startsWith('/')) return `${base}${url}` as any;
                      return `${base}/${url}` as any;
                    };
                    const mediaUrl = resolveUrl(rawUrl);

                    return (
                      <Box sx={{ position: 'relative' }}>
                        {isVideo ? (
                          <video
                            src={mediaUrl}
                            controls
                            style={{
                              width: '100%',
                              height: '400px',
                              objectFit: 'cover',
                              pointerEvents: 'none'
                            }}
                          />
                        ) : (
                          <CardMedia
                            component="img"
                            height="400"
                            image={mediaUrl}
                            alt={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                            onError={(e: any) => { try { e.currentTarget.src = '/banner-hero.jpg'; } catch {} }}
                            sx={{ objectFit: 'cover', pointerEvents: 'none' }}
                          />
                        )}

                        {totalMedia > 1 && (
                          <>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                const newIndex = modalMediaIndex > 0 ? modalMediaIndex - 1 : totalMedia - 1;
                                setModalMediaIndex(newIndex);
                              }}
                              sx={{
                                position: 'absolute',
                                left: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                color: 'white',
                                zIndex: 2,
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)'
                                }
                              }}
                            >
                              <ChevronLeftIcon />
                            </IconButton>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                const newIndex = modalMediaIndex < totalMedia - 1 ? modalMediaIndex + 1 : 0;
                                setModalMediaIndex(newIndex);
                              }}
                              sx={{
                                position: 'absolute',
                                right: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                color: 'white',
                                zIndex: 2,
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)'
                                }
                              }}
                            >
                              <ChevronRightIcon />
                            </IconButton>
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 16,
                                right: 16,
                                background: `
                                  linear-gradient(135deg, 
                                    rgba(0, 0, 0, 0.8) 0%, 
                                    rgba(0, 0, 0, 0.6) 100%
                                  )
                                `,
                                color: 'white',
                                px: 2,
                                py: 1,
                                borderRadius: 1,
                                backdropFilter: 'blur(4px)',
                                zIndex: 2
                              }}
                            >
                              {modalMediaIndex + 1}/{totalMedia}
                            </Box>
                          </>
                        )}
                      </Box>
                    );
                  } catch (err) {
                    console.error('Erro ao renderizar mídia do veículo:', err);
                    return (
                      <Box
                        sx={{
                          height: 400,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `
                            linear-gradient(135deg, 
                              rgba(244, 67, 54, 0.1) 0%, 
                              rgba(244, 67, 54, 0.05) 100%
                            )
                          `,
                          color: 'text.secondary'
                        }}
                      >
                        <Typography variant="h6">Falha ao exibir mídia</Typography>
                      </Box>
                    );
                  }
                })()}

                <Box sx={{ p: 3 }}>
                  <Typography variant="h4" gutterBottom>
                    {formatCurrency(selectedVehicle.price)}
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>Informações Básicas</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {selectedVehicle.category && (
                          <Typography><strong>Categoria:</strong> {selectedVehicle.category}</Typography>
                        )}
                        <Typography><strong>Marca:</strong> {selectedVehicle.brand}</Typography>
                        <Typography><strong>Modelo:</strong> {selectedVehicle.model}</Typography>
                        <Typography><strong>Ano:</strong> {selectedVehicle.year}</Typography>
                        {selectedVehicle.modelYear && (
                          <Typography><strong>Ano Modelo:</strong> {selectedVehicle.modelYear}</Typography>
                        )}
                        <Typography><strong>Quilometragem:</strong> {Number(selectedVehicle.mileage ?? 0).toLocaleString()} km</Typography>
                        <Typography><strong>Cor:</strong> {selectedVehicle.color}</Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>Especificações</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {selectedVehicle.bodyType && (
                          <Typography><strong>Carroceria:</strong> {selectedVehicle.bodyType}</Typography>
                        )}
                        <Typography><strong>Portas:</strong> {selectedVehicle.doors}</Typography>
                        <Typography><strong>Transmissão:</strong> {selectedVehicle.transmission}</Typography>
                        <Typography><strong>Direção:</strong> {selectedVehicle.steering}</Typography>
                        <Typography><strong>Combustível:</strong> {selectedVehicle.fuel}</Typography>
                        {selectedVehicle.status && (
                          <Typography><strong>Status:</strong> {selectedVehicle.status}</Typography>
                        )}
                      </Box>
                    </Grid>
                    
                    {selectedVehicle.optionalFeatures && selectedVehicle.optionalFeatures.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Opcionais</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedVehicle.optionalFeatures.map((feature, index) => (
                            <Chip key={index} label={feature} variant="outlined" />
                          ))}
                        </Box>
                      </Grid>
                    )}
                    
                    {selectedVehicle.features && selectedVehicle.features.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Características Adicionais</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedVehicle.features.map((feature, index) => (
                            <Chip key={index} label={feature} variant="outlined" color="primary" />
                          ))}
                        </Box>
                      </Grid>
                    )}
                    
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>Características Especiais</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedVehicle.armored && <Chip label="Blindado" color="error" />}
                        {selectedVehicle.auction && <Chip label="Leilão" color="warning" />}
                        {selectedVehicle.ipvaPaid && <Chip label="IPVA Pago" color="success" />}
                        {selectedVehicle.licensingUpToDate && <Chip label="Licenciamento em Dia" color="success" />}
                      </Box>
                    </Grid>
                    
                    {selectedVehicle.description && (
                      <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Descrição</Typography>
                        <Typography>{selectedVehicle.description}</Typography>
                      </Grid>
                    )}
                    
                    {selectedVehicle.observations && (
                      <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Observações</Typography>
                        <Typography>{selectedVehicle.observations}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseModal}>Fechar</Button>
            <Button 
              variant="contained" 
              onClick={() => {
                handleCloseModal();
                navigate(`/vehicles/edit/${selectedVehicle?.id}`);
              }}
            >
              Editar
            </Button>
          </DialogActions>
        </Dialog>

        {selectedVehicleId && (
          <VehicleDetailModal
            open={detailModalOpen}
            onClose={handleCloseDetailModal}
            vehicleId={selectedVehicleId}
          />
        )}

        <VehicleImport
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onImport={async (vehicles) => {
            try {
              const results = [];
              
              for (const vehicle of vehicles) {
                try {
                  const {
                    marca: brand,
                    modelo: model,
                    anoFabricacao,
                    anoModelo,
                    preco: price,
                    km: mileage,
                    cor: color,
                    combustivel: fuel,
                    transmissao: transmission,
                    direcao: steering,
                    portas: doors,
                    tipoCarroceria: bodyType,
                    status,
                    descricao,
                    blindado,
                    ipvaPago,
                    leilao,
                    licenciamentoEmDia,
                    ...rest
                  } = vehicle;
                  
                  const vehicleData = {
                    brand: brand || 'Não informado',
                    model: model || 'Não informado',
                    year: Number(anoFabricacao) || new Date().getFullYear(),
                    modelYear: Number(anoModelo) || undefined,
                    price: parseFloat(price) || 0,
                    mileage: parseInt(mileage) || 0,
                    color: color || 'Não informado',
                    fuel: fuel || 'Flex',
                    transmission: transmission || 'Manual',
                    steering: steering || 'Hidráulica',
                    doors: parseInt(String(doors)) || 4,
                    bodyType: bodyType || '',
                    status: status || 'Disponível',
                    features: [],
                    optionalFeatures: [],
                    armored: !!blindado,
                    auction: !!leilao,
                    ipvaPaid: !!ipvaPago,
                    licensingUpToDate: !!licenciamentoEmDia,
                    media: {
                      photos: [],
                      videos: [],
                      inspection: null
                    },
                    description: descricao || `Veículo importado: ${brand} ${model}`
                  };
                  
                  const response = await api.post('/vehicles', vehicleData);
                  results.push({ success: true, vehicle: response.data });
                } catch (error: any) {
                  console.error('Erro ao importar veículo:', error);
                  results.push({ 
                    success: false, 
                    error: error.response?.data?.message || error.message,
                    vehicle: vehicle
                  });
                }
              }
              
              const successCount = results.filter(r => r.success).length;
              const errorCount = results.filter(r => !r.success).length;
              
              if (successCount > 0) {
                setSuccessMessage(`${successCount} veículo(s) importado(s) com sucesso!`);
                fetchVehicles();
              }
              
              if (errorCount > 0) {
                setError(`${errorCount} veículo(s) falharam na importação.`);
              }
              
              return results;
            } catch (error: any) {
              console.error('Erro na importação:', error);
              setError('Erro na importação em massa. Tente novamente.');
              throw error;
            }
          }}
        />

        <Drawer
          anchor="bottom"
          open={filtersDrawerOpen}
          onClose={() => setFiltersDrawerOpen(false)}
          PaperProps={{
            sx: {
              height: { xs: '100vh', sm: '90vh' },
              maxHeight: '100vh',
              width: '100%',
              maxWidth: '100%',
              borderTopLeftRadius: { xs: 0, sm: 16 },
              borderTopRightRadius: { xs: 0, sm: 16 },
              overflow: 'hidden',
              margin: 0,
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0
            }
          }}
          ModalProps={{
            sx: {
              '& .MuiBackdrop-root': {
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            width: '100%',
            bgcolor: 'background.paper',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'primary.main',
              color: 'white'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Filtros
              </Typography>
              <IconButton 
                onClick={() => setFiltersDrawerOpen(false)}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              p: 2
            }}>
              <VehicleFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
            </Box>

            <Box sx={{ 
              p: 2, 
              borderTop: 1, 
              borderColor: 'divider',
              display: 'flex',
              gap: 1
            }}>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                sx={{ flex: 1 }}
              >
                Limpar
              </Button>
              <Button
                variant="contained"
                onClick={() => setFiltersDrawerOpen(false)}
                sx={{ flex: 2 }}
              >
                Aplicar Filtros
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* Controles de Paginação */}
        {totalPages > 1 && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center', 
            alignItems: 'center',
            mt: 3,
            mb: 2,
            gap: 2,
            px: 2
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalVehicles)} de {totalVehicles} veículos
            </Typography>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, page) => setCurrentPage(page)}
              color="primary"
              size={isMobile ? "small" : "medium"}
              showFirstButton
              showLastButton
            />
          </Box>
        )}

        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage(null)}
        >
          <Alert onClose={() => setSuccessMessage(null)} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={3000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default VehicleList;