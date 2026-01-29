import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { MetodoPago, TipoPago, EstadoPago2 } from 'database';

// Asignación de pago a sesión
export class PagoSesionDto {
  @ApiProperty()
  @IsString()
  sesionId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  monto: number;
}

// Crear pago
export class CreatePagoDto {
  @ApiProperty()
  @IsString()
  pacienteId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  monto: number;

  @ApiProperty({ enum: MetodoPago })
  @IsEnum(MetodoPago)
  metodoPago: MetodoPago;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referencia?: string;

  @ApiPropertyOptional({ enum: TipoPago })
  @IsOptional()
  @IsEnum(TipoPago)
  tipoPago?: TipoPago;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notas?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaPago?: string;

  // Asignación a sesiones (opcional)
  // Si no se especifica, el pago queda como anticipo
  @ApiPropertyOptional({ type: [PagoSesionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PagoSesionDto)
  sesiones?: PagoSesionDto[];
}

// Asignar pago existente a sesiones
export class AsignarPagoDto {
  @ApiProperty({ type: [PagoSesionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PagoSesionDto)
  sesiones: PagoSesionDto[];
}

// Reembolso
export class ReembolsarPagoDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  monto: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motivo?: string;
}

// Filtros
export class PagoFiltersDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pacienteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @ApiPropertyOptional({ enum: MetodoPago })
  @IsOptional()
  @IsEnum(MetodoPago)
  metodoPago?: MetodoPago;

  @ApiPropertyOptional({ enum: EstadoPago2 })
  @IsOptional()
  @IsEnum(EstadoPago2)
  estado?: EstadoPago2;

  @ApiPropertyOptional({ enum: TipoPago })
  @IsOptional()
  @IsEnum(TipoPago)
  tipoPago?: TipoPago;

  @ApiPropertyOptional({ description: 'Solo pagos con saldo disponible' })
  @IsOptional()
  conSaldoDisponible?: boolean;
}
