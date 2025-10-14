#!/usr/bin/env python3
import json
import os
import base64
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)

# Diretório para armazenar dados e uploads
DATA_DIR = 'mock_data'
UPLOADS_DIR = os.path.join(DATA_DIR, 'uploads')
VEHICLES_FILE = os.path.join(DATA_DIR, 'vehicles.json')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
COUNTER_FILE = os.path.join(DATA_DIR, 'counter.json')

# Criar diretórios se não existirem
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

def get_next_vehicle_id():
    """Gera o próximo ID sequencial para veículos"""
    if os.path.exists(COUNTER_FILE):
        with open(COUNTER_FILE, 'r', encoding='utf-8') as f:
            counter_data = json.load(f)
    else:
        counter_data = {"vehicle_counter": 0}
    
    counter_data["vehicle_counter"] += 1
    
    with open(COUNTER_FILE, 'w', encoding='utf-8') as f:
        json.dump(counter_data, f, ensure_ascii=False, indent=2)
    
    return f"#{counter_data['vehicle_counter']:05d}"

# Dados iniciais
def load_data():
    # Carregar veículos
    if os.path.exists(VEHICLES_FILE):
        with open(VEHICLES_FILE, 'r', encoding='utf-8') as f:
            vehicles = json.load(f)
    else:
        vehicles = [
            {
                "id": 1,
                "vehicleId": "#00001",
                "category": "Carro",
                "brand": "Toyota",
                "model": "Corolla",
                "licensePlate": "ABC-1234", # Adicionar placa no veículo exemplo
                "modelYear": 2023,
                "year": 2023,
                "price": 85000,
                "mileage": 15000,
                "color": "Branco",
                "bodyType": "Sedan",
                "doors": 4,
                "transmission": "Automático",
                "steering": "Hidráulica",
                "fuel": "Flex",
                "optionalFeatures": ["Ar condicionado", "Direção elétrica", "Vidros elétricos"],
                "armored": False,
                "auction": False,
                "ipvaPaid": True,
                "licensingUpToDate": True,
                "status": "Disponível",
                "description": "Veículo em excelente estado de conservação",
                "media": {
                    "photos": [],
                    "videos": [],
                    "inspection": None
                },
                "createdAt": "2024-01-15T10:30:00Z"
            }
        ]
        save_vehicles(vehicles)
    
    # Carregar usuários
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            users = json.load(f)
    else:
        users = [
            {"id": 1, "name": "Admin", "email": "admin@garage.com", "role": "admin"},
            {"id": 2, "name": "João Silva", "email": "joao@email.com", "role": "user"}
        ]
        save_users(users)
    
    return vehicles, users

def save_vehicles(vehicles):
    with open(VEHICLES_FILE, 'w', encoding='utf-8') as f:
        json.dump(vehicles, f, ensure_ascii=False, indent=2)

def save_users(users):
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, ensure_ascii=False, indent=2)

def save_file(file_data, filename):
    """Salva arquivo base64 no sistema de arquivos"""
    try:
        # Decodificar base64
        file_content = base64.b64decode(file_data.split(',')[1])
        file_path = os.path.join(UPLOADS_DIR, filename)
        
        with open(file_path, 'wb') as f:
            f.write(file_content)
        
        return f"/uploads/{filename}"
    except Exception as e:
        print(f"Erro ao salvar arquivo: {e}")
        return None

# Carregar dados iniciais
vehicles_data, users_data = load_data()

@app.route('/api/login', methods=['POST'])
def login():
    return jsonify({
        "token": "mock-jwt-token",
        "user": {"id": 1, "name": "Demo User", "email": "demo@garage.com", "role": "admin"}
    })

@app.route('/api/register', methods=['POST'])
def register():
    return jsonify({
        "token": "mock-jwt-token", 
        "user": {"id": 2, "name": "New User", "email": "new@garage.com", "role": "user"}
    })

