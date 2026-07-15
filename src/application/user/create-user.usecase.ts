import { randomUUID } from 'node:crypto';
import { User } from '../../domain/user/user.entity';
import { UserRules } from '../../domain/user/user.rules';
import { EmailService } from '../../infrastructure/email/email.service';
import { DomainError } from '../../domain/common/domain.error';

export class CreateUserUseCase {
  constructor(private readonly userRepository: any, private readonly tokenRepository: any, private readonly emailService: EmailService) { }

  async execute(input: {
    pseudo: string;
    email: string;
    pictoId: string;
    consentAccepted: boolean;
  }) {

    input.email = input.email
      .trim()
      .toLowerCase();

    UserRules.ensureValidEmail(input.email);
    UserRules.ensurePictoSelected(input.pictoId);
    UserRules.ensureConsent(input.consentAccepted);

    const existing =
      await this.userRepository.findByEmail(
        input.email,
      );

    if (existing) {

      if (existing.getStatus() === 'active') {

        throw new DomainError(
          'EMAIL_ALREADY_USED',
          'Email already used',
        );
      }

      if (existing.getStatus() === 'pending') {

        await this.tokenRepository.invalidateByUserId(
          existing.id,
        );

        const token =
          await this.tokenRepository.create(
            existing.id,
          );

        await this.emailService.sendConfirmationEmail(
          existing.getEmail(),
          token.value,
        );

        return {
          status: 'pending',
          pseudo: existing.getPseudo(),
          email: existing.getEmail(),
          pictoId: existing.getPictoId(),
        };
      }
    }

    const existingPseudo =
      await this.userRepository.findByPseudo(
        input.pseudo
      );

    if (existingPseudo) {
      throw new DomainError('PSEUDO_ALREADY_USED', 'Pseudo already used');
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

    await this.emailService.sendConfirmationEmail(
      user.getEmail(),
      token.value,
    );

    return {
      status: 'created',
      success: true,
    };
  }
}
