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
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  SmartToy as SmartToyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VolumeUp as VolumeUpIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import Header from '../components/Header';

interface Agent {
  id: string;
  name: string;
  voice: string;
  status: 'active' | 'inactive' | 'training';
  description: string;
  avatar?: string;
  createdAt: string;
  lastActive: string;
}

const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Assistente de Vendas',
      voice: 'Feminina - Clara',
      status: 'active',
      description: 'Especializada em atendimento e vendas de veículos',
      createdAt: '2024-01-15',
      lastActive: '2024-01-20 14:30'
    },
    {
      id: '2',
      name: 'Suporte Técnico',
      voice: 'Masculina - Roberto',
      status: 'inactive',
      description: 'Focada em suporte técnico e resolução de problemas',
      createdAt: '2024-01-10',
      lastActive: '2024-01-18 09:15'
    },
    {
      id: '3',
      name: 'Agendamento',
      voice: 'Feminina - Ana',
      status: 'training',
      description: 'Responsável por agendamentos e test drives',
      createdAt: '2024-01-20',
      lastActive: '2024-01-20 16:45'
    }
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    voice: '',
    description: '',
    status: 'inactive' as Agent['status']
  });

  const voiceOptions = [
    'Feminina - Clara',
    'Feminina - Ana',
    'Feminina - Maria',
    'Masculina - Roberto',
    'Masculina - João',
    'Masculina - Carlos'
  ];

  const handleOpenDialog = (agent?: Agent) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        name: agent.name,
        voice: agent.voice,
        description: agent.description,
        status: agent.status
      });
    } else {
      setEditingAgent(null);
      setFormData({
        name: '',
        voice: '',
        description: '',
        status: 'inactive'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAgent(null);
    setFormData({
      name: '',
      voice: '',
      description: '',
      status: 'inactive'
    });
  };

  const handleSaveAgent = () => {
    if (!formData.name || !formData.voice) {
      setError('Nome e voz são obrigatórios');
      return;
    }

    if (editingAgent) {
      // Editar agente existente
      setAgents(prev => prev.map(agent => 
        agent.id === editingAgent.id 
          ? { ...agent, ...formData }
          : agent
      ));
    } else {
      // Criar novo agente
      const newAgent: Agent = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        lastActive: new Date().toLocaleString('pt-BR')
      };
      setAgents(prev => [...prev, newAgent]);
    }

    setSuccess(true);
    handleCloseDialog();
  };

  const handleDeleteAgent = (agentId: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== agentId));
    setSuccess(true);
  };

  const handleToggleStatus = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { 
            ...agent, 
            status: agent.status === 'active' ? 'inactive' : 'active',
            lastActive: new Date().toLocaleString('pt-BR')
          }
        : agent
    ));
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return '#4caf50';
      case 'inactive':
        return '#f44336';
      case 'training':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusLabel = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'training':
        return 'Treinando';
      default:
        return 'Desconhecido';
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
                Agentes de IA
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Gerencie seus assistentes virtuais inteligentes
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                px: 3,
                py: 1.5
              }}
            >
              Novo Agente
            </Button>
          </Box>

          {/* Lista de Agentes */}
          <Grid container spacing={3}>
            {agents.map((agent) => (
              <Grid item xs={12} md={6} lg={4} key={agent.id}>
                <Card
                  sx={{
                    backgroundColor: '#101012',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Header do Card */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          mr: 2
                        }}
                      >
                        <SmartToyIcon />
                      </Avatar>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                          {agent.name}
                        </Typography>
                        <Chip
                          label={getStatusLabel(agent.status)}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(agent.status),
                            color: 'white',
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Informações do Agente */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <VolumeUpIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1, fontSize: '1rem' }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {agent.voice}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
                        {agent.description}
                      </Typography>
                      
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Última atividade: {agent.lastActive}
                      </Typography>
                    </Box>

                    {/* Controles */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={agent.status === 'active'}
                            onChange={() => handleToggleStatus(agent.id)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#667eea'
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#667eea'
                              }
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {agent.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Typography>
                        }
                      />
                      
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(agent)}
                          sx={{ color: 'rgba(255,255,255,0.7)', mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteAgent(agent.id)}
                          sx={{ color: '#f44336' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Estatísticas */}
          <Box sx={{ mt: 4, p: 3, backgroundColor: '#101012', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Estatísticas dos Agentes
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: '#4caf50', fontWeight: 700 }}>
                    {agents.filter(a => a.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Agentes Ativos
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: '#ff9800', fontWeight: 700 }}>
                    {agents.filter(a => a.status === 'training').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Em Treinamento
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: '#667eea', fontWeight: 700 }}>
                    {agents.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Total de Agentes
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Dialog para Criar/Editar Agente */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
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
          <DialogTitle sx={{ color: 'white', pb: 1 }}>
            {editingAgent ? 'Editar Agente' : 'Novo Agente'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome do Agente"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
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
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Voz</InputLabel>
                  <Select
                    value={formData.voice}
                    onChange={(e) => setFormData(prev => ({ ...prev, voice: e.target.value }))}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                      '& .MuiSelect-select': { color: 'white' }
                    }}
                  >
                    {voiceOptions.map((voice) => (
                      <MenuItem key={voice} value={voice}>
                        {voice}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
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
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Agent['status'] }))}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                      '& .MuiSelect-select': { color: 'white' }
                    }}
                  >
                    <MenuItem value="active">Ativo</MenuItem>
                    <MenuItem value="inactive">Inativo</MenuItem>
                    <MenuItem value="training">Treinando</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveAgent}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px'
              }}
            >
              {editingAgent ? 'Salvar' : 'Criar'}
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

export default Agents;