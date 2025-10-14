import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Paper,
  Avatar,
  Rating,
  Divider
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Security as SecurityIcon,
  Description as DocumentIcon,
  CreditCard as CreditIcon,
  Autorenew as TradeIcon,
  Support as SupportIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  WhatsApp as WhatsAppIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  LocalOffer as OfferIcon,
  FlashOn as FlashIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number | string;
  price: number | string;
  media?: {
    photos?: string[];
  };
  isNew?: boolean;
  priceDropped?: boolean;
}

// Tipos auxiliares para catálogos públicos
interface Differential {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  location?: string;
  rating: number;
  comment: string;
  avatar?: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [financingData, setFinancingData] = useState({
    downPayment: '',
    installments: '48'
  });
  const [company, setCompany] = useState<any>({
    name: '',
    summary: '',
    publicCatalog: {
      hero: { title: '', subtitle: '', backgroundUrl: '' },
      reasons: [],
      testimonials: [],
      tradeIn: { title: '', subtitle: '', backgroundUrl: '' },
      mapEmbedUrl: '',
      footerLinks: []
    }
  });

  useEffect(() => {
    fetchFeaturedVehicles();
    fetchCompany();
  }, []);

  const fetchFeaturedVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      // A API retorna um objeto com a propriedade vehicles
      const vehiclesData = response.data.vehicles || [];
      // Filtrar apenas veículos destacados
      const highlightedVehicles = vehiclesData.filter((vehicle: any) => vehicle.highlighted === true);
      
      // Se não houver veículos destacados, pegar os primeiros 6 como fallback
      const vehicles = highlightedVehicles.length > 0 
        ? highlightedVehicles.slice(0, 6)
        : vehiclesData.slice(0, 6).map((vehicle: any, index: number) => ({
            ...vehicle,
            isNew: index < 2,
            priceDropped: index >= 2 && index < 4
          }));
      
