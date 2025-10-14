import React, { useState } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, FormControl, InputLabel,
  Select, MenuItem, Button, Checkbox, FormControlLabel, Alert, Autocomplete
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

interface EvaluationFormData {
  // Dados do veículo
  brand: string;
  model: string;
  year: string;
  modelYear: string; // Campo separado para ano do modelo
  color: string;
  fuel: string;
  // Dados pessoais
  name: string;
  email: string;
  phone: string;
  cellphone: string;
  // Informações adicionais
  additionalInfo: string;
  privacyAccepted: boolean;
  // Arquivos
  laudoFile: File | null;
  photoFiles: File[];
  videoFiles: File[];
  documentFiles: File[];
}

// Lista de marcas de veículos
const vehicleBrands = [
  'Audi', 'BMW', 'Chevrolet', 'Citroën', 'Fiat', 'Ford', 'Honda', 'Hyundai',
  'Jeep', 'Kia', 'Land Rover', 'Mercedes-Benz', 'Mitsubishi', 'Nissan',
  'Peugeot', 'Renault', 'Toyota', 'Volkswagen', 'Volvo', 'Subaru', 'Suzuki',
  'Mazda', 'Lexus', 'Infiniti', 'Acura', 'Cadillac', 'Chrysler', 'Dodge',
  'Ferrari', 'Lamborghini', 'Maserati', 'Porsche', 'Alfa Romeo', 'Jaguar',
  'Mini', 'Smart', 'Tesla', 'BYD', 'Chery', 'Geely', 'Great Wall', 'JAC',
  'Lifan', 'Troller', 'Agrale', 'Iveco', 'Scania', 'Volvo Trucks', 'Mercedes Trucks'
];

// Lista de cores
const vehicleColors = [
  'Branco', 'Preto', 'Prata', 'Cinza', 'Azul', 'Vermelho', 'Verde', 'Amarelo',
  'Marrom', 'Bege', 'Dourado', 'Bronze', 'Laranja', 'Rosa', 'Roxo', 'Vinho',
  'Azul Marinho', 'Verde Escuro', 'Cinza Escuro', 'Cinza Claro', 'Branco Pérola',
  'Preto Fosco', 'Azul Metálico', 'Vermelho Metálico', 'Verde Metálico'
];

