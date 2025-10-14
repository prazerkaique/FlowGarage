import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Business as BusinessIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  WhatsApp as WhatsAppIcon,
  PhotoCamera,
  Save as SaveIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import ErrorBoundary from '../components/ErrorBoundary';
import api from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Efeito para definir a aba baseada no parâmetro da URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    
    if (tab === 'pessoal') {
      setTabValue(1);
    } else if (tab === 'empresa') {
      setTabValue(0);
    } else if (tab === 'seguranca') {
      setTabValue(2);
    } else if (tab === 'usuarios') {
      setTabValue(3);
    }
  }, [location.search]);

  const [companyData, setCompanyData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    facebook: '',
    instagram: '',
    logo: null as string | null,
    summary: '',
    publicCatalog: {
      hero: { title: '', subtitle: '', backgroundUrl: '' },
      reasons: [] as Array<{ title: string; description: string }>,
      testimonials: [] as Array<{ name: string; location: string; rating: number; comment: string; avatar?: string }>,
      tradeIn: { title: '', subtitle: '', backgroundUrl: '' },
      mapEmbedUrl: '',
      footerLinks: [] as Array<{ label: string; url: string }>
    }
  });

  interface PersonalData {
    name: string;
    email: string;
    phone: string;
    company: string;
    profileImage?: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }

  const [personalData, setPersonalData] = useState<PersonalData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
    profileImage: user?.profileImage || undefined,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estados para controlar visibilidade das senhas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Efeito para atualizar os dados pessoais quando o usuário mudar
  useEffect(() => {
    if (user) {
      setPersonalData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        profileImage: user.profileImage || undefined
      }));
    }
  }, [user]);

  // Efeito para carregar os dados da empresa
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const response = await api.get('/company');
        setCompanyData(prev => ({
          ...prev,
          ...response.data,
          publicCatalog: {
            hero: {
              ...prev.publicCatalog.hero,
              ...(response.data.publicCatalog?.hero || {})
            },
            tradeIn: {
              ...prev.publicCatalog.tradeIn,
              ...(response.data.publicCatalog?.tradeIn || {})
            },
            reasons: response.data.publicCatalog?.reasons ?? prev.publicCatalog.reasons,
            testimonials: response.data.publicCatalog?.testimonials ?? prev.publicCatalog.testimonials,
            footerLinks: response.data.publicCatalog?.footerLinks ?? prev.publicCatalog.footerLinks,
            mapEmbedUrl: response.data.publicCatalog?.mapEmbedUrl ?? prev.publicCatalog.mapEmbedUrl
          }
        }));
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
      }
    };

    loadCompanyData();
  }, []);

  // Efeito para carregar os dados pessoais do servidor
  useEffect(() => {
    const loadPersonalData = async () => {
      try {
        const response = await api.get('/profile');
        setPersonalData(prev => ({
          ...prev,
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          company: response.data.company || '',
          profileImage: response.data.profileImage || undefined
        }));
      } catch (error) {
        console.error('Erro ao carregar dados pessoais:', error);
      }
    };

    loadPersonalData();
  }, []);

  const [users, setUsers] = useState<any[]>([
    { id: 1, name: 'Admin User', email: 'admin@email.com', role: 'admin' },
    { id: 2, name: 'João Silva', email: 'joao@email.com', role: 'user' }
  ]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCompanyChange = (field: string, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCatalogChange = (path: string, value: any) => {
    setCompanyData(prev => {
      const updated = { ...prev } as any;
      // Suporte simples a caminhos como 'publicCatalog.hero.title'
      const keys = path.split('.');
      let ref = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        ref[k] = ref[k] ?? {};
        ref = ref[k];
      }
      ref[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const addReason = () => {
    setCompanyData(prev => ({
      ...prev,
      publicCatalog: {
        ...prev.publicCatalog,
        reasons: [...(prev.publicCatalog?.reasons || []), { title: '', description: '' }]
      }
    }));
  };

  const removeReason = (index: number) => {
    setCompanyData(prev => ({
      ...prev,
      publicCatalog: {
        ...prev.publicCatalog,
        reasons: (prev.publicCatalog?.reasons || []).filter((_, i) => i !== index)
      }
    }));
  };

  const addTestimonial = () => {
    setCompanyData(prev => ({
      ...prev,
      publicCatalog: {
        ...prev.publicCatalog,
        testimonials: [...(prev.publicCatalog?.testimonials || []), { name: '', location: '', rating: 5, comment: '', avatar: '' }]
      }
    }));
  };

  const removeTestimonial = (index: number) => {
    setCompanyData(prev => ({
      ...prev,
      publicCatalog: {
        ...prev.publicCatalog,
        testimonials: (prev.publicCatalog?.testimonials || []).filter((_, i) => i !== index)
      }
    }));
  };

  const addFooterLink = () => {
    setCompanyData(prev => ({
      ...prev,
      publicCatalog: {
        ...prev.publicCatalog,
        footerLinks: [...(prev.publicCatalog?.footerLinks || []), { label: '', url: '' }]
      }
    }));
  };

  const removeFooterLink = (index: number) => {
    setCompanyData(prev => ({
      ...prev,
      publicCatalog: {
        ...prev.publicCatalog,
        footerLinks: (prev.publicCatalog?.footerLinks || []).filter((_, i) => i !== index)
      }
    }));
  };

  const handlePersonalChange = (field: string, value: string) => {
    setPersonalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar tamanho do arquivo (limite de 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'Imagem muito grande. Por favor, selecione uma imagem menor que 2MB.',
          severity: 'error'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        // Comprimir a imagem antes de salvar
        const compressImage = (imageData: string): Promise<string> => {
          return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
              // Redimensionar para máximo 400x400 para melhor qualidade
              const maxSize = 400;
              let { width, height } = img;
              
              if (width > height) {
                if (width > maxSize) {
                  height = (height * maxSize) / width;
                  width = maxSize;
                }
              } else {
                if (height > maxSize) {
                  width = (width * maxSize) / height;
                  height = maxSize;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              
              ctx?.drawImage(img, 0, 0, width, height);
              
              // Usar qualidade 0.8 para melhor balanço entre qualidade e tamanho
              const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
              resolve(compressedImage);
            };
            
            img.onerror = () => resolve(imageData); // Fallback para imagem original
            img.src = imageData;
          });
        };

        compressImage(result).then(compressedImage => {
          if (tabValue === 0) {
            setCompanyData(prev => ({ ...prev, logo: compressedImage }));
          } else {
            setPersonalData(prev => ({ ...prev, profileImage: compressedImage }));
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCompany = async () => {
    try {
      setLoading(true);
      const response = await api.put('/company', companyData);
      
      // Atualizar o estado local com os dados retornados do servidor
      if (response.data.company) {
        const data = response.data.company;
        setCompanyData(prev => ({
          ...prev,
          ...data,
          publicCatalog: {
            hero: {
              ...prev.publicCatalog.hero,
              ...(data.publicCatalog?.hero || {})
            },
            tradeIn: {
              ...prev.publicCatalog.tradeIn,
              ...(data.publicCatalog?.tradeIn || {})
            },
            reasons: data.publicCatalog?.reasons ?? prev.publicCatalog.reasons,
            testimonials: data.publicCatalog?.testimonials ?? prev.publicCatalog.testimonials,
            footerLinks: data.publicCatalog?.footerLinks ?? prev.publicCatalog.footerLinks,
            mapEmbedUrl: data.publicCatalog?.mapEmbedUrl ?? prev.publicCatalog.mapEmbedUrl
          }
        }));
      }
      
      setSuccess(true);
      setSnackbar({
        open: true,
        message: 'Informações da empresa salvas com sucesso!',
        severity: 'success'
      });
    } catch (err) {
      setError('Erro ao salvar configurações da empresa');
      setSnackbar({
        open: true,
        message: 'Erro ao salvar configurações da empresa',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonal = async () => {
    try {
      setLoading(true);
      
      // Validar senhas se estiverem sendo alteradas
      if (personalData.newPassword || personalData.confirmPassword || personalData.currentPassword) {
        if (!personalData.currentPassword) {
          setError('Senha atual é obrigatória para alterar a senha');
          setSnackbar({
            open: true,
            message: 'Senha atual é obrigatória para alterar a senha',
            severity: 'error'
          });
          return;
        }
        
        if (personalData.newPassword !== personalData.confirmPassword) {
          setError('Nova senha e confirmação não coincidem');
          setSnackbar({
            open: true,
            message: 'Nova senha e confirmação não coincidem',
            severity: 'error'
          });
          return;
        }
        
        if (personalData.newPassword.length < 6) {
          setError('Nova senha deve ter pelo menos 6 caracteres');
          setSnackbar({
            open: true,
            message: 'Nova senha deve ter pelo menos 6 caracteres',
            severity: 'error'
          });
          return;
        }
      }
      
      const profileData = {
        name: personalData.name,
        email: personalData.email,
        phone: personalData.phone,
        company: personalData.company,
        profileImage: personalData.profileImage,
        currentPassword: personalData.currentPassword,
        newPassword: personalData.newPassword
      };

      const response = await api.put('/profile', profileData);
      
      // Atualizar o estado local com os dados retornados do servidor
      if (response.data.user) {
        setPersonalData(prev => ({
          ...prev,
          ...response.data.user,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
      
      // Atualizar o contexto de autenticação com os novos dados
      if (user) {
        updateUser({
          name: personalData.name,
          email: personalData.email,
          phone: personalData.phone,
          company: personalData.company,
          profileImage: personalData.profileImage
        });
      }
      
      setSuccess(true);
      setSnackbar({
        open: true,
        message: personalData.newPassword ? 'Perfil e senha atualizados com sucesso!' : 'Perfil atualizado com sucesso!',
        severity: 'success'
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao salvar configurações pessoais';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setCurrentUser({ name: '', email: '', password: '' });
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setCurrentUser({ ...user, password: '' });
    setUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      setLoading(true);
      if (editingUser) {
        const updatedUsers = users.map(u => 
          u.id === editingUser.id ? { ...u, ...currentUser } : u
        );
        setUsers(updatedUsers);
      } else {
        const newId = Math.max(...users.map(u => u.id)) + 1;
        setUsers([...users, { ...currentUser, id: newId, role: 'user' }]);
      }
      setUserDialogOpen(false);
      setSuccess(true);
    } catch (err) {
      setError('Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      setLoading(true);
      setUsers(users.filter(u => u.id !== userId));
      setSuccess(true);
    } catch (err) {
      setError('Erro ao excluir usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper
          sx={{
            backgroundColor: '#1C1C1F',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-selected': {
                    color: '#667eea'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#667eea'
                }
              }}
            >
              <Tab label="Empresa" />
              <Tab label="Pessoal" />
              <Tab label="Segurança" />
              <Tab label="Usuários" />
            </Tabs>
          </Box>

          {/* Configurações da Empresa */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    backgroundColor: '#101012',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px'
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                      Logo da Empresa
                    </Typography>
                    
                    <Avatar
                      src={companyData.logo || undefined}
                      sx={{
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        mb: 2,
                        backgroundColor: companyData.logo ? 'transparent' : 'rgba(255,255,255,0.1)',
                        fontSize: '3rem'
                      }}
                    >
                      {!companyData.logo && <BusinessIcon sx={{ fontSize: '3rem' }} />}
                    </Avatar>
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="company-logo-input"
                      ref={fileInputRef}
                    />
                    
                    <Button
                      variant="outlined"
                      startIcon={<PhotoCamera />}
                      onClick={() => document.getElementById('company-logo-input')?.click()}
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.3)',
                        '&:hover': {
                          borderColor: '#667eea',
                          backgroundColor: 'rgba(102, 126, 234, 0.1)'
                        }
                      }}
                    >
                      Alterar Logo
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card
                  sx={{
                    backgroundColor: '#101012',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
                      Informações da Empresa
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Nome da Empresa"
                          value={companyData.name}
                          onChange={(e) => handleCompanyChange('name', e.target.value)}
                          InputProps={{
                            startAdornment: <BusinessIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              color: 'white',
                              '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.2)'
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255,255,255,0.3)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)'
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Endereço"
                          value={companyData.address}
                          onChange={(e) => handleCompanyChange('address', e.target.value)}
                          InputProps={{
                            startAdornment: <LocationIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              color: 'white',
                              '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.2)'
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255,255,255,0.3)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)'
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Telefone"
                          value={companyData.phone}
                          onChange={(e) => handleCompanyChange('phone', e.target.value)}
                          InputProps={{
                            startAdornment: <PhoneIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              color: 'white',
                              '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.2)'
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255,255,255,0.3)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)'
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="E-mail"
                          value={companyData.email}
                          onChange={(e) => handleCompanyChange('email', e.target.value)}
                          InputProps={{
                            startAdornment: <EmailIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              color: 'white',
                              '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.2)'
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255,255,255,0.3)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)'
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Facebook"
                          value={companyData.facebook}
                          onChange={(e) => handleCompanyChange('facebook', e.target.value)}
                          InputProps={{
                            startAdornment: <FacebookIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              color: 'white',
                              '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.2)'
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255,255,255,0.3)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)'
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Instagram"
                          value={companyData.instagram}
                          onChange={(e) => handleCompanyChange('instagram', e.target.value)}
                          InputProps={{
                            startAdornment: <InstagramIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              color: 'white',
                              '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.2)'
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255,255,255,0.3)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="WhatsApp (link ou número)"
                          value={companyData.whatsapp || ''}
                          onChange={(e) => handleCompanyChange('whatsapp', e.target.value)}
                          InputProps={{
                            startAdornment: <WhatsAppIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                          }}
                          helperText="Ex.: https://wa.me/5544999887766 ou (44) 99988-7766"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              color: 'white',
                              '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.2)'
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255,255,255,0.3)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)'
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3, textAlign: 'right' }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveCompany}
                        disabled={loading}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '12px',
                          px: 4
                        }}
                      >
                        Salvar Alterações
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Configurações Pessoais */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    backgroundColor: '#101012',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px'
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                      Foto do Perfil
                    </Typography>
                    
                    <Avatar
                      src={personalData.profileImage || undefined}
                      sx={{
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        mb: 2,
                        backgroundColor: personalData.profileImage ? 'transparent' : 'rgba(255,255,255,0.1)',
                        fontSize: '3rem'
                      }}
                    >
                      {!personalData.profileImage && <PersonIcon sx={{ fontSize: '3rem' }} />}
                    </Avatar>
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="personal-photo-input"
                    />
                    
                    <Button
                      variant="outlined"
                      startIcon={<PhotoCamera />}
                      onClick={() => document.getElementById('personal-photo-input')?.click()}
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.3)',
                        '&:hover': {
                          borderColor: '#667eea',
                          backgroundColor: 'rgba(102, 126, 234, 0.1)'
                        }
                      }}
                    >
                      Alterar Foto
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card
                  sx={{
                    backgroundColor: '#101012',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
                      Informações Pessoais
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nome"
                          value={personalData.name}
                          onChange={(e) => handlePersonalChange('name', e.target.value)}
                          InputProps={{
                            startAdornment: <PersonIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              color: 'white',
                              '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.2)'
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255,255,255,0.3)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)'
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="E-mail"
                          value={personalData.email}
                          onChange={(e) => handlePersonalChange('email', e.target.value)}
                          InputProps={{
                            startAdornment: <EmailIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              color: 'white',
                              '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.2)'
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255,255,255,0.3)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)'
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Telefone"
                          value={personalData.phone}
                          onChange={(e) => handlePersonalChange('phone', e.target.value)}
                          InputProps={{
                            startAdornment: <PhoneIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              color: 'white',
                              '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.2)'
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255,255,255,0.3)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)'
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Empresa"
                          value={personalData.company}
                          onChange={(e) => handlePersonalChange('company', e.target.value)}
                          InputProps={{
                            startAdornment: <BusinessIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              color: 'white',
                              '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.2)'
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255,255,255,0.3)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)'
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3, textAlign: 'right' }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSavePersonal}
                        disabled={loading}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '12px',
                          px: 4
                        }}
                      >
                        Salvar Alterações
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* CMS do Catálogo Público */}
            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Card
                  sx={{
                    backgroundColor: '#101012',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
                      Catálogo Público (CMS)
                    </Typography>

                    {/* Hero Banner */}
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                      Banner principal
                    </Typography>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Título"
                          value={companyData.publicCatalog.hero.title}
                          onChange={(e) => handleCatalogChange('publicCatalog.hero.title', e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Subtítulo"
                          value={companyData.publicCatalog.hero.subtitle}
                          onChange={(e) => handleCatalogChange('publicCatalog.hero.subtitle', e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Imagem de fundo (URL)"
                          value={companyData.publicCatalog.hero.backgroundUrl}
                          onChange={(e) => handleCatalogChange('publicCatalog.hero.backgroundUrl', e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Vídeo de fundo (URL)"
                          value={companyData.publicCatalog.hero.backgroundVideoUrl || ''}
                          onChange={(e) => handleCatalogChange('publicCatalog.hero.backgroundVideoUrl', e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }}
                        />
                      </Grid>
                    </Grid>

                    {/* Por que comprar aqui */}
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                      Por que comprar aqui
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {(companyData.publicCatalog.reasons || []).map((reason, idx) => (
                        <Grid key={idx} item xs={12} md={6}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={5}>
                              <TextField
                                fullWidth
                                label="Título"
                                value={reason.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCompanyData(prev => {
                                    const reasons = [...(prev.publicCatalog.reasons || [])];
                                    reasons[idx] = { ...reasons[idx], title: val };
                                    return { ...prev, publicCatalog: { ...prev.publicCatalog, reasons } };
                                  });
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={5}>
                              <TextField
                                fullWidth
                                label="Descrição"
                                value={reason.description}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCompanyData(prev => {
                                    const reasons = [...(prev.publicCatalog.reasons || [])];
                                    reasons[idx] = { ...reasons[idx], description: val };
                                    return { ...prev, publicCatalog: { ...prev.publicCatalog, reasons } };
                                  });
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                              <Button variant="outlined" color="error" onClick={() => removeReason(idx)}>
                                Remover
                              </Button>
                            </Grid>
                          </Grid>
                        </Grid>
                      ))}
                    </Grid>
                    <Button variant="outlined" onClick={addReason} sx={{ mb: 3 }}>
                      Adicionar motivo
                    </Button>

                    {/* Depoimentos */}
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                      O que nossos clientes dizem
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {(companyData.publicCatalog.testimonials || []).map((t, idx) => (
                        <Grid key={idx} item xs={12}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={3}>
                              <TextField fullWidth label="Nome" value={t.name} onChange={(e) => {
                                const val = e.target.value;
                                setCompanyData(prev => {
                                  const testimonials = [...(prev.publicCatalog.testimonials || [])];
                                  testimonials[idx] = { ...testimonials[idx], name: val };
                                  return { ...prev, publicCatalog: { ...prev.publicCatalog, testimonials } };
                                });
                              }} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }} />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                              <TextField fullWidth label="UF/Cidade" value={t.location} onChange={(e) => {
                                const val = e.target.value;
                                setCompanyData(prev => {
                                  const testimonials = [...(prev.publicCatalog.testimonials || [])];
                                  testimonials[idx] = { ...testimonials[idx], location: val };
                                  return { ...prev, publicCatalog: { ...prev.publicCatalog, testimonials } };
                                });
                              }} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }} />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                              <TextField fullWidth type="number" label="Nota (1-5)" value={t.rating} onChange={(e) => {
                                const val = Number(e.target.value || 5);
                                setCompanyData(prev => {
                                  const testimonials = [...(prev.publicCatalog.testimonials || [])];
                                  testimonials[idx] = { ...testimonials[idx], rating: val };
                                  return { ...prev, publicCatalog: { ...prev.publicCatalog, testimonials } };
                                });
                              }} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField fullWidth label="Comentário" value={t.comment} onChange={(e) => {
                                const val = e.target.value;
                                setCompanyData(prev => {
                                  const testimonials = [...(prev.publicCatalog.testimonials || [])];
                                  testimonials[idx] = { ...testimonials[idx], comment: val };
                                  return { ...prev, publicCatalog: { ...prev.publicCatalog, testimonials } };
                                });
                              }} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }} />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField fullWidth label="Avatar (URL)" value={t.avatar || ''} onChange={(e) => {
                                const val = e.target.value;
                                setCompanyData(prev => {
                                  const testimonials = [...(prev.publicCatalog.testimonials || [])];
                                  testimonials[idx] = { ...testimonials[idx], avatar: val };
                                  return { ...prev, publicCatalog: { ...prev.publicCatalog, testimonials } };
                                });
                              }} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }} />
                            </Grid>
                            <Grid item xs={12} sm={1}>
                              <Button variant="outlined" color="error" onClick={() => removeTestimonial(idx)}>
                                Remover
                              </Button>
                            </Grid>
                          </Grid>
                        </Grid>
                      ))}
                    </Grid>
                    <Button variant="outlined" onClick={addTestimonial} sx={{ mb: 3 }}>
                      Adicionar depoimento
                    </Button>

                    {/* Banner de entrada */}
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                      Banner: entrada de carro
                    </Typography>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Título" value={companyData.publicCatalog.tradeIn.title} onChange={(e) => handleCatalogChange('publicCatalog.tradeIn.title', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }} />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Subtítulo" value={companyData.publicCatalog.tradeIn.subtitle} onChange={(e) => handleCatalogChange('publicCatalog.tradeIn.subtitle', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }} />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Imagem de fundo (URL)" value={companyData.publicCatalog.tradeIn.backgroundUrl} onChange={(e) => handleCatalogChange('publicCatalog.tradeIn.backgroundUrl', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }} />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Vídeo de fundo (URL)" value={companyData.publicCatalog.tradeIn.backgroundVideoUrl || ''} onChange={(e) => handleCatalogChange('publicCatalog.tradeIn.backgroundVideoUrl', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }} />
                      </Grid>
                    </Grid>

                    {/* Embed do Google Maps */}
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                      Endereço: Embed do Google Maps
                    </Typography>
                    <TextField fullWidth label="URL do Embed" value={companyData.publicCatalog.mapEmbedUrl} onChange={(e) => handleCatalogChange('publicCatalog.mapEmbedUrl', e.target.value)} sx={{ mb: 3, '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }} />

                    {/* Horário de funcionamento */}
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                      Horário de funcionamento
                    </Typography>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Segunda à Sexta"
                          value={companyData.publicCatalog.businessHours?.weekdays || ''}
                          onChange={(e) => handleCatalogChange('publicCatalog.businessHours.weekdays', e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Sábado"
                          value={companyData.publicCatalog.businessHours?.saturday || ''}
                          onChange={(e) => handleCatalogChange('publicCatalog.businessHours.saturday', e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Domingos e feriados"
                          value={companyData.publicCatalog.businessHours?.sundayHolidays || ''}
                          onChange={(e) => handleCatalogChange('publicCatalog.businessHours.sundayHolidays', e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }}
                        />
                      </Grid>
                    </Grid>

                    {/* Links de rodapé */}
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                      Links do rodapé
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {(companyData.publicCatalog.footerLinks || []).map((l, idx) => (
                        <Grid key={idx} item xs={12} md={6}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={5}>
                              <TextField fullWidth label="Rótulo" value={l.label} onChange={(e) => {
                                const val = e.target.value;
                                setCompanyData(prev => {
                                  const footerLinks = [...(prev.publicCatalog.footerLinks || [])];
                                  footerLinks[idx] = { ...footerLinks[idx], label: val };
                                  return { ...prev, publicCatalog: { ...prev.publicCatalog, footerLinks } };
                                });
                              }} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }} />
                            </Grid>
                            <Grid item xs={12} sm={5}>
                              <TextField fullWidth label="URL" value={l.url} onChange={(e) => {
                                const val = e.target.value;
                                setCompanyData(prev => {
                                  const footerLinks = [...(prev.publicCatalog.footerLinks || [])];
                                  footerLinks[idx] = { ...footerLinks[idx], url: val };
                                  return { ...prev, publicCatalog: { ...prev.publicCatalog, footerLinks } };
                                });
                              }} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }} />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                              <Button variant="outlined" color="error" onClick={() => removeFooterLink(idx)}>
                                Remover
                              </Button>
                            </Grid>
                          </Grid>
                        </Grid>
                      ))}
                    </Grid>
                    <Button variant="outlined" onClick={addFooterLink} sx={{ mb: 3 }}>
                      Adicionar link
                    </Button>

                    {/* Resumo da empresa */}
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                      Resumo da empresa
                    </Typography>
                    <TextField fullWidth multiline rows={3} label="Resumo" value={companyData.summary} onChange={(e) => handleCompanyChange('summary', e.target.value)} sx={{ mb: 3, '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } }} />

                    <Box sx={{ mt: 1, textAlign: 'right' }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveCompany}
                        disabled={loading}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '12px',
                          px: 4
                        }}
                      >
                        Salvar CMS
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Configurações de Segurança */}
          <TabPanel value={tabValue} index={2}>
            <Card
              sx={{
                backgroundColor: '#101012',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
                  Alterar Senha
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Senha Atual"
                      type={showCurrentPassword ? "text" : "password"}
                      value={personalData.currentPassword}
                      onChange={(e) => handlePersonalChange('currentPassword', e.target.value)}
                      InputProps={{
                        startAdornment: <LockIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />,
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                            sx={{ color: 'rgba(255,255,255,0.5)' }}
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.2)'
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255,255,255,0.3)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.7)'
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nova Senha"
                      type={showNewPassword ? "text" : "password"}
                      value={personalData.newPassword}
                      onChange={(e) => handlePersonalChange('newPassword', e.target.value)}
                      InputProps={{
                        startAdornment: <LockIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />,
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                            sx={{ color: 'rgba(255,255,255,0.5)' }}
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.2)'
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255,255,255,0.3)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.7)'
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirmar Nova Senha"
                      type={showConfirmPassword ? "text" : "password"}
                      value={personalData.confirmPassword}
                      onChange={(e) => handlePersonalChange('confirmPassword', e.target.value)}
                      InputProps={{
                        startAdornment: <LockIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />,
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{ color: 'rgba(255,255,255,0.5)' }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.2)'
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255,255,255,0.3)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.7)'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, textAlign: 'right' }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSavePersonal}
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px',
                      px: 4
                    }}
                  >
                    Alterar Senha
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Gerenciamento de Usuários */}
          <TabPanel value={tabValue} index={3}>
            <Card
              sx={{
                backgroundColor: '#101012',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    Gerenciamento de Usuários
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddUser}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px'
                    }}
                  >
                    Adicionar Usuário
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>
                          Nome
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>
                          E-mail
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>
                          Tipo
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>
                          Ações
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                            {user.name}
                          </TableCell>
                          <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                            {user.email}
                          </TableCell>
                          <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                            {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                          </TableCell>
                          <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                            <IconButton
                              onClick={() => handleEditUser(user)}
                              sx={{ color: '#667eea', mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeleteUser(user.id)}
                              sx={{ color: '#f44336' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Dialog para Adicionar/Editar Usuário */}
            <Dialog
              open={userDialogOpen}
              onClose={() => setUserDialogOpen(false)}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: {
                  backgroundColor: '#101012',
                  border: '1px solid rgba(255,255,255,0.1)'
                }
              }}
            >
              <DialogTitle sx={{ color: 'white' }}>
                {editingUser ? 'Editar Usuário' : 'Adicionar Usuário'}
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nome"
                      value={currentUser.name}
                      onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.2)'
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255,255,255,0.3)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.7)'
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="E-mail"
                      type="email"
                      value={currentUser.email}
                      onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.2)'
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255,255,255,0.3)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.7)'
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Senha"
                      type="password"
                      value={currentUser.password}
                      onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                      InputProps={{
                        startAdornment: <LockIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.2)'
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255,255,255,0.3)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.7)'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button
                  onClick={() => setUserDialogOpen(false)}
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveUser}
                  variant="contained"
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px'
                  }}
                >
                  Salvar
                </Button>
              </DialogActions>
            </Dialog>
          </TabPanel>
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
            Configurações salvas com sucesso!
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
    </ErrorBoundary>
  );
};

export default Settings;