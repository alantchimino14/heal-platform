import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from 'database';
import {
  CreateProfesionalDto,
  UpdateProfesionalDto,
  CreateContratoDto,
  UpdateContratoDto,
  CreateMetaDto,
  UpdateMetaDto,
  AjusteLiquidacionDto,
} from './dto';

@Injectable()
export class ProfesionalesService {
  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // PROFESIONALES CRUD
  // ============================================================================

  async findAll(params?: { search?: string; isActive?: boolean }) {
    const where: Prisma.ProfesionalWhereInput = {};

    if (params?.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { rut: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    return this.prisma.profesional.findMany({
      where,
      orderBy: { firstName: 'asc' },
      include: {
        _count: {
          select: { sesiones: true, planesTerapeuticos: true },
        },
        contratos: {
          where: { isActive: true },
          orderBy: { fechaInicio: 'desc' },
          take: 1,
        },
      },
    });
  }

  async findOne(id: string) {
    const profesional = await this.prisma.profesional.findUnique({
      where: { id },
      include: {
        _count: {
          select: { sesiones: true, planesTerapeuticos: true },
        },
        contratos: {
          where: { isActive: true },
          orderBy: { fechaInicio: 'desc' },
        },
        preciosPersonalizados: {
          where: { isActive: true },
          include: {
            servicio: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
                precio: true,
                categoria: true,
              },
            },
          },
        },
      },
    });

    if (!profesional) {
      throw new NotFoundException(`Profesional con ID ${id} no encontrado`);
    }

    return profesional;
  }

  async create(data: CreateProfesionalDto) {
    return this.prisma.profesional.create({ data });
  }

