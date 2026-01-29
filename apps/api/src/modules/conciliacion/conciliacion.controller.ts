import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ConciliacionService } from './conciliacion.service';

@ApiTags('Conciliación')
@Controller('conciliacion')
export class ConciliacionController {
  constructor(private readonly conciliacionService: ConciliacionService) {}

  // ============================================================================
  // IMPORTACIONES
  // ============================================================================

  @Get('importaciones')
  @ApiOperation({ summary: 'Listar importaciones de Transbank' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  getImportaciones(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.conciliacionService.getImportaciones({
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('importaciones/:id')
  @ApiOperation({ summary: 'Obtener detalle de importación' })
  getImportacion(@Param('id') id: string) {
    return this.conciliacionService.getImportacion(id);
  }

  @Post('importaciones')
  @ApiOperation({ summary: 'Crear importación desde datos parseados' })
  crearImportacion(
    @Body()
    data: {
      nombreArchivo: string;
      transacciones: Array<{
        fecha: string;
        hora?: string;
        numeroOperacion?: string;
        codigoAutorizacion?: string;
        tipoTarjeta?: string;
        ultimosDigitos?: string;
        monto: number;
        cuotas?: number;
      }>;
    },
  ) {
    return this.conciliacionService.crearImportacion(
      data.nombreArchivo,
      data.transacciones,
    );
  }

  // ============================================================================
  // CONCILIACIÓN
  // ============================================================================

  @Post('transacciones/:id/conciliar')
  @ApiOperation({ summary: 'Conciliar transacción manualmente' })
  conciliarManual(
    @Param('id') id: string,
    @Body()
    data: {
      pagoId?: string;
      ventaId?: string;
      ignorar?: boolean;
      notas?: string;
    },
  ) {
    return this.conciliacionService.conciliarManual(id, data);
  }

  @Post('importaciones/:id/reconciliar')
  @ApiOperation({ summary: 'Re-ejecutar conciliación automática' })
  async reconciliar(@Param('id') id: string) {
    await this.conciliacionService.conciliarAutomatico(id);
    return this.conciliacionService.actualizarEstadoImportacion(id);
  }

  // ============================================================================
  // REPORTES
  // ============================================================================

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen de conciliación por período' })
  @ApiQuery({ name: 'desde', required: true })
  @ApiQuery({ name: 'hasta', required: true })
  getResumen(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.conciliacionService.getResumenConciliacion({ desde, hasta });
  }

  @Get('pendientes')
  @ApiOperation({ summary: 'Transacciones pendientes de conciliar' })
  @ApiQuery({ name: 'limit', required: false })
  getPendientes(@Query('limit') limit?: string) {
    return this.conciliacionService.getTransaccionesPendientes({
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('pagos-para-conciliar')
  @ApiOperation({ summary: 'Buscar pagos candidatos para conciliar' })
  @ApiQuery({ name: 'fecha', required: true })
  @ApiQuery({ name: 'monto', required: false })
  getPagosParaConciliar(
    @Query('fecha') fecha: string,
    @Query('monto') monto?: string,
  ) {
    return this.conciliacionService.getPagosParaConciliar({
      fecha,
      monto: monto ? parseFloat(monto) : undefined,
    });
  }
}
