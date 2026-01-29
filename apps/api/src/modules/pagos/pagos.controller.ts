import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PagosService } from './pagos.service';
import {
  CreatePagoDto,
  AsignarPagoDto,
  ReembolsarPagoDto,
  PagoFiltersDto,
} from './dto/pago.dto';

@ApiTags('Pagos')
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar pagos con filtros' })
  findAll(@Query() filters: PagoFiltersDto) {
    return this.pagosService.findAll(filters);
  }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen de pagos por período' })
  @ApiQuery({ name: 'fechaDesde', required: true })
  @ApiQuery({ name: 'fechaHasta', required: true })
  getResumen(
    @Query('fechaDesde') fechaDesde: string,
    @Query('fechaHasta') fechaHasta: string,
  ) {
    return this.pagosService.getResumen(fechaDesde, fechaHasta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener pago por ID' })
  findOne(@Param('id') id: string) {
    return this.pagosService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar nuevo pago' })
  create(@Body() data: CreatePagoDto) {
    return this.pagosService.create(data);
  }

  @Post(':id/asignar')
  @ApiOperation({ summary: 'Asignar saldo disponible a sesiones' })
  asignarASesiones(@Param('id') id: string, @Body() data: AsignarPagoDto) {
    return this.pagosService.asignarASesiones(id, data);
  }

  @Post(':id/reembolsar')
  @ApiOperation({ summary: 'Reembolsar pago (parcial o total)' })
  reembolsar(@Param('id') id: string, @Body() data: ReembolsarPagoDto) {
    return this.pagosService.reembolsar(id, data);
  }

  @Post(':id/anular')
  @ApiOperation({ summary: 'Anular pago' })
  anular(@Param('id') id: string) {
    return this.pagosService.anular(id);
  }
}
