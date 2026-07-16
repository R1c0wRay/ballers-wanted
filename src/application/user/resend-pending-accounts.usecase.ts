import { EmailService } from '../../infrastructure/email/email.service';

export class ResendPendingAccountsUseCase {

    constructor(
        private readonly userRepository: any,
        private readonly tokenRepository: any,
        private readonly emailService: EmailService,
    ) { }

    async execute() {

        console.log(
            '[ResendPendingAccountsUseCase] Looking for pending users...',
        );

        const REMINDER_DELAY_MS =
            24 * 60 * 60 * 1000;

        const users =
            await this.userRepository.findPendingOlderThan(
                REMINDER_DELAY_MS,
            );

        console.log(
            '[ResendPendingAccountsUseCase] Pending users found:',
            users.length,
        );

        let processedCount = 0;

        for (const user of users) {

            console.log(
                '[ResendPendingAccountsUseCase] Processing user:',
                user.getEmail(),
            );

            if (
                user.getSecondConfirmationSentAt()
            ) {

                console.log(
                    '[ResendPendingAccountsUseCase] Reminder already sent for:',
                    user.getEmail(),
                );

                continue;
            }

            console.log(
                '[ResendPendingAccountsUseCase] Invalidating previous tokens for:',
                user.getEmail(),
            );

            await this.tokenRepository.invalidateByUserId(
                user.id,
            );

            const token =
                await this.tokenRepository.create(
                    user.id,
                );

            console.log(
                '[ResendPendingAccountsUseCase] New token generated for:',
                user.getEmail(),
            );

            await this.emailService.sendConfirmationEmail(
                user.getEmail(),
                token.value,
            );

            console.log(
                '[ResendPendingAccountsUseCase] Reminder email sent to:',
                user.getEmail(),
            );

            user.markSecondConfirmationSent();

            await this.userRepository.save(
                user,
            );

            console.log(
                '[ResendPendingAccountsUseCase] User updated:',
                user.getEmail(),
            );

            processedCount++;
        }

        console.log(
            '[ResendPendingAccountsUseCase] Job completed. Processed users:',
            processedCount,
        );

        return {
            success: true,
            processedCount,
        };
    }
}