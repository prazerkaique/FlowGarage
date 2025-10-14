import bcrypt from 'bcrypt';
import { User } from '../models/index.js';
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const garageId = req.user?.garageId;
        if (!garageId) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        // Verificar se o usuário já existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }
        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);
        // Criar usuário
        const user = await User.create({
            garageId,
            name,
            email,
            password: hashedPassword,
            role: role || 'seller'
        });
        return res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    }
    catch (error) {
        console.error('Erro ao criar usuário:', error);
        return res.status(500).json({ error: 'Erro ao criar usuário' });
    }
};
export const getUsers = async (req, res) => {
    try {
        const garageId = req.user?.garageId;
        if (!garageId) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        const users = await User.findAll({
            where: { garageId },
            attributes: ['id', 'name', 'email', 'role', 'createdAt']
        });
        return res.json(users);
    }
    catch (error) {
        console.error('Erro ao buscar usuários:', error);
        return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
};
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, password } = req.body;
        const garageId = req.user?.garageId;
        if (!garageId) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        const user = await User.findOne({ where: { id, garageId } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email;
        if (role)
            updateData.role = role;
        if (password)
            updateData.password = await bcrypt.hash(password, 10);
        await User.update(updateData, { where: { id, garageId } });
        return res.json({ message: 'Usuário atualizado com sucesso' });
    }
    catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        return res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
};
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const garageId = req.user?.garageId;
        if (!garageId) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        const user = await User.findOne({ where: { id, garageId } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        await User.destroy({ where: { id, garageId } });
        return res.json({ message: 'Usuário removido com sucesso' });
    }
    catch (error) {
        console.error('Erro ao remover usuário:', error);
        return res.status(500).json({ error: 'Erro ao remover usuário' });
    }
};
//# sourceMappingURL=userController.js.map