@app.route('/api/vehicles', methods=['GET'])
def get_vehicles():
    status_filter = request.args.get('status')
    category_filter = request.args.get('category')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    
    filtered_vehicles = vehicles_data
    
    if status_filter:
        filtered_vehicles = [v for v in filtered_vehicles if v.get('status') == status_filter]
    
    if category_filter:
        filtered_vehicles = [v for v in filtered_vehicles if v.get('category') == category_filter]
    
    # Calcular paginação
    total_vehicles = len(filtered_vehicles)
    total_pages = (total_vehicles + limit - 1) // limit  # Ceiling division
    start_index = (page - 1) * limit
    end_index = start_index + limit
    paginated_vehicles = filtered_vehicles[start_index:end_index]
    
    return jsonify({
        "vehicles": paginated_vehicles,
        "totalPages": total_pages,
        "currentPage": page,
        "totalVehicles": total_vehicles,
        "hasNextPage": page < total_pages,
        "hasPrevPage": page > 1
    })

@app.route('/api/vehicles/<int:vehicle_id>', methods=['GET'])
def get_vehicle(vehicle_id):
    vehicle = next((v for v in vehicles_data if v['id'] == vehicle_id), None)
    if vehicle:
        return jsonify(vehicle)
    return jsonify({"error": "Veículo não encontrado"}), 404

