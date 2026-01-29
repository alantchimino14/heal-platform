import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @ApiOperation({ summary: 'Dashboard administrativo' })
  @ApiQuery({ name: 'fechaDesde', required: true, example: '2024-01-01' })
  @ApiQuery({ name: 'fechaHasta', required: true, example: '2024-12-31' })
  getAdminDashboard(
    @Query('fechaDesde') fechaDesde: string,
    @Query('fechaHasta') fechaHasta: string,
  ) {
    return this.dashboardService.getAdminDashboard(fechaDesde, fechaHasta);
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen rápido (sesiones hoy, deuda, etc.)' })
  getResumenRapido() {
    return this.dashboardService.getResumenRapido();
  }

  @Get('equipo')
  @ApiOperation({ summary: 'Métricas del equipo de profesionales' })
  getMetricasEquipo() {
    return this.dashboardService.getMetricasEquipo();
  }
}
