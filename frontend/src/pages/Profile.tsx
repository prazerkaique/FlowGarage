import React, { useState, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Grid,
  Divider,
  IconButton,
  Card,
  CardContent,
  Snackbar,
  Alert
} from '@mui/material';
import {
  PhotoCamera,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import api from '../services/api';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const profileData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        profileImage: profileImage
      };

      await api.put('/profile', profileData);
      
      // Atualizar o contexto de autenticação com os novos dados
      updateUser(profileData);
      
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: 'Perfil atualizado com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar perfil. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '', // Campo adicional não presente na interface User
      company: '' // Campo adicional não presente na interface User
    });
    setIsEditing(false);
  };

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            backgroundColor: '#1C1C1F',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Cabeçalho */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
              Meu Perfil
            </Typography>
            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  px: 3
                }}
              >
                Editar
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  sx={{ borderRadius: '12px' }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px'
                  }}
                >
                  Salvar
                </Button>
              </Box>
            )}
          </Box>

          <Grid container spacing={4}>
            {/* Foto do Perfil */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  backgroundColor: '#101012',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px'
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    <Avatar
                      src={profileImage || undefined}
                      sx={{
                        width: 120,
                        height: 120,
                        background: profileImage ? 'none' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '3rem'
                      }}
                    >
                      {!profileImage && <PersonIcon sx={{ fontSize: '3rem' }} />}
                    </Avatar>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: '#667eea',
                        color: 'white',
                        '&:hover': { backgroundColor: '#4c63d2' }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <PhotoCamera />
                    </IconButton>
                  </Box>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    {formData.name || 'Nome do Usuário'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </Typography>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Informações Pessoais */}
            <Grid item xs={12} md={8}>
              <Card
                sx={{
                  backgroundColor: '#101012',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    Informações Pessoais
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nome Completo"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: isEditing ? 'rgba(255,255,255,0.05)' : 'transparent',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                            '&.Mui-focused fieldset': { borderColor: '#667eea' }
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                          '& .MuiOutlinedInput-input': { color: 'white' }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="E-mail"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <EmailIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: isEditing ? 'rgba(255,255,255,0.05)' : 'transparent',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                            '&.Mui-focused fieldset': { borderColor: '#667eea' }
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                          '& .MuiOutlinedInput-input': { color: 'white' }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Telefone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <PhoneIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: isEditing ? 'rgba(255,255,255,0.05)' : 'transparent',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                            '&.Mui-focused fieldset': { borderColor: '#667eea' }
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                          '& .MuiOutlinedInput-input': { color: 'white' }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Empresa"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        disabled={!isEditing}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <BusinessIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: isEditing ? 'rgba(255,255,255,0.05)' : 'transparent',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                            '&.Mui-focused fieldset': { borderColor: '#667eea' }
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                          '& .MuiOutlinedInput-input': { color: 'white' }
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Snackbars */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
        >
          <Alert onClose={() => setSuccess(false)} severity="success">
            Perfil atualizado com sucesso!
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert onClose={() => setError('')} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Profile;