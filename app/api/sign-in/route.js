import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import pool from '@/lib/db';

async function sendMail(to, name, user_name, token) {

	let subject = 'Registration to My App';

	let html = `
		<p>Hello, ${name}.</p>
		<p>Take note of your user code, it can be useful: <strong>${user_name}</strong>.</p>
		<p>
			Click on the link below to complete the registration process:<br>
			<a href='http://localhost:3000/confirm?token=${token}'>Confirm</a>
		</p>
	`;

    // Configura il transporter SMTP per MailDev
    let transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false, // MailDev non usa TLS
    });

    try {
      await transporter.sendMail({
        from: '"Next.js App" <no-reply@nextjs.local>',
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

export async function POST(req) {
	try {
		const { email, username, password } = await req.json();

		const id = uuidv4();

		const query = `
			INSERT INTO api.users ("id", "name", "email", "password") VALUES 
			($1, $2, $3, crypt($4, gen_salt('bf')))
			RETURNING id, user_name
			`;

		const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });

		await pool.query('BEGIN');

		const result = await pool.query(query, [id, username, email, password]);

		await pool.query(`INSERT INTO api.user_roles ("user_id", "roles") VALUES ($1, 'USER')`, [id]);
		await pool.query(`INSERT INTO api.confirmations ("user_id", "request", "token") VALUES ($1, 'sign-in', $2)`, [id, token]);

		await pool.query('COMMIT');

		console.log('[sign-in] inserted = ', result.rows[0]);

		sendMail(email, username, result.rows[0].user_name, token);

		return NextResponse.json({ message: 'Created' }, { status: 201 });

	} catch (err) {
		await pool.query('ROLLBACK');

		let msg, status;

		switch (err.code) {
			case '23505':
				msg = 'A user with the same email exists';
				status = 400;
				break;
			default:
				msg = `Database error ${err.code} ${err.message}`;
				status = 500;
		}

		console.error('[signin] ', err);

		return NextResponse.json({ message: msg, err }, { status });
	}
}
