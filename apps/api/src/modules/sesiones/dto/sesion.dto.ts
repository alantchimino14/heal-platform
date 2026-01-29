import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { EstadoAgenda, EstadoAtencion, EstadoPago, EstadoBoleta } from 'database';

export class CreateSesionDto {
  @ApiProperty()
  @IsString()
  pacienteId: string;

  @ApiProperty()
  @IsString()
  profesionalId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  servicioId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  planTerapeuticoId?: string;

  @ApiProperty()
  @IsDateString()
  fechaHora: string;

  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duracionMinutos?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  precioBase: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motivoConsulta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class UpdateSesionDto extends PartialType(CreateSesionDto) {
  @ApiPropertyOptional({ enum: EstadoAgenda })
  @IsOptional()
  @IsEnum(EstadoAgenda)
  estadoAgenda?: EstadoAgenda;

  @ApiPropertyOptional({ enum: EstadoAtencion })
  @IsOptional()
  @IsEnum(EstadoAtencion)
  estadoAtencion?: EstadoAtencion;

  @ApiPropertyOptional({ enum: EstadoPago })
  @IsOptional()
  @IsEnum(EstadoPago)
  estadoPago?: EstadoPago;

  @ApiPropertyOptional({ enum: EstadoBoleta })
  @IsOptional()
  @IsEnum(EstadoBoleta)
  estadoBoleta?: EstadoBoleta;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnostico?: string;
}

export class SesionFiltersDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pacienteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profesionalId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  planTerapeuticoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @ApiPropertyOptional({ enum: EstadoAgenda })
  @IsOptional()
  @IsEnum(EstadoAgenda)
  estadoAgenda?: EstadoAgenda;

  @ApiPropertyOptional({ enum: EstadoAtencion })
  @IsOptional()
  @IsEnum(EstadoAtencion)
  estadoAtencion?: EstadoAtencion;

  @ApiPropertyOptional({ enum: EstadoPago })
  @IsOptional()
  @IsEnum(EstadoPago)
  estadoPago?: EstadoPago;

  @ApiPropertyOptional({ enum: EstadoBoleta })
  @IsOptional()
  @IsEnum(EstadoBoleta)
  estadoBoleta?: EstadoBoleta;
}

export class CalendarQueryDto {
  @ApiProperty()
  @IsDateString()
  start: string;

  @ApiProperty()
  @IsDateString()
  end: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profesionalId?: string;
}
