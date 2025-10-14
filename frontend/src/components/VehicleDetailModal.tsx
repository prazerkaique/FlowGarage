import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
  useTheme,
  useMediaQuery,
  Fade,
  Slide
} from '@mui/material';
import {
  Close,
  ArrowBackIos,
  ArrowForwardIos,
  DirectionsCar,
  LocalGasStation,
  Speed,
  Palette,
  CalendarToday,
  AttachMoney,
  Settings,
  Security,
  Gavel,
  Visibility
} from '@mui/icons-material';
import api from '../services/api';
import CarWheelLoader from './CarWheelLoader';

interface Vehicle {
  id: number;
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
  features: string[];
  armored: boolean;
  auction: boolean;
  status?: string;
  observations?: string;
  description?: string;
  media: {
    photos: string[];
    videos: string[];
    inspection?: string;
  };
}

interface VehicleDetailModalProps {
  open: boolean;
  onClose: () => void;
  vehicleId: number | null;
  isPublic?: boolean;
  token?: string;
}

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  open,
  onClose,
  vehicleId,
  isPublic = false,
  token
}) => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (open && vehicleId) {
      fetchVehicleData();
    }
  }, [open, vehicleId]);

  const fetchVehicleData = async () => {
    if (!vehicleId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = isPublic && token 
        ? `/public/catalog/${token}/vehicles/${vehicleId}`
        : `/vehicles/${vehicleId}`;
      
      const response = await api.get(endpoint);
      
      // Processar os dados para garantir que features seja um array
      const vehicleData = {
        ...response.data,
        features: Array.isArray(response.data.optionalFeatures) 
          ? response.data.optionalFeatures 
          : response.data.optionalFeatures 
            ? response.data.optionalFeatures.split(',').map((f: string) => f.trim())
            : []
      };
      
      setVehicle(vehicleData);
      
      // Processar imagens
      const vehicleImages: string[] = [];
      if (vehicleData.media && vehicleData.media.photos) {
        vehicleImages.push(...vehicleData.media.photos.map((photo: string) => 
          `http://localhost:3001${photo}`
        ));
      }
      setImages(vehicleImages);
      setCurrentImageIndex(0);
      
    } catch (error: any) {
      console.error('Erro ao buscar dados do veículo:', error);
      setError('Não foi possível carregar os dados do veículo.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'disponível':
        return '#4caf50'; // Verde
      case 'vendido':
        return '#f44336'; // Vermelho
      case 'reservado':
        return '#ff9800'; // Amarelo/Laranja
      default:
        return '#9e9e9e'; // Cinza
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('pt-BR').format(mileage) + ' km';
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CarWheelLoader size={60} text="Carregando detalhes do veículo..." />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !vehicle) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" p={3}>
            <Typography color="error" variant="h6" gutterBottom>
              {error || 'Veículo não encontrado'}
            </Typography>
            <Button variant="contained" onClick={onClose} sx={{ mt: 2 }}>
              Fechar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: { xs: 0.5, sm: 1 },
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="h6" 
            component="div" 
            fontWeight="bold"
            sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {vehicle.brand} {vehicle.model}
          </Typography>
          {vehicle.licensePlate && (
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9, 
                fontWeight: 'bold',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Placa: {vehicle.licensePlate}
            </Typography>
          )}
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.9,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            {vehicle.year} • {formatPrice(vehicle.price)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          {vehicle.status && (
            <Box sx={{ 
              display: { xs: 'none', sm: 'flex' }, 
              alignItems: 'center', 
              gap: 0.5 
            }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(vehicle.status)
                }}
              />
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'bold' }}>
                {vehicle.status}
              </Typography>
            </Box>
          )}
          <IconButton
            onClick={onClose}
            sx={{ 
              color: 'white',
              p: { xs: 0.5, sm: 1 }
            }}
          >
            <Close sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Grid container>
          {/* Galeria de Imagens */}
          <Grid item xs={12} md={7}>
            <Box sx={{ position: 'relative', height: { xs: '300px', md: '500px' }, overflow: 'hidden' }}>
              {images.length > 0 ? (
                <>
                  {/* Imagem de fundo com blur e zoom */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(${images[currentImageIndex]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'blur(20px) brightness(0.3)',
                      transform: 'scale(1.1)',
                      zIndex: 1
                    }}
                  />
                  
                  {/* Imagem principal */}
                  <CardMedia
                    component="img"
                    image={images[currentImageIndex]}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      zIndex: 2
                    }}
                  />
                  
                  {images.length > 1 && (
                    <>
                      <IconButton
                        onClick={handlePreviousImage}
                        sx={{
                          position: 'absolute',
                          left: { xs: 8, sm: 16 },
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          zIndex: 3,
                          p: { xs: 0.5, sm: 1 },
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.7)'
                          }
                        }}
                      >
                        <ArrowBackIos sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                      </IconButton>
                      
                      <IconButton
                        onClick={handleNextImage}
                        sx={{
                          position: 'absolute',
                          right: { xs: 8, sm: 16 },
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          zIndex: 3,
                          p: { xs: 0.5, sm: 1 },
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.7)'
                          }
                        }}
                      >
                        <ArrowForwardIos sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                      </IconButton>
                      
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: { xs: 8, sm: 16 },
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          borderRadius: 2,
                          px: { xs: 1.5, sm: 2 },
                          py: { xs: 0.5, sm: 1 },
                          zIndex: 3
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          color="white"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {currentImageIndex + 1} / {images.length}
                        </Typography>
                      </Box>
                    </>
                  )}
                </>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5'
                  }}
                >
                  <DirectionsCar sx={{ fontSize: 80, color: '#ccc' }} />
                </Box>
              )}
            </Box>
          </Grid>

          {/* Informações do Veículo */}
          <Grid item xs={12} md={5}>
            <Box sx={{ 
              p: { xs: 2, sm: 3 }, 
              height: { xs: 'auto', md: '500px' }, 
              overflowY: 'auto' 
            }}>
              {/* Informações Principais */}
              <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom 
                  color="primary"
                  sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
                >
                  Informações Principais
                </Typography>
                <Grid container spacing={{ xs: 1, sm: 2 }}>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <CalendarToday sx={{ 
                        mr: 1, 
                        fontSize: { xs: 16, sm: 20 }, 
                        color: 'text.secondary' 
                      }} />
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        <strong>Ano:</strong> {vehicle.year}
                      </Typography>
                    </Box>
                  </Grid>
                  {vehicle.modelYear && (
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <CalendarToday sx={{ 
                          mr: 1, 
                          fontSize: { xs: 16, sm: 20 }, 
                          color: 'text.secondary' 
                        }} />
                        <Typography 
                          variant="body2"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          <strong>Ano Modelo:</strong> {vehicle.modelYear}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Speed sx={{ 
                        mr: 1, 
                        fontSize: { xs: 16, sm: 20 }, 
                        color: 'text.secondary' 
                      }} />
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        <strong>KM:</strong> {formatMileage(vehicle.mileage)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Palette sx={{ 
                        mr: 1, 
                        fontSize: { xs: 16, sm: 20 }, 
                        color: 'text.secondary' 
                      }} />
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        <strong>Cor:</strong> {vehicle.color}
                      </Typography>
                    </Box>
                  </Grid>
                  {vehicle.bodyType && (
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <DirectionsCar sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Carroceria:</strong> {vehicle.bodyType}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocalGasStation sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Combustível:</strong> {vehicle.fuel}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Settings sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Câmbio:</strong> {vehicle.transmission}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Settings sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Direção:</strong> {vehicle.steering}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Portas:</strong> {vehicle.doors}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Informações Especiais */}
              <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom 
                  color="primary"
                  sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
                >
                  Informações Especiais
                </Typography>
                <Box display="flex" gap={{ xs: 0.5, sm: 1 }} flexWrap="wrap" alignItems="center">
                  {vehicle.armored && (
                    <Chip
                      icon={<Security sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                      label="Blindado"
                      color="warning"
                      variant="outlined"
                      size={fullScreen ? "small" : "medium"}
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    />
                  )}
                  {vehicle.auction && (
                    <Chip
                      icon={<Gavel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                      label="Leilão"
                      color="info"
                      variant="outlined"
                      size={fullScreen ? "small" : "medium"}
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    />
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<Visibility sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                    size="small"
                    sx={{ 
                      ml: { xs: 0.5, sm: 1 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      py: { xs: 0.5, sm: 1 },
                      px: { xs: 1, sm: 2 }
                    }}
                    onClick={() => {
                      if (vehicle?.media?.inspection) {
                        // Abrir arquivo de inspeção em nova aba
                        const inspectionUrl = `http://localhost:8000${vehicle.media.inspection}`;
                        window.open(inspectionUrl, '_blank');
                      } else {
                        alert('Nenhum arquivo de vistoria disponível para este veículo.');
                      }
                    }}
                    disabled={!vehicle?.media?.inspection}
                  >
                    Vistoria
                  </Button>
                </Box>
              </Paper>

              {/* Opcionais */}
              {vehicle.features && vehicle.features.length > 0 && (
                <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
                  <Typography 
                    variant="subtitle1" 
                    gutterBottom 
                    color="primary"
                    sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
                  >
                    Opcionais
                  </Typography>
                  <Box display="flex" gap={{ xs: 0.5, sm: 1 }} flexWrap="wrap">
                    {vehicle.features.map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        size={fullScreen ? "small" : "medium"}
                        variant="outlined"
                        color="primary"
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          height: { xs: 24, sm: 32 }
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Observações */}
              {vehicle.observations && (
                <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
                  <Typography 
                    variant="subtitle1" 
                    gutterBottom 
                    color="primary"
                    sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
                  >
                    Observações
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    {vehicle.observations}
                  </Typography>
                </Paper>
              )}

              {/* Descrição */}
              {vehicle.description && (
                <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography 
                    variant="subtitle1" 
                    gutterBottom 
                    color="primary"
                    sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
                  >
                    Descrição
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    {vehicle.description}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailModal;