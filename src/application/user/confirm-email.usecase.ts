import { DomainError } from '../../domain/common/domain.error';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { TokenRepository } from '../../infrastructure/database/repositories/token.repository';

export class ConfirmEmailUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
  ) {}

  async execute(input: { tokenValue: string }) {

    const token = await this.tokenRepository.getByValue(
      input.tokenValue,
    );

    token.use();

    await this.tokenRepository.save(token);

    const user = await this.userRepository.findById(
      token.userId,
    );

    if (!user) {
      throw new DomainError(
        'USER_NOT_FOUND',
        'User not found',
      );
    }

    user.activate();

    await this.userRepository.save(user);

    return {
      userId: user.id,
      status: user.getStatus(),
    };
  }
}