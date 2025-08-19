import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { AdminRepository } from './repositories/admin.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Admin])],
  providers: [AdminRepository],
  exports: [AdminRepository],
})
export class AdminsModule {}
