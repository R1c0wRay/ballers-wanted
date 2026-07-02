import { randomUUID } from 'crypto';
import { EmailConfirmationToken } from '../../../domain/auth/email-confirmation-token.entity';
import { DomainError } from '../../../domain/common/domain.error';


export class TokenRepository {
  private tokens: EmailConfirmationToken[] = [];

  async create(userId: string): Promise<EmailConfirmationToken> {
    const token = new EmailConfirmationToken(
      randomUUID(),
      userId,
      'active',
      new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    );

    this.tokens.push(token);

    return token;
  }

  async getByValue(value: string): Promise<EmailConfirmationToken> {
    const token = this.tokens.find((t) => t.value === value);

    
  if (!token) {
    throw new DomainError('TOKEN_NOT_FOUND', 'Token not found');
  }
    return token;
  }
}
``