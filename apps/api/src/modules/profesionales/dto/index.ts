import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

// ============================================================================
// PROFESIONAL
// ============================================================================

export class CreateProfesionalDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  rut?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  especialidad?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdateProfesionalDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  rut?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  especialidad?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// ============================================================================
// CONTRATOS
// ============================================================================

export enum TipoContrato {
  HONORARIOS = 'HONORARIOS',
  PART_TIME = 'PART_TIME',
  FULL_TIME = 'FULL_TIME',
  PRACTICANTE = 'PRACTICANTE',
}

export class CreateContratoDto {
  @ApiProperty({ enum: TipoContrato })
  @IsEnum(TipoContrato)
  tipo: TipoContrato;

  @ApiProperty()
  @IsDateString()
  fechaInicio: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  fechaFin?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(45)
  horasSemanales?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  tarifaPorSesion?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  salarioBase?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  porcentajeComision?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  bonoMetaCumplida?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notas?: string;
}

export class UpdateContratoDto {
  @ApiPropertyOptional({ enum: TipoContrato })
  @IsEnum(TipoContrato)
  @IsOptional()
  tipo?: TipoContrato;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  fechaFin?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  horasSemanales?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  tarifaPorSesion?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  salarioBase?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  porcentajeComision?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  bonoMetaCumplida?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notas?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// ============================================================================
// METAS MENSUALES
// ============================================================================

export class CreateMetaDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(12)
  mes: number;

  @ApiProperty()
  @IsNumber()
  @Min(2020)
  anio: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  sesionesObjetivo: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  bonoMonto?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notas?: string;
}

export class UpdateMetaDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(1)
  sesionesObjetivo?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  bonoMonto?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  bonoOtorgado?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notas?: string;
}

// ============================================================================
// LIQUIDACIONES
// ============================================================================

export class GenerarLiquidacionDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(12)
  mes: number;

  @ApiProperty()
  @IsNumber()
  @Min(2020)
  anio: number;
}

export class AjusteLiquidacionDto {
  @ApiProperty()
  @IsString()
  concepto: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty()
  @IsNumber()
  monto: number;

  @ApiProperty()
  @IsBoolean()
  esDescuento: boolean;
}

export class AprobarLiquidacionDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notas?: string;
}

export class PagarLiquidacionDto {
  @ApiProperty()
  @IsString()
  metodoPago: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  referenciaPago?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notas?: string;
}
