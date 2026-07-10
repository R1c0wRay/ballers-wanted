import { PictoRepository } from '../../infrastructure/database/repositories/picto.repository';

export class GetPictosUseCase {
  constructor(
    private readonly pictoRepository: PictoRepository,
  ) {}

  async execute() {
    return this.pictoRepository.findAll();
  }
}
``