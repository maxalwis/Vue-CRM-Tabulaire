import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColumnEntity, ColumnType } from './column.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(ColumnEntity)
    private readonly repo: Repository<ColumnEntity>,
  ) {}

  findAll(): Promise<ColumnEntity[]> {
    return this.repo.find({ order: { position: 'ASC' } });
  }

  async create(name: string, type: ColumnType): Promise<ColumnEntity> {
    // Calcule la position maximale pour ajouter la colonne à la fin
    const maxResult = await this.repo
      .createQueryBuilder('column')
      .select('MAX(column.position)', 'max')
      .getRawOne();

    const nextPosition = (maxResult?.max ?? 0) + 1;

    const column = this.repo.create({
      name,
      type,
      position: nextPosition,
    });

    return this.repo.save(column);
  }

  async update(id: number | string, name: string): Promise<ColumnEntity> {
    const column = await this.repo.findOneBy({ id: id as any });
    if (!column) {
      throw new NotFoundException(`Colonne #${id} introuvable`);
    }

    column.name = name;
    return this.repo.save(column);
  }

  async reorder(columnIds: (number | string)[]): Promise<void> {
    // Met à jour la position de chaque colonne selon son index dans le tableau reçu
    const updates = columnIds.map((id, index) =>
      this.repo.update(id as any, { position: index }),
    );
    await Promise.all(updates);
  }

  async remove(id: number | string): Promise<void> {
    const result = await this.repo.delete(id as any);
    if (result.affected === 0) {
      throw new NotFoundException(`Colonne #${id} introuvable`);
    }
  }
}
