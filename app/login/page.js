'use client'

import { useState } from 'react';
import axios from 'axios';
import ResultBox from '@/components/ResultBox';

export default function LoginPage() {
/*
    const requestHeaders = headers();
    const forceReload = requestHeaders.get('x-force-reload');

    console.log('[login] forceReload = ', forceReload)

    if (forceReload === 'true')
        window.location.reload();
*/
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isDisabled, setIsDisabled] = useState(false);
    const [buttonText, setButtonText] = useState('Log in');


    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsDisabled(true);
        setButtonText('Authenticating...');

        console.log(`${process.env.NEXT_PUBLIC_API_AUTH_URL}/api/auth/login`)

        try {
            setError('');
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_AUTH_URL}/api/auth/login`, { email, password }, {
                withCredentials: true
            });

            // Handle successful login
            window.location.href = '/';
        } catch (err) {

            if (!err.response) {
                // Network error occurred
                setError('Network error: ' + err);
            } else {
                // The server responded with a status other than 200 range
                setError(err.response.data.message);
                //setError('Error response: ' + JSON.stringify(err.response));
            }
        }

        setIsDisabled(false);
        setButtonText('Log in');
    };
    return (
        <>
            <div className="flex justify-center my-[1em] font-bold text-4xl">
                Control panel
            </div>

            <div className="w-[20em] mx-auto">

                <ResultBox fail="true" className={`${error ? '' : 'invisible'}`}>{error}</ResultBox>

                <form onSubmit={handleSubmit}>

                    <div className="mt-[2em] mb-[0.5em]">
                        Email
                    </div>
                    <label className="input validator">
                        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                strokeWidth="2.5"
                                fill="none"
                                stroke="currentColor"
                            >
                                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                            </g>
                        </svg>
                        <input type="email" placeholder="mail@site.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </label>
                    <div className="validator-hint hidden">Enter valid email address</div>

                    <div className="mt-[2em] mb-[0.5em]">
                        Password
                    </div>
                    <label className="input validator">
                        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                strokeWidth="2.5"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path
                                    d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                                ></path>
                                <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
                            </g>
                        </svg>
                        <input
                            type="password"
                            required
                            placeholder="Password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>
                    <p className="validator-hint hidden">
                        Enter password
                    </p>

                    <div className="mt-[2em]">
                        <button className="btn btn-primary" type="submit" disabled={isDisabled}>{buttonText}</button>
                    </div>
                </form>
            </div>

            <div className="flex justify-center mt-[4em]">
                <a href="/sign-in" className="link" >Sign in</a>
            </div>
        </>
    );
}
