import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PacientesModule } from './modules/pacientes/pacientes.module';
import { ProfesionalesModule } from './modules/profesionales/profesionales.module';
import { ServiciosModule } from './modules/servicios/servicios.module';
import { SesionesModule } from './modules/sesiones/sesiones.module';
import { PagosModule } from './modules/pagos/pagos.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ProductosModule } from './modules/productos/productos.module';
import { VentasModule } from './modules/ventas/ventas.module';
import { ConciliacionModule } from './modules/conciliacion/conciliacion.module';

@Module({
  imports: [
    PrismaModule,
    PacientesModule,
    ProfesionalesModule,
    ServiciosModule,
    SesionesModule,
    PagosModule,
    DashboardModule,
    ProductosModule,
    VentasModule,
    ConciliacionModule,
  ],
})
export class AppModule {}
