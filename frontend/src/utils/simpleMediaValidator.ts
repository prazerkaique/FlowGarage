import JSZip from 'jszip';
import type { VehicleData } from './excelTemplate';

export interface SimpleMediaValidation {
  isValid: boolean;
  foundVehicles: string[];
  missingVehicles: string[];
  totalFiles: number;
  photos: number;
  videos: number;
  reports: number;
  details: string[];
}

/**
 * Validador simplificado que aceita múltiplas estruturas de pastas
 */
export async function validateSimpleMediaStructure(
  zipFile: File, 
  vehicles: VehicleData[]
): Promise<SimpleMediaValidation> {
  
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(zipFile);
  
  const expectedIds = vehicles.map(v => v.id.toString().padStart(3, '0'));
  const foundVehicles = new Set<string>();
  const details: string[] = [];
  let totalFiles = 0;
  let photos = 0;
  let videos = 0;
  let reports = 0;
  
  console.log('🚀 VALIDADOR FLEXÍVEL INICIADO');
  console.log('📊 Dados do Excel recebidos:', vehicles.map(v => ({ id: v.id, marca: v.marca, modelo: v.modelo })));
  console.log('📋 IDs esperados:', expectedIds);
  console.log('📁 Estrutura do ZIP:');
  
  // Primeiro, vamos mapear a estrutura do ZIP
  const allPaths = Object.keys(zipContent.files);
  const folders = allPaths.filter(path => zipContent.files[path].dir);
  const files = allPaths.filter(path => !zipContent.files[path].dir && !path.includes('.DS_Store') && !path.includes('__MACOSX'));
  
  console.log('📂 Pastas encontradas:', folders);
  console.log('📄 Arquivos encontrados:', files.length);
  
  // Analisar todos os arquivos
  for (const path of files) {
    // Ignorar arquivos do sistema
    if (path.includes('__MACOSX') || path.includes('.DS_Store')) {
      console.log(`🗑️ Ignorando arquivo do sistema: ${path}`);
      continue;
    }
    
    console.log(`🔍 Processando: ${path}`);
    
    totalFiles++;
    
    // Contar tipos de arquivo
    const extension = path.toLowerCase().split('.').pop() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      photos++;
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) {
      videos++;
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
      reports++;
    }
    
    // Dividir o caminho em partes para análise
    const pathParts = path.split('/').filter(part => part.length > 0);
    
    // Verificar se algum veículo esperado está neste arquivo
    let vehicleFoundInThisFile = false;
    
    for (const vehicleId of expectedIds) {
      if (vehicleFoundInThisFile) break; // Já encontrou um veículo neste arquivo
      
      let found = false;
      
      // Testar cada parte do caminho
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        
        // Verificação exata do ID
        if (part === vehicleId) {
          found = true;
          foundVehicles.add(vehicleId);
          details.push(`✅ Veículo ${vehicleId} encontrado em: ${path}`);
          console.log(`✅ MATCH! Veículo ${vehicleId} encontrado em: ${path}`);
          break;
        }
        
        // Verificação com padrões alternativos
        const patterns = [
          `-${vehicleId}-`,     // -001-
          `_${vehicleId}_`,     // _001_
          ` ${vehicleId} `,     // espaços
          `${vehicleId}/`,      // 001/ (pasta)
          `/${vehicleId}`,      // /001 (pasta)
          `${vehicleId}`,       // 001 (simples)
        ];
        
        for (const pattern of patterns) {
          if (part.includes(pattern) || part.toLowerCase().includes(pattern.toLowerCase()) || part === vehicleId) {
            found = true;
            foundVehicles.add(vehicleId);
            details.push(`✅ Veículo ${vehicleId} encontrado (padrão) em: ${path}`);
            console.log(`✅ MATCH! Veículo ${vehicleId} encontrado em: ${path}`);
            break;
          }
        }
        
        // Verificação especial para estruturas como "Lote 1/010/Fotos"
        if (part.includes(vehicleId) || part.endsWith(vehicleId) || part.startsWith(vehicleId)) {
          found = true;
          foundVehicles.add(vehicleId);
          details.push(`✅ Veículo ${vehicleId} encontrado (flexível) em: ${path}`);
          console.log(`✅ MATCH! Veículo ${vehicleId} encontrado em: ${path}`);
          break;
        }
        
        if (found) break;
      }
      
      if (found) {
        vehicleFoundInThisFile = true; // Marca que encontrou um veículo neste arquivo
        break; // Não precisa testar outros IDs para este arquivo
      }
    }
  }
  
  const foundArray = Array.from(foundVehicles);
  const missingVehicles = expectedIds.filter(id => !foundVehicles.has(id));
  
  console.log('📊 RESULTADO FINAL:');
  console.log('✅ Veículos encontrados:', foundArray);
  console.log('❌ Veículos faltando:', missingVehicles);
  console.log('📁 Total de arquivos:', totalFiles);
  console.log('📸 Fotos:', photos);
  console.log('🎥 Vídeos:', videos);
  console.log('📄 Laudos:', reports);
  
  // Verificar se há pastas obrigatórias faltando
  const requiredFolders = ['Fotos', 'Videos', 'Laudo'];
  const foundFolders = new Set<string>();
  
  // Analisar estrutura de pastas
  for (const [path] of Object.entries(zip.files)) {
    const pathParts = path.split('/').filter(part => part.length > 0);
    
    for (const part of pathParts) {
      const normalizedPart = part.toLowerCase();
      if (normalizedPart.includes('foto')) foundFolders.add('Fotos');
      if (normalizedPart.includes('video')) foundFolders.add('Videos');
      if (normalizedPart.includes('laudo')) foundFolders.add('Laudo');
    }
  }
  
  // Adicionar avisos sobre estrutura
  const structureWarnings: string[] = [];
  for (const folder of requiredFolders) {
    if (!foundFolders.has(folder)) {
      structureWarnings.push(`⚠️ Pasta "${folder}" não encontrada na estrutura`);
    }
  }
  
  // Se tudo está OK, mostrar apenas um resumo positivo
  const allVehiclesFound = foundArray.length === expectedIds.length && missingVehicles.length === 0;
  
  const finalDetails = allVehiclesFound && structureWarnings.length === 0
    ? [`✅ Estrutura válida! Todos os ${foundArray.length} veículos foram encontrados com estrutura adequada.`]
    : [...details, ...structureWarnings]; // Mostrar todos os detalhes quando há problemas
  
  return {
    isValid: missingVehicles.length === 0 && foundArray.length > 0,
    foundVehicles: foundArray,
    missingVehicles,
    totalFiles,
    photos,
    videos,
    reports,
    details: finalDetails
  };
}

/**
 * Estruturas de pasta sugeridas (do mais simples ao mais complexo)
 */
export const SUGGESTED_STRUCTURES = [
  {
    name: "Estrutura Simples",
    description: "Uma pasta por veículo com arquivos diretos",
    example: `
001/
  ├── foto1.jpg
  ├── foto2.png
  ├── video1.mp4
  └── laudo.pdf
002/
  ├── foto1.jpg
  └── laudo.pdf
    `,
    pattern: "[ID]/[arquivos]"
  },
  {
    name: "Estrutura com Tipos",
    description: "Pastas organizadas por tipo de mídia",
    example: `
001/
  ├── fotos/
  │   ├── foto1.jpg
  │   └── foto2.png
  ├── videos/
  │   └── video1.mp4
  └── laudo/
      └── laudo.pdf
    `,
    pattern: "[ID]/[tipo]/[arquivos]"
  },
  {
    name: "Estrutura com Lote",
    description: "Pasta de lote contendo veículos",
    example: `
Lote1/
  ├── 001/
  │   ├── fotos/
  │   └── laudo/
  └── 002/
      └── fotos/
    `,
    pattern: "[Lote]/[ID]/[tipo]/[arquivos]"
  }
];