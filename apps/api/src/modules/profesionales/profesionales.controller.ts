import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProfesionalesService } from './profesionales.service';
import {
  CreateProfesionalDto,
  UpdateProfesionalDto,
  CreateContratoDto,
  UpdateContratoDto,
  CreateMetaDto,
  UpdateMetaDto,
  GenerarLiquidacionDto,
  AjusteLiquidacionDto,
  AprobarLiquidacionDto,
  PagarLiquidacionDto,
} from './dto';

@ApiTags('Profesionales')
@Controller('profesionales')
export class ProfesionalesController {
  constructor(private readonly profesionalesService: ProfesionalesService) {}

  // ============================================================================
  // PROFESIONALES CRUD
  // ============================================================================

  @Get()
  @ApiOperation({ summary: 'Listar profesionales' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.profesionalesService.findAll({
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener profesional por ID' })
  findOne(@Param('id') id: string) {
    return this.profesionalesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear profesional' })
  create(@Body() data: CreateProfesionalDto) {
    return this.profesionalesService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar profesional' })
  update(@Param('id') id: string, @Body() data: UpdateProfesionalDto) {
    return this.profesionalesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar profesional' })
  remove(@Param('id') id: string) {
    return this.profesionalesService.remove(id);
  }

  // ============================================================================
  // MÉTRICAS Y SESIONES
  // ============================================================================

  @Get(':id/metricas')
  @ApiOperation({ summary: 'Obtener métricas del profesional' })
  getMetricas(
    @Param('id') id: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.profesionalesService.getMetricas(id, { desde, hasta });
  }

  @Get(':id/sesiones')
  @ApiOperation({ summary: 'Obtener sesiones del profesional' })
  getSesiones(
    @Param('id') id: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('estadoAtencion') estadoAtencion?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.profesionalesService.getSesiones(id, {
      desde,
      hasta,
      estadoAtencion,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id/ingresos')
  @ApiOperation({ summary: 'Obtener ingresos por período del profesional' })
  getIngresosPorPeriodo(
    @Param('id') id: string,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    @Query('agrupacion') agrupacion?: 'dia' | 'semana' | 'mes',
  ) {
    return this.profesionalesService.getIngresosPorPeriodo(id, {
      desde,
      hasta,
      agrupacion,
    });
  }

  @Get(':id/resumen')
  @ApiOperation({ summary: 'Obtener resumen completo para dashboard del profesional' })
  getResumen(@Param('id') id: string) {
    return this.profesionalesService.getResumenProfesional(id);
  }

  // ============================================================================
  // CONTRATOS
  // ============================================================================

  @Get(':id/contratos')
  @ApiOperation({ summary: 'Listar contratos del profesional' })
  getContratos(@Param('id') id: string) {
    return this.profesionalesService.getContratos(id);
  }

  @Get(':id/contrato-activo')
  @ApiOperation({ summary: 'Obtener contrato activo del profesional' })
  getContratoActivo(@Param('id') id: string) {
    return this.profesionalesService.getContratoActivo(id);
  }

  @Post(':id/contratos')
  @ApiOperation({ summary: 'Crear nuevo contrato para el profesional' })
  createContrato(@Param('id') id: string, @Body() data: CreateContratoDto) {
    return this.profesionalesService.createContrato(id, data);
  }

  @Put('contratos/:contratoId')
  @ApiOperation({ summary: 'Actualizar contrato' })
  updateContrato(
    @Param('contratoId') contratoId: string,
    @Body() data: UpdateContratoDto,
  ) {
    return this.profesionalesService.updateContrato(contratoId, data);
  }

  // ============================================================================
  // METAS MENSUALES
  // ============================================================================

  @Get(':id/metas')
  @ApiOperation({ summary: 'Listar metas del profesional' })
  @ApiQuery({ name: 'anio', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getMetas(
    @Param('id') id: string,
    @Query('anio') anio?: string,
    @Query('limit') limit?: string,
  ) {
    return this.profesionalesService.getMetas(id, {
      anio: anio ? parseInt(anio) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id/meta-actual')
  @ApiOperation({ summary: 'Obtener meta del mes actual' })
  getMetaActual(@Param('id') id: string) {
    return this.profesionalesService.getMetaActual(id);
  }

  @Post(':id/metas')
  @ApiOperation({ summary: 'Crear meta mensual para el profesional' })
  createMeta(@Param('id') id: string, @Body() data: CreateMetaDto) {
    return this.profesionalesService.createMeta(id, data);
  }

  @Put('metas/:metaId')
  @ApiOperation({ summary: 'Actualizar meta' })
  updateMeta(@Param('metaId') metaId: string, @Body() data: UpdateMetaDto) {
    return this.profesionalesService.updateMeta(metaId, data);
  }

  @Post(':id/metas/actualizar-progreso')
  @ApiOperation({ summary: 'Actualizar progreso de meta de un período' })
  actualizarProgresoMeta(
    @Param('id') id: string,
    @Body() data: { mes: number; anio: number },
  ) {
    return this.profesionalesService.actualizarProgresoMeta(id, data.mes, data.anio);
  }

  // ============================================================================
  // LIQUIDACIONES
  // ============================================================================

  @Get(':id/liquidaciones')
  @ApiOperation({ summary: 'Listar liquidaciones del profesional' })
  @ApiQuery({ name: 'anio', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getLiquidaciones(
    @Param('id') id: string,
    @Query('anio') anio?: string,
    @Query('limit') limit?: string,
  ) {
    return this.profesionalesService.getLiquidaciones(id, {
      anio: anio ? parseInt(anio) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('liquidaciones/:liquidacionId')
  @ApiOperation({ summary: 'Obtener detalle de liquidación' })
  getLiquidacion(@Param('liquidacionId') liquidacionId: string) {
    return this.profesionalesService.getLiquidacion(liquidacionId);
  }

  @Post(':id/liquidaciones/generar')
  @ApiOperation({ summary: 'Generar liquidación mensual' })
  generarLiquidacion(
    @Param('id') id: string,
    @Body() data: GenerarLiquidacionDto,
  ) {
    return this.profesionalesService.generarLiquidacion(id, data.mes, data.anio);
  }

  @Post('liquidaciones/:liquidacionId/ajuste')
  @ApiOperation({ summary: 'Agregar ajuste a liquidación' })
  agregarAjuste(
    @Param('liquidacionId') liquidacionId: string,
    @Body() data: AjusteLiquidacionDto,
  ) {
    return this.profesionalesService.agregarAjusteLiquidacion(liquidacionId, data);
  }

  @Post('liquidaciones/:liquidacionId/aprobar')
  @ApiOperation({ summary: 'Aprobar liquidación' })
  aprobarLiquidacion(
    @Param('liquidacionId') liquidacionId: string,
    @Body() data: AprobarLiquidacionDto,
  ) {
    return this.profesionalesService.aprobarLiquidacion(liquidacionId, data.notas);
  }

  @Post('liquidaciones/:liquidacionId/pagar')
  @ApiOperation({ summary: 'Marcar liquidación como pagada' })
  pagarLiquidacion(
    @Param('liquidacionId') liquidacionId: string,
    @Body() data: PagarLiquidacionDto,
  ) {
    return this.profesionalesService.pagarLiquidacion(
      liquidacionId,
      data.metodoPago,
      data.referenciaPago,
      data.notas,
    );
  }

  @Post('liquidaciones/:liquidacionId/recalcular')
  @ApiOperation({ summary: 'Recalcular totales de liquidación' })
  recalcularLiquidacion(@Param('liquidacionId') liquidacionId: string) {
    return this.profesionalesService.recalcularLiquidacion(liquidacionId);
  }
}