@app.route('/api/vehicles', methods=['POST'])
def create_vehicle():
    try:
        # Verificar se é FormData ou JSON
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Processar FormData
            data = request.form.to_dict()
            
            # Converter valores numéricos
            if 'year' in data:
                data['year'] = int(data['year']) if data['year'] else 2024
            if 'modelYear' in data:
                data['modelYear'] = int(data['modelYear']) if data['modelYear'] else data.get('year', 2024)
            if 'price' in data:
                # Converter formato brasileiro (vírgula) para formato americano (ponto)
                price_str = str(data['price']).replace(',', '.') if data['price'] else '0'
                data['price'] = float(price_str)
            if 'mileage' in data:
                data['mileage'] = int(data['mileage']) if data['mileage'] else 0
            if 'doors' in data:
                data['doors'] = int(data['doors']) if data['doors'] else 4
            
            # Converter valores booleanos
            data['armored'] = data.get('armored', 'false').lower() == 'true'
            data['auction'] = data.get('auction', 'false').lower() == 'true'
            data['ipvaPaid'] = data.get('ipvaPaid', 'false').lower() == 'true'
            data['licensingUpToDate'] = data.get('licensingUpToDate', 'false').lower() == 'true'
            
            # Processar características opcionais (podem vir como múltiplos valores)
            data['optionalFeatures'] = request.form.getlist('optionalFeatures')
            
        else:
            # Processar JSON (compatibilidade com versões antigas)
            print(f"Content-Type: {request.content_type}")
            print(f"Request data: {request.data}")
            print(f"Request form: {request.form}")
            
            try:
                data = request.get_json()
                if data is None:
                    print("❌ request.get_json() retornou None")
                    return jsonify({"error": "Dados JSON inválidos ou ausentes"}), 400
                print(f"✅ JSON recebido: {data}")
            except Exception as json_error:
                print(f"❌ Erro ao processar JSON: {json_error}")
                return jsonify({"error": f"Erro ao processar JSON: {str(json_error)}"}), 400
        
        # Gerar novo ID único (evitar duplicatas)
        existing_ids = [v['id'] for v in vehicles_data]
        new_id = 1
        while new_id in existing_ids:
            new_id += 1
        
        # Verificar se a placa já existe (placa deve ser única)
        license_plate = data.get('licensePlate', '').strip()
        if license_plate:
            existing_plates = [v.get('licensePlate', '') for v in vehicles_data]
            if license_plate in existing_plates:
                return jsonify({"error": f"Já existe um veículo com a placa {license_plate}"}), 400
        
        # Processar uploads de arquivos
        media = {"photos": [], "videos": [], "inspection": None}
        
        # Processar fotos do FormData
        if request.files:
            photos = request.files.getlist('photos')
            for i, photo_file in enumerate(photos):
                if photo_file and photo_file.filename:
                    # Obter extensão do arquivo
                    file_ext = photo_file.filename.split('.')[-1] if '.' in photo_file.filename else 'jpg'
                    filename = f"photo_{new_id}_{i}_{uuid.uuid4().hex[:8]}.{file_ext}"
                    file_path = os.path.join(UPLOADS_DIR, filename)
                    
                    # Salvar arquivo
                    photo_file.save(file_path)
                    media['photos'].append(f"/uploads/{filename}")
            
            # Processar vídeos do FormData
            videos = request.files.getlist('videos')
            for i, video_file in enumerate(videos):
                if video_file and video_file.filename:
                    file_ext = video_file.filename.split('.')[-1] if '.' in video_file.filename else 'mp4'
                    filename = f"video_{new_id}_{i}_{uuid.uuid4().hex[:8]}.{file_ext}"
                    file_path = os.path.join(UPLOADS_DIR, filename)
                    
                    video_file.save(file_path)
                    media['videos'].append(f"/uploads/{filename}")
            
            # Processar inspeção do FormData
            inspection_file = request.files.get('inspection')
            if inspection_file and inspection_file.filename:
                file_ext = inspection_file.filename.split('.')[-1] if '.' in inspection_file.filename else 'pdf'
                filename = f"inspection_{new_id}_{uuid.uuid4().hex[:8]}.{file_ext}"
                file_path = os.path.join(UPLOADS_DIR, filename)
                
                inspection_file.save(file_path)
                media['inspection'] = f"/uploads/{filename}"
        
        # Processar fotos do JSON (compatibilidade)
        elif 'photos' in data and data['photos']:
            for i, photo_data in enumerate(data['photos']):
                if photo_data:
                    filename = f"photo_{new_id}_{i}_{uuid.uuid4().hex[:8]}.jpg"
                    file_url = save_file(photo_data, filename)
                    if file_url:
                        media['photos'].append(file_url)
        
        # Processar vídeos do JSON (compatibilidade)
        if 'videos' in data and data['videos'] and not request.files:
            for i, video_data in enumerate(data['videos']):
                if video_data:
                    filename = f"video_{new_id}_{i}_{uuid.uuid4().hex[:8]}.mp4"
                    file_url = save_file(video_data, filename)
                    if file_url:
                        media['videos'].append(file_url)
        
        # Processar vistoria do JSON (compatibilidade)
        if 'inspection' in data and data['inspection'] and not request.files:
            filename = f"inspection_{new_id}_{uuid.uuid4().hex[:8]}.pdf"
            file_url = save_file(data['inspection'], filename)
            if file_url:
                media['inspection'] = file_url
        
        # Processar e converter valores de preço
        price_value = data.get('price', 0)
        if isinstance(price_value, str):
            # Remover formatação brasileira (R$, pontos, vírgulas)
            price_clean = price_value.replace('R$', '').replace('.', '').replace(',', '.').strip()
            try:
                price_value = float(price_clean)
            except ValueError:
                print(f"⚠️ Erro ao converter preço '{price_value}' para float, usando 0")
                price_value = 0
        
        # Processar e converter valores de quilometragem
        mileage_value = data.get('mileage', 0)
        if isinstance(mileage_value, str):
            # Remover formatação (pontos, vírgulas)
            mileage_clean = mileage_value.replace('.', '').replace(',', '').strip()
            try:
                mileage_value = int(mileage_clean)
            except ValueError:
                print(f"⚠️ Erro ao converter quilometragem '{mileage_value}' para int, usando 0")
                mileage_value = 0
        
        # Criar novo veículo
        new_vehicle = {
            "id": new_id,
            "vehicleId": get_next_vehicle_id(),
            "category": data.get('category', 'Carro'),
            "brand": data.get('brand', ''),
            "model": data.get('model', ''),
            "licensePlate": data.get('licensePlate', ''), # Adicionar campo placa
            "modelYear": data.get('modelYear', 2024),
            "year": data.get('year', 2024),
            "price": price_value,
            "mileage": mileage_value,
            "color": data.get('color', ''),
            "bodyType": data.get('bodyType', ''),
            "doors": data.get('doors', 4),
            "transmission": data.get('transmission', ''),
            "steering": data.get('steering', ''),
            "fuel": data.get('fuel', ''),
            "optionalFeatures": data.get('optionalFeatures', []),
            "armored": data.get('armored', False),
            "auction": data.get('auction', False),
            "ipvaPaid": data.get('ipvaPaid', False),
            "licensingUpToDate": data.get('licensingUpToDate', False),
            "status": data.get('status', 'Disponível'),
            "description": data.get('description', ''),
            "media": media,
            "createdAt": datetime.now().isoformat()
        }
        
        vehicles_data.append(new_vehicle)
        save_vehicles(vehicles_data)
        
        return jsonify(new_vehicle), 201
        
    except Exception as e:
        print(f"Erro ao criar veículo: {e}")
        return jsonify({"error": "Erro ao criar veículo"}), 500

