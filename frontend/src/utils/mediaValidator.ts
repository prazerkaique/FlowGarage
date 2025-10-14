import JSZip from 'jszip';
import type { VehicleData } from './excelTemplate';

export interface MediaValidation {
  isValid: boolean;
  missingFolders: string[];
  foundFolders: string[];
  missingMedia: { vehicleId: string; type: string; files: string[] }[];
  warnings: string[];
  stats: {
    totalFiles: number;
    vehicleFolders: number;
    photos: number;
    videos: number;
    reports: number;
  };
}

export interface MediaFile {
  vehicleId: string;
  type: 'fotos' | 'videos' | 'laudo';
  fileName: string;
  path: string;
  file: File;
}

/**
 * Valida a estrutura de mídia do ZIP
 * Estrutura esperada: ZIP > Pasta aleatória > Mídia > [ID] > Fotos/Vídeos/Laudo
 */
export async function validateMediaStructure(
  zipFile: File, 
  vehicles: VehicleData[]
): Promise<MediaValidation> {
  const zip = new JSZip();
  const buffer = await zipFile.arrayBuffer();
  const zipContent = await zip.loadAsync(buffer);

  const validation: MediaValidation = {
    isValid: true,
    missingFolders: [],
    foundFolders: [],
    missingMedia: [],
    warnings: [],
    stats: {
      totalFiles: 0,
      vehicleFolders: 0,
      photos: 0,
      videos: 0,
      reports: 0
    }
  };

  // IDs dos veículos esperados (formatados com zero à esquerda)
  const expectedVehicleIds = vehicles.map(v => 
    v.id.toString().padStart(3, '0')
  );

  const foundFolders = new Set<string>();
  const mediaFiles: MediaFile[] = [];

  // Analisar estrutura do ZIP
  console.log('🔍 Iniciando análise do ZIP...');
  console.log('📋 Veículos esperados:', vehicles.map(v => v.id));
  console.log('🎯 IDs formatados esperados:', expectedVehicleIds);

  await zip.forEach((relativePath, file) => {
    const path = relativePath;
    console.log('🔗 Processando arquivo:', path);
    
    // Ignorar diretórios vazios e arquivos do sistema (DS_Store, __MACOSX)
    if (file.dir || path.includes('.DS_Store') || path.includes('__MACOSX')) {
      console.log('⏭️ Ignorando arquivo do sistema ou diretório:', path);
      return;
    }
    
    validation.stats.totalFiles++;
    
    const pathParts = path.split('/').filter(part => part.length > 0);
    console.log('🧩 Partes do caminho completo:', pathParts);
    console.log('📏 Número de partes:', pathParts.length);
    
    // Verificar se segue a estrutura: [PastaAleatoria]/Mídia/[ID]/[Tipo]/arquivo
    // ou apenas: Mídia/[ID]/[Tipo]/arquivo (estrutura antiga ainda suportada)
    let mediaIndex = -1;
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      console.log(`🔍 Verificando parte ${i}: "${part}" (normalizada: "${part.toLowerCase()}")`);
      if (part.toLowerCase() === 'midia' || part.toLowerCase() === 'mídia') {
        mediaIndex = i;
        console.log('✅ Pasta Mídia encontrada no índice:', mediaIndex);
        break;
      }
    }
    
    console.log('📂 Índice da pasta Mídia:', mediaIndex);
    console.log('📏 Comprimento necessário:', mediaIndex + 4, '| Comprimento atual:', pathParts.length);
    
    // Estrutura esperada: [PastaAleatoria]/Mídia/[ID]/[Tipo]/arquivo
    // Isso significa: mediaIndex + 3 partes adicionais = mediaIndex + 4 total
    if (mediaIndex >= 0 && pathParts.length === mediaIndex + 4) {
      const vehicleId = pathParts[mediaIndex + 1];
      const mediaType = pathParts[mediaIndex + 2];
      const fileName = pathParts[pathParts.length - 1];
      
      console.log('✅ Estrutura válida encontrada:');
      console.log('  🚗 ID do veículo (bruto):', vehicleId);
      console.log('  📁 Tipo de mídia (bruto):', mediaType);
      console.log('  📄 Nome do arquivo:', fileName);
      console.log('  🎯 ID esperado está na lista?', expectedVehicleIds.includes(vehicleId));
      console.log('  📋 Lista completa de IDs esperados:', expectedVehicleIds);
      
      foundFolders.add(vehicleId);
      console.log('📁 Pasta adicionada ao conjunto:', vehicleId);
      console.log('📊 Pastas encontradas até agora:', Array.from(foundFolders));
      
      // Contar arquivos por tipo
      const normalizedMediaType = mediaType.toLowerCase();
      if ((normalizedMediaType === 'fotos' || normalizedMediaType === 'foto') && isImageFile(fileName)) {
        validation.stats.photos++;
        console.log('📸 Foto contada:', fileName);
      } else if ((normalizedMediaType === 'videos' || normalizedMediaType === 'video' || normalizedMediaType === 'vídeos' || normalizedMediaType === 'vídeo') && isVideoFile(fileName)) {
        validation.stats.videos++;
        console.log('🎥 Vídeo contado:', fileName);
      } else if ((normalizedMediaType === 'laudo' || normalizedMediaType === 'laudos') && isPdfFile(fileName)) {
        validation.stats.reports++;
        console.log('📋 Laudo contado:', fileName);
      } else {
        console.log('⚠️ Tipo de mídia não reconhecido:', mediaType, 'para arquivo:', fileName);
      }
      
      // Armazenar informações do arquivo (será processado depois)
        if (isValidMediaType(mediaType)) {
          const normalizedType = mediaType.toLowerCase();
          let finalType: 'fotos' | 'videos' | 'laudo';
          
          if (normalizedType === 'foto' || normalizedType === 'fotos') {
            finalType = 'fotos';
          } else if (normalizedType === 'video' || normalizedType === 'videos' || normalizedType === 'vídeos' || normalizedType === 'vídeo') {
            finalType = 'videos';
          } else if (normalizedType === 'laudo' || normalizedType === 'laudos') {
            finalType = 'laudo';
          } else {
            finalType = normalizedType as 'fotos' | 'videos' | 'laudo';
          }
          
          mediaFiles.push({
            vehicleId,
            type: finalType,
            fileName,
            path,
            file: new File([], fileName) // Placeholder - será preenchido na extração
          });
        }
    } else {
      console.log('❌ Estrutura inválida:', path);
      validation.warnings.push(`Arquivo fora da estrutura esperada: ${path}`);
    }
  });
  
  console.log('📊 Estatísticas finais:');
  console.log('  📁 Total de arquivos:', validation.stats.totalFiles);
  console.log('  🚗 Pastas de veículos:', foundFolders.size);
  console.log('  📸 Fotos:', validation.stats.photos);
  console.log('  🎥 Vídeos:', validation.stats.videos);
  console.log('  📋 Laudos:', validation.stats.reports);

  validation.stats.vehicleFolders = foundFolders.size;
  validation.foundFolders = Array.from(foundFolders);

  // Verificar pastas obrigatórias
  console.log('🔍 Verificando pastas obrigatórias...');
  console.log('📋 IDs esperados:', expectedVehicleIds);
  console.log('📁 Pastas encontradas:', Array.from(foundFolders));
  
  expectedVehicleIds.forEach(id => {
    if (!foundFolders.has(id)) {
      console.log(`❌ Pasta não encontrada para veículo: ${id}`);
      validation.missingFolders.push(`${id}/`);
      validation.isValid = false;
    } else {
      console.log(`✅ Pasta encontrada para veículo: ${id}`);
    }
  });

  // Verificar se cada veículo tem pelo menos uma foto
  expectedVehicleIds.forEach(id => {
    const vehiclePhotos = mediaFiles.filter(
      f => f.vehicleId === id && f.type === 'fotos'
    );
    
    if (vehiclePhotos.length === 0) {
      validation.missingMedia.push({
        vehicleId: id,
        type: 'fotos',
        files: ['Pelo menos uma foto é obrigatória']
      });
      validation.warnings.push(`Veículo ${id}: Nenhuma foto encontrada`);
    }
  });

  // Verificar se há veículos com pastas mas sem dados na planilha
  foundFolders.forEach(folderId => {
    if (!expectedVehicleIds.includes(folderId)) {
      validation.warnings.push(
        `Pasta encontrada para veículo ${folderId} que não existe na planilha`
      );
    }
  });

  return validation;
}

