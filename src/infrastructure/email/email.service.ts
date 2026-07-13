import nodemailer from 'nodemailer';

export class EmailService {

    private transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),

        secure: false,

        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    async sendConfirmationEmail(
        email: string,
        token: string,
    ): Promise<void> {

        const confirmationUrl =
            `http://localhost:3000/confirm?token=${token}`;

        await this.transporter.sendMail({
            from: `"Ballers Wanted" <${process.env.MAIL_FROM}>`,

            to: email,

            subject: '🏀 Confirme ton compte Ballers Wanted',

            html: `
        <div
          style="
            background:#020617;
            padding:40px;
            font-family:Arial,sans-serif;
          "
        >
          <div
            style="
              max-width:600px;
              margin:auto;
              background:#0f172a;
              border-radius:16px;
              padding:32px;
              color:white;
            "
          >
            <h1
              style="
                text-align:center;
                margin-bottom:24px;
              "
            >
              🏀 Ballers Wanted
            </h1>

            <h2
              style="
                text-align:center;
                margin-bottom:24px;
              "
            >
              Bienvenue dans la communauté
            </h2>

            <p>
              Merci pour ton inscription.
            </p>

            <p>
              Pour activer ton compte, clique sur le bouton ci-dessous :
            </p>

            <div
              style="
                text-align:center;
                margin:40px 0;
              "
            >
                <a
                    href="${confirmationUrl}"
                    style="
                        background:#ea580c;
                        color:white;
                        padding:14px 24px;
                        border-radius:8px;
                        text-decoration:none;
                        font-weight:bold;
                        display:inline-block;
                    "
                >
                    Activer mon compte
                </a>
            </div>

            <p>
              Si le bouton ne fonctionne pas, utilise le lien suivant :
            </p>

            <p style="word-break:break-all;">
                <a
                    href="${confirmationUrl}"
                    style="color:#fb923c;"
                >
                ${confirmationUrl}
                </a>
            </p>

            <hr
              style="
                border:none;
                border-top:1px solid #334155;
                margin:24px 0;
              "
            />

            <p
              style="
                color:#cbd5e1;
                font-size:14px;
              "
            >
              Ce lien est valable 5 minutes.
            </p>

            <p
              style="
                color:#94a3b8;
                font-size:12px;
                margin-top:24px;
              "
            >
              © Ballers Wanted
            </p>

          </div>
        </div>
      `,
        });
    }
}