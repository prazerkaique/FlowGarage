import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  Paper,
  Divider,
  IconButton,
  Fade,
  keyframes
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Folder as FolderIcon,
  Download as DownloadIcon,
  PlayArrow as PlayArrowIcon,
  Close as CloseIcon,
  VideoLibrary as VideoLibraryIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { parseExcelFile, downloadExcelTemplate } from '../utils/excelTemplate';
import type { VehicleData } from '../utils/excelTemplate';
import { validateMediaStructure, extractMediaFiles, generateValidationReport } from '../utils/mediaValidator';
import type { MediaValidation as MediaValidationResult, MediaFile } from '../utils/mediaValidator';
import { validateSimpleMediaStructure, SUGGESTED_STRUCTURES } from '../utils/simpleMediaValidator';
import type { SimpleMediaValidation } from '../utils/simpleMediaValidator';

interface VehicleImportProps {
  open: boolean;
  onClose: () => void;
  onImport: (vehicles: VehicleData[]) => void;
}

interface ImportResult {
  success: number;
  errors: string[];
  warnings: string[];
}

interface ZipStats {
  totalFiles: number;
  vehicleFolders: number;
  photos: number;
  videos: number;
  reports: number;
}

interface MediaValidation {
  isValid: boolean;
  missingFolders: string[];
  foundFolders: string[];
  missingMedia: { vehicleId: string; type: string; files: string[] }[];
  warnings: string[];
}

// Animação de destaque suave para o botão
const glow = keyframes`
  0% { 
    box-shadow: 0 0 5px rgba(156, 39, 176, 0.5);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 20px rgba(156, 39, 176, 0.8), 0 0 30px rgba(156, 39, 176, 0.6);
    transform: scale(1.02);
  }
  100% { 
    box-shadow: 0 0 5px rgba(156, 39, 176, 0.5);
    transform: scale(1);
  }
`;

