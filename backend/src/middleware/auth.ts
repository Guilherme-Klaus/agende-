import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
  userId?: string;
  tenantId?: string;
  role?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; tenantId: string; role: string };
    req.userId = decoded.userId;
    req.tenantId = decoded.tenantId;
    req.role = decoded.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

export function tenantMatchMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const paramTenantId = req.params.tenantId;
  if (req.role === 'super-admin') return next();
  if (paramTenantId && paramTenantId !== req.tenantId) {
    return res.status(403).json({ error: 'Acesso negado a este estabelecimento.' });
  }
  next();
}

export function superAdminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.role !== 'super-admin') {
    return res.status(403).json({ error: 'Acesso restrito ao administrador do sistema.' });
  }
  next();
}