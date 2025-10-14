import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Chip,
  Fade,
  Slide,
  IconButton,
  Alert
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  ContactPhone as ContactIcon,
  CheckCircle as CheckIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number | string;
  price: number | string;
}

interface FinancingFormProps {
  selectedVehicle?: Vehicle | null;
  onClose?: () => void;
}

interface FormData {
  // Dados do Veículo
  vehicleId: number | null;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  vehiclePrice: string;
  downPayment: string;
  financingAmount: string;
  installments: string;

  // Dados Pessoais
  fullName: string;
  cpf: string;
  rg: string;
  birthDate: string;
  maritalStatus: string;
  motherName: string;
  phone: string;
  email: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;

  // Dados Profissionais
  company: string;
  position: string;
  admissionDate: string;
  salary: string;
  workPhone: string;
  companyCep: string;
  companyAddress: string;
  companyNumber: string;
  companyNeighborhood: string;
  companyCity: string;
  companyState: string;

  // Referências
  bankName: string;
  bankAgency: string;
  bankAccount: string;
  accountType: string;
  personalRef1Name: string;
  personalRef1Phone: string;
  personalRef2Name: string;
  personalRef2Phone: string;
  
  // Informações Adicionais
  additionalInfo: string;
  acceptTerms: boolean;
}

const steps = [
  { label: 'Dados do Veículo', icon: <CarIcon /> },
  { label: 'Dados Pessoais', icon: <PersonIcon /> },
  { label: 'Dados Profissionais', icon: <WorkIcon /> },
  { label: 'Referências', icon: <ContactIcon /> }
];

