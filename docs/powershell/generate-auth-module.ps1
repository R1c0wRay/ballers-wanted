$BASE = "C:\Users\ehazoume\OneDrive\OneDrive - Capgemini\00 - Sogeti\AI et prompts\AIAD Framework\BallersWanted\src"

Write-Host "Generating auth module in $BASE ..."

# Création des dossiers
New-Item -ItemType Directory -Force -Path "$BASE\domain\common"
New-Item -ItemType Directory -Force -Path "$BASE\domain\user"
New-Item -ItemType Directory -Force -Path "$BASE\domain\auth"
New-Item -ItemType Directory -Force -Path "$BASE\application\user"
New-Item -ItemType Directory -Force -Path "$BASE\api\user"

# -------- DOMAIN ERROR --------
@"
export class DomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
"@ | Set-Content "$BASE\domain\common\domain.error.ts"

# -------- USER ENTITY --------
@"
export type UserStatus = 'pending' | 'active';

export class User {
  constructor(
    readonly id: string,
    private pseudo: string,
    private email: string,
    private pictoId: string,
    private status: UserStatus,
    private consentVersion: string | null,
    private consentAcceptedAt: Date | null,
    readonly createdAt: Date,
  ) {}

  activate(): void {
    if (this.status !== 'active') {
      this.status = 'active';
    }
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  getEmail(): string {
    return this.email;
  }

  getPseudo(): string {
    return this.pseudo;
  }
}
"@ | Set-Content "$BASE\domain\user\user.entity.ts"

# -------- USER RULES --------
@"
import { DomainError } from '../common/domain.error';

export class InvalidEmailFormatError extends DomainError {
  constructor() {
    super('INVALID_EMAIL_FORMAT', 'Email format is invalid');
  }
}

export class PictoRequiredError extends DomainError {
  constructor() {
    super('PICTO_REQUIRED', 'Picto is required');
  }
}

export class ConsentRequiredError extends DomainError {
  constructor() {
    super('CONSENT_REQUIRED', 'RGPD consent required');
  }
}

export class UserRules {
  static ensureValidEmail(email: string): void {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      throw new InvalidEmailFormatError();
    }
  }

  static ensurePictoSelected(pictoId: string | null): void {
    if (!pictoId) {
      throw new PictoRequiredError();
    }
  }

  static ensureConsent(consent: boolean): void {
    if (!consent) {
      throw new ConsentRequiredError();
    }
  }
}
"@ | Set-Content "$BASE\domain\user\user.rules.ts"

# -------- EMAIL TOKEN --------
@"
import { DomainError } from '../common/domain.error';

export type TokenStatus = 'active' | 'used' | 'expired';

export class EmailConfirmationToken {
  constructor(
    readonly value: string,
    readonly userId: string,
    private status: TokenStatus,
    readonly expiresAt: Date,
  ) {}

  use(): void {
    if (this.status !== 'active') {
      throw new DomainError('TOKEN_INVALID', 'Token not usable');
    }

    if (new Date() > this.expiresAt) {
      this.status = 'expired';
      throw new DomainError('TOKEN_EXPIRED', 'Token expired');
    }

    this.status = 'used';
  }
}
"@ | Set-Content "$BASE\domain\auth\email-confirmation-token.entity.ts"

# -------- OTP --------
@"
import { DomainError } from '../common/domain.error';

export type OtpStatus = 'active' | 'used' | 'expired';

export class OtpCode {
  constructor(
    readonly value: string,
    readonly userId: string,
    private status: OtpStatus,
    readonly expiresAt: Date,
    private attempts: number,
  ) {}

  verify(input: string): void {
    if (this.status !== 'active') {
      throw new DomainError('OTP_INVALID', 'OTP not usable');
    }

    if (new Date() > this.expiresAt) {
      this.status = 'expired';
      throw new DomainError('OTP_EXPIRED', 'OTP expired');
    }

    if (this.value !== input) {
      this.attempts++;
      if (this.attempts >= 3) {
        throw new DomainError('OTP_MAX_ATTEMPTS', 'Max attempts reached');
      }
      throw new DomainError('OTP_INVALID', 'Invalid OTP');
    }

    this.status = 'used';
  }
}
"@ | Set-Content "$BASE\domain\auth\otp-code.entity.ts"

# -------- CREATE USER USECASE --------
@"
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
"@ | Set-Content "$BASE\application\user\create-user.usecase.ts"

# -------- CONTROLLER --------
@"
import { Body, Controller, Param, Post } from '@nestjs/common';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: any,
  ) {}

  @Post('register')
  create(@Body() body: any) {
    return this.createUserUseCase.execute(body);
  }
}
"@ | Set-Content "$BASE\api\user\user.controller.ts"

Write-Host "Auth module generated successfully."
