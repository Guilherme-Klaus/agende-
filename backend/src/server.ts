import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cron from 'node-cron';
import { authMiddleware, tenantMatchMiddleware, superAdminMiddleware, AuthRequest } from './middleware/auth';

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Servidor do Agende+ rodando com sucesso! 🚀');
});

// ==========================================
// ROTAS DO SUPER ADMIN (Protegidas)
// ==========================================
app.post('/super-admin-login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Checagem redundante de e-mail removida!
    if (email !== process.env.SUPER_ADMIN_EMAIL) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }
    
    const match = await bcrypt.compare(password, process.env.SUPER_ADMIN_PASSWORD_HASH as string);
    if (!match) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }
    
    const token = jwt.sign(
      { userId: 'super-admin', tenantId: 'super-admin', role: 'super-admin' }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    return res.status(200).json({ 
      token, 
      user: { 
        email, 
        role: 'super-admin', 
        tenantName: 'Painel Master',
        tenantId: 'super-admin'
      } 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno.' });
  }
});

app.put('/admin/update-user-email/:userId', authMiddleware, superAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { newEmail } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });
    return res.status(200).json({ message: 'E-mail atualizado com sucesso!', user: updatedUser });
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao atualizar e-mail do usuário.' });
  }
});

app.put('/admin/toggle-tenant-status/:tenantId', authMiddleware, superAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { isActive } = req.body;
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive: Boolean(isActive) },
    });
    return res.status(200).json({ message: 'Status da empresa alterado com sucesso!', tenant: updatedTenant });
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao alterar status da empresa.' });
  }
});

app.put('/admin/update-tenant-due-date/:tenantId', authMiddleware, superAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { dueDate } = req.body;
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { dueDate: dueDate ? new Date(dueDate) : null },
    });
    return res.status(200).json({ message: 'Data de vencimento atualizada com sucesso!', tenant: updatedTenant });
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao atualizar data de vencimento.' });
  }
});

app.put('/admin/update-tenant-plan/:tenantId', authMiddleware, superAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { plan } = req.body;
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { plan: plan || 'essencial' },
    });
    return res.status(200).json({ message: 'Plano alterado com sucesso!', tenant: updatedTenant });
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao alterar o plano da empresa.' });
  }
});

app.get('/tenants', authMiddleware, superAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const tenants = await prisma.tenant.findMany({ 
      include: { users: true }, 
      orderBy: { name: 'asc' } 
    });
    return res.status(200).json(tenants);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar empresas.' });
  }
});

app.delete('/tenant/:id', authMiddleware, superAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.appointment.deleteMany({ where: { tenantId: id } });
    await prisma.expense.deleteMany({ where: { tenantId: id } });

    const profs = await prisma.professional.findMany({ where: { tenantId: id } });
    for (const p of profs) {
      await prisma.professionalHour.deleteMany({ where: { professionalId: p.id } });
    }

    await prisma.businessHour.deleteMany({ where: { tenantId: id } });
    await prisma.user.deleteMany({ where: { tenantId: id } });
    await prisma.service.deleteMany({ where: { tenantId: id } });
    await prisma.product.deleteMany({ where: { tenantId: id } });
    await prisma.professional.deleteMany({ where: { tenantId: id } });
    await prisma.customer.deleteMany({ where: { tenantId: id } });

    await prisma.tenant.delete({ where: { id } });

    return res.status(200).json({ message: 'Empresa removida com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Erro ao excluir a empresa.' });
  }
});

// ==========================================
// ROTAS DE TENANTS E CADASTRO
// ==========================================
app.post('/tenant', async (req: Request, res: Response) => {
  try {
    const { name, category, whatsapp, address, closingHour, themeColor, logoUrl, slug, pixKey, minNoticeHours, requireDeposit, depositPercent, plan } = req.body;
    
    const generatedSlug = slug 
      ? slug.toLowerCase().replace(/[^a-z0-9]/g, '-') 
      : name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-');

    const newTenant = await prisma.tenant.create({
      data: { 
        name, 
        slug: generatedSlug,
        category: category || null, 
        whatsapp: whatsapp || null, 
        address: address || null, 
        closingHour: closingHour || '19:00', 
        themeColor: themeColor || 'emerald',
        logoUrl: logoUrl || null,
        pixKey: pixKey || null,
        plan: plan || 'essencial',
        minNoticeHours: minNoticeHours !== undefined ? Number(minNoticeHours) : 2,
        requireDeposit: requireDeposit !== undefined ? Boolean(requireDeposit) : false,
        depositPercent: depositPercent !== undefined ? Number(depositPercent) : 50,
        isActive: false 
      },
    });

    const finalCloseTime = closingHour || '19:00';
    const defaultHours = [
      { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: finalCloseTime, lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: finalCloseTime, lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: finalCloseTime, lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: finalCloseTime, lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: finalCloseTime, lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: finalCloseTime, lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00' },
    ];

    for (const h of defaultHours) {
      await prisma.businessHour.create({ data: { ...h, tenantId: newTenant.id } });
    }

    return res.status(201).json(newTenant);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao criar estabelecimento ou slug já em uso.' });
  }
});

app.get('/tenant/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    let tenant = await prisma.tenant.findUnique({ where: { id: identifier } });
    if (!tenant) {
      tenant = await prisma.tenant.findUnique({ where: { slug: identifier } });
    }
    if (!tenant) return res.status(404).json({ error: 'Estabelecimento não encontrado.' });
    return res.status(200).json(tenant);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao buscar estabelecimento.' });
  }
});

