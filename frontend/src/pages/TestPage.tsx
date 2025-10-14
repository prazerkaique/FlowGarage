import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardMedia } from '@mui/material';
import api from '../services/api';

const TestPage: React.FC = () => {
  const [vehicle, setVehicle] = useState<any>(null);

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        console.log('TestPage: Carregando veículo ID 2');
        const response = await api.get('/vehicles/2');
        console.log('TestPage: Resposta da API:', response.data);
        setVehicle(response.data);
      } catch (error) {
        console.error('TestPage: Erro ao carregar veículo:', error);
      }
    };

    loadVehicle();
  }, []);

  if (!vehicle) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Teste de Carregamento de Fotos
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        Veículo: {vehicle.brand} {vehicle.model}
      </Typography>

      <Typography variant="body1" gutterBottom>
        Fotos encontradas: {vehicle.media?.photos?.length || 0}
      </Typography>

      {vehicle.media?.photos?.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
          {vehicle.media.photos.map((photoUrl: string, index: number) => {
            const fullUrl = `http://localhost:3001${photoUrl}`;
            console.log('TestPage: Renderizando foto:', fullUrl);
            
            return (
              <Card key={index} sx={{ width: 200, height: 150 }}>
                <CardMedia
                  component="img"
                  height="150"
                  image={fullUrl}
                  alt={`Foto ${index + 1}`}
                  onLoad={() => console.log('TestPage: Foto carregada:', fullUrl)}
                  onError={(e) => console.error('TestPage: Erro ao carregar foto:', fullUrl, e)}
                />
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default TestPage;