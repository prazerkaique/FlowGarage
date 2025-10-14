import * as XLSX from 'xlsx';

export interface VehicleData {
  id: string;
  categoria: string;
  marca: string;
  modelo: string;
  placa: string;
  anoFabricacao: number;
  anoModelo: number;
  km: string;
  preco: string;
  cor: string;
  status: string;
  descricao: string;
  
  // Especificações Técnicas
  tipoCarroceria: string;
  transmissao: string;
  combustivel: string;
  portas: string;
  direcao: string;
  
  // Características Especiais
  blindado: boolean;
  ipvaPago: boolean;
  leilao: boolean;
  licenciamentoEmDia: boolean;
  
  // Opcionais
  arCondicionado: boolean;
  direcaoHidraulica: boolean;
  vidrosEletricos: boolean;
  travasEletricas: boolean;
  alarme: boolean;
  som: boolean;
  gps: boolean;
  cameraRe: boolean;
  sensorEstacionamento: boolean;
  airbags: boolean;
  abs: boolean;
  controleEstabilidade: boolean;
  controleTracao: boolean;
  pilotoAutomatico: boolean;
  bancoCouro: boolean;
  rodasLigaLeve: boolean;
  tetoSolar: boolean;
  faroisNeblina: boolean;
  bluetooth: boolean;
  usb: boolean;
  entradaAuxiliar: boolean;
  controleVolante: boolean;
  retrovisoresEletricos: boolean;
  retrovisoresRetrateis: boolean;
}

