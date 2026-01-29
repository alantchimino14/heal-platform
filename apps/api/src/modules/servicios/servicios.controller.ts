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
import { ServiciosService } from './servicios.service';
import { CategoriaServicio } from 'database';

@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Get()
  findAll(
    @Query('categoria') categoria?: CategoriaServicio,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    return this.serviciosService.findAll({
      categoria,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      search,
    });
  }

  @Get('categorias')
  getCategorias() {
    return this.serviciosService.getCategorias();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviciosService.findOne(id);
  }

  @Get(':id/precio/:profesionalId')
  getPrecioParaProfesional(
    @Param('id') id: string,
    @Param('profesionalId') profesionalId: string,
  ) {
    return this.serviciosService.getPrecioParaProfesional(id, profesionalId);
  }

  @Post()
  create(
    @Body()
    data: {
      nombre: string;
      codigo?: string;
      descripcion?: string;
      categoria?: CategoriaServicio;
      precio: number;
      duracionMinutos?: number;
    },
  ) {
    return this.serviciosService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    data: {
      nombre?: string;
      codigo?: string;
      descripcion?: string;
      categoria?: CategoriaServicio;
      precio?: number;
      duracionMinutos?: number;
      isActive?: boolean;
    },
  ) {
    return this.serviciosService.update(id, data);
  }

  @Post(':id/precios-profesional')
  setPrecioProfesional(
    @Param('id') id: string,
    @Body() data: { profesionalId: string; precio: number },
  ) {
    return this.serviciosService.setPrecioProfesional(id, data.profesionalId, data.precio);
  }

  @Delete(':id/precios-profesional/:profesionalId')
  removePrecioProfesional(
    @Param('id') id: string,
    @Param('profesionalId') profesionalId: string,
  ) {
    return this.serviciosService.removePrecioProfesional(id, profesionalId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviciosService.remove(id);
  }
}
