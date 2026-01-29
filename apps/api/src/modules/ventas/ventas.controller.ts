import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import { MetodoPago, EstadoVenta } from 'database';

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('pacienteId') pacienteId?: string,
    @Query('metodoPago') metodoPago?: MetodoPago,
    @Query('estado') estado?: EstadoVenta,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ventasService.findAll({
      search,
      pacienteId,
      metodoPago,
      estado,
      desde,
      hasta,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('resumen')
  getResumen(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.ventasService.getResumen({ desde, hasta });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ventasService.findOne(id);
  }

  @Post()
  create(
    @Body()
    data: {
      pacienteId?: string;
      items: {
        productoId: string;
        cantidad: number;
        precioUnit?: number;
        descuento?: number;
      }[];
      descuento?: number;
      metodoPago: MetodoPago;
      referencia?: string;
      descripcion?: string;
      notas?: string;
    },
  ) {
    return this.ventasService.create(data);
  }

  @Put(':id/anular')
  anular(@Param('id') id: string) {
    return this.ventasService.anular(id);
  }
}
