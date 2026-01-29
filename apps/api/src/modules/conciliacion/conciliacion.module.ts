import { Module } from '@nestjs/common';
import { ConciliacionService } from './conciliacion.service';
import { ConciliacionController } from './conciliacion.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConciliacionController],
  providers: [ConciliacionService],
  exports: [ConciliacionService],
})
export class ConciliacionModule {}
