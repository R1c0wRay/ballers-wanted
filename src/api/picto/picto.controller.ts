import { Controller, Get } from '@nestjs/common';
import { GetPictosUseCase } from '../../application/picto/get-pictos.usecase';

@Controller('pictos')
export class PictoController {
  constructor(
    private readonly getPictosUseCase: GetPictosUseCase,
  ) {}

  @Get()
  async getPictos() {
    return this.getPictosUseCase.execute();
  }
}