@app.route('/api/vehicles/<int:vehicle_id>', methods=['PUT'])
def update_vehicle(vehicle_id):
    try:
        # Verificar se é FormData (multipart) ou JSON
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Processar FormData
            data = {}
            
            # Extrair campos de texto
            for key in request.form.keys():
                if key in ['existingPhotosOrder', 'existingVideosOrder']:
                    # Parse JSON strings
                    try:
                        data[key] = json.loads(request.form[key])
                    except:
                        data[key] = request.form[key]
                else:
                    data[key] = request.form[key]
            
            # Processar arquivos
            files = request.files.getlist('photos')
            if files and files[0].filename:  # Verificar se há arquivos reais
                data['photos'] = []
                for file in files:
                    if file and file.filename:
                        # Salvar arquivo
                        filename = f"photo_{vehicle_id}_{len(data['photos'])}_{uuid.uuid4().hex[:8]}.{file.filename.split('.')[-1]}"
                        file_path = os.path.join(UPLOADS_DIR, filename)
                        file.save(file_path)
                        data['photos'].append(f"/uploads/{filename}")
        else:
            # Processar JSON
            data = request.get_json()
        
        vehicle_index = next((i for i, v in enumerate(vehicles_data) if v['id'] == vehicle_id), None)
        
        if vehicle_index is None:
            return jsonify({"error": "Veículo não encontrado"}), 404
        
        # Verificar se a placa já existe em outro veículo (placa deve ser única)
        license_plate = data.get('licensePlate', '').strip()
        if license_plate:
            existing_plates = [(i, v.get('licensePlate', '')) for i, v in enumerate(vehicles_data)]
            for i, plate in existing_plates:
                if plate == license_plate and i != vehicle_index:
                    return jsonify({"error": f"Já existe outro veículo com a placa {license_plate}"}), 400

        # Atualizar dados do veículo
        vehicle = vehicles_data[vehicle_index]
        
        # Manter mídia existente
        existing_media = vehicle.get('media', {"photos": [], "videos": [], "inspection": None})
        
        # Processar reordenação de fotos existentes
        if 'existingPhotosOrder' in data and data['existingPhotosOrder']:
            try:
                existing_photos_order = data['existingPhotosOrder'] if isinstance(data['existingPhotosOrder'], list) else json.loads(data['existingPhotosOrder'])
                # Reordenar fotos existentes conforme a nova ordem
                if existing_photos_order and existing_media.get('photos'):
                    reordered_photos = []
                    for photo_url in existing_photos_order:
                        if photo_url in existing_media['photos']:
                            reordered_photos.append(photo_url)
                    existing_media['photos'] = reordered_photos
                    print(f"Fotos reordenadas: {existing_media['photos']}")
            except Exception as e:
                print(f"Erro ao processar existingPhotosOrder: {e}")
        
        # Processar reordenação de vídeos existentes
        if 'existingVideosOrder' in data and data['existingVideosOrder']:
            try:
                existing_videos_order = data['existingVideosOrder'] if isinstance(data['existingVideosOrder'], list) else json.loads(data['existingVideosOrder'])
                # Reordenar vídeos existentes conforme a nova ordem
                if existing_videos_order and existing_media.get('videos'):
                    reordered_videos = []
                    for video_url in existing_videos_order:
                        if video_url in existing_media['videos']:
                            reordered_videos.append(video_url)
                    existing_media['videos'] = reordered_videos
                    print(f"Vídeos reordenados: {existing_media['videos']}")
            except Exception as e:
                print(f"Erro ao processar existingVideosOrder: {e}")
        
        # Adicionar novas fotos (se houver)
        if 'photos' in data and data['photos']:
            if isinstance(data['photos'], list):
                # Fotos já processadas (URLs)
                existing_media['photos'].extend(data['photos'])
            else:
                # Processar fotos base64
                new_photos = []
                photos_data = data['photos'] if isinstance(data['photos'], list) else [data['photos']]
                for i, photo_data in enumerate(photos_data):
                    if photo_data and photo_data.startswith('data:'):
                        filename = f"photo_{vehicle_id}_{len(existing_media['photos']) + i}_{uuid.uuid4().hex[:8]}.jpg"
                        file_url = save_file(photo_data, filename)
                        if file_url:
                            new_photos.append(file_url)
                existing_media['photos'].extend(new_photos)
        
        # Atualizar outros campos (exceto mídia)
        for key, value in data.items():
            if key not in ['photos', 'videos', 'inspection', 'existingPhotosOrder', 'existingVideosOrder']:
                vehicle[key] = value
        
        vehicle['media'] = existing_media
        vehicles_data[vehicle_index] = vehicle
        save_vehicles(vehicles_data)
        
        print(f"Veículo {vehicle_id} atualizado com sucesso")
        return jsonify(vehicle)
        
    except Exception as e:
        print(f"Erro ao atualizar veículo: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Erro interno do servidor"}), 500

