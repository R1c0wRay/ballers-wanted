import { DomainError } from '../../domain/common/domain.error';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { TokenRepository } from '../../infrastructure/database/repositories/token.repository';

export class ConfirmEmailUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
  ) {}

  async execute(input: { tokenValue: string }) {
    const token = await this.tokenRepository.getByValue(input.tokenValue);

    if (!token) {
      throw new DomainError('TOKEN_INVALID', 'Invalid token');
    }

    const user = await this.userRepository.findById(token.userId);

    if (!user) {
      throw new DomainError('USER_NOT_FOUND', 'User not found');
    }

    // ✅ ✅ ✅ CORRECTION ICI
    await this.userRepository.save({
      ...user,
      status: 'active',
    });

    return {
      userId: user.id,
      status: 'active',
    };
  }
}