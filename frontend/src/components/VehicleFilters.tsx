import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

export interface FilterValues {
  category: string;
  brand: string;
  model: string;
  color: string;
  priceRange: [number, number];
  mileageRange: [number, number];
  status: string;
  bodyType: string;
  doors: string;
  transmission: string;
  steering: string;
  fuel: string;
  engine: string;
  features: string[];
  specialFeatures: string[];
}

interface VehicleFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  onClearFilters: () => void;
}

const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const [expanded, setExpanded] = useState<string[]>(['basic', 'price', 'features']);

  const handleAccordionChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpanded(prev => 
      isExpanded 
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  };

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleFeatureToggle = (feature: string, type: 'features' | 'specialFeatures') => {
    try {
      // Garantir que sempre temos um array válido
      const currentFeatures = Array.isArray(filters[type]) ? filters[type] : [];
      const newFeatures = currentFeatures.includes(feature)
        ? currentFeatures.filter(f => f !== feature)
        : [...currentFeatures, feature];
      
      handleFilterChange(type, newFeatures);
    } catch (error) {
      console.error('Erro ao alternar feature:', error);
      // Em caso de erro, garantir que o array seja válido
      handleFilterChange(type, []);
    }
  };

  const brands = [
    // Japonesas
    'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki', 'Lexus', 'Infiniti', 'Acura',
    // Americanas
    'Ford', 'Chevrolet', 'Chrysler', 'Dodge', 'Jeep', 'RAM', 'Tesla', 'Cadillac', 'Lincoln', 'GMC', 'Buick',
    // Alemãs
    'Volkswagen', 'Audi', 'BMW', 'Mercedes-Benz', 'Porsche', 'Opel',
    // Italianas
    'Fiat', 'Alfa Romeo', 'Ferrari', 'Lamborghini', 'Maserati', 'Lancia',
    // Francesas
    'Renault', 'Peugeot', 'Citroën', 'DS Automobiles', 'Bugatti',
    // Britânicas
    'Jaguar', 'Land Rover', 'Aston Martin', 'Bentley', 'Rolls-Royce', 'Mini', 'McLaren', 'Lotus',
    // Sul-coreanas
    'Hyundai', 'Kia', 'Genesis', 'SsangYong',
    // Chinesas
    'BYD', 'Chery', 'Geely', 'Great Wall', 'NIO', 'Xpeng', 'Li Auto', 'Hongqi',
    // Suecas
    'Volvo', 'Koenigsegg', 'Polestar', 'Saab'
  ];
  const colors = [
    'Branco', 'Preto', 'Prata', 'Cinza', 'Azul', 'Vermelho', 'Verde', 'Amarelo', 
    'Bege', 'Marrom', 'Dourado', 'Bronze', 'Rosa', 'Roxo', 'Laranja', 'Vinho'
  ];
  const statuses = ['Disponível', 'Vendido', 'Reservado', 'Em Manutenção'];
  const bodyTypes = ['Sedan', 'Hatch', 'SUV', 'Pickup', 'Conversível', 'Wagon'];
  const doorOptions = ['2', '3', '4', '5'];
  const transmissions = ['Manual', 'Automático', 'CVT', 'Semi-automático'];
  const steerings = ['Hidráulica', 'Elétrica', 'Mecânica'];
  const fuels = ['Gasolina', 'Etanol', 'Flex', 'Diesel', 'Híbrido', 'Elétrico'];
  const engines = ['1.0', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '2.0 - 2.9', '3.0 - 3.9', '4.0 ou mais'];
  
  const commonFeatures = [
    'Ar condicionado',
    'Direção hidráulica (ou elétrica)',
    'Vidros elétricos',
    'Travas elétricas',
    'Alarme',
    'Som',
    'GPS',
    'Câmera de ré',
    'Sensor de estacionamento',
    'Airbags',
    'ABS',
    'Controle de estabilidade',
    'Controle de tração',
    'Piloto automático',
    'Banco de couro',
    'Rodas de liga leve',
    'Teto solar',
    'Faróis de neblina',
    'Bluetooth',
    'USB',
    'Entrada auxiliar',
    'Controle no volante',
    'Retrovisor elétrico',
    'Retrovisor retrátil'
  ];
  
  const specialFeatures = [
    'Blindado', 'Leilão', 'IPVA Pago', 'Licenciamento em Dia', 'Único Dono',
    'Revisões em Concessionária', 'Manual do Proprietário', 'Chave Reserva'
  ];

  return (
    <Paper
      sx={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        height: 'fit-content',
        maxHeight: { xs: 'none', md: 'calc(100vh - 120px)' },
        overflow: { xs: 'visible', md: 'auto' },
        p: { xs: 1.5, sm: 2 },
        borderRadius: 3,
        background: 'linear-gradient(145deg, #1C1C1F 0%, #101012 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: { xs: 1.5, sm: 2 },
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        gap: { xs: 1, sm: 0 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon sx={{ 
            color: 'primary.main',
            fontSize: { xs: '1.2rem', sm: '1.5rem' }
          }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: 'white',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Filtros
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<ClearIcon sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }} />}
          onClick={onClearFilters}
          sx={{ 
            minWidth: 'auto',
            color: 'rgba(255, 255, 255, 0.7)',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            px: { xs: 1, sm: 1.5 },
            py: { xs: 0.5, sm: 0.75 },
            '&:hover': { 
              color: 'white',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(15px)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }
          }}
        >
          Limpar
        </Button>
      </Box>

      <Divider sx={{ mb: { xs: 1.5, sm: 2 }, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Filtros Básicos */}
      <Accordion
        expanded={expanded.includes('basic')}
        onChange={handleAccordionChange('basic')}
        sx={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px !important',
          mb: { xs: 0.75, sm: 1 },
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Typography sx={{ 
            color: 'white', 
            fontWeight: 500,
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}>
            Informações Básicas
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: { xs: 1, sm: 2 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: { xs: 1.5, sm: 2 }
          }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                Categoria
              </InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                sx={{ 
                  color: 'white',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="Carro">Carro</MenuItem>
                <MenuItem value="Moto">Moto</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                Marca
              </InputLabel>
              <Select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                sx={{ 
                  color: 'white',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                <MenuItem value="">Todas</MenuItem>
                {brands.map(brand => (
                  <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Modelo"
              value={filters.model}
              onChange={(e) => handleFilterChange('model', e.target.value)}
              sx={{ 
                '& .MuiInputLabel-root': { 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                },
                '& .MuiInputBase-input': { 
                  color: 'white',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                Cor
              </InputLabel>
              <Select
                value={filters.color}
                onChange={(e) => handleFilterChange('color', e.target.value)}
                sx={{ 
                  color: 'white',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                <MenuItem value="">Todas</MenuItem>
                {colors.map(color => (
                  <MenuItem key={color} value={color}>{color}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                Status
              </InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                sx={{ 
                  color: 'white',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {statuses.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Motor */}
          <Box sx={{ minWidth: 120, mt: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Motor</InputLabel>
              <Select
                value={filters.engine}
                onChange={(e) => handleFilterChange('engine', e.target.value)}
                sx={{ color: 'white' }}
              >
                <MenuItem value="">Todos</MenuItem>
                {engines.map(engine => (
                  <MenuItem key={engine} value={engine}>{engine}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Preço e Quilometragem */}
      <Accordion
        expanded={expanded.includes('price')}
        onChange={handleAccordionChange('price')}
        sx={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px !important',
          mb: { xs: 0.75, sm: 1 },
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Typography sx={{ 
            color: 'white', 
            fontWeight: 500,
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}>
            Preço e Quilometragem
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: { xs: 1, sm: 2 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: { xs: 2, sm: 3 }
          }}>
            <Box>
              <Typography sx={{ 
                color: 'white', 
                mb: 1, 
                fontSize: { xs: '0.8rem', sm: '0.9rem' }
              }}>
                Preço: R$ {filters.priceRange[0].toLocaleString()} - R$ {filters.priceRange[1].toLocaleString()}
              </Typography>
              <Slider
                value={filters.priceRange}
                onChange={(_, value) => handleFilterChange('priceRange', value)}
                valueLabelDisplay="auto"
                min={0}
                max={500000}
                step={5000}
                sx={{ 
                  color: 'primary.main',
                  '& .MuiSlider-thumb': {
                    width: { xs: 16, sm: 20 },
                    height: { xs: 16, sm: 20 }
                  }
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ 
                color: 'white', 
                mb: 1, 
                fontSize: { xs: '0.8rem', sm: '0.9rem' }
              }}>
                Quilometragem: {filters.mileageRange[0].toLocaleString()} - {filters.mileageRange[1].toLocaleString()} km
              </Typography>
              <Slider
                value={filters.mileageRange}
                onChange={(_, value) => handleFilterChange('mileageRange', value)}
                valueLabelDisplay="auto"
                min={0}
                max={300000}
                step={5000}
                sx={{ 
                  color: 'primary.main',
                  '& .MuiSlider-thumb': {
                    width: { xs: 16, sm: 20 },
                    height: { xs: 16, sm: 20 }
                  }
                }}
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Especificações Técnicas */}
      <Accordion
        expanded={expanded.includes('specs')}
        onChange={handleAccordionChange('specs')}
        sx={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px !important',
          mb: 1,
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Typography sx={{ color: 'white', fontWeight: 500 }}>Especificações Técnicas</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Carroceria</InputLabel>
              <Select
                value={filters.bodyType}
                onChange={(e) => handleFilterChange('bodyType', e.target.value)}
                sx={{ color: 'white' }}
              >
                <MenuItem value="">Todas</MenuItem>
                {bodyTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Portas</InputLabel>
              <Select
                value={filters.doors}
                onChange={(e) => handleFilterChange('doors', e.target.value)}
                sx={{ color: 'white' }}
              >
                <MenuItem value="">Todas</MenuItem>
                {doorOptions.map(doors => (
                  <MenuItem key={doors} value={doors}>{doors} portas</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Transmissão</InputLabel>
              <Select
                value={filters.transmission}
                onChange={(e) => handleFilterChange('transmission', e.target.value)}
                sx={{ color: 'white' }}
              >
                <MenuItem value="">Todas</MenuItem>
                {transmissions.map(trans => (
                  <MenuItem key={trans} value={trans}>{trans}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Direção</InputLabel>
              <Select
                value={filters.steering}
                onChange={(e) => handleFilterChange('steering', e.target.value)}
                sx={{ color: 'white' }}
              >
                <MenuItem value="">Todas</MenuItem>
                {steerings.map(steering => (
                  <MenuItem key={steering} value={steering}>{steering}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Combustível</InputLabel>
              <Select
                value={filters.fuel}
                onChange={(e) => handleFilterChange('fuel', e.target.value)}
                sx={{ color: 'white' }}
              >
                <MenuItem value="">Todos</MenuItem>
                {fuels.map(fuel => (
                  <MenuItem key={fuel} value={fuel}>{fuel}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Opcionais */}
      <Accordion
        expanded={expanded.includes('features')}
        onChange={handleAccordionChange('features')}
        sx={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px !important',
          mb: { xs: 0.75, sm: 1 },
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Typography sx={{ 
            color: 'white', 
            fontWeight: 500,
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}>
            Opcionais
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: { xs: 1, sm: 2 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: { xs: 0.5, sm: 1 }
          }}>
            {commonFeatures.map(feature => (
              <Chip
                key={feature}
                label={feature}
                onClick={() => handleFeatureToggle(feature, 'features')}
                variant={Array.isArray(filters.features) && filters.features.includes(feature) ? 'filled' : 'outlined'}
                sx={{
                  color: Array.isArray(filters.features) && filters.features.includes(feature) ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  backgroundColor: Array.isArray(filters.features) && filters.features.includes(feature) ? 'primary.main' : 'transparent',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  height: { xs: 24, sm: 32 },
                  '& .MuiChip-label': {
                    px: { xs: 0.75, sm: 1 }
                  },
                  '&:hover': {
                    backgroundColor: Array.isArray(filters.features) && filters.features.includes(feature) ? 'primary.dark' : 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Características Especiais */}
      <Accordion
        expanded={expanded.includes('special')}
        onChange={handleAccordionChange('special')}
        sx={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px !important',
          mb: { xs: 0.75, sm: 1 },
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Typography sx={{ 
            color: 'white', 
            fontWeight: 500,
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}>
            Características Especiais
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: { xs: 1, sm: 2 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: { xs: 0.5, sm: 1 }
          }}>
            {specialFeatures.map(feature => (
              <Chip
                key={feature}
                label={feature}
                onClick={() => handleFeatureToggle(feature, 'specialFeatures')}
                variant={Array.isArray(filters.specialFeatures) && filters.specialFeatures.includes(feature) ? 'filled' : 'outlined'}
                sx={{
                  color: Array.isArray(filters.specialFeatures) && filters.specialFeatures.includes(feature) ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  backgroundColor: Array.isArray(filters.specialFeatures) && filters.specialFeatures.includes(feature) ? 'secondary.main' : 'transparent',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  height: { xs: 24, sm: 32 },
                  '& .MuiChip-label': {
                    px: { xs: 0.75, sm: 1 }
                  },
                  '&:hover': {
                    backgroundColor: Array.isArray(filters.specialFeatures) && filters.specialFeatures.includes(feature) ? 'secondary.dark' : 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default VehicleFilters;