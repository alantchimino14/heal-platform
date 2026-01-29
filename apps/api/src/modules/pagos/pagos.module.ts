import { Module, forwardRef } from '@nestjs/common';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { SesionesModule } from '../sesiones/sesiones.module';
import { PacientesModule } from '../pacientes/pacientes.module';

@Module({
  imports: [
    forwardRef(() => SesionesModule),
    forwardRef(() => PacientesModule),
  ],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}
