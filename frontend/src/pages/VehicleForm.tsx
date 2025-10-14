import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Switch,
  Divider,
  Stack,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Tooltip,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  CloudUpload, 
  Delete as DeleteIcon, 
  DragIndicator as DragIndicatorIcon,
  Add as AddIcon,
  CameraAlt as CameraAltIcon,
  Videocam as VideocamIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  FiberManualRecord as RecordIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';
import api from '../services/api';
import Header from '../components/Header';
import CarWheelLoader from '../components/CarWheelLoader';

interface VehicleFormData {
  category: string;
  brand: string;
  model: string;
  licensePlate: string;
  year: string | number;
  modelYear?: string | number;
  price: string | number;
  mileage: string | number;
  color: string;
  bodyType?: string;
  doors: string | number;
  transmission: string;
  steering: string;
  fuel: string;
  engine?: string;
  features: string[];
  armored: boolean;
  auction: boolean;
  status: string;
  observations?: string;
  description?: string;
  photos: File[];
  videos: File[];
  inspection: File | null;
  ipvaPaid?: boolean;
  licensingUpToDate?: boolean;
}

interface PhotoItem {
  id: string;
  file?: File;
  preview: string;
  url?: string;
  existingId?: number;
}

interface VideoItem {
  id: string;
  file?: File;
  preview: string;
  url?: string;
  existingId?: number;
}

// Lista de marcas disponíveis para autocomplete
const BRANDS = [
  'Toyota', 'Volkswagen', 'Ford', 'Chevrolet', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'BMW', 'Mercedes-Benz',
  'Audi', 'Fiat', 'Renault', 'Peugeot', 'Citroën', 'Jeep', 'Land Rover', 'Volvo', 'Subaru', 'Mazda',
  'Mitsubishi', 'Suzuki', 'Lexus', 'Infiniti', 'Acura', 'Cadillac', 'Lincoln', 'Buick', 'GMC', 'Dodge',
  'Ram', 'Chrysler', 'Jaguar', 'Porsche', 'Ferrari', 'Lamborghini', 'Maserati', 'Bentley', 'Rolls-Royce',
  'Aston Martin', 'McLaren', 'Bugatti', 'Koenigsegg', 'Pagani', 'Lotus', 'Morgan', 'Caterham', 'Ariel',
  'BAC', 'Noble', 'Ginetta', 'TVR', 'Westfield', 'Radical', 'Caparo', 'Ultima', 'Ascari', 'Gumpert',
  'Spyker', 'Wiesmann', 'Artega', 'Melkus', 'Gillet', 'Donkervoort', 'Arash', 'Zenvo',
  'Rimac', 'Pininfarina', 'De Tomaso', 'Lancia', 'Alfa Romeo', 'Ducati', 'Aprilia', 'MV Agusta', 
  'Benelli', 'Bimota', 'Cagiva', 'Husqvarna', 'KTM', 'Sherco', 'Gas Gas', 'Beta', 'Montesa', 
  'Scorpa', 'Ossa', 'Bultaco', 'Derbi', 'Rieju', 'Puch', 'Zündapp', 'Kreidler', 'Hercules', 
  'Sachs', 'DKW', 'MZ', 'Simson', 'Jawa', 'ČZ', 'Babetta', 'Velorex', 'Tatra', 'Škoda', 
  'Dacia', 'ARO', 'Oltcit', 'Roman', 'Bucegi', 'Carpați', 'Ford Romania', 'Renault Romania', 
  'Automobile Craiova', 'Daewoo', 'SsangYong', 'Tata', 'Mahindra', 'Bajaj', 'TVS', 'Hero', 
  'Royal Enfield', 'Yamaha', 'Kawasaki'
];

const VehicleForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<VehicleFormData>({
    category: 'Carro',
    brand: '',
    model: '',
    licensePlate: '',
    year: '',
    modelYear: '',
    price: '',
    mileage: '',
    color: '',
    bodyType: '',
    doors: 4,
    transmission: 'manual',
    steering: 'hidraulica',
    fuel: 'flex',
    engine: '',
    features: [],
    armored: false,
    auction: false,
    status: 'Disponível',
    observations: '',
    description: '',
    photos: [],
    videos: [],
    inspection: null,
    ipvaPaid: false,
    licensingUpToDate: false
  });

  const [photoItems, setPhotoItems] = useState<PhotoItem[]>([]);
  const [videoItems, setVideoItems] = useState<VideoItem[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [customOptional, setCustomOptional] = useState<string>('');
  const [generatingDescription, setGeneratingDescription] = useState<boolean>(false);
  
  // Estados para o modal de câmera
  const [cameraModalOpen, setCameraModalOpen] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Estados para o modal de vídeo
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRecordRef = useRef<HTMLVideoElement>(null);

  // Carregar dados do veículo se estiver editando
  useEffect(() => {
    if (isEditing && id) {
      loadVehicleData(id);
    }
  }, [isEditing, id]);

  const loadVehicleData = async (vehicleId: string) => {
    try {
      setLoading(true);
      console.log('Carregando dados do veículo ID:', vehicleId);
      const response = await api.get(`/vehicles/${vehicleId}`);
      console.log('Resposta da API:', response.data);
      const vehicle = response.data;
      
      setFormData({
        category: vehicle.category || 'Carro',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        licensePlate: vehicle.licensePlate || '',
        year: vehicle.year?.toString() || '',
        modelYear: vehicle.modelYear?.toString() || '',
        price: vehicle.price?.toString() || '',
        color: vehicle.color || '',
        mileage: vehicle.mileage?.toString() || '',
        description: vehicle.description || '',
        bodyType: vehicle.bodyType || '',
        doors: vehicle.doors?.toString() || '',
        transmission: vehicle.transmission || '',
        steering: vehicle.steering || '',
        fuel: vehicle.fuel || '',
        engine: vehicle.engine || '',
        features: Array.isArray(vehicle.optionalFeatures) ? vehicle.optionalFeatures : [],
        armored: vehicle.armored || false,
        auction: vehicle.auction || false,
        ipvaPaid: vehicle.ipvaPaid || false,
        licensingUpToDate: vehicle.licensingUpToDate || false,
        photos: [],
        videos: [],
        inspection: null,
        status: vehicle.status || 'Disponível'
      });

      // Carregar fotos existentes
      if (vehicle.media?.photos?.length > 0) {
        console.log('Carregando fotos existentes:', vehicle.media.photos);
        const existingPhotos: PhotoItem[] = vehicle.media.photos.map((photoUrl: string, index: number) => ({
          id: `existing-${index}`,
          preview: `http://localhost:3001${photoUrl}`,
          url: `http://localhost:3001${photoUrl}`,
          existingId: index
        }));
        console.log('PhotoItems criados:', existingPhotos);
        setPhotoItems(existingPhotos);
      } else {
        console.log('Nenhuma foto encontrada ou estrutura inválida:', vehicle.media);
      }

      // Carregar vídeos existentes
      if (vehicle.media && vehicle.media.videos && vehicle.media.videos.length > 0) {
        const existingVideos: VideoItem[] = vehicle.media.videos.map((videoUrl: string, index: number) => ({
          id: `existing-video-${index}`,
          preview: `http://localhost:3001${videoUrl}`,
          url: `http://localhost:3001${videoUrl}`,
          existingId: index
        }));
        setVideoItems(existingVideos);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do veículo:', error);
      setError('Erro ao carregar dados do veículo');
    } finally {
      setLoading(false);
    }
  };

  // Converter arquivo para base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const formatNumber = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    // Adiciona pontos como separadores de milhares
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const formatPrice = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue === '') return '';
    
    // Converte para número e divide por 100 para ter centavos
    const numberValue = parseInt(numericValue) / 100;
    
    // Formata com vírgula para centavos e pontos para milhares
    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const parsePriceToNumber = (value: string) => {
    // Remove pontos e vírgulas, converte para número
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const parseNumber = (value: string) => {
    // Remove os pontos para obter o valor numérico
    return value.replace(/\./g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Formatação especial para preço
    if (name === 'price') {
      const formattedValue = formatPrice(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } 
    // Formatação especial para quilometragem
    else if (name === 'mileage') {
      const formattedValue = formatNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleFeatureChange = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: Array.isArray(prev.features) && prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...(Array.isArray(prev.features) ? prev.features : []), feature]
    }));
  };

  const handleAddCustomOptional = () => {
    if (customOptional.trim() && !(Array.isArray(formData.features) && formData.features.includes(customOptional.trim()))) {
      setFormData(prev => ({
        ...prev,
        features: [...(Array.isArray(prev.features) ? prev.features : []), customOptional.trim()]
      }));
      setCustomOptional('');
    }
  };

  // Função para abrir modal de câmera
  const openCameraModal = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setCameraStream(stream);
      setCameraModalOpen(true);
      
      // Aguardar o modal abrir e então conectar o stream ao vídeo
      setTimeout(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setError('Erro ao acessar a câmera. Verifique as permissões do navegador.');
    }
  };

  // Função para fechar modal de câmera
  const closeCameraModal = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraModalOpen(false);
  };

  // Função para capturar foto do modal
  const capturePhotoFromModal = () => {
    if (!videoRef.current || !cameraStream) return;

    try {
      // Criar canvas para capturar a imagem
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      
      if (ctx && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Converter canvas para blob
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
            const newPhotoItem: PhotoItem = {
              id: `camera-${Date.now()}`,
              file,
              preview: URL.createObjectURL(file)
            };
            
            setPhotoItems(prev => [...prev, newPhotoItem]);
            setFormData(prev => ({
              ...prev,
              photos: [...prev.photos, file]
            }));
            
            // Fechar modal após capturar
            closeCameraModal();
            setError(''); // Limpar qualquer erro anterior
          }
        }, 'image/jpeg', 0.9);
      } else {
        throw new Error('Não foi possível capturar a imagem da câmera');
      }
      
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
      setError('Erro ao capturar foto. Tente novamente.');
    }
  };

  // Função para capturar foto da câmera (versão antiga - manter para compatibilidade)
  const capturePhoto = async () => {
    // Agora apenas abre o modal
    await openCameraModal();
  };

  // Função para gravar vídeo da câmera
  const captureVideo = async () => {
    // Agora abre o modal de vídeo
    await openVideoModal();
  };

  // Função para abrir modal de vídeo
  const openVideoModal = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });
      
      setVideoStream(stream);
      setVideoModalOpen(true);
      
      // Aguardar o modal abrir e então conectar o stream ao vídeo
      setTimeout(() => {
        if (videoRecordRef.current && stream) {
          videoRecordRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error('Erro ao acessar câmera para vídeo:', error);
      setError('Erro ao acessar a câmera para vídeo. Verifique as permissões do navegador.');
    }
  };

  // Função para fechar modal de vídeo
  const closeVideoModal = () => {
    if (isRecording && mediaRecorder) {
      stopRecording();
    }
    
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    
    setVideoModalOpen(false);
    setIsRecording(false);
    setRecordingTime(0);
    setMediaRecorder(null);
    setIsMuted(true); // Reset mute state
  };

  // Função para alternar mute/unmute
  const toggleMute = () => {
    if (videoRecordRef.current) {
      videoRecordRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Função para iniciar gravação
  const startRecording = () => {
    if (!videoStream) return;

    try {
      const recorder = new MediaRecorder(videoStream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const file = new File([blob], `video-${Date.now()}.mp4`, { type: 'video/mp4' });
        const newVideoItem: VideoItem = {
          id: `camera-video-${Date.now()}`,
          file,
          preview: URL.createObjectURL(file)
        };
        
        setVideoItems(prev => [...prev, newVideoItem]);
        setFormData(prev => ({
          ...prev,
          videos: [...prev.videos, file]
        }));
        
        // Fechar modal após gravar
        closeVideoModal();
        setError(''); // Limpar qualquer erro anterior
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Iniciar contador de tempo
      const timer = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Parar gravação automaticamente após 30 segundos
          if (newTime >= 30) {
            clearInterval(timer);
            if (recorder.state === 'recording') {
              recorder.stop();
            }
          }
          return newTime;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      setError('Erro ao iniciar gravação de vídeo.');
    }
  };

  // Função para parar gravação
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photos' | 'videos' | 'inspection') => {
    const files = e.target.files;
    if (files) {
      if (type === 'photos') {
        const newPhotoItems: PhotoItem[] = Array.from(files).map((file, index) => ({
          id: `new-${Date.now()}-${index}`,
          file,
          preview: URL.createObjectURL(file)
        }));
        
        // Verificar duplicatas baseado no nome e tamanho do arquivo
        const existingFiles = photoItems
          .filter(item => item.file) // Apenas fotos novas têm file
          .map(item => `${item.file!.name}-${item.file!.size}`);
        const uniqueNewItems = newPhotoItems.filter(item => 
          !existingFiles.includes(`${item.file!.name}-${item.file!.size}`)
        );
        
        if (uniqueNewItems.length !== newPhotoItems.length) {
          setError('Algumas fotos já foram adicionadas e foram ignoradas para evitar duplicatas.');
        }
        
        setPhotoItems(prev => [...prev, ...uniqueNewItems]);
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, ...uniqueNewItems.map(item => item.file!)]
        }));
      } else if (type === 'videos') {
        const newVideoItems: VideoItem[] = Array.from(files).map((file, index) => ({
          id: `new-video-${Date.now()}-${index}`,
          file,
          preview: URL.createObjectURL(file)
        }));
        
        // Verificar duplicatas baseado no nome e tamanho do arquivo
        const existingFiles = videoItems
          .filter(item => item.file) // Apenas vídeos novos têm file
          .map(item => `${item.file!.name}-${item.file!.size}`);
        const uniqueNewItems = newVideoItems.filter(item => 
          !existingFiles.includes(`${item.file!.name}-${item.file!.size}`)
        );
        
        if (uniqueNewItems.length !== newVideoItems.length) {
          setError('Alguns vídeos já foram adicionados e foram ignorados para evitar duplicatas.');
        }
        
        setVideoItems(prev => [...prev, ...uniqueNewItems]);
        setFormData(prev => ({
          ...prev,
          videos: [...prev.videos, ...uniqueNewItems.map(item => item.file!)]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          inspection: files[0] || null
        } as VehicleFormData));
      }
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess(false);
  };

  // Função para remover foto
  const removePhoto = (photoId: string) => {
    const photoToRemove = photoItems.find(item => item.id === photoId);
    if (photoToRemove && photoToRemove.file) {
      URL.revokeObjectURL(photoToRemove.preview); // Limpar URL do preview apenas para fotos novas
    }
    
    setPhotoItems(prev => prev.filter(item => item.id !== photoId));
    
    // Atualizar formData apenas com fotos novas (que têm file)
    const remainingPhotos = photoItems
      .filter(item => item.id !== photoId && item.file)
      .map(item => item.file!);
    
    setFormData(prev => ({
      ...prev,
      photos: remainingPhotos
    }));
  };

  // Função para remover vídeo
  const removeVideo = (videoId: string) => {
    const videoToRemove = videoItems.find(item => item.id === videoId);
    if (videoToRemove && videoToRemove.file) {
      URL.revokeObjectURL(videoToRemove.preview); // Limpar URL do preview apenas para vídeos novos
    }
    
    setVideoItems(prev => prev.filter(item => item.id !== videoId));
    
    // Atualizar formData apenas com vídeos novos (que têm file)
    const remainingVideos = videoItems
      .filter(item => item.id !== videoId && item.file)
      .map(item => item.file!);
    
    setFormData(prev => ({
      ...prev,
      videos: remainingVideos
    }));
  };

  // Função para reordenar fotos com drag & drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    
    if (startIndex === endIndex) return;
    
    if (result.source.droppableId === 'photos') {
      reorderPhotos(startIndex, endIndex);
    } else if (result.source.droppableId === 'videos') {
      reorderVideos(startIndex, endIndex);
    }
  };

  // Função para reordenar fotos
  const reorderPhotos = (startIndex: number, endIndex: number) => {
    const result = Array.from(photoItems);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    setPhotoItems(result);
    
    // Atualizar formData apenas com fotos novas (que têm file)
    const newPhotos = result.filter(item => item.file).map(item => item.file!);
    setFormData(prev => ({
      ...prev,
      photos: newPhotos
    }));
  };

  // Função para reordenar vídeos
  const reorderVideos = (startIndex: number, endIndex: number) => {
    const result = Array.from(videoItems);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    setVideoItems(result);
    
    // Atualizar formData apenas com vídeos novos (que têm file)
    const newVideos = result.filter(item => item.file).map(item => item.file!);
    setFormData(prev => ({
      ...prev,
      videos: newVideos
    }));
  };

  // Função para mover foto para cima
  const movePhotoUp = (index: number) => {
    if (index > 0) {
      reorderPhotos(index, index - 1);
    }
  };

  // Função para mover foto para baixo
  const movePhotoDown = (index: number) => {
    if (index < photoItems.length - 1) {
      reorderPhotos(index, index + 1);
    }
  };

  // Função para mover vídeo para cima
  const moveVideoUp = (index: number) => {
    if (index > 0) {
      reorderVideos(index, index - 1);
    }
  };

  // Função para mover vídeo para baixo
  const moveVideoDown = (index: number) => {
    if (index < videoItems.length - 1) {
      reorderVideos(index, index + 1);
    }
  };

  // Função para gerar descrição com IA
  const generateAIDescription = async () => {
    try {
      setGeneratingDescription(true);
      
      // Preparar dados do veículo para a IA
      const vehicleData = {
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        fuel: formData.fuel,
        transmission: formData.transmission,
        mileage: formData.mileage,
        doors: formData.doors,
        features: formData.features,
        armored: formData.armored,
        auction: formData.auction
      };

      // Simular chamada para API de IA (pode ser OpenAI, Claude, etc.)
      // Por enquanto, vamos criar uma descrição baseada nos dados
      const description = generateDescriptionFromData(vehicleData);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setFormData(prev => ({
        ...prev,
        description: description
      }));
      
      // Mostrar mensagem de sucesso
      setError('Descrição gerada com sucesso!');
      setSuccess(true);
      
    } catch (err) {
      console.error('Erro ao gerar descrição:', err);
      setError('Erro ao gerar descrição. Tente novamente.');
    } finally {
      setGeneratingDescription(false);
    }
  };

  // Base de dados de características por marca e modelo
  const getVehicleProfile = (brand: string, model: string, category: string) => {
    const profiles: any = {
      // SUVs e Utilitários - Ideal para famílias
      'SUV': {
        targetAudience: 'famílias com filhos',
        benefits: ['espaço interno generoso', 'porta-malas amplo', 'posição de dirigir elevada', 'segurança para toda família'],
        lifestyle: 'Perfeito para viagens em família, passeios de fim de semana e o dia a dia urbano com conforto e praticidade.'
      },
      // Sedans - Versatilidade
      'Sedan': {
        targetAudience: 'executivos e famílias',
        benefits: ['conforto refinado', 'porta-malas espaçoso', 'economia de combustível', 'design elegante'],
        lifestyle: 'Ideal para quem busca sofisticação no dia a dia, viagens confortáveis e economia sem abrir mão do estilo.'
      },
      // Hatchbacks - Jovens e urbanos
      'Hatchback': {
        targetAudience: 'jovens e casais urbanos',
        benefits: ['agilidade no trânsito', 'facilidade para estacionar', 'economia de combustível', 'design moderno'],
        lifestyle: 'Perfeito para a vida urbana, primeiro carro ou para quem valoriza praticidade e economia no dia a dia.'
      },
      // Pickups - Trabalho e aventura
      'Pickup': {
        targetAudience: 'empreendedores e aventureiros',
        benefits: ['capacidade de carga', 'robustez', 'versatilidade', 'design imponente'],
        lifestyle: 'Ideal para trabalho, aventuras off-road e para quem precisa de um veículo que une utilidade e estilo.'
      }
    };

    // Características específicas por marca
    const brandQualities: any = {
      'Toyota': ['confiabilidade lendária', 'baixo custo de manutenção', 'alta durabilidade'],
      'Honda': ['tecnologia avançada', 'eficiência energética', 'design inteligente'],
      'Volkswagen': ['engenharia alemã', 'segurança superior', 'acabamento refinado'],
      'Ford': ['performance robusta', 'tecnologia americana', 'versatilidade comprovada'],
      'Chevrolet': ['tradição brasileira', 'peças acessíveis', 'rede de assistência ampla'],
      'Hyundai': ['garantia estendida', 'tecnologia moderna', 'custo-benefício excepcional'],
      'BMW': ['luxo premium', 'performance esportiva', 'status diferenciado'],
      'Mercedes-Benz': ['elegância suprema', 'conforto incomparável', 'prestígio mundial'],
      'Audi': ['design sofisticado', 'tecnologia de ponta', 'dirigibilidade superior']
    };

    return {
      profile: profiles[category] || profiles['Sedan'],
      brandQualities: brandQualities[brand] || ['qualidade reconhecida', 'boa procedência', 'excelente opção']
    };
  };

  // Função auxiliar para gerar descrição baseada nos dados - VERSÃO MELHORADA
  const generateDescriptionFromData = (data: any) => {
    const vehicleInfo = getVehicleProfile(data.brand, data.model, data.category);
    const profile = vehicleInfo.profile;
    const brandQualities = vehicleInfo.brandQualities;

    // Início atrativo
    let description = `🚗 **${data.brand} ${data.model} ${data.year}** - Uma excelente escolha para ${profile.targetAudience}!\n\n`;
    
    // Características técnicas de forma atrativa
    description += `Este ${data.brand} ${data.model}`;
    if (data.color) {
      description += ` na elegante cor ${data.color.toLowerCase()}`;
    }
    
    description += ` combina`;
    if (data.fuel) {
      description += ` motor ${data.fuel.toLowerCase()} eficiente`;
    }
    if (data.transmission) {
      description += ` com câmbio ${data.transmission.toLowerCase()} suave`;
    }
    description += `.`;
    
    // Quilometragem de forma positiva
    if (data.mileage) {
      const km = Number(data.mileage);
      if (km < 30000) {
        description += ` Com apenas ${km.toLocaleString('pt-BR')} km, está praticamente novo!`;
      } else if (km < 80000) {
        description += ` Com ${km.toLocaleString('pt-BR')} km bem conservados, ainda tem muito a oferecer!`;
      } else {
        description += ` Com ${km.toLocaleString('pt-BR')} km de experiência comprovada na estrada!`;
      }
    }
    
    // Benefícios específicos do perfil
    description += `\n\n✨ **Por que escolher este veículo?**\n`;
    profile.benefits.forEach((benefit: string, index: number) => {
      description += `${index + 1}. ${benefit.charAt(0).toUpperCase() + benefit.slice(1)}\n`;
    });
    
    // Qualidades da marca
    description += `\n🏆 **Qualidades ${data.brand}:**\n`;
    brandQualities.forEach((quality: string, index: number) => {
      description += `• ${quality.charAt(0).toUpperCase() + quality.slice(1)}\n`;
    });
    
    // Opcionais de forma atrativa
    if (data.features && data.features.length > 0) {
      description += `\n🎯 **Opcionais que fazem a diferença:**\n`;
      data.features.slice(0, 4).forEach((feature: string) => {
        description += `• ${feature}\n`;
      });
    }
    
    // Características especiais
    if (data.armored) {
      description += `\n🛡️ **Segurança Blindada** - Proteção máxima para você e sua família!\n`;
    }
    
    // Lifestyle e público-alvo
    description += `\n💫 **Estilo de Vida:** ${profile.lifestyle}\n`;
    
    // Call to action final
    description += `\n🔥 **Não perca esta oportunidade!** Este ${data.brand} ${data.model} está esperando por você. Agende já sua visita e sinta a diferença de dirigir um veículo de qualidade!\n\n`;
    description += `💰 **Financiamento facilitado** | 🔄 **Aceita troca** | 📞 **Entre em contato agora!**`;
    
    return description;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      
      // Adicionar dados básicos
      formDataToSend.append('category', formData.category);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('year', formData.year.toString());
      formDataToSend.append('modelYear', formData.modelYear?.toString() || '');
      formDataToSend.append('price', parseNumber(formData.price.toString()));
      formDataToSend.append('mileage', parseNumber(formData.mileage.toString()));
      formDataToSend.append('color', formData.color);
      formDataToSend.append('bodyType', formData.bodyType || '');
      formDataToSend.append('doors', formData.doors.toString());
      formDataToSend.append('transmission', formData.transmission);
      formDataToSend.append('steering', formData.steering);
      formDataToSend.append('fuel', formData.fuel);
      formDataToSend.append('armored', formData.armored.toString());
      formDataToSend.append('auction', formData.auction.toString());
      formDataToSend.append('status', formData.status);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('ipvaPaid', formData.ipvaPaid?.toString() || 'false');
      formDataToSend.append('licensingUpToDate', formData.licensingUpToDate?.toString() || 'false');
      
      // Adicionar características opcionais
      formData.features.forEach(feature => {
        formDataToSend.append('optionalFeatures', feature);
      });
      
      // Adicionar fotos novas
      formData.photos.forEach((photo, index) => {
        formDataToSend.append(`photos`, photo);
      });
      
      // Adicionar informações sobre ordem das fotos existentes
      if (isEditing) {
        const existingPhotosUrls = photoItems
          .filter(item => !item.file && item.url) // Apenas fotos existentes
          .map(item => item.url!.replace('http://localhost:3001', '')); // Remove o prefixo da URL
        
        if (existingPhotosUrls.length > 0) {
          formDataToSend.append('existingPhotosOrder', JSON.stringify(existingPhotosUrls));
        }
      }
      
      // Adicionar vídeos novas
      formData.videos.forEach((video, index) => {
        formDataToSend.append(`videos`, video);
      });
      
      // Adicionar informações sobre ordem dos vídeos existentes
      if (isEditing) {
        const existingVideosUrls = videoItems
          .filter(item => !item.file && item.url) // Apenas vídeos existentes
          .map(item => item.url!.replace('http://localhost:3001', '')); // Remove o prefixo da URL
        
        if (existingVideosUrls.length > 0) {
          formDataToSend.append('existingVideosOrder', JSON.stringify(existingVideosUrls));
        }
      }
      
      // Adicionar inspeção
      if (formData.inspection) {
        formDataToSend.append('inspection', formData.inspection);
      }

      let response;
      if (isEditing) {
        response = await api.put(`/vehicles/${id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await api.post('/vehicles', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/vehicles');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro ao salvar veículo:', error);
      setError(error.response?.data?.message || 'Erro ao salvar veículo');
    } finally {
      setLoading(false);
    }
  };

  const availableFeatures = [
    'Ar condicionado',
    'Direção hidráulica (ou elétrica)',
    'Vidros elétricos',
    'Travas elétricas',
    'Alarme',
    'Som',
    'GPS',
    'Câmera de ré',
    'Sensor de estacionamento',
    'Airbags',
    'ABS',
    'Controle de estabilidade',
    'Controle de tração',
    'Piloto automático',
    'Banco de couro',
    'Rodas de liga leve',
    'Teto solar',
    'Faróis de neblina',
    'Bluetooth',
    'USB',
    'Entrada auxiliar',
    'Controle no volante',
    'Retrovisor elétrico',
    'Retrovisor retrátil'
  ];

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ 
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 }
      }}>
        <Paper elevation={3} sx={{ 
          p: { xs: 2, sm: 4 }
        }}>
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2.125rem' },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            {isEditing ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
          </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={{ xs: 2, sm: 3 }}>
            {/* Informações Básicas */}
            <Typography 
              variant="h6"
              sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                fontWeight: 600
              }}
            >
              Informações Básicas
            </Typography>
            
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Categoria
                  </InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleSelectChange}
                    label="Categoria"
                    sx={{
                      '& .MuiSelect-select': {
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }
                    }}
                  >
                    <MenuItem value="Carro">Carro</MenuItem>
                    <MenuItem value="Moto">Moto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={BRANDS}
                  value={formData.brand}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      brand: newValue || ''
                    }));
                  }}
                  onInputChange={(event, newInputValue) => {
                    setFormData(prev => ({
                      ...prev,
                      brand: newInputValue
                    }));
                  }}
                  freeSolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Marca"
                      required
                      fullWidth
                      sx={{
                        '& .MuiInputBase-root': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Modelo"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  placeholder="Ex: BMW X6 4.4 M 4X4 V8 32V BI-TURBO"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* Informações do Veículo */}
            <Typography variant="h6">Informações do Veículo</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Placa"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ano"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ano do Modelo"
                  name="modelYear"
                  type="number"
                  value={formData.modelYear}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Preço"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quilometragem"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Cor</InputLabel>
                  <Select
                    name="color"
                    value={formData.color}
                    onChange={handleSelectChange}
                    label="Cor"
                  >
                    <MenuItem value="Branco">Branco</MenuItem>
                    <MenuItem value="Preto">Preto</MenuItem>
                    <MenuItem value="Prata">Prata</MenuItem>
                    <MenuItem value="Cinza">Cinza</MenuItem>
                    <MenuItem value="Azul">Azul</MenuItem>
                    <MenuItem value="Vermelho">Vermelho</MenuItem>
                    <MenuItem value="Verde">Verde</MenuItem>
                    <MenuItem value="Amarelo">Amarelo</MenuItem>
                    <MenuItem value="Bege">Bege</MenuItem>
                    <MenuItem value="Marrom">Marrom</MenuItem>
                    <MenuItem value="Dourado">Dourado</MenuItem>
                    <MenuItem value="Bronze">Bronze</MenuItem>
                    <MenuItem value="Rosa">Rosa</MenuItem>
                    <MenuItem value="Roxo">Roxo</MenuItem>
                    <MenuItem value="Laranja">Laranja</MenuItem>
                    <MenuItem value="Vinho">Vinho</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleSelectChange}
                    label="Status"
                  >
                    <MenuItem value="Disponível">Disponível</MenuItem>
                    <MenuItem value="Vendido">Vendido</MenuItem>
                    <MenuItem value="Reservado">Reservado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Especificações Técnicas */}
            <Typography variant="h6">Especificações Técnicas</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Carroceria</InputLabel>
                  <Select
                    name="bodyType"
                    value={formData.bodyType}
                    onChange={handleSelectChange}
                    label="Tipo de Carroceria"
                  >
                    <MenuItem value="Sedan">Sedan</MenuItem>
                    <MenuItem value="Hatchback">Hatchback</MenuItem>
                    <MenuItem value="SUV">SUV</MenuItem>
                    <MenuItem value="Pickup">Pickup</MenuItem>
                    <MenuItem value="Conversível">Conversível</MenuItem>
                    <MenuItem value="Wagon">Wagon</MenuItem>
                    <MenuItem value="Coupé">Coupé</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Número de Portas"
                  name="doors"
                  type="number"
                  value={formData.doors}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Transmissão</InputLabel>
                  <Select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleSelectChange}
                    label="Transmissão"
                  >
                    <MenuItem value="manual">Manual</MenuItem>
                    <MenuItem value="automatica">Automática</MenuItem>
                    <MenuItem value="cvt">CVT</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Direção</InputLabel>
                  <Select
                    name="steering"
                    value={formData.steering}
                    onChange={handleSelectChange}
                    label="Direção"
                  >
                    <MenuItem value="hidraulica">Hidráulica</MenuItem>
                    <MenuItem value="eletrica">Elétrica</MenuItem>
                    <MenuItem value="mecanica">Mecânica</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Combustível</InputLabel>
                  <Select
                    name="fuel"
                    value={formData.fuel}
                    onChange={handleSelectChange}
                    label="Combustível"
                  >
                    <MenuItem value="flex">Flex</MenuItem>
                    <MenuItem value="gasolina">Gasolina</MenuItem>
                    <MenuItem value="etanol">Etanol</MenuItem>
                    <MenuItem value="diesel">Diesel</MenuItem>
                    <MenuItem value="eletrico">Elétrico</MenuItem>
                    <MenuItem value="hibrido">Híbrido</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Motor</InputLabel>
                  <Select
                    name="engine"
                    value={formData.engine}
                    onChange={handleSelectChange}
                    label="Motor"
                  >
                    <MenuItem value="1.0">1.0</MenuItem>
                    <MenuItem value="1.2">1.2</MenuItem>
                    <MenuItem value="1.3">1.3</MenuItem>
                    <MenuItem value="1.4">1.4</MenuItem>
                    <MenuItem value="1.5">1.5</MenuItem>
                    <MenuItem value="1.6">1.6</MenuItem>
                    <MenuItem value="1.7">1.7</MenuItem>
                    <MenuItem value="1.8">1.8</MenuItem>
                    <MenuItem value="1.9">1.9</MenuItem>
                    <MenuItem value="2.0 - 2.9">2.0 - 2.9</MenuItem>
                    <MenuItem value="3.0 - 3.9">3.0 - 3.9</MenuItem>
                    <MenuItem value="4.0 ou mais">4.0 ou mais</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Características Especiais */}
            <Typography variant="h6">Características Especiais</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="armored"
                      checked={formData.armored}
                      onChange={handleSwitchChange}
                    />
                  }
                  label="Blindado"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="auction"
                      checked={formData.auction}
                      onChange={handleSwitchChange}
                    />
                  }
                  label="Leilão"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="ipvaPaid"
                      checked={formData.ipvaPaid}
                      onChange={handleSwitchChange}
                    />
                  }
                  label="IPVA Pago"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="licensingUpToDate"
                      checked={formData.licensingUpToDate}
                      onChange={handleSwitchChange}
                    />
                  }
                  label="Licenciamento em Dia"
                />
              </Grid>
            </Grid>

            {/* Opcionais */}
            <Typography variant="h6">Opcionais</Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Adicionar opcional personalizado"
                value={customOptional}
                onChange={(e) => setCustomOptional(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomOptional();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={handleAddCustomOptional}
                      disabled={!customOptional.trim()}
                      size="small"
                      variant="contained"
                      sx={{ ml: 1 }}
                    >
                      Adicionar
                    </Button>
                  )
                }}
              />
            </Box>
            <FormGroup>
              <Box sx={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                p: 2
              }}>
                <Grid container spacing={1}>
                  {availableFeatures.map((feature) => (
                    <Grid item xs={12} sm={6} md={4} key={feature}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.features.includes(feature)}
                            onChange={() => handleFeatureChange(feature)}
                          />
                        }
                        label={feature}
                      />
                    </Grid>
                  ))}
                  {/* Opcionais personalizados */}
                  {formData.features
                    .filter(feature => !availableFeatures.includes(feature))
                    .map((feature) => (
                      <Grid item xs={12} sm={6} md={4} key={feature}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={true}
                              onChange={() => handleFeatureChange(feature)}
                            />
                          }
                          label={`${feature} (personalizado)`}
                        />
                      </Grid>
                    ))}
                </Grid>
              </Box>
            </FormGroup>

            {/* Descrição */}
            <Typography variant="h6">Descrição</Typography>
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                label="Descrição do Veículo"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                multiline
                rows={4}
                placeholder="Descreva as características, condições e diferenciais do veículo..."
              />
              <Box sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: 0.5
              }}>
                <Tooltip title="Gerar descrição com IA">
                  <IconButton
                    onClick={generateAIDescription}
                    disabled={generatingDescription || !formData.brand || !formData.model}
                    color="primary"
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
                    }}
                  >
                    <AutoAwesomeIcon />
                  </IconButton>
                </Tooltip>
                {generatingDescription && (
                  <Typography variant="caption" color="primary" sx={{ fontSize: '0.7rem' }}>
                    Gerando...
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Upload de Fotos */}
            <Typography variant="h6">Fotos do Veículo</Typography>
            <Box>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload"
                  multiple
                  type="file"
                  onChange={(e) => handleFileChange(e, 'photos')}
                />
                <label htmlFor="photo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                  >
                    Adicionar Fotos
                  </Button>
                </label>
                
                <Button
                  variant="outlined"
                  onClick={capturePhoto}
                  startIcon={<CameraAltIcon />}
                  color="secondary"
                >
                  Tirar Foto
                </Button>
              </Stack>
              
              {photoItems.length > 0 && (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="photos" direction="horizontal">
                    {(provided) => (
                      <Box
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 2,
                          mt: 2
                        }}
                      >
                        {photoItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                sx={{
                                  width: 200,
                                  position: 'relative',
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                  transform: snapshot.isDragging ? 'rotate(5deg)' : 'none'
                                }}
                              >
                                <CardMedia
                                  component="img"
                                  height="150"
                                  image={item.preview}
                                  alt={`Foto ${index + 1}`}
                                />
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    display: 'flex',
                                    gap: 1
                                  }}
                                >
                                  <Tooltip title="Arrastar para reordenar">
                                    <IconButton
                                      {...provided.dragHandleProps}
                                      size="small"
                                      sx={{
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        '&:hover': {
                                          backgroundColor: 'rgba(0,0,0,0.7)'
                                        }
                                      }}
                                    >
                                      <DragIndicatorIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Remover foto">
                                    <IconButton
                                      onClick={() => removePhoto(item.id)}
                                      size="small"
                                      sx={{
                                        backgroundColor: 'rgba(255,0,0,0.7)',
                                        color: 'white',
                                        '&:hover': {
                                          backgroundColor: 'rgba(255,0,0,0.9)'
                                        }
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    position: 'absolute',
                                    bottom: 8,
                                    left: 8,
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    px: 1,
                                    borderRadius: 1
                                  }}
                                >
                                  {index + 1}
                                </Typography>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </Box>

            {/* Upload de Vídeos */}
            <Typography variant="h6">Vídeos do Veículo</Typography>
            <Box>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <input
                  accept="video/*"
                  style={{ display: 'none' }}
                  id="video-upload"
                  multiple
                  type="file"
                  onChange={(e) => handleFileChange(e, 'videos')}
                />
                <label htmlFor="video-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                  >
                    Adicionar Vídeos
                  </Button>
                </label>
                
                <Button
                  variant="outlined"
                  onClick={captureVideo}
                  startIcon={<VideocamIcon />}
                  color="secondary"
                >
                  Gravar Vídeo
                </Button>
              </Stack>
              
              {videoItems.length > 0 && (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="videos" direction="horizontal">
                    {(provided) => (
                      <Box
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 2,
                          mt: 2
                        }}
                      >
                        {videoItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                sx={{
                                  width: 200,
                                  position: 'relative',
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                  transform: snapshot.isDragging ? 'rotate(5deg)' : 'none'
                                }}
                              >
                                <video
                                  width="200"
                                  height="150"
                                  controls
                                  style={{ objectFit: 'cover' }}
                                >
                                  <source src={item.preview} type="video/mp4" />
                                  Seu navegador não suporta o elemento de vídeo.
                                </video>
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    display: 'flex',
                                    gap: 1
                                  }}
                                >
                                  <Tooltip title="Arrastar para reordenar">
                                    <IconButton
                                      {...provided.dragHandleProps}
                                      size="small"
                                      sx={{
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        '&:hover': {
                                          backgroundColor: 'rgba(0,0,0,0.7)'
                                        }
                                      }}
                                    >
                                      <DragIndicatorIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Remover vídeo">
                                    <IconButton
                                      onClick={() => removeVideo(item.id)}
                                      size="small"
                                      sx={{
                                        backgroundColor: 'rgba(255,0,0,0.7)',
                                        color: 'white',
                                        '&:hover': {
                                          backgroundColor: 'rgba(255,0,0,0.9)'
                                        }
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    position: 'absolute',
                                    bottom: 8,
                                    left: 8,
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    px: 1,
                                    borderRadius: 1
                                  }}
                                >
                                  {index + 1}
                                </Typography>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </Box>

            {/* Upload de Inspeção */}
            <Typography 
              variant="h6"
              sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                fontWeight: 600
              }}
            >
              Laudo de Inspeção
            </Typography>
            <Box>
              <input
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                id="inspection-upload"
                type="file"
                onChange={(e) => handleFileChange(e, 'inspection')}
              />
              <label htmlFor="inspection-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 2, sm: 3 }
                  }}
                >
                  {formData.inspection ? 'Alterar Laudo' : 'Adicionar Laudo de Inspeção'}
                </Button>
              </label>
              {formData.inspection && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  Arquivo selecionado: {formData.inspection.name}
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Botões de Ação */}
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1.5, sm: 2 }, 
              justifyContent: { xs: 'stretch', sm: 'flex-end' },
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/vehicles')}
                disabled={loading}
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  py: { xs: 1.5, sm: 1 },
                  order: { xs: 2, sm: 1 }
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CarWheelLoader size={20} showText={false} /> : undefined}
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  py: { xs: 1.5, sm: 1 },
                  order: { xs: 1, sm: 2 }
                }}
              >
                {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Cadastrar')}
              </Button>
            </Box>
          </Stack>
        </Box>
        </Paper>
      </Container>

      {/* Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {isEditing ? 'Veículo atualizado com sucesso!' : 'Veículo cadastrado com sucesso!'}
        </Alert>
      </Snackbar>

      {/* Modal de Câmera */}
      <Dialog
        open={cameraModalOpen}
        onClose={closeCameraModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CameraAltIcon />
            Capturar Foto
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
          <Box
            sx={{
              width: '100%',
              maxWidth: '640px',
              height: '480px',
              backgroundColor: '#000',
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {cameraStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <CameraAltIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                <Typography variant="body1" sx={{ opacity: 0.7 }}>
                  Aguardando acesso à câmera...
                </Typography>
              </Box>
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Posicione o veículo no centro da tela e clique em "Capturar Foto" quando estiver pronto
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', p: 3, gap: 2 }}>
          <Button
            onClick={closeCameraModal}
            variant="outlined"
            size="large"
            sx={{ minWidth: 120 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={capturePhotoFromModal}
            variant="contained"
            size="large"
            startIcon={<CameraAltIcon />}
            disabled={!cameraStream}
            sx={{ minWidth: 150 }}
          >
            Capturar Foto
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Vídeo */}
      <Dialog
        open={videoModalOpen}
        onClose={closeVideoModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <VideocamIcon />
            Gravar Vídeo
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
          <Box
            sx={{
              width: '100%',
              maxWidth: '640px',
              height: '480px',
              backgroundColor: '#000',
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {videoStream ? (
              <>
                <video
                  ref={videoRecordRef}
                  autoPlay
                  playsInline
                  muted={isMuted}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                {isRecording && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      backgroundColor: 'rgba(255, 0, 0, 0.8)',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    <RecordIcon sx={{ fontSize: 16, animation: 'blink 1s infinite' }} />
                    REC {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </Box>
                )}
                {/* Botão de Mute/Unmute */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                  }}
                >
                  <IconButton
                    onClick={toggleMute}
                    sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      },
                      width: 48,
                      height: 48
                    }}
                  >
                    {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                  </IconButton>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <VideocamIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                <Typography variant="body1" sx={{ opacity: 0.7 }}>
                  Aguardando acesso à câmera...
                </Typography>
              </Box>
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            {isRecording 
              ? 'Gravando vídeo... Clique em "Parar" para finalizar ou aguarde 30 segundos'
              : 'Posicione o veículo no centro da tela e clique em "Iniciar Gravação" quando estiver pronto'
            }
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', p: 3, gap: 2 }}>
          <Button
            onClick={closeVideoModal}
            variant="outlined"
            size="large"
            sx={{ minWidth: 120 }}
            disabled={isRecording}
          >
            Cancelar
          </Button>
          {!isRecording ? (
            <Button
              onClick={startRecording}
              variant="contained"
              size="large"
              startIcon={<PlayArrowIcon />}
              disabled={!videoStream}
              sx={{ minWidth: 150 }}
              color="error"
            >
              Iniciar Gravação
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="contained"
              size="large"
              startIcon={<StopIcon />}
              sx={{ minWidth: 150 }}
              color="primary"
            >
              Parar Gravação
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
          }
        `}
      </style>
    </>
  );
};

export default VehicleForm;