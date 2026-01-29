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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto, UpdatePacienteDto, PacienteFiltersDto } from './dto/paciente.dto';

@ApiTags('Pacientes')
@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar pacientes con filtros' })
  findAll(@Query() filters: PacienteFiltersDto) {
    return this.pacientesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener paciente por ID' })
  findOne(@Param('id') id: string) {
    return this.pacientesService.findOne(id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Obtener balance financiero del paciente' })
  getBalance(@Param('id') id: string) {
    return this.pacientesService.getBalance(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear paciente' })
  @ApiResponse({ status: 201, description: 'Paciente creado' })
  create(@Body() data: CreatePacienteDto) {
    return this.pacientesService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar paciente' })
  update(@Param('id') id: string, @Body() data: UpdatePacienteDto) {
    return this.pacientesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar paciente (soft delete)' })
  remove(@Param('id') id: string) {
    return this.pacientesService.remove(id);
  }
}