app.put('/tenant/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (req.role !== 'super-admin' && id !== req.tenantId) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    const { name, category, whatsapp, address, themeColor, logoUrl, slug, pixKey, minNoticeHours, requireDeposit, depositPercent, closingHour, portfolioPhotos, plan } = req.body;
    
    const existing = await prisma.tenant.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Estabelecimento não encontrado.' });

    const updated = await prisma.tenant.update({
      where: { id },
      data: { 
        name: name !== undefined ? name : existing.name, 
        slug: slug !== undefined ? slug.toLowerCase().replace(/[^a-z0-9]/g, '-') : existing.slug,
        category: category !== undefined ? category : existing.category, 
        whatsapp: whatsapp !== undefined ? whatsapp : existing.whatsapp, 
        address: address !== undefined ? address : existing.address,
        closingHour: closingHour !== undefined ? closingHour : existing.closingHour,
        themeColor: themeColor !== undefined ? themeColor : existing.themeColor,
        logoUrl: logoUrl !== undefined ? logoUrl : existing.logoUrl,
        pixKey: pixKey !== undefined ? pixKey : existing.pixKey,
        plan: plan !== undefined ? plan : existing.plan,
        minNoticeHours: minNoticeHours !== undefined ? Number(minNoticeHours) : existing.minNoticeHours,
        requireDeposit: requireDeposit !== undefined ? Boolean(requireDeposit) : existing.requireDeposit,
        depositPercent: depositPercent !== undefined ? Number(depositPercent) : existing.depositPercent,
        portfolioPhotos: portfolioPhotos !== undefined ? portfolioPhotos : existing.portfolioPhotos
      },
    });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao atualizar estabelecimento' });
  }
});

// ==========================================
// ROTAS DE AUTENTICAÇÃO E LOGIN
// ==========================================
app.post('/user', async (req: Request, res: Response) => {
  try {
    const { name, email, password, tenantId } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, tenantId },
    });
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao criar usuário administrador.' });
  }
});

app.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });
    if (!user) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    
    // Verifica se a empresa está ativa
    if (user.tenant && user.tenant.isActive === false) {
      return res.status(200).json({
        token: jwt.sign({ userId: user.id, tenantId: user.tenantId, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' }),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          tenantId: user.tenantId,
          tenantName: user.tenant.name,
          isActive: false, 
          role: 'admin',
        }
      });
    }

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, role: 'admin' }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tenantId: user.tenantId,
        tenantName: user.tenant ? user.tenant.name : 'Super Admin',
        isActive: user.tenant ? user.tenant.isActive : true,
        role: 'admin',
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

app.post('/professional-login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const professional = await prisma.professional.findUnique({
      where: { email },
      include: { tenant: true },
    });
    if (!professional || !professional.password) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    const passwordMatch = await bcrypt.compare(password, professional.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }
    const token = jwt.sign(
      { userId: professional.id, tenantId: professional.tenantId, role: 'professional' }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    return res.status(200).json({
      token,
      user: {
        id: professional.id,
        name: professional.name,
        email: professional.email,
        tenantId: professional.tenantId,
        tenantName: professional.tenant.name,
        isActive: professional.tenant.isActive,
        role: 'professional',
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro no login do profissional.' });
  }
});

// ==========================================
// ROTAS DE OPERAÇÃO (Serviços, Produtos, Agenda, etc.)
// ==========================================
app.get('/business-hours/:tenantId', authMiddleware, tenantMatchMiddleware, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const hours = await prisma.businessHour.findMany({ where: { tenantId }, orderBy: { dayOfWeek: 'asc' } });
    return res.status(200).json(hours);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar horários.' });
  }
});

