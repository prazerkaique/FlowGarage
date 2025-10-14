import type { Request, Response } from 'express';
import AWS from 'aws-sdk';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Media, Vehicle } from '../models/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuração do AWS S3 (ou compatível como MinIO)
const s3Config: AWS.S3.Types.ClientConfiguration = {
  s3ForcePathStyle: true, // Necessário para MinIO
  signatureVersion: 'v4'
};

if (process.env.AWS_ACCESS_KEY_ID) {
  s3Config.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
}
if (process.env.AWS_SECRET_ACCESS_KEY) {
  s3Config.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
}
if (process.env.S3_ENDPOINT) {
  s3Config.endpoint = process.env.S3_ENDPOINT;
}

const s3 = new AWS.S3(s3Config);

// Configuração do multer para upload temporário
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo não suportado'));
    }
  }
});

export const uploadMedia = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const garageId = req.user?.garageId;
    const files = req.files as Express.Multer.File[];

    if (!garageId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Verificar se o veículo existe e pertence à garagem
    const vehicle = await Vehicle.findOne({ 
      where: { id: vehicleId, garageId } 
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    const uploadPromises = files.map(async (file) => {
      // Determinar o tipo de mídia
      const isVideo = file.mimetype.startsWith('video/');
      const mediaType = isVideo ? 'video' : 'photo';

      // Upload para o S3
      const fileContent = fs.readFileSync(file.path);
      const params = {
        Bucket: process.env.S3_BUCKET || 'car-catalog-media',
        Key: `${garageId}/${vehicleId}/${Date.now()}-${file.originalname}`,
        Body: fileContent,
        ContentType: file.mimetype
      };

      const uploadResult = await s3.upload(params).promise();

      // Remover arquivo temporário
      fs.unlinkSync(file.path);

      // Salvar referência no banco de dados
      return Media.create({
        vehicleId,
        type: mediaType,
        url: uploadResult.Location
      });
    });

    await Promise.all(uploadPromises);

    return res.status(201).json({ message: 'Mídia(s) enviada(s) com sucesso' });
  } catch (error) {
    console.error('Erro ao fazer upload de mídia:', error);
    return res.status(500).json({ error: 'Erro ao fazer upload de mídia' });
  }
};

export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const garageId = req.user?.garageId;

    if (!garageId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Buscar a mídia e verificar se pertence a um veículo da garagem
    const media = await Media.findByPk(id, {
      include: [{
        model: Vehicle,
        where: { garageId }
      }]
    });

    if (!media) {
      return res.status(404).json({ error: 'Mídia não encontrada' });
    }

    // Extrair o Key do URL
    const urlParts = media.url.split('/');
    const key = urlParts.slice(3).join('/');

    // Remover do S3
    await s3.deleteObject({
      Bucket: process.env.S3_BUCKET || 'car-catalog-media',
      Key: key
    }).promise();

    // Remover do banco de dados
    await media.destroy();

    return res.json({ message: 'Mídia removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover mídia:', error);
    return res.status(500).json({ error: 'Erro ao remover mídia' });
  }
};