import { prisma } from '../../prisma/prisma.service';

export class PictoRepository {

  async findAll() {
    return prisma.picto.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }
}