app.get('/business-hours/:tenantId/public', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const hours = await prisma.businessHour.findMany({ where: { tenantId }, orderBy: { dayOfWeek: 'asc' } });
    return res.status(200).json(hours);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar horários.' });
  }
});

app.put('/business-hour/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const hour = await prisma.businessHour.findUnique({ where: { id } });
    
    if (!hour) return res.status(404).json({ error: 'Horário não encontrado.' });
    if (req.role !== 'super-admin' && hour.tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    const { isOpen, openTime, closeTime, lunchStart, lunchEnd } = req.body;
    const updated = await prisma.businessHour.update({
      where: { id },
      data: { isOpen, openTime, closeTime, lunchStart, lunchEnd },
    });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao atualizar horário.' });
  }
});

app.get('/professional-hours/:professionalId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { professionalId } = req.params;
    
    const professional = await prisma.professional.findUnique({ where: { id: professionalId } });
    if (!professional) return res.status(404).json({ error: 'Profissional não encontrado.' });
    if (req.role !== 'super-admin' && professional.tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    let hours = await prisma.professionalHour.findMany({ where: { professionalId }, orderBy: { dayOfWeek: 'asc' } });
    
    if (hours.length === 0) {
      const defaultHours = [
        { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
        { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
        { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
        { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
        { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
        { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '19:30', lunchStart: '12:00', lunchEnd: '13:00' },
        { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00' },
      ];
      for (const h of defaultHours) {
        await prisma.professionalHour.create({ data: { ...h, professionalId } });
      }
      hours = await prisma.professionalHour.findMany({ where: { professionalId }, orderBy: { dayOfWeek: 'asc' } });
    }

    return res.status(200).json(hours);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar horários do profissional.' });
  }
});

app.put('/professional-hour/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const hour = await prisma.professionalHour.findUnique({ 
      where: { id },
      include: { professional: true } 
    });
    
    if (!hour) return res.status(404).json({ error: 'Horário não encontrado.' });
    if (req.role !== 'super-admin' && hour.professional.tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    const { isOpen, openTime, closeTime, lunchStart, lunchEnd } = req.body;
    const updated = await prisma.professionalHour.update({
      where: { id },
      data: { isOpen, openTime, closeTime, lunchStart, lunchEnd },
    });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao atualizar horário do profissional.' });
  }
});

app.post('/service', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, duration, price } = req.body;
    const tenantId = req.role === 'super-admin' ? req.body.tenantId : req.tenantId;

    const newService = await prisma.service.create({
      data: { name, duration: Number(duration) || 30, price: Number(price) || 0, tenantId },
    });
    return res.status(201).json(newService);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao criar serviço.' });
  }
});

app.get('/services/:tenantId', authMiddleware, tenantMatchMiddleware, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const services = await prisma.service.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
    return res.status(200).json(services);
  } catch (error) {
    return res.status(200).json([]);
  }
});

app.get('/services/:tenantId/public', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const services = await prisma.service.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
    return res.status(200).json(services);
  } catch (error) {
    return res.status(200).json([]);
  }
});

app.delete('/service/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.findUnique({ where: { id } });
    
    if (!service) return res.status(404).json({ error: 'Serviço não encontrado.' });
    if (req.role !== 'super-admin' && service.tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    await prisma.appointment.updateMany({
      where: { serviceId: id },
      data: { serviceId: null },
    });
    await prisma.service.delete({ where: { id } });
    return res.status(200).json({ message: 'Serviço excluído com sucesso.' });
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao excluir serviço.' });
  }
});

app.post('/product', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, stock } = req.body;
    const tenantId = req.role === 'super-admin' ? req.body.tenantId : req.tenantId;

    const newProduct = await prisma.product.create({
      data: { name, price: Number(price) || 0, stock: Number(stock) || 0, tenantId },
    });
    return res.status(201).json(newProduct);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao criar produto.' });
  }
});

app.get('/products/:tenantId', authMiddleware, tenantMatchMiddleware, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const products = await prisma.product.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
    return res.status(200).json(products);
  } catch (error) {
    return res.status(200).json([]);
  }
});

app.delete('/product/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    
    if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });
    if (req.role !== 'super-admin' && product.tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    await prisma.product.delete({ where: { id } });
    return res.status(200).json({ message: 'Produto excluído com sucesso.' });
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao excluir produto.' });
  }
});