export function createExcelTemplate(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  
  // Criar planilha de veículos
  const vehicleHeaders = [
    'ID', 'Categoria', 'Marca', 'Modelo', 'Placa', 'Ano de Fabricação', 'Ano do Modelo', 
    'KM', 'Preço', 'Cor', 'Status', 'Descrição',
    'Tipo de Carroceria', 'Transmissão', 'Combustível', 'Portas', 'Direção',
    'Blindado', 'IPVA Pago', 'Leilão', 'Licenciamento em Dia',
    'Ar Condicionado', 'Direção Hidráulica', 'Vidros Elétricos', 'Travas Elétricas',
    'Alarme', 'Som', 'GPS', 'Câmera de Ré', 'Sensor de Estacionamento',
    'Airbags', 'ABS', 'Controle de Estabilidade', 'Controle de Tração',
    'Piloto Automático', 'Banco de Couro', 'Rodas de Liga Leve', 'Teto Solar',
    'Faróis de Neblina', 'Bluetooth', 'USB', 'Entrada Auxiliar',
    'Controle no Volante', 'Retrovisores Elétricos', 'Retrovisores Retráteis'
  ];
  
  // Criar dados de exemplo
  const exampleData = [
    vehicleHeaders,
    [
      '001', 'Carro', 'Toyota', 'Corolla XEi 2.0 Flex', 'ABC-1234', 2020, 2021,
      '25.000', 'R$ 85.000,00', 'Prata', 'Disponível', 'Veículo em excelente estado',
      'Sedan', 'Automática', 'Flex', '4', 'Hidráulica',
      'Não', 'Sim', 'Não', 'Sim',
      'Sim', 'Sim', 'Sim', 'Sim',
      'Sim', 'Sim', 'Não', 'Sim', 'Sim',
      'Sim', 'Sim', 'Sim', 'Sim',
      'Não', 'Não', 'Sim', 'Não',
      'Sim', 'Sim', 'Sim', 'Sim',
      'Sim', 'Sim', 'Não'
    ]
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(exampleData);
  
  // Definir largura das colunas
  const colWidths = vehicleHeaders.map(() => ({ wch: 15 }));
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Veículos');

  // Criar planilha de instruções
  const instructions = [
    ['INSTRUÇÕES PARA PREENCHIMENTO'],
    [''],
    ['CAMPOS OBRIGATÓRIOS:'],
    ['• ID: Número sequencial (001, 002, 003...)'],
    ['• Categoria: Carro ou Moto'],
    ['• Marca: Nome da marca do veículo'],
    ['• Modelo: Descrição completa (ex: C3 GLX 1.4)'],
    ['• Placa: Formato ABC-1234 ou ABC1D23'],
    ['• Ano de Fabricação: Ano que o veículo foi fabricado'],
    ['• Ano do Modelo: Ano do modelo do veículo'],
    ['• KM: Quilometragem com pontos (ex: 10.000)'],
    ['• Preço: Formato R$ 25.000,00'],
    ['• Cor: Selecionar da lista disponível'],
    ['• Status: Disponível, Vendido ou Reservado'],
    [''],
    ['ESPECIFICAÇÕES TÉCNICAS:'],
    ['• Tipo de Carroceria: Sedan, Hatch, SUV, etc.'],
    ['• Transmissão: Manual, Automática, CVT'],
    ['• Combustível: Gasolina, Álcool, Flex, Diesel, Elétrico'],
    ['• Portas: Número de portas (2, 4, 5)'],
    ['• Direção: Mecânica, Hidráulica, Elétrica'],
    [''],
    ['CARACTERÍSTICAS E OPCIONAIS:'],
    ['• Use "Sim" ou "Não" para todos os itens'],
    ['• Características Especiais: Blindado, IPVA Pago, etc.'],
    ['• Opcionais: Ar condicionado, GPS, etc.'],
    [''],
    ['OBSERVAÇÕES:'],
    ['• Não deixe células em branco nos campos obrigatórios'],
    ['• Use o formato exato especificado para cada campo'],
    ['• Mantenha a consistência nos dados']
  ];
  
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  wsInstructions['!cols'] = [{ wch: 50 }];
  
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instruções');
  
  return wb;
}

export function parseExcelFile(file: File): Promise<VehicleData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Ler a primeira planilha (Veículos)
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Pular a primeira linha (cabeçalho) e processar os dados
        const vehicles: VehicleData[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          
          // Pular linhas vazias
          if (!row || row.length === 0 || !row[0]) continue;
          
          // Função auxiliar para converter Sim/Não em boolean
          const toBool = (value: any): boolean => {
            return String(value || '').toUpperCase() === 'SIM';
          };
          
          const vehicle: VehicleData = {
            id: String(row[0]).padStart(3, '0'), // Garantir 3 dígitos (001, 002, etc)
            categoria: String(row[1] || '').trim(),
            marca: String(row[2] || '').trim(),
            modelo: String(row[3] || '').trim(),
            placa: String(row[4] || '').trim(),
            anoFabricacao: Number(row[5]) || 0,
            anoModelo: Number(row[6]) || 0,
            km: String(row[7] || '').trim(),
            preco: String(row[8] || '').trim(),
            cor: String(row[9] || '').trim(),
            status: String(row[10] || '').trim(),
            descricao: String(row[11] || '').trim(),
            
            // Especificações Técnicas
            tipoCarroceria: String(row[12] || '').trim(),
            transmissao: String(row[13] || '').trim(),
            combustivel: String(row[14] || '').trim(),
            portas: String(row[15] || '').trim(),
            direcao: String(row[16] || '').trim(),
            
            // Características Especiais
            blindado: toBool(row[17]),
            ipvaPago: toBool(row[18]),
            leilao: toBool(row[19]),
            licenciamentoEmDia: toBool(row[20]),
            
            // Opcionais
            arCondicionado: toBool(row[21]),
            direcaoHidraulica: toBool(row[22]),
            vidrosEletricos: toBool(row[23]),
            travasEletricas: toBool(row[24]),
            alarme: toBool(row[25]),
            som: toBool(row[26]),
            gps: toBool(row[27]),
            cameraRe: toBool(row[28]),
            sensorEstacionamento: toBool(row[29]),
            airbags: toBool(row[30]),
            abs: toBool(row[31]),
            controleEstabilidade: toBool(row[32]),
            controleTracao: toBool(row[33]),
            pilotoAutomatico: toBool(row[34]),
            bancoCouro: toBool(row[35]),
            rodasLigaLeve: toBool(row[36]),
            tetoSolar: toBool(row[37]),
            faroisNeblina: toBool(row[38]),
            bluetooth: toBool(row[39]),
            usb: toBool(row[40]),
            entradaAuxiliar: toBool(row[41]),
            controleVolante: toBool(row[42]),
            retrovisoresEletricos: toBool(row[43]),
            retrovisoresRetrateis: toBool(row[44])
          };
          
          // Validar dados obrigatórios
          if (vehicle.marca && vehicle.modelo && vehicle.anoFabricacao && vehicle.preco) {
            vehicles.push(vehicle);
          }
        }
        
        resolve(vehicles);
      } catch (error) {
        reject(new Error('Erro ao processar arquivo Excel: ' + error));
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
}

export function downloadExcelTemplate() {
  const wb = createExcelTemplate();
  
  // Gerar buffer do arquivo Excel
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  // Criar blob e fazer download
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'modelo-importacao-veiculos.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}