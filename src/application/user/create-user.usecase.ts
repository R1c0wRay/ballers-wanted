import { randomUUID } from 'node:crypto';
import { User } from '../../domain/user/user.entity';
import { UserRules } from '../../domain/user/user.rules';

export class CreateUserUseCase {
  constructor(private readonly userRepository: any, private readonly tokenRepository: any) {}

  async execute(input: {
    pseudo: string;
    email: string;
    pictoId: string;
    consentAccepted: boolean;
  }) {
    UserRules.ensureValidEmail(input.email);
    UserRules.ensurePictoSelected(input.pictoId);
    UserRules.ensureConsent(input.consentAccepted);

    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error('EMAIL_ALREADY_USED');
    }

    const user = new User(
      randomUUID(),
      input.pseudo,
      input.email,
      input.pictoId,
      'pending',
      'v1',
      new Date(),
      new Date(),
    );

    await this.userRepository.save(user);

    const token = await this.tokenRepository.create(user.id);

    return {
      userId: user.id,
      confirmationToken: token.value,
    };
  }
}
