import JSZip from 'jszip';

export interface ExtractedFile {
  name: string;
  blob: Blob;
  type: string;
}

export class ZipHandler {
  private zip: JSZip;

  constructor() {
    this.zip = new JSZip();
  }

  /**
   * Carrega um arquivo ZIP
   */
  async loadZip(file: File): Promise<void> {
    try {
      this.zip = await JSZip.loadAsync(file);
    } catch (error) {
      throw new Error('Erro ao carregar arquivo ZIP: ' + (error as Error).message);
    }
  }

  /**
   * Lista todos os arquivos no ZIP
   */
  listFiles(): string[] {
    const files: string[] = [];
    this.zip.forEach((relativePath: string, zipEntry: JSZip.JSZipObject) => {
      if (!zipEntry.dir) {
        files.push(relativePath);
      }
    });
    return files;
  }

  /**
   * Extrai arquivos de imagem do ZIP
   */
  async extractImages(): Promise<ExtractedFile[]> {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const extractedFiles: ExtractedFile[] = [];

    for (const [relativePath, zipEntry] of Object.entries(this.zip.files)) {
      if (!zipEntry.dir) {
        const extension = this.getFileExtension(relativePath).toLowerCase();
        
        if (imageExtensions.includes(extension)) {
          try {
            const blob = await (zipEntry as JSZip.JSZipObject).async('blob');
            extractedFiles.push({
              name: this.getFileName(relativePath),
              blob,
              type: this.getMimeType(extension)
            });
          } catch (error) {
            console.warn(`Erro ao extrair arquivo ${relativePath}:`, error);
          }
        }
      }
    }

    return extractedFiles;
  }

  /**
   * Extrai arquivos de vídeo do ZIP
   */
  async extractVideos(): Promise<ExtractedFile[]> {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];
    const extractedFiles: ExtractedFile[] = [];

    for (const [relativePath, zipEntry] of Object.entries(this.zip.files)) {
      if (!zipEntry.dir) {
        const extension = this.getFileExtension(relativePath).toLowerCase();
        
        if (videoExtensions.includes(extension)) {
          try {
            const blob = await (zipEntry as JSZip.JSZipObject).async('blob');
            extractedFiles.push({
              name: this.getFileName(relativePath),
              blob,
              type: this.getMimeType(extension)
            });
          } catch (error) {
            console.warn(`Erro ao extrair arquivo ${relativePath}:`, error);
          }
        }
      }
    }

    return extractedFiles;
  }

  /**
   * Extrai um arquivo específico pelo nome
   */
  async extractFile(fileName: string): Promise<ExtractedFile | null> {
    const zipEntry = this.zip.file(fileName);
    if (!zipEntry) {
      // Tentar buscar por nome sem considerar pastas
      const foundEntry = Object.entries(this.zip.files).find(([path, entry]) => 
        !entry.dir && this.getFileName(path) === fileName
      );
      
      if (!foundEntry) {
        return null;
      }
      
      const [relativePath, entry] = foundEntry;
      const blob = await (entry as JSZip.JSZipObject).async('blob');
      const extension = this.getFileExtension(relativePath);
      
      return {
        name: fileName,
        blob,
        type: this.getMimeType(extension)
      };
    }

    try {
      const blob = await zipEntry.async('blob');
      const extension = this.getFileExtension(fileName);
      
      return {
        name: fileName,
        blob,
        type: this.getMimeType(extension)
      };
    } catch (error) {
      console.warn(`Erro ao extrair arquivo ${fileName}:`, error);
      return null;
    }
  }

  /**
   * Extrai múltiplos arquivos pelos nomes
   */
  async extractFiles(fileNames: string[]): Promise<{ [fileName: string]: ExtractedFile | null }> {
    const results: { [fileName: string]: ExtractedFile | null } = {};
    
    for (const fileName of fileNames) {
      results[fileName] = await this.extractFile(fileName);
    }
    
    return results;
  }

  /**
   * Verifica se um arquivo existe no ZIP
   */
  hasFile(fileName: string): boolean {
    return this.zip.file(fileName) !== null || 
           Object.keys(this.zip.files).some(path => 
             this.getFileName(path) === fileName
           );
  }

  /**
   * Obtém estatísticas do ZIP
   */
  getStats(): { totalFiles: number; images: number; videos: number; others: number } {
    let totalFiles = 0;
    let images = 0;
    let videos = 0;
    let others = 0;

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];

    this.zip.forEach((relativePath: string, zipEntry: JSZip.JSZipObject) => {
      if (!zipEntry.dir) {
        totalFiles++;
        const extension = this.getFileExtension(relativePath).toLowerCase();
        
        if (imageExtensions.includes(extension)) {
          images++;
        } else if (videoExtensions.includes(extension)) {
          videos++;
        } else {
          others++;
        }
      }
    });

    return { totalFiles, images, videos, others };
  }

  /**
   * Utilitários privados
   */
  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot !== -1 ? fileName.substring(lastDot) : '';
  }

  private getFileName(filePath: string): string {
    return filePath.split('/').pop() || filePath;
  }

  private getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
      '.flv': 'video/x-flv',
      '.webm': 'video/webm'
    };
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}

