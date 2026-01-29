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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SesionesService } from './sesiones.service';
import {
  CreateSesionDto,
  UpdateSesionDto,
  SesionFiltersDto,
  CalendarQueryDto,
} from './dto/sesion.dto';

@ApiTags('Sesiones')
@Controller('sesiones')
export class SesionesController {
  constructor(private readonly sesionesService: SesionesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar sesiones con filtros' })
  findAll(@Query() filters: SesionFiltersDto) {
    return this.sesionesService.findAll(filters);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Obtener sesiones para vista calendario' })
  getCalendar(@Query() query: CalendarQueryDto) {
    return this.sesionesService.getCalendar(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener sesión por ID' })
  findOne(@Param('id') id: string) {
    return this.sesionesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear sesión' })
  create(@Body() data: CreateSesionDto) {
    return this.sesionesService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar sesión (incluye cambio de estados)' })
  update(@Param('id') id: string, @Body() data: UpdateSesionDto) {
    return this.sesionesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar sesión' })
  remove(@Param('id') id: string) {
    return this.sesionesService.remove(id);
  }
}
