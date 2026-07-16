import { DomainError } from '../common/domain.error';

export type TokenStatus = 'active' | 'used' | 'expired';

export class TokenInvalidError extends DomainError {
  constructor() {
    super('TOKEN_INVALID', 'Token is invalid');
  }
}

export class TokenExpiredError extends DomainError {
  constructor() {
    super('TOKEN_EXPIRED', 'Token is expired');
  }
}

export class TokenAlreadyUsedError
  extends DomainError {

  constructor() {
    super(
      'TOKEN_ALREADY_USED',
      'Token already used',
    );
  }
}

export class EmailConfirmationToken {
  constructor(
    readonly value: string,
    readonly userId: string,
    private status: TokenStatus,
    readonly expiresAt: Date,
  ) { }

  use(): void {

    if (this.status === 'used') {
      throw new TokenAlreadyUsedError();
    }

    if (this.status === 'expired') {
      throw new TokenExpiredError();
    }

    if (this.status !== 'active') {
      throw new TokenInvalidError();
    }

    if (new Date() > this.expiresAt) {

      this.status = 'expired';

      throw new TokenExpiredError();
    }

    this.status = 'used';
  }


  getStatus(): TokenStatus {
    return this.status;
  }
}