/**
 * Função utilitária para processar upload de fotos em lote
 */
export async function processPhotosZip(
  zipFile: File, 
  photoNames: string[]
): Promise<{ [photoName: string]: File | null }> {
  const zipHandler = new ZipHandler();
  await zipHandler.loadZip(zipFile);
  
  const extractedFiles = await zipHandler.extractFiles(photoNames);
  const processedFiles: { [photoName: string]: File | null } = {};
  
  for (const [photoName, extractedFile] of Object.entries(extractedFiles)) {
    if (extractedFile) {
      processedFiles[photoName] = new File(
        [extractedFile.blob], 
        extractedFile.name, 
        { type: extractedFile.type }
      );
    } else {
      processedFiles[photoName] = null;
    }
  }
  
  return processedFiles;
}

/**
 * Função utilitária para validar arquivo ZIP
 */
export async function validateZipFile(file: File): Promise<{
  isValid: boolean;
  stats?: { totalFiles: number; images: number; videos: number; others: number };
  error?: string;
}> {
  try {
    const handler = new ZipHandler();
    await handler.loadZip(file);
    const stats = handler.getStats();
    
    return {
      isValid: true,
      stats
    };
  } catch (error) {
    return {
      isValid: false,
      error: (error as Error).message
    };
  }
}

/**
 * Valida se todas as fotos mencionadas no XML existem no ZIP
 */
export async function validatePhotoCorrespondence(
  zipFile: File,
  vehiclesData: any[]
): Promise<{
  isValid: boolean;
  missingFiles: string[];
  foundFiles: string[];
  unusedFiles: string[];
  warnings: string[];
}> {
  try {
    const handler = new ZipHandler();
    await handler.loadZip(zipFile);
    const zipFiles = handler.listFiles();
    
    // Coleta todas as fotos e vídeos mencionados no XML
    const requiredFiles = new Set<string>();
    vehiclesData.forEach((vehicle, index) => {
      if (vehicle.photos && Array.isArray(vehicle.photos)) {
        vehicle.photos.forEach((photo: string) => {
          requiredFiles.add(photo);
        });
      }
      if (vehicle.videos && Array.isArray(vehicle.videos)) {
        vehicle.videos.forEach((video: string) => {
          requiredFiles.add(video);
        });
      }
    });

    const requiredFilesArray = Array.from(requiredFiles);
    const missingFiles: string[] = [];
    const foundFiles: string[] = [];
    const warnings: string[] = [];

    // Verifica quais arquivos estão faltando
    requiredFilesArray.forEach(fileName => {
      if (zipFiles.includes(fileName)) {
        foundFiles.push(fileName);
      } else {
        missingFiles.push(fileName);
      }
    });

    // Verifica arquivos no ZIP que não são mencionados no XML
    const unusedFiles = zipFiles.filter(file => !requiredFiles.has(file));

    // Gera avisos
    if (missingFiles.length > 0) {
      warnings.push(`${missingFiles.length} arquivo(s) mencionado(s) no XML não foram encontrados no ZIP`);
    }
    if (unusedFiles.length > 0) {
      warnings.push(`${unusedFiles.length} arquivo(s) no ZIP não são mencionados no XML`);
    }

    return {
      isValid: missingFiles.length === 0,
      missingFiles,
      foundFiles,
      unusedFiles,
      warnings
    };
  } catch (error) {
    return {
      isValid: false,
      missingFiles: [],
      foundFiles: [],
      unusedFiles: [],
      warnings: [`Erro ao validar correspondência: ${(error as Error).message}`]
    };
  }
}

