import {
  Injectable,
  OnModuleInit,
} from '@nestjs/common';

import { Cron } from '@nestjs/schedule';

import { ResendPendingAccountsUseCase }
  from '../../application/user/resend-pending-accounts.usecase';

@Injectable()
export class PendingAccountScheduler
  implements OnModuleInit {

  constructor(
    private readonly resendPendingAccountsUseCase:
      ResendPendingAccountsUseCase,
  ) { }

  onModuleInit() {

    console.log(
      '[PendingAccountScheduler] Loaded ✅',
    );
  }

  @Cron('0 0 * * *')
  async resendPendingAccounts() {

    console.log(
      '[PendingAccountScheduler] Triggered ✅',
    );

    const result =
      await this
        .resendPendingAccountsUseCase
        .execute();

    console.log(
      '[PendingAccountScheduler] Job completed',
      result,
    );
  }
}