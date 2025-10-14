import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          gap: 4
        }}
      >
        {/* Carro sem motor SVG */}
        <Box
          sx={{
            width: { xs: 300, md: 400 },
            height: { xs: 200, md: 250 },
            mb: 2
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 250"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Corpo do carro */}
            <path
              d="M50 180 L80 160 L120 140 L280 140 L320 160 L350 180 L350 200 L320 200 L320 210 L300 210 L300 200 L100 200 L100 210 L80 210 L80 200 L50 200 Z"
              fill="#9c27b0"
              stroke="#7b1fa2"
              strokeWidth="2"
            />
            
            {/* Janelas */}
            <path
              d="M90 160 L110 145 L290 145 L310 160 L310 170 L90 170 Z"
              fill="#424242"
              stroke="#212121"
              strokeWidth="1"
            />
            
            {/* Divisão das janelas */}
            <line x1="200" y1="145" x2="200" y2="170" stroke="#212121" strokeWidth="2"/>
            
            {/* Faróis */}
            <circle cx="70" cy="170" r="8" fill="#fff3e0" stroke="#ff9800" strokeWidth="2"/>
            <circle cx="330" cy="170" r="8" fill="#fff3e0" stroke="#ff9800" strokeWidth="2"/>
            
            {/* Rodas */}
            <circle cx="100" cy="200" r="20" fill="#424242" stroke="#212121" strokeWidth="3"/>
            <circle cx="300" cy="200" r="20" fill="#424242" stroke="#212121" strokeWidth="3"/>
            
            {/* Detalhes das rodas */}
            <circle cx="100" cy="200" r="12" fill="#616161"/>
            <circle cx="300" cy="200" r="12" fill="#616161"/>
            <circle cx="100" cy="200" r="6" fill="#9e9e9e"/>
            <circle cx="300" cy="200" r="6" fill="#9e9e9e"/>
            
            {/* Capô aberto */}
            <path
              d="M50 180 L80 160 L120 140 L120 120 L80 100 L50 120 Z"
              fill="#ba68c8"
              stroke="#7b1fa2"
              strokeWidth="2"
            />
            
            {/* Dobradiça do capô */}
            <line x1="120" y1="140" x2="120" y2="120" stroke="#424242" strokeWidth="3"/>
            <circle cx="120" cy="130" r="3" fill="#616161"/>
            
            {/* Compartimento do motor VAZIO */}
            <rect
              x="55"
              y="125"
              width="60"
              height="35"
              fill="#1a1a1a"
              stroke="#424242"
              strokeWidth="1"
              rx="3"
            />
            
            {/* Linhas indicando vazio */}
            <line x1="60" y1="130" x2="110" y2="155" stroke="#424242" strokeWidth="1" strokeDasharray="3,3"/>
            <line x1="110" y1="130" x2="60" y2="155" stroke="#424242" strokeWidth="1" strokeDasharray="3,3"/>
            
            {/* Texto "VAZIO" no compartimento */}
            <text x="85" y="145" textAnchor="middle" fill="#666" fontSize="10" fontFamily="monospace">
              VAZIO
            </text>
            
            {/* Para-choque */}
            <rect x="45" y="175" width="310" height="8" fill="#7b1fa2" rx="4"/>
            
            {/* Placa */}
            <rect x="180" y="185" width="40" height="12" fill="#fff" stroke="#424242" strokeWidth="1" rx="2"/>
            <text x="200" y="193" textAnchor="middle" fill="#424242" fontSize="8" fontFamily="monospace">
              404
            </text>
          </svg>
        </Box>

        {/* Mensagem de erro */}
        <Box>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', md: '4rem' },
              fontWeight: 700,
              color: '#9c27b0',
              mb: 2
            }}
          >
            404
          </Typography>
          
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.5rem', md: '2rem' },
              fontWeight: 600,
              mb: 2,
              color: 'text.primary'
            }}
          >
            Motor não encontrado
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1rem', md: '1.25rem' },
              color: 'text.secondary',
              mb: 4,
              maxWidth: 400
            }}
          >
            Sem ele, essa página nem sai da garagem.
          </Typography>
        </Box>

        {/* Botão para voltar */}
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/vehicles')}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            borderRadius: 3
          }}
        >
          Voltar para a Garagem
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;