      setFeaturedVehicles(vehicles);
    } catch (error) {
      console.error('Erro ao buscar veículos em destaque:', error);
    }
  };

  const fetchCompany = async () => {
    try {
      const response = await api.get('/company');
      setCompany(response.data || {});
    } catch (error) {
      console.error('Erro ao buscar dados da empresa:', error);
    }
  };

  const handleTabNavigation = (tabIndex: number) => {
    navigate(`/catalog?tab=${tabIndex}`);
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numPrice);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlide = Math.max(0, featuredVehicles.length - 3);
      return Math.min(prev + 1, maxSlide);
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const defaultReasons: Differential[] = [
    { icon: <CheckIcon />, title: 'Garantia e procedência', description: 'Garantia de 90 dias para motor e câmbio' },
    { icon: <DocumentIcon />, title: 'Documentação sem dor de cabeça', description: 'Cuidamos de toda a burocracia' },
    { icon: <CreditIcon />, title: 'Parcelamos em até 18x', description: 'Condições especiais no cartão' },
    { icon: <TradeIcon />, title: 'Aceitamos seu usado na troca', description: 'Avaliação justa e rápida' },
    { icon: <SupportIcon />, title: 'Atendimento humanizado', description: 'Equipe especializada e dedicada' },
    { icon: <ScheduleIcon />, title: 'Resposta rápida no WhatsApp', description: 'Atendimento ágil e personalizado' }
  ];
  const differentials: Differential[] = (
    (company.publicCatalog?.reasons?.length ? company.publicCatalog.reasons : defaultReasons) as Array<Partial<Differential>>
  ).map((r: Partial<Differential>, idx: number): Differential => ({
    icon: defaultReasons[idx]?.icon || <CheckIcon />,
    title: r.title ?? defaultReasons[idx]?.title ?? '',
    description: r.description ?? defaultReasons[idx]?.description ?? ''
  }));

  const testimonials: Testimonial[] = company.publicCatalog?.testimonials?.length
    ? company.publicCatalog.testimonials
    : [
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
      ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Banner */}
      <Box
        sx={{
          backgroundImage: company.publicCatalog?.hero?.backgroundVideoUrl
            ? 'none'
            : `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${company.publicCatalog?.hero?.backgroundUrl || '/banner-hero.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)'
        }}
      >
        {company.publicCatalog?.hero?.backgroundVideoUrl && (
          <Box
            component="video"
            src={company.publicCatalog.hero.backgroundVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0
            }}
          />
        )}
        {company.publicCatalog?.hero?.backgroundVideoUrl && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5))',
              zIndex: 1
            }}
          />
        )}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={8} lg={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 'bold',
                    mb: 2,
                    fontSize: { xs: '2rem', md: '3rem' }
                  }}
                >
                  {company.publicCatalog?.hero?.title || 'Seu próximo carro, com procedência e garantia.'}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    fontSize: { xs: '1rem', md: '1.25rem' }
                  }}
                >
                  {company.publicCatalog?.hero?.subtitle || 'Aproveite ofertas exclusivas, condições de financiamento e avaliação online.'}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleTabNavigation(0)}
                    sx={{
                      fontWeight: 'bold',
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    Ver Estoque Agora
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleTabNavigation(2)}
                    sx={{
                      fontWeight: 'bold',
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    Simule Financiamento
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleTabNavigation(1)}
                    sx={{
                      fontWeight: 'bold',
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    Avalie Seu Usado
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Destaques do Estoque */}
      <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold' }}
          >
            Destaques do Estoque
          </Typography>
        
        <Box sx={{ position: 'relative' }}>
          {currentSlide > 0 && (
            <IconButton
              onClick={prevSlide}
              sx={{
                position: 'absolute',
                left: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          )}
          
          <Grid container spacing={3}>
            {featuredVehicles
              .slice(currentSlide, currentSlide + 3)
              .map((vehicle) => (
                <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)' },
                      position: 'relative',
                      bgcolor: 'background.paper',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {vehicle.isNew && (
                      <Chip
                        icon={<FlashIcon />}
                        label="Novidade"
                        color="success"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          zIndex: 1
                        }}
                      />
                    )}
                    {vehicle.priceDropped && (
                      <Chip
                        icon={<OfferIcon />}
                        label="🔥 Baixou o preço"
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          zIndex: 1
                        }}
                      />
                    )}
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        vehicle.media?.photos?.[0]
                          ? `http://localhost:3001${vehicle.media.photos[0]}`
                          : '/placeholder-car.jpg'
                      }
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {vehicle.brand} {vehicle.model}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {vehicle.year}
                      </Typography>
                      <Typography
                        variant="h5"
                        color="primary"
                        sx={{ fontWeight: 'bold', mb: 2 }}
                      >
                        {formatPrice(vehicle.price)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        ou financiado a partir de R$ {Math.round(Number(vehicle.price) / 60).toLocaleString('pt-BR')}/mês
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          onClick={() => navigate(`/catalog?tab=0&vehicle=${vehicle.id}`)}
                        >
                          Ver detalhes
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          fullWidth
                          startIcon={<WhatsAppIcon />}
                          onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
                        >
                          Agendar visita
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
          
          {currentSlide < featuredVehicles.length - 3 && (
            <IconButton
              onClick={nextSlide}
              sx={{
                position: 'absolute',
                right: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          )}
        </Box>
        </Container>
      </Box>

      {/* Por que comprar aqui? */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold' }}
          >
            Por que comprar aqui?
          </Typography>
          <Grid container spacing={4}>
            {differentials.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' },
                    bgcolor: 'background.paper',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      mb: 2
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Financiamento em até 60x com os principais bancos</strong>
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Depoimentos */}
      <Box sx={{ bgcolor: '#121212', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold', color: 'white' }}
          >
            O que nossos clientes dizem
          </Typography>
          <Grid container spacing={4} sx={{ justifyContent: 'center', alignItems: 'stretch' }}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index} sx={{ display: 'flex' }}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    width: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'translateY(-5px)' },
                    bgcolor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      src={testimonial.avatar}
                      sx={{ 
                        mr: 2, 
                        width: 56, 
                        height: 56,
                        border: '3px solid #1976d2'
                      }}
                    >
                      {testimonial.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {testimonial.location}
                      </Typography>
                    </Box>
                  </Box>
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2, '& .MuiRating-iconFilled': { color: '#ffd700' } }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    "{testimonial.comment}"
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => window.open('https://google.com/reviews', '_blank')}
              sx={{ borderRadius: 3 }}
            >
              Ver mais avaliações no Google
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Avalie seu carro */}
      <Box 
        sx={{ 
          backgroundImage: company.publicCatalog?.tradeIn?.backgroundVideoUrl
            ? 'none'
            : `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${company.publicCatalog?.tradeIn?.backgroundUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&h=1080&fit=crop'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'white', 
          py: 12,
          position: 'relative',
          overflow: 'hidden',
          minHeight: '500px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {company.publicCatalog?.tradeIn?.backgroundVideoUrl && (
          <Box
            component="video"
            src={company.publicCatalog.tradeIn.backgroundVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0
            }}
          />
        )}
        {company.publicCatalog?.tradeIn?.backgroundVideoUrl && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6))',
              zIndex: 1
            }}
          />
        )}
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h2" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                mb: 3
              }}
            >
              {company.publicCatalog?.tradeIn?.title || 'Quer dar seu carro como entrada?'}
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 5, 
                opacity: 0.95,
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              {company.publicCatalog?.tradeIn?.subtitle || 'Envie os dados do seu carro em 2 minutos e receba nossa proposta.'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#1976d2',
                color: 'white',
                '&:hover': { 
                  bgcolor: '#1565c0',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)'
                },
                px: 8,
                py: 3,
                borderRadius: 50,
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onClick={() => handleTabNavigation(1)}
            >
              Avaliar meu carro
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Simule seu financiamento */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold', color: 'text.primary' }}
          >
            Simule seu financiamento
          </Typography>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', bgcolor: 'background.paper', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Entrada desejada"
                  value={financingData.downPayment}
                  onChange={(e) => setFinancingData({ ...financingData, downPayment: e.target.value })}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Prazo"
                  value={financingData.installments}
                  onChange={(e) => setFinancingData({ ...financingData, installments: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="24">24 meses</MenuItem>
                  <MenuItem value="36">36 meses</MenuItem>
                  <MenuItem value="48">48 meses</MenuItem>
                  <MenuItem value="60">60 meses</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => handleTabNavigation(2)}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  Quero simular com o banco
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* Mapa e endereço */}
      <Box sx={{ bgcolor: '#121212', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold', color: 'white' }}
          >
            Visite nossa loja
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ height: 400, borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                <iframe
                  src={company.publicCatalog?.mapEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975!2d-46.6333824!3d-23.5505199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5a2b2ed7f3a1%3A0xab35da2f5ca62674!2sSão%20Paulo%2C%20SP!5e0!3m2!1spt!2sbr!4v1642000000000!5m2!1spt!2sbr"}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização da loja"
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ 
                p: 4, 
                height: 400, 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)', 
                bgcolor: 'rgba(0, 0, 0, 0.8)', 
                backdropFilter: 'blur(10px)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LocationIcon sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
                    Nossa Localização
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold', color: 'white' }}>
                  Endereço:
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Rua das Flores, 123<br />
                  Centro - São Paulo, SP<br />
                  CEP: 01234-567
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold', color: 'white' }}>
                  Horário de Funcionamento:
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Segunda a Sexta: 8h às 18h<br />
                  Sábado: 8h às 16h<br />
                  Domingo: Fechado
                </Typography>
                
                <Button
                  variant="contained"
                  startIcon={<WhatsAppIcon />}
                  fullWidth
                  sx={{ 
                    mb: 2, 
                    borderRadius: 3,
                    bgcolor: '#25D366',
                    color: 'white',
                    '&:hover': { 
                      bgcolor: '#128C7E',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(37, 211, 102, 0.4)'
                    },
                    py: 1.5,
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
                >
                  Falar no WhatsApp
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<LocationIcon />}
                  fullWidth
                  sx={{ 
                    borderRadius: 3,
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    '&:hover': { 
                      borderColor: '#1565c0',
                      bgcolor: 'rgba(25, 118, 210, 0.1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.2)'
                    },
                    py: 1.5,
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => window.open('https://maps.google.com/directions', '_blank')}
                >
                  Como chegar
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;