@app.route('/api/vehicles/<int:vehicle_id>', methods=['PATCH'])
def patch_vehicle(vehicle_id):
    """Atualização parcial de veículo (ex: highlighted)"""
    try:
        data = request.get_json()
        
        vehicle_index = next((i for i, v in enumerate(vehicles_data) if v['id'] == vehicle_id), None)
        
        if vehicle_index is None:
            return jsonify({"error": "Veículo não encontrado"}), 404
        
        # Atualizar apenas os campos fornecidos
        vehicle = vehicles_data[vehicle_index]
        for key, value in data.items():
            vehicle[key] = value
        
        vehicles_data[vehicle_index] = vehicle
        save_vehicles(vehicles_data)
        
        print(f"Veículo {vehicle_id} atualizado parcialmente: {data}")
        return jsonify(vehicle)
        
    except Exception as e:
        print(f"Erro ao atualizar veículo parcialmente: {e}")
        return jsonify({"error": "Erro interno do servidor"}), 500

@app.route('/api/vehicles/<int:vehicle_id>', methods=['DELETE'])
def delete_vehicle(vehicle_id):
    try:
        # Encontrar o veículo
        vehicle_index = None
        for i, v in enumerate(vehicles_data):
            if v['id'] == vehicle_id:
                vehicle_index = i
                break
        
        if vehicle_index is None:
            return jsonify({"error": "Veículo não encontrado"}), 404
        
        # Remover o veículo da lista
        deleted_vehicle = vehicles_data.pop(vehicle_index)
        
        # Salvar dados atualizados
        save_vehicles(vehicles_data)
        
        return jsonify({"message": "Veículo excluído com sucesso", "vehicle": deleted_vehicle})
        
    except Exception as e:
        print(f"Erro ao excluir veículo: {e}")
        return jsonify({"error": "Erro interno do servidor"}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    response = send_from_directory(UPLOADS_DIR, filename)
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify(users_data)

@app.route('/api/profile', methods=['PUT'])
def update_profile():
    """Atualiza o perfil do usuário"""
    try:
        data = request.get_json()
        
        # Carregar dados de usuários existentes
        users_file = os.path.join(DATA_DIR, 'users.json')
        users = []
        if os.path.exists(users_file):
            with open(users_file, 'r', encoding='utf-8') as f:
                users = json.load(f)
        
        # Simular verificação de senha atual se fornecida
        if data.get('currentPassword') and data.get('newPassword'):
            # Em um sistema real, você verificaria a senha atual contra o hash armazenado
            # Para o mock, vamos simular que a senha atual está correta
            if data.get('currentPassword') != 'senha123':  # Senha mock para teste
                return jsonify({
                    "error": "Senha atual incorreta"
                }), 400
        
        # Preparar dados do usuário para salvar
        user_data = {
            "id": 1,  # ID do usuário logado (em um sistema real viria do token)
            "name": data.get('name', ''),
            "email": data.get('email', ''),
            "phone": data.get('phone', ''),
            "company": data.get('company', ''),
            "profileImage": data.get('profileImage', ''),
            "updated_at": datetime.now().isoformat()
        }
        
        # Se há nova senha, simular hash e salvar
        if data.get('newPassword'):
            user_data["password_hash"] = f"hash_{data.get('newPassword')}"  # Mock hash
        
        # Atualizar ou adicionar usuário na lista
        user_found = False
        for i, user in enumerate(users):
            if user.get('id') == 1:  # ID do usuário logado
                users[i] = {**user, **user_data}
                user_found = True
                break
        
        if not user_found:
            users.append(user_data)
        
        # Salvar dados atualizados no arquivo
        with open(users_file, 'w', encoding='utf-8') as f:
            json.dump(users, f, ensure_ascii=False, indent=2)
        
        # Salvar também em arquivo específico do perfil para facilitar carregamento
        profile_file = os.path.join(DATA_DIR, 'profile.json')
        with open(profile_file, 'w', encoding='utf-8') as f:
            json.dump(user_data, f, ensure_ascii=False, indent=2)
        
        response_data = {
            "success": True,
            "message": "Perfil atualizado com sucesso!",
            "user": {
                "name": user_data['name'],
                "email": user_data['email'],
                "phone": user_data['phone'],
                "company": user_data['company'],
                "profileImage": user_data['profileImage']
            }
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({
            "error": f"Erro ao atualizar perfil: {str(e)}"
        }), 500

@app.route('/api/profile', methods=['GET'])
def get_profile():
    """Carrega os dados do perfil do usuário"""
    try:
        # Tentar carregar dados salvos do arquivo de perfil
        profile_file = os.path.join(DATA_DIR, 'profile.json')
        
        if os.path.exists(profile_file):
            try:
                with open(profile_file, 'r', encoding='utf-8') as f:
                    profile_data = json.load(f)
                return jsonify({
                    "name": profile_data.get('name', ''),
                    "email": profile_data.get('email', ''),
                    "phone": profile_data.get('phone', ''),
                    "company": profile_data.get('company', ''),
                    "profileImage": profile_data.get('profileImage', '')
                })
            except Exception as e:
                print(f"Erro ao carregar dados do perfil: {e}")
        
        # Retornar dados padrão se não houver arquivo salvo
        return jsonify({
            "name": "Usuário Admin",
            "email": "admin@garage.com",
            "phone": "(11) 99999-9999",
            "company": "Garagem Premium",
            "profileImage": None
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Erro ao carregar perfil: {str(e)}"
        }), 500

@app.route('/api/vehicles/share-catalog', methods=['POST'])
def share_catalog():
    """Gera um token público para compartilhar o catálogo"""
    import jwt
    import time
    
    # Simular dados do usuário logado (em um sistema real viria do token de autenticação)
    garage_id = 1
    
    # Gerar token único
    token_data = {
        "garageId": garage_id,
        "type": "public_catalog",
        "timestamp": int(time.time()),
        "random": str(uuid.uuid4())
    }
    
    # Usar uma chave secreta simples para o mock
    secret = "mock_secret_key"
    token = jwt.encode(token_data, secret, algorithm='HS256')
    
    public_url = f"http://localhost:5173/public-catalog?token={token}"
    
    return jsonify({
        "token": token,
        "publicUrl": public_url,
        "expiresIn": "30 dias"
    })

@app.route('/api/public/catalog/<token>', methods=['GET'])
def validate_public_catalog(token):
    """Valida o token público e retorna informações do catálogo"""
    import jwt
    
    try:
        secret = "mock_secret_key"
        decoded = jwt.decode(token, secret, algorithms=['HS256'])
        
        if decoded.get('type') != 'public_catalog':
            return jsonify({"error": "Token inválido"}), 401
            
        return jsonify({
            "valid": True,
            "garageId": decoded.get('garageId')
        })
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Token inválido"}), 401

@app.route('/api/public/catalog/<token>/vehicles', methods=['GET'])
def get_public_vehicles(token):
    """Lista veículos do catálogo público"""
    import jwt
    
    try:
        secret = "mock_secret_key"
        decoded = jwt.decode(token, secret, algorithms=['HS256'])
        
        if decoded.get('type') != 'public_catalog':
            return jsonify({"error": "Token inválido"}), 401
            
        # Retornar todos os veículos (em um sistema real filtraria por garageId)
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 8))
        
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        
        paginated_vehicles = vehicles_data[start_idx:end_idx]
        total_pages = (len(vehicles_data) + limit - 1) // limit
        
        return jsonify({
            "vehicles": paginated_vehicles,
            "totalPages": total_pages,
            "currentPage": page
        })
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Token inválido"}), 401

