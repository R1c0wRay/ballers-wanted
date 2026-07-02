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
