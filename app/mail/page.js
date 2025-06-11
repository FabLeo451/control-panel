'use client';

import { useEffect, useState } from 'react';


export default function UsersPage() {
	const [message, setMessage] = useState('');
	const [name, setName] = useState('');

	const [successMsg, setSuccessMessage] = useState(null);
	const [errorMsg, setError] = useState(null);

	const formValid = message && name;

	const handleSendMessage = async (e) => {
		e.preventDefault();


	}

  return (
		<div>
			<div className="flex font-bold text-4xl">
				Send email
			</div>

			<div>
				{successMsg && (
					<div role="alert" className="alert alert-success w-full max-w-[90vw] lg:max-w-[50vw] mx-auto mt-3">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>{successMsg}</span>
					</div>
				)}

				{errorMsg && (
					<div role="alert" className="alert alert-error w-full max-w-[90vw] lg:max-w-[50vw] mx-auto mt-3">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>{errorMsg}</span>
					</div>
				)}

				<div className="w-[20em]">

					<form onSubmit={handleSendMessage} className="w-[20em]">

						<div className="mt-[2em] mb-[0.5em]">To</div>
						<label className="input">
							<input type="text" placeholder="Any name you want" value={name} onChange={(e) => setName(e.target.value)} className="w-full" required />
						</label>

						<div>
							<div className="mt-[2em] mb-[0.5em]">Content</div>
							<textarea className="textarea h-30" value={message} maxLength={500} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message here"></textarea>
						</div>

						<div className="mt-[2em]">
							<button className="btn btn-primary" type="submit" disabled={!formValid} >Send</button>
						</div>

					</form>
				</div>
			</div>

		</div>
  );
}