@app.route('/api/public/catalog/<token>/vehicles/<int:vehicle_id>', methods=['GET'])
def get_public_vehicle(token, vehicle_id):
    """Obtém detalhes de um veículo específico no catálogo público"""
    import jwt
    
    try:
        secret = "mock_secret_key"
        decoded = jwt.decode(token, secret, algorithms=['HS256'])
        
        if decoded.get('type') != 'public_catalog':
            return jsonify({"error": "Token inválido"}), 401
            
        # Buscar veículo por ID
        vehicle = next((v for v in vehicles_data if v['id'] == vehicle_id), None)
        if not vehicle:
            return jsonify({"error": "Veículo não encontrado"}), 404
            
        return jsonify(vehicle)
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Token inválido"}), 401

@app.route('/api/company', methods=['GET'])
def get_company():
    # Tentar carregar dados salvos do arquivo
    company_file = os.path.join(DATA_DIR, 'company.json')
    
    if os.path.exists(company_file):
        try:
            with open(company_file, 'r', encoding='utf-8') as f:
                company_data = json.load(f)
            return jsonify(company_data)
        except Exception as e:
            print(f"Erro ao carregar dados da empresa: {e}")
    
    # Retornar dados padrão se não houver arquivo salvo
    return jsonify({
        "name": "Garagem Premium",
        "cnpj": "12.345.678/0001-90",
        "address": "Rua das Flores, 123 - Centro",
        "city": "São Paulo",
        "state": "SP",
        "phone": "(11) 99999-9999",
        "email": "contato@garagempremium.com.br",
        "facebook": "",
        "instagram": "",
        "logo": None
    })

