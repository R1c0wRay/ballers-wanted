import { EmailService } from '../../infrastructure/email/email.service';

export class ResendPendingAccountsUseCase {

    constructor(
        private readonly userRepository: any,
        private readonly tokenRepository: any,
        private readonly emailService: EmailService,
    ) { }

    async execute() {

        const REMINDER_DELAY_MS =
            24 * 60 * 60 * 1000;

        const users =
            await this.userRepository.findPendingOlderThan(
                REMINDER_DELAY_MS,
            );

        let processedCount = 0;

        for (const user of users) {

            if (
                user.getSecondConfirmationSentAt()
            ) {
                continue;
            }

            await this.tokenRepository.invalidateByUserId(
                user.id,
            );

            const token =
                await this.tokenRepository.create(
                    user.id,
                );

            await this.emailService.sendConfirmationEmail(
                user.getEmail(),
                token.value,
            );

            user.markSecondConfirmationSent();

            await this.userRepository.save(
                user,
            );

            processedCount++;
        }

        return {
            success: true,
            processedCount,
        };
    }
}