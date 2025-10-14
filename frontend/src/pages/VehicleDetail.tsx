import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Chip, Button, 
  Card, CardMedia, Divider, List, ListItem, ListItemText,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert
} from '@mui/material';
import { 
  ArrowUpward, ArrowDownward, Delete, Add, Edit, Close, DragIndicator 
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
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
  observations?: string;
  description?: string;
  media: {
    photos: string[];
    videos: string[];
    inspection?: string;
  };
}

const VehicleDetail: React.FC = () => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchVehicleData();
  }, [id]);

  const fetchVehicleData = async () => {
    try {
      console.log('Buscando veículo com ID:', id);
      const response = await api.get(`/vehicles/${id}`);
      console.log('Resposta da API:', response.data);
      
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
      
      // Selecionar a primeira imagem como padrão
      if (response.data?.media?.photos?.length > 0) {
        setSelectedImage(`http://localhost:3001${response.data.media.photos[0]}`);
      }
    } catch (error: any) {
      console.error('Erro ao buscar dados do veículo:', error);
      console.error('Detalhes do erro:', error.response?.data);
      setError(`Não foi possível carregar os dados do veículo. ${error.response?.data?.message || error.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      try {
        await api.delete(`/vehicles/${id}`);
        navigate('/vehicles');
      } catch (error) {
        console.error('Erro ao excluir veículo:', error);
      }
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      await api.delete(`/vehicles/${id}/media/${photoId}`);
      setSnackbarMessage('Foto removida com sucesso!');
      setSnackbarOpen(true);
      fetchVehicleData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao excluir foto:', error);
      setSnackbarMessage('Erro ao remover foto');
      setSnackbarOpen(true);
    }
  };

  const handleReorderPhoto = async (photoId: number, direction: 'up' | 'down') => {
    try {
      await api.patch(`/vehicles/${id}/media/${photoId}/reorder`, { direction });
      setSnackbarMessage('Foto reordenada com sucesso!');
      setSnackbarOpen(true);
      fetchVehicleData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao reordenar foto:', error);
      setSnackbarMessage('Erro ao reordenar foto');
      setSnackbarOpen(true);
    }
  };

  // Função para drag & drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    
    if (startIndex === endIndex) return;
    
    // Reordenar localmente primeiro para feedback visual imediato
    const photos = vehicle?.media?.photos || [];
    const reorderedPhotos = Array.from(photos);
    const [removed] = reorderedPhotos.splice(startIndex, 1);
    reorderedPhotos.splice(endIndex, 0, removed);
    
    // Atualizar estado local
    if (vehicle) {
      setVehicle({ 
        ...vehicle, 
        media: { 
          ...vehicle.media, 
          photos: reorderedPhotos 
        } 
      });
    }
    
    // Enviar para o backend (usa o índice como identificador da foto)
    handleReorderPhotoByDrag(startIndex, startIndex, endIndex);
  };

  const handleReorderPhotoByDrag = async (photoId: number, fromIndex: number, toIndex: number) => {
    try {
      await api.patch(`/vehicles/${id}/media/${photoId}/reorder-drag`, { 
        fromIndex, 
        toIndex 
      });
      setSnackbarMessage('Foto reordenada com sucesso!');
      setSnackbarOpen(true);
      // Não recarregar dados aqui pois já atualizamos localmente
    } catch (error) {
      console.error('Erro ao reordenar foto:', error);
      setSnackbarMessage('Erro ao reordenar foto');
      setSnackbarOpen(true);
      // Em caso de erro, recarregar dados para reverter
      fetchVehicleData();
    }
  };

  const handleAddPhotos = async (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('photos', file);
    });

    try {
      await api.post(`/vehicles/${id}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSnackbarMessage('Fotos adicionadas com sucesso!');
      setSnackbarOpen(true);
      setOpenDialog(false);
      fetchVehicleData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao adicionar fotos:', error);
      setSnackbarMessage('Erro ao adicionar fotos');
      setSnackbarOpen(true);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Carregando detalhes do veículo...</Typography>
      </Container>
    );
  }

  if (error || !vehicle) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error">{error || 'Veículo não encontrado'}</Typography>
        <Button variant="contained" onClick={() => navigate('/vehicles')} sx={{ mt: 2 }}>
          Voltar para lista
        </Button>
      </Container>
    );
  }

  let images: any[] = [];
  let videos: any[] = [];

  // Verificar se media é um array (estrutura nova) ou objeto (estrutura antiga)
  if (Array.isArray(vehicle.media)) {
    images = vehicle.media.filter((m: any) => m.type === 'image' || m.type === 'photo');
    videos = vehicle.media.filter((m: any) => m.type === 'video');
  } else if (vehicle.media) {
    // Estrutura antiga com photos/videos
    if (vehicle.media.photos) {
      images = vehicle.media.photos.map((photoUrl: string, index: number) => ({
        id: index,
        type: 'photo',
        url: `http://localhost:3001${photoUrl}`
      }));
    }
    
    if (vehicle.media.videos) {
      videos = vehicle.media.videos.map((videoUrl: string, index: number) => ({
        id: index,
        type: 'video',
        url: `http://localhost:3001${videoUrl}`
      }));
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 2, sm: 0 } }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
          {vehicle.brand} {vehicle.model}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 1 }, width: { xs: '100%', sm: 'auto' } }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/vehicles')}
            size={window.innerWidth < 600 ? "small" : "medium"}
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Voltar
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)}
            size={window.innerWidth < 600 ? "small" : "medium"}
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Editar
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Edit sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
            onClick={() => setEditMode(!editMode)}
            size={window.innerWidth < 600 ? "small" : "medium"}
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            {editMode ? 'Sair da Edição' : 'Editar Mídia'}
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDeleteVehicle}
            size={window.innerWidth < 600 ? "small" : "medium"}
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Excluir
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 4 } }}>
        {/* Galeria de imagens */}
        <Box sx={{ flex: { xs: '1', md: '2' } }}>
          <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2 }, mb: 3, width: '100%' }}>
            {selectedImage ? (
              <Box sx={{ mb: 2 }}>
                <CardMedia
                  component="img"
                  image={selectedImage}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  sx={{ 
                    width: '100%', 
                    height: { xs: 250, sm: 350, md: 400 }, 
                    objectFit: 'contain',
                    bgcolor: '#f5f5f5'
                  }}
                />
              </Box>
            ) : (
              <Box 
                sx={{ 
                  width: '100%', 
                  height: { xs: 250, sm: 350, md: 400 }, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: '#f5f5f5'
                }}
              >
                <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Sem imagens disponíveis
                </Typography>
              </Box>
            )}

            {/* Miniaturas com controles de edição */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="photos" direction="horizontal">
                {(provided) => (
                  <Box 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: { xs: 0.5, sm: 1 }, pb: 1 }}
                  >
                    {images.map((image, index) => (
                      <Draggable key={image.id} draggableId={image.id.toString()} index={index} isDragDisabled={!editMode}>
                        {(provided, snapshot) => (
                          <Box 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{ 
                              position: 'relative', 
                              minWidth: { xs: 80, sm: 100 },
                              transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                              opacity: snapshot.isDragging ? 0.8 : 1,
                              transition: 'transform 0.2s ease, opacity 0.2s ease'
                            }}
                          >
                            <Card 
                              sx={{ 
                                minWidth: { xs: 80, sm: 100 }, 
                                height: { xs: 56, sm: 70 },
                                cursor: editMode ? 'grab' : 'pointer',
                                border: selectedImage === image.url ? '2px solid #1976d2' : 'none',
                                '&:active': editMode ? { cursor: 'grabbing' } : {}
                              }}
                              onClick={() => !snapshot.isDragging && setSelectedImage(image.url)}
                            >
                              <CardMedia
                                component="img"
                                image={image.url}
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                sx={{ height: '100%', objectFit: 'cover' }}
                              />
                              {editMode && (
                                <Box 
                                  {...provided.dragHandleProps}
                                  sx={{ 
                                    position: 'absolute', 
                                    top: { xs: 1, sm: 2 }, 
                                    left: { xs: 1, sm: 2 },
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                    borderRadius: '50%',
                                    width: { xs: 16, sm: 20 },
                                    height: { xs: 16, sm: 20 },
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <DragIndicator sx={{ fontSize: { xs: 10, sm: 12 }, color: 'white' }} />
                                </Box>
                              )}
                            </Card>
                            
                            {editMode && (
                              <Box sx={{ 
                                position: 'absolute', 
                                top: -8, 
                                right: -8, 
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: 0.5
                              }}>
                                <IconButton 
                                  size="small" 
                                  sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'red', color: 'white' } }}
                                  onClick={() => handleDeletePhoto(image.id)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {editMode && (
                      <Card 
                        sx={{ 
                          minWidth: 100, 
                          height: 70,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          border: '2px dashed #ccc',
                          '&:hover': { borderColor: '#1976d2' }
                        }}
                        onClick={() => setOpenDialog(true)}
                      >
                        <Add sx={{ fontSize: 30, color: '#ccc' }} />
                      </Card>
                    )}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          </Paper>

          {/* Vídeos */}
          {videos.length > 0 && (
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Vídeos</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {videos.map((video) => (
                  <Box key={video.id} sx={{ width: 300 }}>
                    <video 
                      controls 
                      style={{ width: '100%', height: 200 }}
                      src={video.url}
                      onError={(e) => {
                        console.error('Erro ao carregar vídeo:', video.url);
                        console.error('Evento de erro:', e);
                      }}
                      onLoadStart={() => console.log('Iniciando carregamento do vídeo:', video.url)}
                      onCanPlay={() => console.log('Vídeo pronto para reprodução:', video.url)}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Box>

        {/* Informações do veículo */}
        <Box sx={{ flex: { xs: '1', md: '1' } }}>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {formatCurrency(vehicle.price)}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {vehicle.year} • {vehicle.mileage.toLocaleString()} km
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <List disablePadding>
              <ListItem disablePadding sx={{ py: { xs: 0.5, sm: 1 } }}>
                <ListItemText 
                  primary="Marca" 
                  secondary={vehicle.brand}
                  primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                />
              </ListItem>
              <ListItem disablePadding sx={{ py: { xs: 0.5, sm: 1 } }}>
                <ListItemText 
                  primary="Modelo" 
                  secondary={vehicle.model}
                  primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                />
              </ListItem>
              <ListItem disablePadding sx={{ py: { xs: 0.5, sm: 1 } }}>
                <ListItemText 
                  primary="Ano" 
                  secondary={vehicle.year}
                  primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                />
              </ListItem>
              <ListItem disablePadding sx={{ py: { xs: 0.5, sm: 1 } }}>
                <ListItemText 
                  primary="Cor" 
                  secondary={vehicle.color}
                  primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                />
              </ListItem>
              <ListItem disablePadding sx={{ py: { xs: 0.5, sm: 1 } }}>
                <ListItemText 
                  primary="Carroceria" 
                  secondary={vehicle.bodyType || 'Não informado'}
                  primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                />
              </ListItem>
              <ListItem disablePadding sx={{ py: { xs: 0.5, sm: 1 } }}>
                <ListItemText 
                  primary="Portas" 
                  secondary={vehicle.doors}
                  primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                />
              </ListItem>
              <ListItem disablePadding sx={{ py: { xs: 0.5, sm: 1 } }}>
                <ListItemText 
                  primary="Câmbio" 
                  secondary={vehicle.transmission}
                  primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                />
              </ListItem>
              <ListItem disablePadding sx={{ py: { xs: 0.5, sm: 1 } }}>
                <ListItemText 
                  primary="Direção" 
                  secondary={vehicle.steering}
                  primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                />
              </ListItem>
              <ListItem disablePadding sx={{ py: { xs: 0.5, sm: 1 } }}>
                <ListItemText 
                  primary="Combustível" 
                  secondary={vehicle.fuel}
                  primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                />
              </ListItem>
            </List>
            
            {(vehicle.armored || vehicle.auction) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, flexWrap: 'wrap' }}>
                  {vehicle.armored && (
                    <Chip 
                      label="Blindado" 
                      color="primary" 
                      size={window.innerWidth < 600 ? "small" : "medium"}
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    />
                  )}
                  {vehicle.auction && (
                    <Chip 
                      label="Veio de leilão" 
                      size={window.innerWidth < 600 ? "small" : "medium"}
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    />
                  )}
                </Box>
              </>
            )}
          </Paper>

          {/* Opcionais */}
          {vehicle.features && vehicle.features.length > 0 && (
            <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Opcionais
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 } }}>
                {vehicle.features.map((feature, index) => (
                  <Chip 
                    key={index} 
                    label={feature} 
                    variant="outlined" 
                    size={window.innerWidth < 600 ? "small" : "medium"}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  />
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Dialog para adicionar fotos */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Adicionar Fotos
          <IconButton
            onClick={() => setOpenDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleAddPhotos(e.target.files)}
            style={{ width: '100%', padding: '10px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VehicleDetail;