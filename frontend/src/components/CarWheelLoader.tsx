import React from 'react';
import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { keyframes } from '@mui/system';

// Animação de rotação
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

interface CarWheelLoaderProps {
  size?: number;
  color?: string;
  text?: string;
  showText?: boolean;
  sx?: SxProps<Theme>;
}

const CarWheelLoader: React.FC<CarWheelLoaderProps> = ({ 
  size = 40, 
  color = '#6C6BCF', 
  text = 'Carregando...', 
  showText = true, 
  sx 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...sx
      }}
    >
      {/* Roda de carro SVG */}
      <Box
        sx={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: `${spin} 1s linear infinite`,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Pneu externo */}
          <circle
            cx="50"
            cy="50"
            r="48"
            stroke={color}
            strokeWidth="4"
            fill="none"
          />
          
          {/* Aro da roda */}
          <circle
            cx="50"
            cy="50"
            r="35"
            stroke={color}
            strokeWidth="2"
            fill="none"
          />
          
          {/* Raios da roda */}
          <g stroke={color} strokeWidth="2">
            <line x1="50" y1="15" x2="50" y2="35" />
            <line x1="50" y1="65" x2="50" y2="85" />
            <line x1="15" y1="50" x2="35" y2="50" />
            <line x1="65" y1="50" x2="85" y2="50" />
            <line x1="26.5" y1="26.5" x2="38.8" y2="38.8" />
            <line x1="61.2" y1="61.2" x2="73.5" y2="73.5" />
            <line x1="73.5" y1="26.5" x2="61.2" y2="38.8" />
            <line x1="38.8" y1="61.2" x2="26.5" y2="73.5" />
          </g>
          
          {/* Centro da roda */}
          <circle
            cx="50"
            cy="50"
            r="8"
            fill={color}
          />
          
          {/* Parafusos */}
          <g fill={color}>
            <circle cx="50" cy="30" r="2" />
            <circle cx="50" cy="70" r="2" />
            <circle cx="30" cy="50" r="2" />
            <circle cx="70" cy="50" r="2" />
            <circle cx="35.8" cy="35.8" r="2" />
            <circle cx="64.2" cy="64.2" r="2" />
            <circle cx="64.2" cy="35.8" r="2" />
            <circle cx="35.8" cy="64.2" r="2" />
          </g>
        </svg>
      </Box>
      
      {/* Texto de loading */}
      {showText && (
        <Typography 
          variant="body2" 
          color="textSecondary"
          sx={{ 
            fontWeight: 500,
            color: color 
          }}
        >
          {text}
        </Typography>
      )}
    </Box>
  );
};

export default CarWheelLoader;