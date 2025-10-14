import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Chip,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  DirectionsCar as CarIcon
} from '@mui/icons-material';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  color: string;
  bodyType?: string;
}

interface SearchResult {
  type: 'brand' | 'model';
  value: string;
  brand?: string;
  model?: string;
  vehicles?: Vehicle[];
  score: number;
}

interface SmartSearchProps {
  vehicles: Vehicle[];
  onSearchResults: (results: Vehicle[]) => void;
  placeholder?: string;
}

// Função para calcular similaridade entre strings (Levenshtein distance)
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Função para calcular score de similaridade (0-1, onde 1 é idêntico)
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - (distance / maxLength);
}

// Função para normalizar texto (remover acentos, espaços extras, etc.)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, ' ') // Remove espaços extras
    .trim();
}

// Função para normalizar marcas e unificar variações
function normalizeBrand(brand: string): string {
  const normalized = normalizeText(brand);
  
  // Mapeamento de variações comuns para a forma padrão
  const brandMappings: { [key: string]: string } = {
    'citroen': 'citroen',
    'citroën': 'citroen',
    'volkswagen': 'volkswagen',
    'vw': 'volkswagen',
    'mercedes': 'mercedes-benz',
    'mercedes-benz': 'mercedes-benz',
    'bmw': 'bmw',
    'audi': 'audi',
    'ford': 'ford',
    'chevrolet': 'chevrolet',
    'chevy': 'chevrolet',
    'fiat': 'fiat',
    'honda': 'honda',
    'toyota': 'toyota',
    'nissan': 'nissan',
    'hyundai': 'hyundai',
    'kia': 'kia',
    'peugeot': 'peugeot',
    'renault': 'renault',
    'jeep': 'jeep',
    'land rover': 'land-rover',
    'landrover': 'land-rover',
    'range rover': 'land-rover'
  };
  
  return brandMappings[normalized] || normalized;
}

