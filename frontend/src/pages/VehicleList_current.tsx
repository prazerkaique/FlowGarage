import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, 
  Button, IconButton, Chip, CardMedia,
  Dialog, DialogContent, DialogTitle, DialogActions,
  Drawer, useTheme, useMediaQuery, Snackbar, Alert
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
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehicles');
      setVehicles(response.data);
      setFilteredVehicles(response.data);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      setError('Erro ao carregar veículos');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (filters: FilterValues) => {
    let filtered = [...vehicles];

    if (filters.category) {
      filtered = filtered.filter(vehicle => vehicle.category === filters.category);
    }

    if (filters.brand) {
      filtered = filtered.filter(vehicle => vehicle.brand === filters.brand);
    }

    if (filters.model) {
      filtered = filtered.filter(vehicle => 
        vehicle.model.toLowerCase().includes(filters.model.toLowerCase())
      );
    }

    if (filters.color) {
      filtered = filtered.filter(vehicle => vehicle.color === filters.color);
    }

    if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 500000)) {
      filtered = filtered.filter(vehicle => {
        const price = vehicle.price;
        return price >= (filters.priceRange?.[0] || 0) && price <= (filters.priceRange?.[1] || 500000);
      });
    }

    if (filters.mileageRange && (filters.mileageRange[0] > 0 || filters.mileageRange[1] < 300000)) {
      filtered = filtered.filter(vehicle => {
        const mileage = vehicle.mileage;
        return mileage >= (filters.mileageRange?.[0] || 0) && mileage <= (filters.mileageRange?.[1] || 300000);
      });
    }

    if (filters.status) {
      filtered = filtered.filter(vehicle => vehicle.status === filters.status);
    }

    if (filters.bodyType) {
      filtered = filtered.filter(vehicle => vehicle.bodyType === filters.bodyType);
    }

    if (filters.doors) {
      filtered = filtered.filter(vehicle => vehicle.doors.toString() === filters.doors);
    }

    if (filters.transmission) {
      filtered = filtered.filter(vehicle => vehicle.transmission === filters.transmission);
    }

    if (filters.steering) {
      filtered = filtered.filter(vehicle => vehicle.steering === filters.steering);
    }

    if (filters.fuel) {
      filtered = filtered.filter(vehicle => vehicle.fuel === filters.fuel);
    }

    if (filters.engine) {
      filtered = filtered.filter(vehicle => vehicle.engine === filters.engine);
    }

    if (filters.features && filters.features.length > 0) {
      filtered = filtered.filter(vehicle => {
        return filters.features.some(feature => 
          vehicle.features.includes(feature) || 
          (vehicle.optionalFeatures && vehicle.optionalFeatures.includes(feature))
        );
      });
    }

    if (filters.specialFeatures && filters.specialFeatures.length > 0) {
      filtered = filtered.filter(vehicle => {
        return filters.specialFeatures.some(feature => {
          switch (feature) {
            case 'armored':
              return vehicle.armored;
            case 'auction':
              return vehicle.auction;
            case 'ipvaPaid':
              return vehicle.ipvaPaid;
            case 'licensingUpToDate':
              return vehicle.licensingUpToDate;
            case 'highlighted':
              return vehicle.highlighted;
            default:
              return false;
          }
        });
      });
    }

    setFilteredVehicles(filtered);
  };

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters: FilterValues = {
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
    };
    setFilters(defaultFilters);
    setFilteredVehicles(vehicles);
  };

  const handleDeleteVehicle = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      try {
        await api.delete(`/vehicles/${id}`);
        setSuccessMessage('Veículo excluído com sucesso!');
        fetchVehicles();
      } catch (error) {
        console.error('Erro ao excluir veículo:', error);
        setError('Erro ao excluir veículo');
      }
    }
  };

  const formatPrice = (price: number | string) => {
    if (typeof price === 'string') {
      return price;
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatMileage = (mileage: number | string) => {
    if (typeof mileage === 'string') {
      return `${mileage} km`;
    }
    return `${mileage.toLocaleString('pt-BR')} km`;
  };

  const getStatusColor = (status: string) => {
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

  const nextImage = (vehicleId: number, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [vehicleId]: ((prev[vehicleId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (vehicleId: number, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [vehicleId]: ((prev[vehicleId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const openModal = (vehicle: Vehicle, mediaIndex: number = 0) => {
    setSelectedVehicle(vehicle);
    setModalMediaIndex(mediaIndex);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedVehicle(null);
    setModalMediaIndex(0);
  };

  const openDetailModal = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedVehicleId(null);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CarWheelLoader />
        <Typography variant="h6" color="text.secondary">
          Carregando veículos...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Veículos ({Array.isArray(filteredVehicles) ? filteredVehicles.length : 0})
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFiltersDrawerOpen(true)}
              sx={{ minWidth: 'auto' }}
            >
              {isMobile ? '' : 'Filtros'}
            </Button>
            
            {user?.role === 'admin' && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => setImportModalOpen(true)}
                  sx={{ minWidth: 'auto' }}
                >
                  {isMobile ? '' : 'Importar'}
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/vehicles/new')}
                >
                  {isMobile ? '' : 'Novo Veículo'}
                </Button>
              </>
            )}
          </Box>
        </Box>

        <SmartSearch 
          vehicles={Array.isArray(vehicles) ? vehicles.map(v => ({
            id: v.id,
            brand: v.brand,
            model: v.model,
            year: v.year,
            price: v.price,
            color: v.color,
            bodyType: v.bodyType
          })) : []}
          onSearchResults={(results) => {
            const resultIds = results.map(r => r.id);
            setFilteredVehicles(Array.isArray(vehicles) ? vehicles.filter(v => resultIds.includes(v.id)) : []);
          }}
          placeholder="Busque por marca, modelo ou características..."
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          {Array.isArray(filteredVehicles) && filteredVehicles.map((vehicle) => {
            const currentIndex = currentImageIndex[vehicle.id] || 0;
            const photosLen = vehicle.media?.photos?.length ?? 0;
            const videosLen = vehicle.media?.videos?.length ?? 0;
            const hasMedia = photosLen > 0 || videosLen > 0;
            const allMedia = [...(vehicle.media?.photos ?? []), ...(vehicle.media?.videos ?? [])];
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={vehicle.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => openDetailModal(vehicle.id)}
                >
                  <Box sx={{ position: 'relative', height: 200 }}>
                    {hasMedia ? (
                      <>
                        <CardMedia
                          component="img"
                          height="200"
                          image={allMedia[currentIndex]?.startsWith('/uploads/') 
                            ? `http://localhost:8000${allMedia[currentIndex]}`
                            : allMedia[currentIndex]
                          }
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          sx={{ 
                            objectFit: 'cover',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(vehicle, currentIndex);
                          }}
                        />
                        
                        {allMedia.length > 1 && (
                          <>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                prevImage(vehicle.id, allMedia.length);
                              }}
                              sx={{
                                position: 'absolute',
                                left: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                              }}
                            >
                              <ChevronLeftIcon />
                            </IconButton>
                            
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                nextImage(vehicle.id, allMedia.length);
                              }}
                              sx={{
                                position: 'absolute',
                                right: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                              }}
                            >
                              <ChevronRightIcon />
                            </IconButton>
                            
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 8,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.75rem'
                              }}
                            >
                              {currentIndex + 1} / {allMedia.length}
                            </Box>
                          </>
                        )}
                      </>
                    ) : (
                      <Box
                        sx={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.200',
                          color: 'grey.500'
                        }}
                      >
                        <Typography variant="body2">
                          Sem imagem
                        </Typography>
                      </Box>
                    )}

                    {vehicle.highlighted && (
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          bgcolor: 'rgba(255,193,7,0.9)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(255,193,7,1)' }
                        }}
                      >
                        <StarIcon fontSize="small" />
                      </IconButton>
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
                        sx={{ mb: 1, fontFamily: 'monospace' }}
                      >
                        {vehicle.licensePlate}
                      </Typography>
                    )}

                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ mb: 1 }}
                    >
                      {vehicle.year} • {formatMileage(vehicle.mileage)}
                    </Typography>

                    <Typography 
                      variant="h6" 
                      color="primary" 
                      sx={{ 
                        fontWeight: 'bold',
                        mb: 1,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                      }}
                    >
                      {formatPrice(vehicle.price)}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {vehicle.category && (
                        <Chip 
                          label={vehicle.category} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                      <Chip 
                        label={vehicle.transmission === 'automatic' ? 'Automático' : 'Manual'} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                      <Chip 
                        label={vehicle.fuel} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Box>

                    {user?.role === 'admin' && (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        gap: 1,
                        mt: 'auto'
                      }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/vehicles/${vehicle.id}/edit`);
                          }}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVehicle(vehicle.id);
                          }}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {Array.isArray(filteredVehicles) && filteredVehicles.length === 0 && !loading && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="h6" color="text.secondary">
              Nenhum veículo encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tente ajustar os filtros ou adicionar novos veículos
            </Typography>
            {user?.role === 'admin' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/vehicles/new')}
                sx={{ mt: 2 }}
              >
                Adicionar Primeiro Veículo
              </Button>
            )}
          </Box>
        )}
      </Container>

      <Drawer
        anchor="right"
        open={filtersDrawerOpen}
        onClose={() => setFiltersDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400 },
            p: 2
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Filtros</Typography>
          <IconButton onClick={() => setFiltersDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <VehicleFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
      </Drawer>

      <Dialog
        open={modalOpen}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {selectedVehicle && (
            <>
              <IconButton
                onClick={closeModal}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  zIndex: 1,
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                }}
              >
                <CloseIcon />
              </IconButton>
              
              <Box
                component="img"
                src={selectedVehicle.media.photos[modalMediaIndex]?.startsWith('/uploads/') 
                  ? `http://localhost:8000${selectedVehicle.media.photos[modalMediaIndex]}`
                  : selectedVehicle.media.photos[modalMediaIndex]
                }
                alt={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: 1
                }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {selectedVehicleId && (
        <VehicleDetailModal
          vehicleId={selectedVehicleId}
          open={detailModalOpen}
          onClose={closeDetailModal}
        />
      )}

      {user?.role === 'admin' && (
        <VehicleImport
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onImport={(vehicles) => {
            setImportModalOpen(false);
            fetchVehicles();
            setSuccessMessage('Veículos importados com sucesso!');
          }}
        />
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default VehicleList;