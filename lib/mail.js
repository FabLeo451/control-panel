import nodemailer from 'nodemailer';

const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({
  region: "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function sendLocal(to, subject, html) {

	let transporter = nodemailer.createTransport({
		host: 'localhost',
		port: 1025,
		secure: false, // MailDev doesn't use TLS
	});

	try {
		await transporter.sendMail({
			from: '"Ekhoes" <no-reply@ekhoes.com>',
			to,
			subject,
			html,
		});

		return true;

	} catch (error) {
		console.log('[sign-in] ', error)
		return false;
	}
}

async function sendSES(to, subject, html) {
  const command = new SendEmailCommand({
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: html,
          Charset: "UTF-8",
        },
      },
    },
    Source: "noreply@ekhoes.com", // Usa un indirizzo verificato nel tuo dominio
  });

  try {
    const response = await ses.send(command);
    console.log("Email inviata con successo:", response);
    return response;
  } catch (error) {
    console.error("Errore nell'invio dell'email:", error);
    throw error;
  }
}

async function send(to, subject, html) {
	//sendLocal(to, subject, html)
	sendSES(to, subject, html)
}

export { send };