/**
 * Extrai arquivos de mídia organizados por veículo
 */
export async function extractMediaFiles(
  zipFile: File,
  vehicles: VehicleData[]
): Promise<{ [vehicleId: string]: MediaFile[] }> {
  const zip = new JSZip();
  const buffer = await zipFile.arrayBuffer();
  const zipContent = await zip.loadAsync(buffer);

  const mediaByVehicle: { [vehicleId: string]: MediaFile[] } = {};

  // Inicializar arrays para cada veículo
  vehicles.forEach(vehicle => {
    const id = vehicle.id.toString().padStart(2, '0');
    mediaByVehicle[id] = [];
  });

  // Processar arquivos do ZIP
  for (const path of Object.keys(zipContent.files)) {
    const file = zipContent.files[path];
    
    if (file.dir) continue;
    
    const pathParts = path.split('/');
    
    if (pathParts.length >= 4 && pathParts[0].toLowerCase() === 'midia') {
      const vehicleId = pathParts[1];
      const mediaType = pathParts[2].toLowerCase();
      const fileName = pathParts[pathParts.length - 1];
      
      if (isValidMediaType(mediaType) && mediaByVehicle[vehicleId]) {
        const blob = await file.async('blob');
        const mediaFile: MediaFile = {
          vehicleId,
          type: mediaType as 'fotos' | 'videos' | 'laudo',
          fileName,
          path,
          file: new File([blob], fileName, { type: getFileType(fileName) })
        };
        
        mediaByVehicle[vehicleId].push(mediaFile);
      }
    }
  }

  return mediaByVehicle;
}