// Função para gerar sugestões de nomenclatura
export function generateFileNameSuggestions(
  vehicleData: any,
  originalFileName: string
): string[] {
  const suggestions: string[] = [];
  
  if (!vehicleData || !vehicleData.marca || !vehicleData.modelo || !vehicleData.id) {
    return suggestions;
  }
  
  // Normalizar dados do veículo
  const marca = vehicleData.marca.toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const modelo = vehicleData.modelo.toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const id = String(vehicleData.id).padStart(3, '0');
  
  // Detectar tipo de foto baseado no nome original
  const fileName = originalFileName.toLowerCase();
  const extension = originalFileName.split('.').pop()?.toLowerCase() || 'jpg';
  
  const photoTypes = [
    { keywords: ['front', 'frente', 'frontal'], type: 'frontal' },
    { keywords: ['side', 'lateral', 'lado'], type: 'lateral' },
    { keywords: ['back', 'tras', 'traseira', 'atras'], type: 'traseira' },
    { keywords: ['interior', 'inside', 'dentro'], type: 'interior' },
    { keywords: ['panel', 'painel', 'dashboard'], type: 'painel' },
    { keywords: ['engine', 'motor'], type: 'motor' },
    { keywords: ['trunk', 'porta_malas', 'bagageiro'], type: 'porta_malas' },
    { keywords: ['wheel', 'roda', 'pneu'], type: 'rodas' },
    { keywords: ['detail', 'detalhe'], type: 'detalhes' }
  ];
  
  // Tentar detectar o tipo da foto
  let detectedType = 'geral';
  for (const photoType of photoTypes) {
    if (photoType.keywords.some(keyword => fileName.includes(keyword))) {
      detectedType = photoType.type;
      break;
    }
  }
  
  // Gerar sugestões baseadas no padrão
  const basePattern = `${marca}_${modelo}_${id}`;
  
  // Sugestão principal com tipo detectado
  suggestions.push(`${basePattern}_${detectedType}.${extension}`);
  
  // Sugestões alternativas com tipos comuns
  const commonTypes = ['frontal', 'lateral', 'traseira', 'interior'];
  commonTypes.forEach(type => {
    if (type !== detectedType) {
      suggestions.push(`${basePattern}_${type}.${extension}`);
    }
  });
  
  // Sugestão com numeração sequencial
  suggestions.push(`${basePattern}_01.${extension}`);
  suggestions.push(`${basePattern}_02.${extension}`);
  
  return suggestions.slice(0, 5); // Limitar a 5 sugestões
}

// Função para validar e sugerir correções em nomes de arquivos
export function validateAndSuggestFileNames(
  zipFile: File,
  vehiclesData: any[]
): Promise<{
  validFiles: string[];
  invalidFiles: { original: string; suggestions: string[] }[];
}> {
  return new Promise((resolve, reject) => {
    const zipHandler = new ZipHandler();
    
    zipHandler.loadZip(zipFile)
      .then(() => {
        const files = zipHandler.listFiles();
        const imageFiles = files.filter(file => 
          /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(file)
        );
        
        const validFiles: string[] = [];
        const invalidFiles: { original: string; suggestions: string[] }[] = [];
        
        imageFiles.forEach(file => {
          const fileName = file;
          
          // Verificar se segue o padrão recomendado
          const patternMatch = fileName.match(/^([a-z_]+)_([a-z_]+)_(\d+)_([a-z_]+)\.(jpg|jpeg|png|webp|gif|bmp)$/i);
          
          if (patternMatch) {
            validFiles.push(fileName);
          } else {
            // Tentar encontrar veículo correspondente para gerar sugestões
            let suggestions: string[] = [];
            
            // Se temos dados de veículos, gerar sugestões baseadas neles
            if (vehiclesData && vehiclesData.length > 0) {
              // Tentar associar com o primeiro veículo como exemplo
              suggestions = generateFileNameSuggestions(vehiclesData[0], fileName);
              
              // Se temos múltiplos veículos, adicionar sugestões para outros também
              if (vehiclesData.length > 1) {
                vehiclesData.slice(1, 3).forEach(vehicle => {
                  const moreSuggestions = generateFileNameSuggestions(vehicle, fileName);
                  suggestions.push(...moreSuggestions.slice(0, 2));
                });
              }
            } else {
              // Sugestões genéricas se não temos dados de veículos
              const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
              suggestions = [
                `marca_modelo_001_frontal.${extension}`,
                `marca_modelo_001_lateral.${extension}`,
                `marca_modelo_001_traseira.${extension}`
              ];
            }
            
            invalidFiles.push({
              original: fileName,
              suggestions: [...new Set(suggestions)] // Remover duplicatas
            });
          }
        });
        
        resolve({ validFiles, invalidFiles });
      })
      .catch(reject);
  });
}