const SmartSearch: React.FC<SmartSearchProps> = ({ 
  vehicles, 
  onSearchResults, 
  placeholder = "Busque por marca, modelo ou características..." 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Extrair marcas e modelos únicos dos veículos
  const allBrands = Array.from(new Set(vehicles.map(v => v.brand))).sort();
  const models = Array.from(new Set(vehicles.map(v => v.model))).sort();
  
  // Criar mapa de marcas normalizadas para a primeira marca encontrada
  const brandMap = new Map<string, string>();
  allBrands.forEach(brand => {
    const normalized = normalizeBrand(brand);
    if (!brandMap.has(normalized)) {
      brandMap.set(normalized, brand);
    }
  });
  
  // Usar apenas as marcas principais (primeira de cada grupo normalizado)
  const brands = Array.from(brandMap.values()).sort();

  // Função para buscar sugestões
  const findSuggestions = (query: string): SearchResult[] => {
    if (!query || query.length < 2) return [];

    const normalizedQuery = normalizeText(query);
    const results: SearchResult[] = [];

    // Buscar marcas
    brands.forEach(brand => {
      const normalizedBrand = normalizeBrand(brand);
      const normalizedQueryBrand = normalizeBrand(query);
      
      // Calcular similaridade usando as versões normalizadas
      const similarity = calculateSimilarity(normalizedQueryBrand, normalizedBrand);
      
      // Também verificar se a query está contida na marca (ambas normalizadas)
      const containsScore = normalizedBrand.includes(normalizedQueryBrand) ? 0.8 : 0;
      const finalScore = Math.max(similarity, containsScore);
      
      if (finalScore > 0.4) { // Threshold para similaridade
        const brandVehicles = vehicles.filter(v => normalizeBrand(v.brand) === normalizedBrand);
        const brandModels = Array.from(new Set(brandVehicles.map(v => v.model))).sort();
        
        results.push({
          type: 'brand',
          value: brand,
          brand,
          vehicles: brandVehicles,
          score: finalScore
        });

        // Adicionar modelos da marca como sugestões separadas quando buscar por marca
        brandModels.forEach(model => {
          const modelVehicles = brandVehicles.filter(v => v.model === model);
          results.push({
            type: 'model',
            value: `${brand} ${model}`,
            brand,
            model,
            vehicles: modelVehicles,
            score: finalScore * 0.9 // Score ligeiramente menor que a marca
          });
        });
      }
    });

    // Buscar modelos independentemente da marca
    models.forEach(model => {
      const normalizedModel = normalizeText(model);
      const similarity = calculateSimilarity(normalizedQuery, normalizedModel);
      
      // Também verificar se a query está contida no modelo
      const containsScore = normalizedModel.includes(normalizedQuery) ? 0.8 : 0;
      const finalScore = Math.max(similarity, containsScore);
      
      if (finalScore > 0.4) {
        const modelVehicles = vehicles.filter(v => v.model === model);
        
        // Se a busca não contém uma marca específica, mostrar modelo único
        const queryWords = normalizedQuery.split(' ');
        const hasBrandInQuery = brands.some(brand => 
          queryWords.some(word => normalizeBrand(brand).includes(normalizeBrand(word)))
        );
        
        if (!hasBrandInQuery) {
          // Agrupar todos os veículos do modelo, independente da marca
          results.push({
            type: 'model',
            value: model,
            model,
            vehicles: modelVehicles,
            score: finalScore
          });
        }
      }
    });

    // Buscar combinações marca + modelo específicas
    const queryWords = normalizedQuery.split(' ');
    if (queryWords.length >= 2) {
      vehicles.forEach(vehicle => {
        const fullName = `${vehicle.brand} ${vehicle.model}`;
        const normalizedFullName = normalizeText(fullName);
        const normalizedFullNameBrand = `${normalizeBrand(vehicle.brand)} ${normalizeText(vehicle.model)}`;
        
        const similarity = calculateSimilarity(normalizedQuery, normalizedFullName);
        const brandSimilarity = calculateSimilarity(normalizedQuery, normalizedFullNameBrand);
        
        const containsScore = normalizedFullName.includes(normalizedQuery) ? 0.9 : 0;
        const brandContainsScore = normalizedFullNameBrand.includes(normalizedQuery) ? 0.9 : 0;
        
        const finalScore = Math.max(similarity, brandSimilarity, containsScore, brandContainsScore);
        
        if (finalScore > 0.5) {
          const specificVehicles = vehicles.filter(v => 
            normalizeBrand(v.brand) === normalizeBrand(vehicle.brand) && v.model === vehicle.model
          );
          
          results.push({
            type: 'model',
            value: `${vehicle.brand} ${vehicle.model}`,
            brand: vehicle.brand,
            model: vehicle.model,
            vehicles: specificVehicles,
            score: finalScore
          });
        }
      });
    }

    // Ordenar por score e remover duplicatas
    return results
      .sort((a, b) => b.score - a.score)
      .filter((result, index, self) => {
        // Para marcas, usar a marca normalizada para detectar duplicatas
        if (result.type === 'brand') {
          return index === self.findIndex(r => 
            r.type === result.type && 
            normalizeBrand(r.brand || '') === normalizeBrand(result.brand || '')
          );
        }
        // Para modelos, usar a combinação marca normalizada + modelo
        else if (result.type === 'model') {
          return index === self.findIndex(r => 
            r.type === result.type && 
            normalizeBrand(r.brand || '') === normalizeBrand(result.brand || '') &&
            r.model === result.model
          );
        }
        // Fallback para outros tipos
        return index === self.findIndex(r => 
          r.type === result.type && 
          r.value === result.value
        );
      })
      .slice(0, 10);
  };

  // Atualizar sugestões quando o termo de busca mudar
  useEffect(() => {
    const results = findSuggestions(searchTerm);
    setSuggestions(results);
    setSelectedIndex(-1);
  }, [searchTerm, vehicles]);

  // Executar busca
  const executeSearch = (result?: SearchResult) => {
    let filteredVehicles: Vehicle[] = [];

    if (result) {
      filteredVehicles = result.vehicles || [];
    } else if (searchTerm.trim()) {
      // Busca geral se não há sugestão selecionada
      const normalizedQuery = normalizeText(searchTerm);
      filteredVehicles = vehicles.filter(vehicle => {
        const brandMatch = normalizeText(vehicle.brand).includes(normalizedQuery);
        const modelMatch = normalizeText(vehicle.model).includes(normalizedQuery);
        const colorMatch = normalizeText(vehicle.color).includes(normalizedQuery);
        const bodyTypeMatch = vehicle.bodyType ? normalizeText(vehicle.bodyType).includes(normalizedQuery) : false;
        
        return brandMatch || modelMatch || colorMatch || bodyTypeMatch;
      });
    } else {
      filteredVehicles = vehicles;
    }

    onSearchResults(filteredVehicles);
    setShowSuggestions(false);
  };

  // Manipular seleção de sugestão
  const handleSuggestionSelect = (result: SearchResult) => {
    setSearchTerm(result.value);
    executeSearch(result);
  };

  // Manipular teclas
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          executeSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Limpar busca
  const clearSearch = () => {
    setSearchTerm('');
    onSearchResults(vehicles);
    setShowSuggestions(false);
  };

  return (
    <Box ref={searchRef} sx={{ position: 'relative', width: '100%' }}>
      <TextField
        fullWidth
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton onClick={clearSearch} size="small">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#1C1C1F',
            borderRadius: '16px',
            transition: 'all 0.3s ease-in-out',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
              borderRadius: '16px',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(147, 51, 234, 0.6)',
              boxShadow: '0 0 8px rgba(147, 51, 234, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#9333ea',
              borderWidth: '2px',
              boxShadow: '0 0 16px rgba(147, 51, 234, 0.5), 0 0 32px rgba(147, 51, 234, 0.2)',
            },
            '&.Mui-focused': {
              transform: 'scale(1.02)',
            },
          },
          '& .MuiInputBase-input': {
            color: 'white',
            padding: '14px 16px',
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'rgba(255, 255, 255, 0.6)',
          },
        }}
      />

      {showSuggestions && suggestions.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 400,
            overflow: 'auto',
            backgroundColor: '#1C1C1F',
            border: '1px solid rgba(147, 51, 234, 0.4)',
            borderRadius: '16px',
            mt: 1,
            boxShadow: '0 8px 32px rgba(147, 51, 234, 0.2), 0 4px 16px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <List dense>
            {suggestions.map((result, index) => (
              <ListItem
                key={`${result.type}-${result.value}`}
                button
                selected={index === selectedIndex}
                onClick={() => handleSuggestionSelect(result)}
                sx={{
                  borderRadius: '12px',
                  margin: '4px 8px',
                  transition: 'all 0.2s ease-in-out',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(147, 51, 234, 0.3)',
                    boxShadow: '0 0 12px rgba(147, 51, 234, 0.4)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(147, 51, 234, 0.15)',
                    transform: 'translateX(4px)',
                    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.2)',
                  },
                }}
              >
                <CarIcon sx={{ 
                  mr: 2, 
                  color: 'rgba(147, 51, 234, 0.8)',
                  transition: 'color 0.2s ease-in-out',
                }} />
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {result.value}
                      </Typography>
                      <Chip
                        label={result.type === 'brand' ? 'Marca' : 'Modelo'}
                        size="small"
                        sx={{
                          backgroundColor: result.type === 'brand' ? '#9333ea' : '#7c3aed',
                          color: 'white',
                          fontSize: '0.7rem',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(147, 51, 234, 0.3)',
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      {result.vehicles?.length} veículo{result.vehicles?.length !== 1 ? 's' : ''} encontrado{result.vehicles?.length !== 1 ? 's' : ''}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default SmartSearch;