/**
 * Verifica se o arquivo é uma imagem
 */
function isImageFile(fileName: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return imageExtensions.includes(ext);
}

/**
 * Verifica se o arquivo é um vídeo
 */
function isVideoFile(fileName: string): boolean {
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.mp3'];
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return videoExtensions.includes(ext);
}

/**
 * Verifica se o arquivo é um PDF
 */
function isPdfFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.pdf');
}

/**
 * Verifica se o tipo de mídia é válido
 */
function isValidMediaType(type: string): boolean {
  const normalizedType = type.toLowerCase();
  return ['fotos', 'videos', 'laudo', 'foto', 'video', 'vídeos', 'vídeo', 'laudos'].includes(normalizedType);
}

/**
 * Retorna o tipo MIME do arquivo baseado na extensão
 */
function getFileType(fileName: string): string {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
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
    '.webm': 'video/webm',
    '.mkv': 'video/x-matroska',
    '.pdf': 'application/pdf'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Gera relatório de validação em formato legível
 */
export function generateValidationReport(validation: MediaValidation): string {
  const lines: string[] = [];
  
  lines.push('=== RELATÓRIO DE VALIDAÇÃO DE MÍDIA ===\n');
  
  lines.push(`Status: ${validation.isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}\n`);
  
  lines.push('📊 ESTATÍSTICAS:');
  lines.push(`- Total de arquivos: ${validation.stats.totalFiles}`);
  lines.push(`- Pastas de veículos: ${validation.stats.vehicleFolders}`);
  lines.push(`- Fotos: ${validation.stats.photos}`);
  lines.push(`- Vídeos: ${validation.stats.videos}`);
  lines.push(`- Laudos: ${validation.stats.reports}\n`);
  
  if (validation.missingFolders.length > 0) {
    lines.push('❌ PASTAS FALTANTES:');
    validation.missingFolders.forEach(folder => {
      lines.push(`- Mídia/${folder}/`);
    });
    lines.push('');
  }
  
  if (validation.missingMedia.length > 0) {
    lines.push('⚠️ MÍDIA FALTANTE:');
    validation.missingMedia.forEach(missing => {
      lines.push(`- Veículo ${missing.vehicleId} (${missing.type}): ${missing.files.join(', ')}`);
    });
    lines.push('');
  }
  
  if (validation.warnings.length > 0) {
    lines.push('⚠️ AVISOS:');
    validation.warnings.forEach(warning => {
      lines.push(`- ${warning}`);
    });
    lines.push('');
  }
  
  lines.push('📁 ESTRUTURA ESPERADA:');
  lines.push('Mídia/');
  lines.push('├── 01/');
  lines.push('│   ├── Fotos/');
  lines.push('│   │   ├── foto1.jpg');
  lines.push('│   │   └── foto2.png');
  lines.push('│   ├── Videos/');
  lines.push('│   │   └── video1.mp4');
  lines.push('│   └── Laudo/');
  lines.push('│       └── laudo.pdf');
  lines.push('└── 02/');
  lines.push('    └── ...');
  
  return lines.join('\n');
}