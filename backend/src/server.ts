import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cron from 'node-cron';

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = 'segredo_super_secreto_agende_plus';

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Servidor do Agende+ rodando com sucesso! 🚀');
});

app.put('/admin/update-user-email/:userId', async (req: Request, res: Response) => {
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

app.put('/admin/toggle-tenant-status/:tenantId', async (req: Request, res: Response) => {
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

app.put('/admin/update-tenant-due-date/:tenantId', async (req: Request, res: Response) => {
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

app.put('/admin/update-tenant-plan/:tenantId', async (req: Request, res: Response) => {
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

app.get('/tenants', async (req: Request, res: Response) => {
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

app.put('/tenant/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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

app.delete('/tenant/:id', async (req: Request, res: Response) => {
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

app.get('/business-hours/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const hours = await prisma.businessHour.findMany({ where: { tenantId }, orderBy: { dayOfWeek: 'asc' } });
    return res.status(200).json(hours);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar horários.' });
  }
});

app.put('/business-hour/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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

app.get('/professional-hours/:professionalId', async (req: Request, res: Response) => {
  try {
    const { professionalId } = req.params;
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

app.put('/professional-hour/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
    
    const token = jwt.sign({ userId: user.id, tenantId: user.tenantId }, JWT_SECRET, { expiresIn: '7d' });
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
    return res.status(200).json({
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
    return res.status(500).json({ error: 'Erro no login do profissional.' });
  }
});

app.post('/service', async (req: Request, res: Response) => {
  try {
    const { name, duration, price, tenantId } = req.body;
    const newService = await prisma.service.create({
      data: { name, duration: Number(duration) || 30, price: Number(price) || 0, tenantId },
    });
    return res.status(201).json(newService);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao criar serviço.' });
  }
});

app.get('/services/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const services = await prisma.service.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
    return res.status(200).json(services);
  } catch (error) {
    return res.status(200).json([]);
  }
});

app.delete('/service/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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

app.post('/product', async (req: Request, res: Response) => {
  try {
    const { name, price, stock, tenantId } = req.body;
    const newProduct = await prisma.product.create({
      data: { name, price: Number(price) || 0, stock: Number(stock) || 0, tenantId },
    });
    return res.status(201).json(newProduct);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao criar produto.' });
  }
});

app.get('/products/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const products = await prisma.product.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
    return res.status(200).json(products);
  } catch (error) {
    return res.status(200).json([]);
  }
});

app.delete('/product/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    return res.status(200).json({ message: 'Produto excluído com sucesso.' });
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao excluir produto.' });
  }
});

app.post('/expense', async (req: Request, res: Response) => {
  try {
    const { description, amount, tenantId } = req.body;
    const expense = await prisma.expense.create({
      data: { description, amount: Number(amount) || 0, tenantId }
    });
    return res.status(201).json(expense);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao cadastrar despesa.' });
  }
});

app.get('/expenses/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const expenses = await prisma.expense.findMany({ where: { tenantId }, orderBy: { date: 'desc' } });
    return res.status(200).json(expenses);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar despesas.' });
  }
});

app.delete('/expense/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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

app.get('/reviews/:tenantId', async (req: Request, res: Response) => {
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

app.post('/professional', async (req: Request, res: Response) => {
  try {
    const { name, nickname, avatarUrl, email, password, commission, tenantId } = req.body;
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

app.get('/professionals/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const professionals = await prisma.professional.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
    return res.status(200).json(professionals);
  } catch (error) {
    return res.status(200).json([]);
  }
});

app.delete('/professional/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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

app.get('/customers-report/:tenantId', async (req: Request, res: Response) => {
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
    const appointmentDate = new Date(date);

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: { tenantId, date: appointmentDate, professionalId: professionalId || null },
    });

    if (conflictingAppointment) {
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
      data: { date: appointmentDate, tenantId, customerId, serviceId: serviceId || null, professionalId: professionalId || null },
      include: { customer: true, tenant: true, service: true, professional: true },
    });

    const formattedDate = appointmentDate.toLocaleDateString('pt-BR');
    const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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

app.get('/appointments/:tenantId', async (req: Request, res: Response) => {
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

app.delete('/appointment/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id } });
    return res.status(200).json({ message: 'Agendamento cancelado com sucesso!' });
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao cancelar o agendamento.' });
  }
});

cron.schedule('0 20 * * *', async () => {
  console.log('🤖 Executando rotina de disparo dos resumos diários (20h)...');
});

app.listen(3000, () => {
  console.log('🔥 Servidor do Agende+ rodando na porta 3000');
});