app.post('/expense', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { description, amount } = req.body;
    const tenantId = req.role === 'super-admin' ? req.body.tenantId : req.tenantId;

    const expense = await prisma.expense.create({
      data: { description, amount: Number(amount) || 0, tenantId }
    });
    return res.status(201).json(expense);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao cadastrar despesa.' });
  }
});

app.get('/expenses/:tenantId', authMiddleware, tenantMatchMiddleware, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const expenses = await prisma.expense.findMany({ where: { tenantId }, orderBy: { date: 'desc' } });
    return res.status(200).json(expenses);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar despesas.' });
  }
});

app.delete('/expense/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const expense = await prisma.expense.findUnique({ where: { id } });
    
    if (!expense) return res.status(404).json({ error: 'Despesa não encontrada.' });
    if (req.role !== 'super-admin' && expense.tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    await prisma.expense.delete({ where: { id } });
    return res.status(200).json({ message: 'Despesa excluída com sucesso.' });
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao excluir despesa.' });
  }
});

app.post('/review', async (req: Request, res: Response) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    const review = await prisma.review.create({
      data: { appointmentId, rating: Number(rating), comment: comment || null }
    });
    return res.status(201).json(review);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao salvar avaliação.' });
  }
});

app.get('/reviews/:tenantId', authMiddleware, tenantMatchMiddleware, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { appointment: { tenantId } },
      include: { appointment: { include: { customer: true, service: true, professional: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar avaliações.' });
  }
});

app.post('/professional', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, nickname, avatarUrl, email, password, commission } = req.body;
    const tenantId = req.role === 'super-admin' ? req.body.tenantId : req.tenantId;

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    const newProf = await prisma.professional.create({
      data: { 
        name, 
        nickname, 
        avatarUrl: avatarUrl || null, 
        email: email || null, 
        password: hashedPassword, 
        commission: commission !== undefined ? Number(commission) : 50.0,
        tenantId 
      }
    });
    return res.status(201).json(newProf);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao cadastrar profissional.' });
  }
});

app.get('/professionals/:tenantId', authMiddleware, tenantMatchMiddleware, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const professionals = await prisma.professional.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
    return res.status(200).json(professionals);
  } catch (error) {
    return res.status(200).json([]);
  }
});

app.get('/professionals/:tenantId/public', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const professionals = await prisma.professional.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
    return res.status(200).json(professionals);
  } catch (error) {
    return res.status(200).json([]);
  }
});

app.delete('/professional/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const professional = await prisma.professional.findUnique({ where: { id } });
    
    if (!professional) return res.status(404).json({ error: 'Profissional não encontrado.' });
    if (req.role !== 'super-admin' && professional.tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    await prisma.professionalHour.deleteMany({ where: { professionalId: id } });
    await prisma.professional.delete({ where: { id } });
    return res.status(200).json({ message: 'Profissional excluído com sucesso.' });
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao excluir profissional.' });
  }
});

app.post('/customer', async (req: Request, res: Response) => {
  try {
    const { name, phone, birthDate, tenantId } = req.body;
    const cleanPhone = String(phone).replace(/\D/g, '');
    
    let customer = await prisma.customer.findFirst({ 
      where: { tenantId, phone: { contains: cleanPhone } } 
    });

    if (!customer) {
      customer = await prisma.customer.create({ 
        data: { name, phone: cleanPhone, birthDate: birthDate || null, tenantId } 
      });
    } else {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { 
          name, 
          phone: cleanPhone, 
          birthDate: birthDate !== undefined ? (birthDate || null) : customer.birthDate 
        }
      });
    }

    return res.status(201).json(customer);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao criar ou buscar cliente.' });
  }
});

app.get('/customer-appointments/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { phone } = req.query;

    if (!phone) return res.status(400).json({ error: 'Telefone obrigatório.' });

    const cleanSearchPhone = String(phone).replace(/\D/g, '');

    const allCustomers = await prisma.customer.findMany({ where: { tenantId } });
    const matchedCustomers = allCustomers.filter(c => c.phone.replace(/\D/g, '').includes(cleanSearchPhone));
    const customerIds = matchedCustomers.map(c => c.id);

    if (customerIds.length === 0) {
      return res.status(200).json([]);
    }

    const appointments = await prisma.appointment.findMany({
      where: { tenantId, customerId: { in: customerIds } },
      include: { service: true, professional: true, customer: true, review: true },
      orderBy: { date: 'desc' },
    });

    return res.status(200).json(appointments);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar histórico.' });
  }
});

