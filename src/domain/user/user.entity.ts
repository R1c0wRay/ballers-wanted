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
  ) { }

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

  getPictoId(): string {
    return this.pictoId;
  }

  getStatus(): UserStatus {
    return this.status;
  }

  getConsentInfo() {
    return {
      version: this.consentVersion,
      acceptedAt: this.consentAcceptedAt,
    };
  }
}