const FinancingForm: React.FC<FinancingFormProps> = ({ selectedVehicle, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    vehicleId: selectedVehicle?.id || null,
    vehicleBrand: selectedVehicle?.brand || '',
    vehicleModel: selectedVehicle?.model || '',
    vehicleYear: selectedVehicle?.year?.toString() || '',
    vehiclePrice: selectedVehicle?.price?.toString() || '',
    downPayment: '',
    financingAmount: '',
    installments: '60',
    fullName: '',
    cpf: '',
    rg: '',
    birthDate: '',
    maritalStatus: '',
    motherName: '',
    phone: '',
    email: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    company: '',
    position: '',
    admissionDate: '',
    salary: '',
    workPhone: '',
    companyCep: '',
    companyAddress: '',
    companyNumber: '',
    companyNeighborhood: '',
    companyCity: '',
    companyState: '',
    bankName: '',
    bankAgency: '',
    bankAccount: '',
    accountType: 'corrente',
    personalRef1Name: '',
    personalRef1Phone: '',
    personalRef2Name: '',
    personalRef2Phone: '',
    additionalInfo: '',
    acceptTerms: false
  });

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Dados do Veículo
        return !!(formData.vehicleBrand && formData.vehicleModel && formData.vehicleYear && 
                 formData.vehiclePrice && formData.downPayment && formData.installments);
      case 1: // Dados Pessoais
        return !!(formData.fullName && formData.cpf && formData.rg && formData.birthDate && 
                 formData.phone && formData.email && formData.cep && formData.address);
      case 2: // Dados Profissionais
        return !!(formData.company && formData.position && formData.salary && formData.workPhone);
      case 3: // Referências
        return !!(formData.bankName && formData.personalRef1Name && formData.personalRef1Phone && 
                 formData.acceptTerms);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      if (!completedSteps.includes(activeStep)) {
        setCompletedSteps(prev => [...prev, activeStep]);
      }
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;
    
    setIsSubmitting(true);
    
    // Simular envio
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setCompletedSteps(prev => [...prev, activeStep]);
    }, 2000);
  };

  const progress = ((completedSteps.length + (validateStep(activeStep) ? 1 : 0)) / steps.length) * 100;

  const renderVehicleStep = () => (
    <Fade in timeout={500}>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CarIcon /> Dados do Veículo
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Marca"
                value={formData.vehicleBrand}
                onChange={(e) => handleInputChange('vehicleBrand', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Modelo"
                value={formData.vehicleModel}
                onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Ano"
                value={formData.vehicleYear}
                onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Valor do Veículo"
                value={formData.vehiclePrice}
                onChange={(e) => handleInputChange('vehiclePrice', e.target.value)}
                required
                InputProps={{ startAdornment: 'R$ ' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Entrada"
                value={formData.downPayment}
                onChange={(e) => handleInputChange('downPayment', e.target.value)}
                required
                InputProps={{ startAdornment: 'R$ ' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Parcelas</InputLabel>
                <Select
                  value={formData.installments}
                  onChange={(e) => handleInputChange('installments', e.target.value)}
                >
                  <MenuItem value="12">12x</MenuItem>
                  <MenuItem value="24">24x</MenuItem>
                  <MenuItem value="36">36x</MenuItem>
                  <MenuItem value="48">48x</MenuItem>
                  <MenuItem value="60">60x</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Fade>
  );

  const renderPersonalStep = () => (
    <Fade in timeout={500}>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon /> Dados Pessoais
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="CPF"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="RG"
                value={formData.rg}
                onChange={(e) => handleInputChange('rg', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Data de Nascimento"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Estado Civil</InputLabel>
                <Select
                  value={formData.maritalStatus}
                  onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                >
                  <MenuItem value="solteiro">Solteiro(a)</MenuItem>
                  <MenuItem value="casado">Casado(a)</MenuItem>
                  <MenuItem value="divorciado">Divorciado(a)</MenuItem>
                  <MenuItem value="viuvo">Viúvo(a)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Telefone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome da Mãe"
                value={formData.motherName}
                onChange={(e) => handleInputChange('motherName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="CEP"
                value={formData.cep}
                onChange={(e) => handleInputChange('cep', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Endereço"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Número"
                value={formData.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Complemento"
                value={formData.complement}
                onChange={(e) => handleInputChange('complement', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Bairro"
                value={formData.neighborhood}
                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cidade"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Fade>
  );

  const renderProfessionalStep = () => (
    <Fade in timeout={500}>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WorkIcon /> Dados Profissionais
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Empresa onde trabalha"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cargo/Função"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Data de Admissão"
                type="date"
                value={formData.admissionDate}
                onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Salário"
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                required
                InputProps={{ startAdornment: 'R$ ' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Telefone da Empresa"
                value={formData.workPhone}
                onChange={(e) => handleInputChange('workPhone', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="CEP da Empresa"
                value={formData.companyCep}
                onChange={(e) => handleInputChange('companyCep', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Endereço da Empresa"
                value={formData.companyAddress}
                onChange={(e) => handleInputChange('companyAddress', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Número"
                value={formData.companyNumber}
                onChange={(e) => handleInputChange('companyNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bairro"
                value={formData.companyNeighborhood}
                onChange={(e) => handleInputChange('companyNeighborhood', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cidade"
                value={formData.companyCity}
                onChange={(e) => handleInputChange('companyCity', e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Fade>
  );

  const renderReferencesStep = () => (
    <Fade in timeout={500}>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ContactIcon /> Referências Bancárias e Pessoais
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Referência Bancária
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Banco"
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Agência"
                value={formData.bankAgency}
                onChange={(e) => handleInputChange('bankAgency', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Conta"
                value={formData.bankAccount}
                onChange={(e) => handleInputChange('bankAccount', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                Referências Pessoais
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome da 1ª Referência"
                value={formData.personalRef1Name}
                onChange={(e) => handleInputChange('personalRef1Name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone da 1ª Referência"
                value={formData.personalRef1Phone}
                onChange={(e) => handleInputChange('personalRef1Phone', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome da 2ª Referência"
                value={formData.personalRef2Name}
                onChange={(e) => handleInputChange('personalRef2Name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone da 2ª Referência"
                value={formData.personalRef2Phone}
                onChange={(e) => handleInputChange('personalRef2Phone', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Informações Adicionais"
                multiline
                rows={3}
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                placeholder="Alguma informação adicional que gostaria de compartilhar..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.acceptTerms}
                    onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                    required
                  />
                }
                label="Li e concordo com a política de privacidade"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Fade>
  );

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderVehicleStep();
      case 1:
        return renderPersonalStep();
      case 2:
        return renderProfessionalStep();
      case 3:
        return renderReferencesStep();
      default:
        return null;
    }
  };

  if (submitSuccess) {
    return (
      <Fade in timeout={500}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CelebrationIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="success.main">
            Parabéns!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Sua solicitação de financiamento foi enviada com sucesso!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Nossa equipe entrará em contato em breve para dar continuidade ao processo.
          </Typography>
          <Button variant="contained" onClick={onClose}>
            Fechar
          </Button>
        </Box>
      </Fade>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto', p: 3 }}>
      {/* Barra de Progresso */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" color="primary">
            Solicitação de Financiamento
          </Typography>
          <Chip 
            label={`${Math.round(progress)}% Concluído`} 
            color="primary" 
            variant="outlined"
          />
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 8, borderRadius: 4, mb: 2 }}
        />
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step key={step.label} completed={completedSteps.includes(index)}>
            <StepLabel 
              icon={completedSteps.includes(index) ? <CheckIcon color="success" /> : step.icon}
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Conteúdo da Etapa */}
      <Box sx={{ mb: 4 }}>
        {renderStepContent(activeStep)}
      </Box>

      {/* Botões de Navegação */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Voltar
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {!validateStep(activeStep) && (
            <Alert severity="warning" sx={{ mr: 2 }}>
              Preencha todos os campos obrigatórios para continuar
            </Alert>
          )}
          
          {activeStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!validateStep(activeStep) || isSubmitting}
              variant="contained"
              size="large"
              sx={{ minWidth: 120 }}
            >
              {isSubmitting ? 'Enviando...' : 'Finalizar'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!validateStep(activeStep)}
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              size="large"
            >
              Próximo
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default FinancingForm;