app.get('/customers-report/:tenantId', authMiddleware, tenantMatchMiddleware, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const customers = await prisma.customer.findMany({
      where: { tenantId },
      include: {
        appointments: {
          include: { service: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    const formatted = customers.map(c => {
      const totalAppointments = c.appointments.length;
      const totalSpent = c.appointments.reduce((acc, app) => acc + (app.service?.price || 0), 0);
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        birthDate: c.birthDate,
        totalAppointments,
        totalSpent,
        lastAppointment: c.appointments.length > 0 ? c.appointments[c.appointments.length - 1].date : null
      };
    });
    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar relatório de clientes.' });
  }
});

app.post('/appointment', async (req: Request, res: Response) => {
  try {
    const { date, tenantId, customerId, serviceId, professionalId, productIds } = req.body;
    const start = new Date(date);

    const service = serviceId ? await prisma.service.findUnique({ where: { id: serviceId } }) : null;
    const duration = service?.duration || 30;
    const end = new Date(start.getTime() + duration * 60000);

    const sameDayAppointments = await prisma.appointment.findMany({
      where: {
        tenantId,
        professionalId: professionalId || null,
        date: {
          gte: new Date(start.getFullYear(), start.getMonth(), start.getDate()),
          lt: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1),
        },
      },
      include: { service: true },
    });

    const hasConflict = sameDayAppointments.some((a) => {
      const aStart = new Date(a.date);
      const aEnd = new Date(aStart.getTime() + (a.service?.duration || 30) * 60000);
      return start < aEnd && end > aStart;
    });

    if (hasConflict) {
      return res.status(400).json({ error: 'Este horário já está ocupado para este profissional.' });
    }

    if (productIds && Array.isArray(productIds)) {
      for (const prodId of productIds) {
        const product = await prisma.product.findUnique({ where: { id: prodId } });
        if (product && product.stock > 0) {
          await prisma.product.update({
            where: { id: prodId },
            data: { stock: product.stock - 1 }
          });
        }
      }
    }

    const newAppointment = await prisma.appointment.create({
      data: { date: start, tenantId, customerId, serviceId: serviceId || null, professionalId: professionalId || null },
      include: { customer: true, tenant: true, service: true, professional: true },
    });

    const formattedDate = start.toLocaleDateString('pt-BR');
    const formattedTime = start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const serviceName = newAppointment.service?.name || 'Atendimento';
    const tenantName = newAppointment.tenant?.name || 'Estabelecimento';
    
    const whatsappMessage = encodeURIComponent(
      `Olá ${newAppointment.customer.name}! Seu agendamento de *${serviceName}* na *${tenantName}* está confirmado para o dia *${formattedDate} às ${formattedTime}*. Te esperamos lá!`
    );
    
    const customerPhoneClean = newAppointment.customer.phone.replace(/\D/g, '');
    const whatsappLink = `https://api.whatsapp.com/send?phone=55${customerPhoneClean}&text=${whatsappMessage}`;

    return res.status(201).json({
      ...newAppointment,
      whatsappLink,
    });
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao criar agendamento.' });
  }
});

app.get('/appointments/:tenantId', authMiddleware, tenantMatchMiddleware, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const appointments = await prisma.appointment.findMany({
      where: { tenantId },
      include: { customer: true, service: true, professional: true, review: true },
      orderBy: { date: 'asc' },
    });
    return res.status(200).json(appointments);
  } catch (error) {
    return res.status(200).json([]);
  }
});

app.get('/appointments/:tenantId/slots', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const appointments = await prisma.appointment.findMany({
      where: { tenantId },
      select: { date: true, professionalId: true, service: { select: { duration: true } } },
    });
    return res.status(200).json(appointments);
  } catch (error) {
    return res.status(200).json([]);
  }
});

app.delete('/appointment/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { phone } = req.query;

    const appointment = await prisma.appointment.findUnique({ 
      where: { id }, 
      include: { customer: true } 
    });
    
    if (!appointment) return res.status(404).json({ error: 'Agendamento não encontrado.' });

    const cleanPhone = String(phone || '').replace(/\D/g, '');
    if (!cleanPhone || appointment.customer.phone !== cleanPhone) {
      return res.status(403).json({ error: 'Não autorizado a cancelar este agendamento.' });
    }

    await prisma.appointment.delete({ where: { id } });
    return res.status(200).json({ message: 'Agendamento cancelado com sucesso!' });
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao cancelar o agendamento.' });
  }
});

cron.schedule('0 20 * * *', async () => {
  console.log('🤖 Executando rotina de disparo dos resumos diários (20h)...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Servidor do Agende+ rodando na porta ${PORT}`);
});