import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from '../entities/admin.entity';
import { BaseRepository } from '../../common/repository/base.repository';

@Injectable()
export class AdminRepository extends BaseRepository<Admin> {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    dataSource: DataSource,
  ) {
    super(adminRepository, dataSource);
  }

  async findByEmail(email: string): Promise<Admin | undefined> {
    return this.adminRepository.findOne({ where: { email } });
  }

  async save(admin: Admin | Partial<Admin>): Promise<Admin> {
    return this.adminRepository.save(admin);
  }

  async update(id: string, admin: Partial<Admin>): Promise<Admin> {
    await this.adminRepository.update(id, admin);
    return this.adminRepository.findOne({ where: { id } });
  }
}