  async update(id: string, data: UpdateProfesionalDto) {
    await this.findOne(id);
    return this.prisma.profesional.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.profesional.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ============================================================================
  // CONTRATOS
  // ============================================================================

  async getContratos(profesionalId: string) {
    await this.findOne(profesionalId);
    return this.prisma.contratoProfesional.findMany({
      where: { profesionalId },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  async getContratoActivo(profesionalId: string) {
    await this.findOne(profesionalId);
    return this.prisma.contratoProfesional.findFirst({
      where: {
        profesionalId,
        isActive: true,
        OR: [{ fechaFin: null }, { fechaFin: { gte: new Date() } }],
      },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  async createContrato(profesionalId: string, data: CreateContratoDto) {
    await this.findOne(profesionalId);

    // Desactivar contrato anterior si existe
    await this.prisma.contratoProfesional.updateMany({
      where: { profesionalId, isActive: true },
      data: { isActive: false },
    });

    return this.prisma.contratoProfesional.create({
      data: {
        profesionalId,
        tipo: data.tipo,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
        horasSemanales: data.horasSemanales,
        tarifaPorSesion: data.tarifaPorSesion,
        salarioBase: data.salarioBase,
        porcentajeComision: data.porcentajeComision,
        bonoMetaCumplida: data.bonoMetaCumplida,
        notas: data.notas,
      },
    });
  }

  async updateContrato(contratoId: string, data: UpdateContratoDto) {
    const contrato = await this.prisma.contratoProfesional.findUnique({
      where: { id: contratoId },
    });

    if (!contrato) {
      throw new NotFoundException(`Contrato con ID ${contratoId} no encontrado`);
    }

    return this.prisma.contratoProfesional.update({
      where: { id: contratoId },
      data: {
        ...data,
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : undefined,
      },
    });
  }

  // ============================================================================
  // METAS MENSUALES
  // ============================================================================

  async getMetas(
    profesionalId: string,
    params?: { anio?: number; limit?: number },
  ) {
    await this.findOne(profesionalId);

    const where: Prisma.MetaMensualWhereInput = { profesionalId };
    if (params?.anio) {
      where.anio = params.anio;
    }

    return this.prisma.metaMensual.findMany({
      where,
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
      take: params?.limit || 12,
    });
  }

  async getMetaActual(profesionalId: string) {
    await this.findOne(profesionalId);
    const now = new Date();

    return this.prisma.metaMensual.findUnique({
      where: {
        profesionalId_mes_anio: {
          profesionalId,
          mes: now.getMonth() + 1,
          anio: now.getFullYear(),
        },
      },
    });
  }

  async createMeta(profesionalId: string, data: CreateMetaDto) {
    await this.findOne(profesionalId);

    // Verificar que no exista ya una meta para ese período
    const existing = await this.prisma.metaMensual.findUnique({
      where: {
        profesionalId_mes_anio: {
          profesionalId,
          mes: data.mes,
          anio: data.anio,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Ya existe una meta para ${data.mes}/${data.anio}`,
      );
    }

    return this.prisma.metaMensual.create({
      data: {
        profesionalId,
        mes: data.mes,
        anio: data.anio,
        sesionesObjetivo: data.sesionesObjetivo,
        bonoMonto: data.bonoMonto,
        notas: data.notas,
      },
    });
  }

  async updateMeta(metaId: string, data: UpdateMetaDto) {
    const meta = await this.prisma.metaMensual.findUnique({
      where: { id: metaId },
    });

    if (!meta) {
      throw new NotFoundException(`Meta con ID ${metaId} no encontrada`);
    }

    return this.prisma.metaMensual.update({
      where: { id: metaId },
      data,
    });
  }

  async actualizarProgresoMeta(profesionalId: string, mes: number, anio: number) {
    // Contar sesiones realizadas en el período
    const inicioMes = new Date(anio, mes - 1, 1);
    const finMes = new Date(anio, mes, 0, 23, 59, 59, 999);

    const sesionesRealizadas = await this.prisma.sesion.count({
      where: {
        profesionalId,
        estadoAtencion: 'REALIZADA',
        fechaHora: {
          gte: inicioMes,
          lte: finMes,
        },
      },
    });

    const meta = await this.prisma.metaMensual.findUnique({
      where: {
        profesionalId_mes_anio: { profesionalId, mes, anio },
      },
    });

    if (!meta) return null;

    const cumplimiento =
      meta.sesionesObjetivo > 0
        ? (sesionesRealizadas / meta.sesionesObjetivo) * 100
        : 0;

    return this.prisma.metaMensual.update({
      where: { id: meta.id },
      data: {
        sesionesRealizadas,
        cumplimiento: Math.min(cumplimiento, 100),
        metaCumplida: sesionesRealizadas >= meta.sesionesObjetivo,
      },
    });
  }

  // ============================================================================
  // LIQUIDACIONES
  // ============================================================================

  async getLiquidaciones(
    profesionalId: string,
    params?: { anio?: number; limit?: number },
  ) {
    await this.findOne(profesionalId);

    const where: Prisma.LiquidacionWhereInput = { profesionalId };
    if (params?.anio) {
      where.anio = params.anio;
    }

    return this.prisma.liquidacion.findMany({
      where,
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
      take: params?.limit || 12,
    });
  }

  async getLiquidacion(liquidacionId: string) {
    const liquidacion = await this.prisma.liquidacion.findUnique({
      where: { id: liquidacionId },
      include: {
        profesional: {
          select: { id: true, firstName: true, lastName: true, rut: true },
        },
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!liquidacion) {
      throw new NotFoundException(
        `Liquidación con ID ${liquidacionId} no encontrada`,
      );
    }

    return liquidacion;
  }

  async generarLiquidacion(profesionalId: string, mes: number, anio: number) {
    const profesional = await this.findOne(profesionalId);

    // Verificar que no exista ya
    const existing = await this.prisma.liquidacion.findUnique({
      where: {
        profesionalId_mes_anio: { profesionalId, mes, anio },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Ya existe una liquidación para ${mes}/${anio}`,
      );
    }

    // Obtener contrato activo
    const contrato = await this.getContratoActivo(profesionalId);

    // Obtener sesiones del período
    const inicioMes = new Date(anio, mes - 1, 1);
    const finMes = new Date(anio, mes, 0, 23, 59, 59, 999);

    const sesiones = await this.prisma.sesion.findMany({
      where: {
        profesionalId,
        fechaHora: {
          gte: inicioMes,
          lte: finMes,
        },
      },
      include: {
        paciente: { select: { firstName: true, lastName: true } },
        servicio: { select: { nombre: true } },
      },
    });

    const sesionesRealizadas = sesiones.filter(
      (s) => s.estadoAtencion === 'REALIZADA',
    );

    // Calcular ingresos por sesiones
    let ingresosSesiones = 0;
    const itemsData: Array<{
      tipo: string;
      concepto: string;
      descripcion?: string;
      cantidad?: number;
      valorUnitario?: number;
      monto: number;
      esDescuento: boolean;
      sesionId?: string;
    }> = [];

    for (const sesion of sesionesRealizadas) {
      const tarifaSesion = contrato?.tarifaPorSesion
        ? Number(contrato.tarifaPorSesion)
        : Number(sesion.precioFinal) * 0.5; // 50% por defecto si no hay contrato

      ingresosSesiones += tarifaSesion;

      itemsData.push({
        tipo: 'SESION',
        concepto: `Sesión ${sesion.servicio?.nombre || 'General'}`,
        descripcion: `${sesion.paciente.firstName} ${sesion.paciente.lastName} - ${new Date(sesion.fechaHora).toLocaleDateString('es-CL')}`,
        cantidad: 1,
        valorUnitario: tarifaSesion,
        monto: tarifaSesion,
        esDescuento: false,
        sesionId: sesion.id,
      });
    }

    // Verificar bono por meta
    let bonoMeta = 0;
    const meta = await this.prisma.metaMensual.findUnique({
      where: {
        profesionalId_mes_anio: { profesionalId, mes, anio },
      },
    });

    if (
      meta &&
      meta.metaCumplida &&
      !meta.bonoOtorgado &&
      meta.bonoMonto
    ) {
      bonoMeta = Number(meta.bonoMonto);
      itemsData.push({
        tipo: 'BONO_META',
        concepto: 'Bono por cumplimiento de meta',
        descripcion: `Meta: ${meta.sesionesObjetivo} sesiones - Realizadas: ${meta.sesionesRealizadas}`,
        monto: bonoMeta,
        esDescuento: false,
      });
    }

    const totalBruto = ingresosSesiones + bonoMeta;
    const totalLiquido = totalBruto; // Se ajusta con items de descuento después

    // Crear liquidación primero
    const liquidacion = await this.prisma.liquidacion.create({
      data: {
        profesionalId,
        mes,
        anio,
        sesionesTotales: sesiones.length,
        sesionesRealizadas: sesionesRealizadas.length,
        ingresosSesiones,
        bonoMeta,
        totalBruto,
        totalLiquido,
        estado: 'BORRADOR',
      },
    });

    // Crear items asociados
    if (itemsData.length > 0) {
      await this.prisma.liquidacionItem.createMany({
        data: itemsData.map((item) => ({
          liquidacionId: liquidacion.id,
          tipo: item.tipo as any,
          concepto: item.concepto,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          valorUnitario: item.valorUnitario,
          monto: item.monto,
          esDescuento: item.esDescuento,
          sesionId: item.sesionId,
        })),
      });
    }

    // Retornar con items incluidos
    return this.prisma.liquidacion.findUnique({
      where: { id: liquidacion.id },
      include: {
        items: true,
        profesional: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  async agregarAjusteLiquidacion(liquidacionId: string, data: AjusteLiquidacionDto) {
    const liquidacion = await this.getLiquidacion(liquidacionId);

    if (liquidacion.estado !== 'BORRADOR' && liquidacion.estado !== 'PENDIENTE') {
      throw new BadRequestException(
        'Solo se pueden agregar ajustes a liquidaciones en borrador o pendientes',
      );
    }

    await this.prisma.liquidacionItem.create({
      data: {
        liquidacionId,
        tipo: data.esDescuento ? 'DESCUENTO' : 'AJUSTE',
        concepto: data.concepto,
        descripcion: data.descripcion,
        monto: Math.abs(data.monto),
        esDescuento: data.esDescuento,
      },
    });

    // Recalcular totales
    return this.recalcularLiquidacion(liquidacionId);
  }

  async recalcularLiquidacion(liquidacionId: string) {
    const liquidacion = await this.prisma.liquidacion.findUnique({
      where: { id: liquidacionId },
      include: { items: true },
    });

    if (!liquidacion) {
      throw new NotFoundException('Liquidación no encontrada');
    }

    let totalBruto = 0;
    let totalDescuentos = 0;

    for (const item of liquidacion.items) {
      if (item.esDescuento) {
        totalDescuentos += Number(item.monto);
      } else {
        totalBruto += Number(item.monto);
      }
    }

    return this.prisma.liquidacion.update({
      where: { id: liquidacionId },
      data: {
        totalBruto,
        totalDescuentos,
        totalLiquido: totalBruto - totalDescuentos,
      },
      include: {
        items: true,
        profesional: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async aprobarLiquidacion(liquidacionId: string, notas?: string) {
    const liquidacion = await this.getLiquidacion(liquidacionId);

    if (liquidacion.estado !== 'BORRADOR' && liquidacion.estado !== 'PENDIENTE') {
      throw new BadRequestException(
        'Solo se pueden aprobar liquidaciones en borrador o pendientes',
      );
    }

    return this.prisma.liquidacion.update({
      where: { id: liquidacionId },
      data: {
        estado: 'APROBADA',
        fechaAprobacion: new Date(),
        notas: notas || liquidacion.notas,
      },
      include: {
        items: true,
        profesional: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async pagarLiquidacion(
    liquidacionId: string,
    metodoPago: string,
    referenciaPago?: string,
    notas?: string,
  ) {
    const liquidacion = await this.getLiquidacion(liquidacionId);

    if (liquidacion.estado !== 'APROBADA') {
      throw new BadRequestException(
        'Solo se pueden pagar liquidaciones aprobadas',
      );
    }

    // Marcar bono como otorgado si corresponde
    const bonoItem = liquidacion.items.find((i) => i.tipo === 'BONO_META');
    if (bonoItem) {
      await this.prisma.metaMensual.updateMany({
        where: {
          profesionalId: liquidacion.profesionalId,
          mes: liquidacion.mes,
          anio: liquidacion.anio,
        },
        data: { bonoOtorgado: true },
      });
    }

    return this.prisma.liquidacion.update({
      where: { id: liquidacionId },
      data: {
        estado: 'PAGADA',
        fechaPago: new Date(),
        metodoPago: metodoPago as any,
        referenciaPago,
        notas: notas || liquidacion.notas,
      },
      include: {
        items: true,
        profesional: { select: { firstName: true, lastName: true } },
      },
    });
  }

  // ============================================================================
  // MÉTRICAS Y REPORTES
  // ============================================================================

  async getMetricas(id: string, params?: { desde?: string; hasta?: string }) {
    await this.findOne(id);

    const where: Prisma.SesionWhereInput = {
      profesionalId: id,
    };

    if (params?.desde || params?.hasta) {
      where.fechaHora = {};
      if (params?.desde) {
        where.fechaHora.gte = new Date(params.desde);
      }
      if (params?.hasta) {
        const hasta = new Date(params.hasta);
        hasta.setHours(23, 59, 59, 999);
        where.fechaHora.lte = hasta;
      }
    }

    const sesiones = await this.prisma.sesion.findMany({
      where,
      select: {
        id: true,
        precioFinal: true,
        montoPagado: true,
        estadoAtencion: true,
        estadoPago: true,
      },
    });

    const sesionesRealizadas = sesiones.filter(
      (s) => s.estadoAtencion === 'REALIZADA',
    );
    const ingresosTotales = sesionesRealizadas.reduce(
      (sum, s) => sum + Number(s.precioFinal),
      0,
    );
    const ingresosCobrados = sesionesRealizadas.reduce(
      (sum, s) => sum + Number(s.montoPagado),
      0,
    );

    // Obtener meta actual
    const now = new Date();
    const metaActual = await this.prisma.metaMensual.findUnique({
      where: {
        profesionalId_mes_anio: {
          profesionalId: id,
          mes: now.getMonth() + 1,
          anio: now.getFullYear(),
        },
      },
    });

    return {
      totalSesiones: sesiones.length,
      sesionesRealizadas: sesionesRealizadas.length,
      sesionesPendientes: sesiones.filter((s) => s.estadoAtencion === 'PENDIENTE')
        .length,
      ingresosTotales,
      ingresosCobrados,
      ingresosPendientes: ingresosTotales - ingresosCobrados,
      sesionesPagadas: sesionesRealizadas.filter((s) => s.estadoPago === 'PAGADA')
        .length,
      sesionesSinPago: sesionesRealizadas.filter(
        (s) => s.estadoPago === 'NO_PAGADA',
      ).length,
      metaActual: metaActual
        ? {
            sesionesObjetivo: metaActual.sesionesObjetivo,
            sesionesRealizadas: metaActual.sesionesRealizadas,
            cumplimiento: Number(metaActual.cumplimiento),
            metaCumplida: metaActual.metaCumplida,
          }
        : null,
    };
  }

  async getSesiones(
    id: string,
    params?: {
      desde?: string;
      hasta?: string;
      estadoAtencion?: string;
      page?: number;
      limit?: number;
    },
  ) {
    await this.findOne(id);

    const where: Prisma.SesionWhereInput = {
      profesionalId: id,
    };

    if (params?.desde || params?.hasta) {
      where.fechaHora = {};
      if (params?.desde) {
        where.fechaHora.gte = new Date(params.desde);
      }
      if (params?.hasta) {
        const hasta = new Date(params.hasta);
        hasta.setHours(23, 59, 59, 999);
        where.fechaHora.lte = hasta;
      }
    }

    if (params?.estadoAtencion) {
      where.estadoAtencion = params.estadoAtencion as any;
    }

    const page = params?.page || 1;
    const limit = params?.limit || 20;

    const [data, total] = await Promise.all([
      this.prisma.sesion.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { fechaHora: 'desc' },
        include: {
          paciente: {
            select: { id: true, firstName: true, lastName: true, rut: true },
          },
          servicio: {
            select: { id: true, nombre: true },
          },
        },
      }),
      this.prisma.sesion.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getIngresosPorPeriodo(
    id: string,
    params: { desde: string; hasta: string; agrupacion?: 'dia' | 'semana' | 'mes' },
  ) {
    await this.findOne(id);

    const desde = new Date(params.desde);
    const hasta = new Date(params.hasta);
    hasta.setHours(23, 59, 59, 999);

    const sesiones = await this.prisma.sesion.findMany({
      where: {
        profesionalId: id,
        estadoAtencion: 'REALIZADA',
        fechaHora: {
          gte: desde,
          lte: hasta,
        },
      },
      select: {
        fechaHora: true,
        precioFinal: true,
        montoPagado: true,
      },
      orderBy: { fechaHora: 'asc' },
    });

    const agrupacion = params.agrupacion || 'dia';
    const grupos = new Map<
      string,
      { generado: number; cobrado: number; sesiones: number }
    >();

    for (const sesion of sesiones) {
      let key: string;
      const fecha = new Date(sesion.fechaHora);

      switch (agrupacion) {
        case 'semana':
          const startOfWeek = new Date(fecha);
          startOfWeek.setDate(fecha.getDate() - fecha.getDay());
          key = startOfWeek.toISOString().split('T')[0];
          break;
        case 'mes':
          key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = fecha.toISOString().split('T')[0];
      }

      if (!grupos.has(key)) {
        grupos.set(key, { generado: 0, cobrado: 0, sesiones: 0 });
      }
      const grupo = grupos.get(key)!;
      grupo.generado += Number(sesion.precioFinal);
      grupo.cobrado += Number(sesion.montoPagado);
      grupo.sesiones++;
    }

    return Array.from(grupos.entries()).map(([periodo, datos]) => ({
      periodo,
      ...datos,
    }));
  }

  // ============================================================================
  // RESUMEN PARA DASHBOARD DEL PROFESIONAL
  // ============================================================================

  async getResumenProfesional(profesionalId: string) {
    const profesional = await this.findOne(profesionalId);
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const finHoy = new Date();
    finHoy.setHours(23, 59, 59, 999);

    // Sesiones del mes
    const sesionesDelMes = await this.prisma.sesion.count({
      where: {
        profesionalId,
        estadoAtencion: 'REALIZADA',
        fechaHora: { gte: inicioMes, lte: finMes },
      },
    });

    // Sesiones de hoy
    const sesionesHoy = await this.prisma.sesion.findMany({
      where: {
        profesionalId,
        fechaHora: { gte: hoy, lte: finHoy },
      },
      include: {
        paciente: { select: { firstName: true, lastName: true } },
        servicio: { select: { nombre: true } },
      },
      orderBy: { fechaHora: 'asc' },
    });

    // Próximas sesiones (siguientes 7 días)
    const proximas = await this.prisma.sesion.findMany({
      where: {
        profesionalId,
        fechaHora: {
          gt: finHoy,
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        estadoAgenda: { in: ['AGENDADA', 'CONFIRMADA'] },
      },
      include: {
        paciente: { select: { firstName: true, lastName: true } },
        servicio: { select: { nombre: true } },
      },
      orderBy: { fechaHora: 'asc' },
      take: 10,
    });

    // Meta actual
    const meta = await this.prisma.metaMensual.findUnique({
      where: {
        profesionalId_mes_anio: {
          profesionalId,
          mes: now.getMonth() + 1,
          anio: now.getFullYear(),
        },
      },
    });

    // Contrato activo
    const contrato = await this.getContratoActivo(profesionalId);

    // Última liquidación
    const ultimaLiquidacion = await this.prisma.liquidacion.findFirst({
      where: { profesionalId },
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
    });

    return {
      profesional: {
        id: profesional.id,
        nombre: `${profesional.firstName} ${profesional.lastName}`,
        especialidad: profesional.especialidad,
      },
      mesActual: {
        mes: now.getMonth() + 1,
        anio: now.getFullYear(),
        sesionesRealizadas: sesionesDelMes,
        meta: meta
          ? {
              objetivo: meta.sesionesObjetivo,
              cumplimiento: Number(meta.cumplimiento),
              cumplida: meta.metaCumplida,
              bonoDisponible: meta.metaCumplida && !meta.bonoOtorgado,
            }
          : null,
      },
      hoy: {
        total: sesionesHoy.length,
        realizadas: sesionesHoy.filter((s) => s.estadoAtencion === 'REALIZADA').length,
        pendientes: sesionesHoy.filter((s) => s.estadoAtencion === 'PENDIENTE').length,
        sesiones: sesionesHoy,
      },
      proximasSesiones: proximas,
      contrato: contrato
        ? {
            tipo: contrato.tipo,
            fechaInicio: contrato.fechaInicio,
            tarifaPorSesion: contrato.tarifaPorSesion
              ? Number(contrato.tarifaPorSesion)
              : null,
          }
        : null,
      ultimaLiquidacion: ultimaLiquidacion
        ? {
            mes: ultimaLiquidacion.mes,
            anio: ultimaLiquidacion.anio,
            estado: ultimaLiquidacion.estado,
            totalLiquido: Number(ultimaLiquidacion.totalLiquido),
          }
        : null,
    };
  }
}
