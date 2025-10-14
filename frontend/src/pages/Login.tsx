import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CarWheelLoader from '../components/CarWheelLoader';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/vehicles');
    } catch (err) {
      setError('Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        mt: { xs: 4, sm: 8 }, 
        px: { xs: 2, sm: 0 },
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        <Paper elevation={3} sx={{ 
          p: { xs: 3, sm: 4 }, 
          width: '100%', 
          bgcolor: 'background.paper' 
        }}>
          <Typography 
            component="h1" 
            variant="h4" 
            align="center" 
            gutterBottom 
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
          >
            Garage Bay
          </Typography>
          <Typography 
            component="h2" 
            variant="h6" 
            align="center" 
            gutterBottom 
            color="text.secondary" 
            sx={{ 
              mb: 3,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Login
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                },
                '& .MuiInputLabel-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                },
                '& .MuiInputLabel-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: { xs: 1.2, sm: 1.5 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                '&:hover': { color: 'white' } 
              }}
              disabled={loading}
              startIcon={loading ? <CarWheelLoader size={20} showText={false} /> : undefined}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/register')}
              sx={{ 
                color: 'text.secondary', 
                borderColor: 'text.secondary',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                py: { xs: 1, sm: 1.2 },
                '&:hover': { 
                  borderColor: 'secondary.main', 
                  color: 'white' 
                } 
              }}
            >
              Não tem uma conta? Cadastre-se
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;