import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Erro no formato do token' });
    }
    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ error: 'Formato de token inválido' });
    }
    try {
        const secret = process.env.JWT_SECRET ?? 'default_secret';
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        return next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};
export const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        if (roles.includes(req.user.role)) {
            return next();
        }
        return res.status(403).json({ error: 'Acesso negado' });
    };
};
//# sourceMappingURL=auth.js.map