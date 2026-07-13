import { DomainError } from '../../domain/common/domain.error';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { TokenRepository } from '../../infrastructure/database/repositories/token.repository';

export class ConfirmEmailUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
  ) { }

  async execute(input: { tokenValue: string }) {

    const token = await this.tokenRepository.getByValue(
      input.tokenValue,
    );

    try {

      token.use();

    } catch (error) {

      if (
        error instanceof DomainError &&
        error.code === 'TOKEN_EXPIRED'
      ) {

        const user =
          await this.userRepository.findById(
            token.userId,
          );

        throw new DomainError(
          'TOKEN_EXPIRED',
          JSON.stringify({
            pseudo: user?.getPseudo?.(),
            email: user?.getEmail?.(),
            pictoId: user?.getPictoId?.(),
          }),
        );
      }

      throw error;
    }

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
      email: user.getEmail(),
    };
  }
}