@app.route('/api/company', methods=['PUT'])
def update_company():
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['name', 'address', 'phone', 'email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Campo {field} é obrigatório"}), 400
        
        # Simular salvamento dos dados da empresa
        company_data = {
            "name": data.get('name'),
            "cnpj": data.get('cnpj', ''),
            "address": data.get('address'),
            "city": data.get('city', ''),
            "state": data.get('state', ''),
            "phone": data.get('phone'),
            "email": data.get('email'),
            "facebook": data.get('facebook', ''),
            "instagram": data.get('instagram', ''),
            "logo": data.get('logo'),
            "updated_at": datetime.now().isoformat()
        }
        
        # Salvar em arquivo para persistir os dados
        company_file = os.path.join(DATA_DIR, 'company.json')
        with open(company_file, 'w', encoding='utf-8') as f:
            json.dump(company_data, f, ensure_ascii=False, indent=2)
        
        return jsonify({
            "message": "Informações da empresa atualizadas com sucesso!",
            "company": company_data
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚗 Mock Server iniciado!")
    print("📡 Endpoints disponíveis:")
    print("   POST /api/login")
    print("   POST /api/register") 
    print("   GET  /api/vehicles")
    print("   GET  /api/vehicles/<id>")
    print("   POST /api/vehicles")
    print("   PUT  /api/vehicles/<id>")
    print("   DELETE /api/vehicles/<id>")
    print("   GET  /api/users")
    print("   PUT  /api/profile")
    print("   GET  /api/profile")
    print("   GET  /api/company")
    print("   PUT  /api/company")
    print("   GET  /uploads/<filename>")
    print("🌐 Servidor rodando em http://localhost:3001")
    app.run(host='0.0.0.0', port=3001, debug=True)