const VehicleEvaluationForm: React.FC = () => {
  const [formData, setFormData] = useState<EvaluationFormData>({
    brand: '',
    model: '',
    year: '',
    modelYear: '',
    color: '',
    fuel: '',
    name: '',
    email: '',
    phone: '',
    cellphone: '',
    additionalInfo: '',
    privacyAccepted: false,
    laudoFile: null,
    photoFiles: [],
    videoFiles: [],
    documentFiles: []
  });

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (field: keyof EvaluationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: keyof EvaluationFormData, files: FileList | null) => {
    if (!files) return;
    
    if (field === 'laudoFile') {
      handleInputChange(field, files[0]);
    } else {
      const fileArray = Array.from(files);
      handleInputChange(field, fileArray);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.privacyAccepted) {
      alert('Você deve aceitar a política de privacidade para continuar.');
      return;
    }

    try {
      // Aqui você implementaria o envio do formulário
      console.log('Dados do formulário:', formData);
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setSubmitStatus('idle');
        setFormData({
          brand: '',
          model: '',
          year: '',
          modelYear: '',
          color: '',
          fuel: '',
          name: '',
          email: '',
          phone: '',
          cellphone: '',
          additionalInfo: '',
          privacyAccepted: false,
          laudoFile: null,
          photoFiles: [],
          videoFiles: [],
          documentFiles: []
        });
      }, 3000);
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom sx={{ 
          textAlign: 'center', 
          mb: 3,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          AVALIE O SEU VEÍCULO COM A GENTE.
        </Typography>
        
        <Typography variant="body1" sx={{ 
          textAlign: 'center', 
          mb: 4, 
          color: 'text.secondary' 
        }}>
          Preencha o formulário abaixo e tenha a melhor avaliação de mercado para seu veículo.
        </Typography>

        {submitStatus === 'success' && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Formulário enviado com sucesso! Entraremos em contato em breve.
          </Alert>
        )}

        {submitStatus === 'error' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Erro ao enviar formulário. Tente novamente.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Dados do Veículo */}
          <Typography variant="h6" gutterBottom sx={{ 
            color: 'primary.main', 
            fontWeight: 600,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <AssessmentIcon />
            Dados do Veículo
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={vehicleBrands}
                value={formData.brand}
                onChange={(event, newValue) => {
                  handleInputChange('brand', newValue || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    label="Marca"
                    placeholder="Digite ou selecione a marca"
                  />
                )}
                freeSolo
                autoComplete
                autoHighlight
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Modelo"
                placeholder="Ex: Golf"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                required
                label="Ano de Fabricação"
                placeholder="Ex: 2020"
                type="number"
                inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                required
                label="Ano do Modelo"
                placeholder="Ex: 2021"
                type="number"
                inputProps={{ min: 1900, max: new Date().getFullYear() + 2 }}
                value={formData.modelYear}
                onChange={(e) => handleInputChange('modelYear', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Autocomplete
                options={vehicleColors}
                value={formData.color}
                onChange={(event, newValue) => {
                  handleInputChange('color', newValue || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    label="Cor"
                    placeholder="Selecione a cor"
                  />
                )}
                autoComplete
                autoHighlight
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth required>
                <InputLabel>Combustível</InputLabel>
                <Select
                  value={formData.fuel}
                  label="Combustível"
                  onChange={(e) => handleInputChange('fuel', e.target.value)}
                >
                  <MenuItem value="Flex">Flex</MenuItem>
                  <MenuItem value="Gasolina">Gasolina</MenuItem>
                  <MenuItem value="Etanol">Etanol</MenuItem>
                  <MenuItem value="Diesel">Diesel</MenuItem>
                  <MenuItem value="Elétrico">Elétrico</MenuItem>
                  <MenuItem value="Híbrido">Híbrido</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Dados Pessoais */}
          <Typography variant="h6" gutterBottom sx={{ 
            color: 'primary.main', 
            fontWeight: 600,
            mb: 2 
          }}>
            Dados Pessoais
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Nome"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="email"
                label="Email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone"
                placeholder="(44) 3000-0000"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Celular"
                placeholder="(44) 99999-9999"
                value={formData.cellphone}
                onChange={(e) => handleInputChange('cellphone', e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Upload de Arquivos */}
          <Typography variant="h6" gutterBottom sx={{ 
            color: 'primary.main', 
            fontWeight: 600,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <CloudUploadIcon />
            Documentos e Mídias
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Button
                component="label"
                variant="outlined"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{ height: '56px' }}
              >
                Laudo do Veículo
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload('laudoFile', e.target.files)}
                />
              </Button>
              {formData.laudoFile && (
                <Typography variant="caption" color="success.main">
                  ✓ {formData.laudoFile.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                component="label"
                variant="outlined"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{ height: '56px' }}
              >
                Fotos do Veículo
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload('photoFiles', e.target.files)}
                />
              </Button>
              {formData.photoFiles.length > 0 && (
                <Typography variant="caption" color="success.main">
                  ✓ {formData.photoFiles.length} foto(s) selecionada(s)
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                component="label"
                variant="outlined"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{ height: '56px' }}
              >
                Vídeos do Veículo
                <input
                  type="file"
                  hidden
                  multiple
                  accept="video/*"
                  onChange={(e) => handleFileUpload('videoFiles', e.target.files)}
                />
              </Button>
              {formData.videoFiles.length > 0 && (
                <Typography variant="caption" color="success.main">
                  ✓ {formData.videoFiles.length} vídeo(s) selecionado(s)
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                component="label"
                variant="outlined"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{ height: '56px' }}
              >
                Documentos
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('documentFiles', e.target.files)}
                />
              </Button>
              {formData.documentFiles.length > 0 && (
                <Typography variant="caption" color="success.main">
                  ✓ {formData.documentFiles.length} documento(s) selecionado(s)
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* Informações Adicionais */}
          <Typography variant="h6" gutterBottom sx={{ 
            color: 'primary.main', 
            fontWeight: 600,
            mb: 2 
          }}>
            Informações Adicionais
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Informações Adicionais"
            placeholder="Descreva detalhes importantes sobre o veículo, histórico de manutenção, modificações, etc."
            value={formData.additionalInfo}
            onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
            sx={{ mb: 3 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.privacyAccepted}
                onChange={(e) => handleInputChange('privacyAccepted', e.target.checked)}
                required
              />
            }
            label="Li e concordo com a política de privacidade"
            sx={{ mb: 3 }}
          />

          <Box sx={{ textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!formData.privacyAccepted || submitStatus === 'success'}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1.1rem',
                py: 1.5,
                px: 4,
                borderRadius: 3,
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 25px rgba(33, 150, 243, 0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {submitStatus === 'success' ? '✓ Enviado com Sucesso!' : 'Enviar Avaliação'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default VehicleEvaluationForm;