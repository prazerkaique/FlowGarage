import { Op } from 'sequelize';
import { Vehicle, Media } from '../models/index.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
export const createVehicle = async (req, res) => {
    try {
        const garageId = req.user?.garageId;
        if (!garageId) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        const vehicleData = {
            ...req.body,
            garageId
        };
        const vehicle = await Vehicle.create(vehicleData);
        return res.status(201).json(vehicle);
    }
    catch (error) {
        console.error('Erro ao criar veículo:', error);
        return res.status(500).json({ error: 'Erro ao criar veículo' });
    }
};
export const getVehicles = async (req, res) => {
    try {
        const garageId = req.user?.garageId;
        if (!garageId) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        const vehicles = await Vehicle.findAll({
            where: { garageId },
            include: [{ model: Media }]
        });
        return res.json(vehicles);
    }
    catch (error) {
        console.error('Erro ao buscar veículos:', error);
        return res.status(500).json({ error: 'Erro ao buscar veículos' });
    }
};
// Gerar token para catálogo público
export const generatePublicCatalogToken = async (req, res) => {
    try {
        const garageId = req.user?.garageId;
        if (!garageId) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        // Gerar token único
        const tokenData = {
            garageId,
            type: 'public_catalog',
            timestamp: Date.now(),
            random: crypto.randomBytes(16).toString('hex')
        };
        const secret = process.env.JWT_SECRET || 'default_secret';
        const token = jwt.sign(tokenData, secret, { expiresIn: '30d' });
        const publicUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/public/catalog/${token}`;
        return res.json({
            token,
            publicUrl,
            expiresIn: '30 dias'
        });
    }
    catch (error) {
        console.error('Erro ao gerar token público:', error);
        return res.status(500).json({ error: 'Erro ao gerar token público' });
    }
};
// Validar token e retornar informações do catálogo
export const getPublicCatalog = async (req, res) => {
    try {
        const { token } = req.params;
        const secret = process.env.JWT_SECRET ?? 'default_secret';
        const decoded = jwt.verify(token, secret);
        if (decoded.type !== 'public_catalog') {
            return res.status(401).json({ error: 'Token inválido' });
        }
        return res.json({
            valid: true,
            garageId: decoded.garageId
        });
    }
    catch (error) {
        console.error('Erro ao validar token:', error);
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};
// Listar veículos do catálogo público
export const getPublicVehicles = async (req, res) => {
    try {
        const { token } = req.params;
        const secret = process.env.JWT_SECRET ?? 'default_secret';
        const decoded = jwt.verify(token, secret);
        if (decoded.type !== 'public_catalog') {
            return res.status(401).json({ error: 'Token inválido' });
        }
        const vehicles = await Vehicle.findAll({
            where: { garageId: decoded.garageId },
            include: [{ model: Media }]
        });
        return res.json({
            vehicles,
            totalPages: 1,
            currentPage: 1
        });
    }
    catch (error) {
        console.error('Erro ao buscar veículos públicos:', error);
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};
// Obter detalhes de um veículo específico no catálogo público
export const getPublicVehicleById = async (req, res) => {
    try {
        const { token, id } = req.params;
        const secret = process.env.JWT_SECRET ?? 'default_secret';
        const decoded = jwt.verify(token, secret);
        if (decoded.type !== 'public_catalog') {
            return res.status(401).json({ error: 'Token inválido' });
        }
        const vehicle = await Vehicle.findOne({
            where: {
                id,
                garageId: decoded.garageId
            },
            include: [{ model: Media }]
        });
        if (!vehicle) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }
        return res.json(vehicle);
    }
    catch (error) {
        console.error('Erro ao buscar veículo público:', error);
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};
export const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;
        const garageId = req.user?.garageId;
        if (!garageId) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        const vehicle = await Vehicle.findOne({
            where: { id, garageId },
            include: [{ model: Media }]
        });
        if (!vehicle) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }
        return res.json(vehicle);
    }
    catch (error) {
        console.error('Erro ao buscar veículo:', error);
        return res.status(500).json({ error: 'Erro ao buscar veículo' });
    }
};
export const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const garageId = req.user?.garageId;
        if (!garageId) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        const vehicle = await Vehicle.findOne({ where: { id, garageId } });
        if (!vehicle) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }
        await Vehicle.update(req.body, { where: { id, garageId } });
        return res.json({ message: 'Veículo atualizado com sucesso' });
    }
    catch (error) {
        console.error('Erro ao atualizar veículo:', error);
        return res.status(500).json({ error: 'Erro ao atualizar veículo' });
    }
};
export const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const garageId = req.user?.garageId;
        if (!garageId) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        const vehicle = await Vehicle.findOne({ where: { id, garageId } });
        if (!vehicle) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }
        // Remover todas as mídias associadas ao veículo
        await Media.destroy({ where: { vehicleId: id } });
        // Remover o veículo
        await Vehicle.destroy({ where: { id, garageId } });
        return res.json({ message: 'Veículo removido com sucesso' });
    }
    catch (error) {
        console.error('Erro ao remover veículo:', error);
        return res.status(500).json({ error: 'Erro ao remover veículo' });
    }
};
export const searchVehicles = async (req, res) => {
    try {
        const { brand, model, yearMin, yearMax, priceMin, priceMax, mileageMin, mileageMax, bodyType, doors, transmission, steering, fuel, color, leatherSeats, multimediaSystem, absBreaks, xenonHeadlights, electricLock, armored, auction, garageId } = req.query;
        const whereClause = {};
        // Filtros básicos
        if (brand)
            whereClause.brand = { [Op.iLike]: `%${brand}%` };
        if (model)
            whereClause.model = { [Op.iLike]: `%${model}%` };
        if (bodyType)
            whereClause.bodyType = bodyType;
        if (doors)
            whereClause.doors = doors;
        if (transmission)
            whereClause.transmission = transmission;
        if (steering)
            whereClause.steering = steering;
        if (fuel)
            whereClause.fuel = fuel;
        if (color)
            whereClause.color = { [Op.iLike]: `%${color}%` };
        // Filtros de faixa
        if (yearMin || yearMax) {
            whereClause.year = {};
            if (yearMin)
                whereClause.year[Op.gte] = yearMin;
            if (yearMax)
                whereClause.year[Op.lte] = yearMax;
        }
        if (priceMin || priceMax) {
            whereClause.price = {};
            if (priceMin)
                whereClause.price[Op.gte] = priceMin;
            if (priceMax)
                whereClause.price[Op.lte] = priceMax;
        }
        if (mileageMin || mileageMax) {
            whereClause.mileage = {};
            if (mileageMin)
                whereClause.mileage[Op.gte] = mileageMin;
            if (mileageMax)
                whereClause.mileage[Op.lte] = mileageMax;
        }
        // Filtros booleanos
        if (leatherSeats)
            whereClause.leatherSeats = leatherSeats === 'true';
        if (multimediaSystem)
            whereClause.multimediaSystem = multimediaSystem === 'true';
        if (absBreaks)
            whereClause.absBreaks = absBreaks === 'true';
        if (xenonHeadlights)
            whereClause.xenonHeadlights = xenonHeadlights === 'true';
        if (electricLock)
            whereClause.electricLock = electricLock === 'true';
        if (armored)
            whereClause.armored = armored === 'true';
        if (auction)
            whereClause.auction = auction === 'true';
        // Filtro por garagem (para API pública)
        if (garageId)
            whereClause.garageId = garageId;
        const vehicles = await Vehicle.findAll({
            where: whereClause,
            include: [{ model: Media }]
        });
        return res.json(vehicles);
    }
    catch (error) {
        console.error('Erro ao buscar veículos:', error);
        return res.status(500).json({ error: 'Erro ao buscar veículos' });
    }
};
//# sourceMappingURL=vehicleController.js.map