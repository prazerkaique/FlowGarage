import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import Header from '../components/Header';

interface WhatsAppConfig {
  apiKey: string;
  webhookUrl: string;
  phoneNumber: string;
  businessName: string;
  isConnected: boolean;
  lastSync: string;
}

const WhatsAppAPI: React.FC = () => {
  const [config, setConfig] = useState<WhatsAppConfig>({
    apiKey: '',
    webhookUrl: 'https://your-domain.com/webhook/whatsapp',
    phoneNumber: '',
    businessName: 'Project Garage',
    isConnected: false,
    lastSync: ''
  });

  const [qrCodeDialog, setQrCodeDialog] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Estatísticas simuladas
  const [stats] = useState({
    messagesReceived: 1247,
    messagesSent: 892,
    activeChats: 23,
    responseTime: '2.3 min'
  });

  const handleConfigChange = (field: keyof WhatsAppConfig, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // Simular conexão com API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (!config.apiKey || !config.phoneNumber) {
        setError('API Key e número de telefone são obrigatórios');
        return;
      }

      setConfig(prev => ({
        ...prev,
        isConnected: true,
        lastSync: new Date().toLocaleString('pt-BR')
      }));
      
      setSuccess(true);
    } catch (err) {
      setError('Erro ao conectar com WhatsApp API');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setConfig(prev => ({
      ...prev,
      isConnected: false,
      lastSync: ''
    }));
    setSuccess(true);
  };

  const handleGenerateQR = () => {
    setQrCodeDialog(true);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(config.webhookUrl);
    setSuccess(true);
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (err) {
      setError('Erro ao testar conexão');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#1C1C1F',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            p: 4
          }}
        >
          {/* Cabeçalho */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                API WhatsApp
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Configure e gerencie a integração com WhatsApp Business
              </Typography>
            </Box>
            
            <Chip
              icon={config.isConnected ? <CheckCircleIcon /> : <ErrorIcon />}
              label={config.isConnected ? 'Conectado' : 'Desconectado'}
              color={config.isConnected ? 'success' : 'error'}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Grid container spacing={4}>
            {/* Configurações */}
            <Grid item xs={12} lg={8}>
              <Card
                sx={{
                  backgroundColor: '#101012',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  mb: 3
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center' }}>
                    <SettingsIcon sx={{ mr: 1 }} />
                    Configurações da API
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="API Key"
                        type="password"
                        value={config.apiKey}
                        onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                        placeholder="Insira sua API Key do WhatsApp Business"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                            '&.Mui-focused fieldset': { borderColor: '#25d366' }
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                          '& .MuiOutlinedInput-input': { color: 'white' }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Número de Telefone"
                        value={config.phoneNumber}
                        onChange={(e) => handleConfigChange('phoneNumber', e.target.value)}
                        placeholder="+55 11 99999-9999"
                        InputProps={{
                          startAdornment: <PhoneIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                            '&.Mui-focused fieldset': { borderColor: '#25d366' }
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                          '& .MuiOutlinedInput-input': { color: 'white' }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nome do Negócio"
                        value={config.businessName}
                        onChange={(e) => handleConfigChange('businessName', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                            '&.Mui-focused fieldset': { borderColor: '#25d366' }
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                          '& .MuiOutlinedInput-input': { color: 'white' }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          fullWidth
                          label="Webhook URL"
                          value={config.webhookUrl}
                          onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                              '&.Mui-focused fieldset': { borderColor: '#25d366' }
                            },
                            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                            '& .MuiOutlinedInput-input': { color: 'white' }
                          }}
                        />
                        <IconButton
                          onClick={handleCopyWebhook}
                          sx={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {!config.isConnected ? (
                      <Button
                        variant="contained"
                        startIcon={<WhatsAppIcon />}
                        onClick={handleConnect}
                        disabled={isLoading}
                        sx={{
                          backgroundColor: '#25d366',
                          '&:hover': { backgroundColor: '#1da851' },
                          borderRadius: '12px',
                          px: 3
                        }}
                      >
                        {isLoading ? 'Conectando...' : 'Conectar'}
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        onClick={handleDisconnect}
                        sx={{
                          borderColor: '#f44336',
                          color: '#f44336',
                          '&:hover': { borderColor: '#d32f2f', backgroundColor: 'rgba(244, 67, 54, 0.1)' },
                          borderRadius: '12px',
                          px: 3
                        }}
                      >
                        Desconectar
                      </Button>
                    )}
                    
                    <Button
                      variant="outlined"
                      startIcon={<QrCodeIcon />}
                      onClick={handleGenerateQR}
                      sx={{
                        borderColor: 'rgba(255,255,255,0.3)',
                        color: 'white',
                        '&:hover': { borderColor: 'rgba(255,255,255,0.5)' },
                        borderRadius: '12px',
                        px: 3
                      }}
                    >
                      QR Code
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={handleTestConnection}
                      disabled={isLoading}
                      sx={{
                        borderColor: 'rgba(255,255,255,0.3)',
                        color: 'white',
                        '&:hover': { borderColor: 'rgba(255,255,255,0.5)' },
                        borderRadius: '12px',
                        px: 3
                      }}
                    >
                      Testar Conexão
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Estatísticas */}
              <Card
                sx={{
                  backgroundColor: '#101012',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center' }}>
                    <AnalyticsIcon sx={{ mr: 1 }} />
                    Estatísticas
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: '#25d366', fontWeight: 700 }}>
                          {stats.messagesReceived.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Mensagens Recebidas
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: '#667eea', fontWeight: 700 }}>
                          {stats.messagesSent.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Mensagens Enviadas
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 700 }}>
                          {stats.activeChats}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Chats Ativos
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700 }}>
                          {stats.responseTime}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Tempo de Resposta
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Status e Informações */}
            <Grid item xs={12} lg={4}>
              <Card
                sx={{
                  backgroundColor: '#101012',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  mb: 3
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
                    Status da Conexão
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {config.isConnected ? (
                      <CheckCircleIcon sx={{ color: '#4caf50', mr: 1 }} />
                    ) : (
                      <ErrorIcon sx={{ color: '#f44336', mr: 1 }} />
                    )}
                    <Typography sx={{ color: 'white' }}>
                      {config.isConnected ? 'Conectado' : 'Desconectado'}
                    </Typography>
                  </Box>
                  
                  {config.isConnected && config.lastSync && (
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Última sincronização: {config.lastSync}
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Card
                sx={{
                  backgroundColor: '#101012',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center' }}>
                    <SecurityIcon sx={{ mr: 1 }} />
                    Recursos Disponíveis
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <MessageIcon sx={{ color: '#25d366' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Mensagens Automáticas"
                        secondary="Respostas automáticas para clientes"
                        primaryTypographyProps={{ color: 'white' }}
                        secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon sx={{ color: '#25d366' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Integração com CRM"
                        secondary="Sincronização com sistema de vendas"
                        primaryTypographyProps={{ color: 'white' }}
                        secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <AnalyticsIcon sx={{ color: '#25d366' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Relatórios Detalhados"
                        secondary="Análise de conversas e métricas"
                        primaryTypographyProps={{ color: 'white' }}
                        secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Dialog QR Code */}
        <Dialog
          open={qrCodeDialog}
          onClose={() => setQrCodeDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: '#101012',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px'
            }
          }}
        >
          <DialogTitle sx={{ color: 'white', textAlign: 'center' }}>
            QR Code para WhatsApp
          </DialogTitle>
          
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <Box
              sx={{
                width: 200,
                height: 200,
                backgroundColor: 'white',
                borderRadius: '12px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <QrCodeIcon sx={{ fontSize: '8rem', color: '#25d366' }} />
            </Box>
            
            <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
              Escaneie este QR Code com seu WhatsApp
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Abra o WhatsApp no seu celular e escaneie o código para conectar
            </Typography>
          </DialogContent>
          
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
              onClick={() => setQrCodeDialog(false)}
              variant="contained"
              sx={{
                backgroundColor: '#25d366',
                '&:hover': { backgroundColor: '#1da851' },
                borderRadius: '12px',
                px: 4
              }}
            >
              Fechar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbars */}
        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
        >
          <Alert onClose={() => setSuccess(false)} severity="success">
            Operação realizada com sucesso!
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

export default WhatsAppAPI;