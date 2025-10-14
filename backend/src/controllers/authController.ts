import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Garage, User } from '../models/index.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, cnpj, email, password } = req.body;

    // Verificar se a garagem já existe
    const existingGarage = await Garage.findOne({ where: { email } });
    if (existingGarage) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar garagem
    const garage = await Garage.create({
      name,
      cnpj,
      email,
      password: hashedPassword
    });

    // Criar usuário admin para a garagem
    await User.create({
      garageId: garage.id,
      name: `Admin ${name}`,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    return res.status(201).json({ message: 'Garagem registrada com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar garagem:', error);
    return res.status(500).json({ error: 'Erro ao registrar garagem' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário pelo email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, garageId: user.garageId, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        garageId: user.garageId
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ error: 'Erro ao fazer login' });
  }
};