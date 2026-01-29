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
import { ProductosService } from './productos.service';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('categoria') categoria?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.productosService.findAll({
      search,
      categoria,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('categorias')
  getCategorias() {
    return this.productosService.getCategorias();
  }

  @Get('stock-bajo')
  getStockBajo() {
    return this.productosService.getStockBajo();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }

  @Post()
  create(
    @Body()
    data: {
      codigo?: string;
      nombre: string;
      descripcion?: string;
      categoria?: string;
      precio: number;
      costo?: number;
      stock?: number;
      stockMinimo?: number;
    },
  ) {
    return this.productosService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    data: {
      codigo?: string;
      nombre?: string;
      descripcion?: string;
      categoria?: string;
      precio?: number;
      costo?: number;
      stock?: number;
      stockMinimo?: number;
      isActive?: boolean;
    },
  ) {
    return this.productosService.update(id, data);
  }

  @Put(':id/stock')
  adjustStock(
    @Param('id') id: string,
    @Body() data: { cantidad: number; motivo?: string },
  ) {
    return this.productosService.adjustStock(id, data.cantidad, data.motivo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(id);
  }
}