const VehicleImport: React.FC<VehicleImportProps> = ({ open, onClose, onImport }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [vehicleData, setVehicleData] = useState<VehicleData[]>([]);
  const [zipStats, setZipStats] = useState<ZipStats | null>(null);
  const [mediaValidation, setMediaValidation] = useState<MediaValidation | null>(null);
  const [simpleValidation, setSimpleValidation] = useState<SimpleMediaValidation | null>(null);
  const [useSimpleValidator, setUseSimpleValidator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAllVehicles, setShowAllVehicles] = useState(false);

  const steps = ['Upload de Arquivos', 'Validação', 'Importação'];

  const handleReset = () => {
    setActiveStep(0);
    setExcelFile(null);
    setZipFile(null);
    setVehicleData([]);
    setZipStats(null);
    setMediaValidation(null);
    setLoading(false);
    setErrors([]);
    setWarnings([]);
    setSuccess(false);
    setImportResult(null);
    setShowVideoModal(false);
  };

  const handleExcelUpload = async (file: File) => {
    setLoading(true);
    setErrors([]);
    setWarnings([]);

    try {
      const vehicles = await parseExcelFile(file);
      setExcelFile(file);
      setVehicleData(vehicles);
      // Removido o avanço automático: setActiveStep(1);
    } catch (error) {
      setErrors(['Erro ao processar planilha Excel: ' + (error as Error).message]);
    } finally {
      setLoading(false);
    }
  };

  const validateZipStructure = async (file: File): Promise<{ stats: ZipStats; validation: MediaValidation }> => {
    if (!vehicleData || vehicleData.length === 0) {
      throw new Error('Dados da planilha não encontrados. Faça upload da planilha primeiro.');
    }

    const validationResult = await validateMediaStructure(file, vehicleData);
    
    const stats: ZipStats = {
      totalFiles: validationResult.stats.totalFiles,
      vehicleFolders: validationResult.stats.vehicleFolders,
      photos: validationResult.stats.photos,
      videos: validationResult.stats.videos,
      reports: validationResult.stats.reports
    };

    const validation: MediaValidation = {
      isValid: validationResult.isValid,
      missingFolders: validationResult.missingFolders,
      foundFolders: validationResult.foundFolders,
      missingMedia: validationResult.missingMedia,
      warnings: validationResult.warnings
    };

    return { stats, validation };
  };

  const handleZipUpload = async (file: File) => {
    setLoading(true);
    setErrors([]);
    setWarnings([]);

    try {
      console.log('🚀 INICIANDO UPLOAD DO ZIP:', file.name, 'Tamanho:', file.size, 'bytes');
      console.log('📊 Dados dos veículos disponíveis:', vehicleData?.length || 0, 'veículos');
      console.log('🔧 Usando validador simples:', useSimpleValidator);
      
      if (useSimpleValidator) {
        console.log('✅ Chamando validateSimpleMediaStructure...');
        // Usar validador simples
        const simpleResult = await validateSimpleMediaStructure(file, vehicleData);
        console.log('📋 Resultado do validador simples:', simpleResult);
        
        setSimpleValidation(simpleResult);
        setZipFile(file);
        
        // Criar stats básicos
        const stats = {
          totalFiles: simpleResult.totalFiles,
          vehicleFolders: simpleResult.foundVehicles.length,
          photos: simpleResult.photos,
          videos: simpleResult.videos,
          reports: simpleResult.reports
        };
        
        console.log('📊 Stats criados:', stats);
        setZipStats(stats);
        
        // Converter para formato compatível
        const validation = {
          isValid: simpleResult.isValid,
          missingFolders: simpleResult.missingVehicles,
          foundFolders: simpleResult.foundVehicles,
          missingMedia: [],
          warnings: simpleResult.details
        };
        
        console.log('✅ Validação criada:', validation);
        setMediaValidation(validation);
      } else {
        console.log('⚠️ Usando validador original...');
        // Usar validador original
        const { stats, validation } = await validateZipStructure(file);
        setZipFile(file);
        setZipStats(stats);
        setMediaValidation(validation);
      }
      
      // Removido o avanço automático para a etapa de validação
      // if (validation.isValid) {
      //   setActiveStep(2);
      // }
    } catch (error) {
      setErrors(['Erro ao processar arquivo ZIP: ' + (error as Error).message]);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    console.log('🚀 INICIANDO IMPORTAÇÃO');
    console.log('📊 Dados dos veículos:', vehicleData);
    console.log('📁 Arquivo ZIP:', zipFile?.name || 'Nenhum ZIP fornecido');
    
    if (!vehicleData.length) {
      console.log('❌ IMPORTAÇÃO CANCELADA - Nenhum veículo para importar');
      console.log('   - Veículos:', vehicleData.length);
      return;
    }

    setLoading(true);
    try {
      console.log('⏳ Processando importação...');
      // Simular processamento da importação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result: ImportResult = {
        success: vehicleData.length,
        errors: [],
        warnings: mediaValidation?.warnings || []
      };

      console.log('✅ IMPORTAÇÃO CONCLUÍDA:', result);
      setImportResult(result);
      setSuccess(true);
      
      // Chamar callback com os dados dos veículos
      console.log('📤 Chamando onImport com:', vehicleData);
      onImport(vehicleData);
      
    } catch (error) {
      console.log('❌ ERRO NA IMPORTAÇÃO:', error);
      setImportResult({
        success: 0,
        errors: ['Erro na importação: ' + (error as Error).message],
        warnings: []
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceedToValidation = excelFile !== null;
  const canProceedToImport = excelFile !== null; // Removendo dependência do ZIP para permitir importação apenas com Excel

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            {/* Botão Piscante para Tutorial */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={() => setShowVideoModal(true)}
                sx={{
                  animation: `${glow} 3s ease-in-out infinite`,
                  fontSize: '1.1rem',
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #7b1fa2 30%, #c2185b 90%)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                🎥 Assista o Passo a Passo
              </Button>
            </Box>

            <Grid container spacing={3}>
              {/* Upload da Planilha Excel */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <DescriptionIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        1. Planilha de Veículos
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Baixe o modelo e preencha com os dados dos veículos
                      </Typography>
                      
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={downloadExcelTemplate}
                        sx={{ mb: 2, mr: 1 }}
                      >
                        Baixar Modelo
                      </Button>

                      <input
                        accept=".xlsx,.xls"
                        style={{ display: 'none' }}
                        id="excel-upload"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleExcelUpload(file);
                        }}
                      />
                      <label htmlFor="excel-upload">
                        <Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
                          Upload Excel
                        </Button>
                      </label>

                      {excelFile && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            ✅ {excelFile.name} - {vehicleData.length} veículos encontrados
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Upload do ZIP de Mídias */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <FolderIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        2. Arquivo ZIP de Mídias
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Estrutura flexível: aceita múltiplos formatos de organização
                      </Typography>

                      {/* Estruturas Sugeridas */}
                       <Box sx={{ mb: 2, textAlign: 'left' }}>
                         <Typography variant="subtitle2" gutterBottom>
                           📁 Estruturas aceitas:
                         </Typography>
                         {SUGGESTED_STRUCTURES.map((structure, index) => (
                           <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
                             <Typography variant="caption" fontWeight="bold" sx={{ color: 'white' }}>
                               {structure.name}:
                             </Typography>
                             <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', mt: 0.5, color: 'grey.100' }}>
                               {structure.pattern}
                             </Typography>
                           </Box>
                         ))}
                       </Box>

                      <input
                        accept=".zip"
                        style={{ display: 'none' }}
                        id="zip-upload"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleZipUpload(file);
                        }}
                      />
                      <label htmlFor="zip-upload">
                        <Button 
                          variant="contained" 
                          component="span" 
                          startIcon={<CloudUploadIcon />}
                          disabled={!canProceedToValidation}
                        >
                          Upload ZIP
                        </Button>
                      </label>

                      {zipFile && zipStats && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            ✅ {zipFile.name}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {zipStats.vehicleFolders} pastas • {zipStats.photos} fotos • 
                            {zipStats.videos} vídeos • {zipStats.reports} laudos
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            {/* Mostrar apenas se há arquivo Excel carregado */}
            {vehicleData.length > 0 && (
              <>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    ✅ Planilha Excel Validada com Sucesso!
                  </Typography>
                  <Typography variant="body2">
                    {vehicleData.length} veículos prontos para importação.
                  </Typography>
                </Alert>

                <Typography variant="subtitle1" gutterBottom>
                  Veículos a serem importados ({vehicleData.length}):
                </Typography>
                <Grid container spacing={2}>
                  {vehicleData.slice(0, showAllVehicles ? vehicleData.length : 6).map((vehicle, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card variant="outlined">
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            ID: {vehicle.id} - {vehicle.marca} {vehicle.modelo}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Ano: {vehicle.anoModelo} • Cor: {vehicle.cor}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Preço: R$ {vehicle.preco}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                  {vehicleData.length > 6 && (
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: 'center', mt: 2 }}>
                        {!showAllVehicles ? (
                          <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              ... e mais {vehicleData.length - 6} veículos
                            </Typography>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => setShowAllVehicles(true)}
                            >
                              Ver Todos os {vehicleData.length} Veículos
                            </Button>
                          </>
                        ) : (
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setShowAllVehicles(false)}
                          >
                            Mostrar Apenas os Primeiros 6
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  )}
                </Grid>

                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    💡 Importação Simplificada
                  </Typography>
                  <Typography variant="body2">
                    Você pode prosseguir com a importação apenas com a planilha Excel. 
                    As fotos e vídeos podem ser adicionadas posteriormente através da edição individual de cada veículo.
                  </Typography>
                </Alert>
              </>
            )}

            {/* Seção do ZIP (opcional) */}
            {zipFile && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Validação de Mídias (Opcional)
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant={!useSimpleValidator ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => setUseSimpleValidator(false)}
                    size="small"
                  >
                    Validador Padrão
                  </Button>
                  <Button
                    variant={useSimpleValidator ? "contained" : "outlined"}
                    color="secondary"
                    onClick={() => setUseSimpleValidator(true)}
                    size="small"
                  >
                    Validador Flexível
                  </Button>
                  {zipFile && (
                    <Button
                      variant="outlined"
                      onClick={() => handleZipUpload(zipFile)}
                      size="small"
                      disabled={loading}
                    >
                      Revalidar
                    </Button>
                  )}
                </Box>

                {useSimpleValidator && simpleValidation && (
                  <Alert severity={simpleValidation.isValid ? "success" : "warning"} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Validador Flexível - {simpleValidation.isValid ? "✅ Aprovado" : "⚠️ Verificar"}
                    </Typography>
                    <Typography variant="body2">
                      Encontrados: {simpleValidation.foundVehicles.length} veículos de {vehicleData.length} esperados
                    </Typography>
                    {simpleValidation.missingVehicles.length > 0 && (
                      <Typography variant="body2" color="error">
                        Faltando: {simpleValidation.missingVehicles.join(', ')}
                      </Typography>
                    )}
                  </Alert>
                )}

                {mediaValidation && mediaValidation.missingFolders.length > 0 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {useSimpleValidator ? "Veículos não encontrados:" : "Pastas de veículos não encontradas:"}
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      {mediaValidation.missingFolders.map(folder => (
                        <li key={folder}>{useSimpleValidator ? folder : `Mídia/${folder}/`}</li>
                      ))}
                    </Box>
                  </Alert>
                )}

                {mediaValidation && mediaValidation.warnings.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Avisos:</Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      {mediaValidation.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </Box>
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Importação
            </Typography>

            {loading && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Processando importação...
                </Typography>
                <LinearProgress />
              </Box>
            )}

            {importResult && (
              <Box sx={{ mb: 3 }}>
                {importResult.success > 0 && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    ✅ {importResult.success} veículos importados com sucesso!
                  </Alert>
                )}

                {importResult.errors.length > 0 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Erros encontrados:
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      {importResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </Box>
                  </Alert>
                )}

                {importResult.warnings.length > 0 && (
                  <Alert severity="warning">
                    <Typography variant="subtitle2" gutterBottom>
                      Avisos:
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      {importResult.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </Box>
                  </Alert>
                )}
              </Box>
            )}

            {!loading && !importResult && (
              <Alert severity="info">
                Clique em "Importar" para processar os {vehicleData.length} veículos.
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Importação em Massa de Veículos
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Alert>
          )}

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent()}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleReset} disabled={loading}>
            Reiniciar
          </Button>
          
          {/* Botão "Próxima Etapa" para a primeira etapa */}
          {activeStep === 0 && (
            <Button
              onClick={() => setActiveStep(1)}
              variant="contained"
              disabled={!canProceedToValidation || loading}
            >
              Próxima Etapa
            </Button>
          )}
          
          {activeStep === 1 && (
            <Button
              onClick={() => setActiveStep(2)}
              variant="contained"
              disabled={!canProceedToImport || loading}
            >
              Prosseguir
            </Button>
          )}

          {activeStep === 2 && !success && (
            <Button
              onClick={handleImport}
              variant="contained"
              disabled={!canProceedToImport || loading}
            >
              {loading ? 'Importando...' : 'Importar'}
            </Button>
          )}

          {success && (
            <Button onClick={onClose} variant="contained" color="success">
              Concluir
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal do Vídeo Tutorial */}
      <Dialog 
        open={showVideoModal} 
        onClose={() => setShowVideoModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Tutorial: Como Importar Veículos
            <IconButton onClick={() => setShowVideoModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Tutorial de Importação"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allowFullScreen
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VehicleImport;