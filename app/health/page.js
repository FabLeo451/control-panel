'use client'

import { useEffect, useState } from 'react'
import axios from 'axios';
import ResultRow from '@/components/ResultRow'
import {
	ArrowPathIcon,
	XCircleIcon,
	CircleStackIcon,
	ServerIcon,
	CpuChipIcon
} from '@heroicons/react/24/outline'

const fetchHealthData = async (url, setResult, setData, setLoading) => {
	try {
		const res = await fetch(url)
		setResult(res.ok)
		const data = await res.json()
		//setData(data.success ? data : data.details || data)
		setData(data)
	} catch (error) {
		console.log('Fetch error: ', error)
		setData({message: error.message})
	} finally {
		setLoading(false)
	}
}

function bytesToGigabytes(bytes) {
	if (typeof bytes !== 'number' || isNaN(bytes)) return null;
	const gb = bytes / (1024 ** 3); // 1 GB = 1024³ bytes
	return Math.round(gb * 10) / 10; // arrotonda a 1 cifra decimale
}

function UsageBar({ title, used, total }) {
	const usedPercent = Math.round((used / total) * 100);

	return (
		<div>
			<div className="flex justify-between text-sm mb-1">
				<span>{title}</span>
				<span>{usedPercent}% ({bytesToGigabytes(used)} GB / {bytesToGigabytes(total)} GB)</span>
			</div>
			<div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
				<div
					className="bg-blue-600 h-full"
					style={{ width: `${usedPercent}%` }}
				/>
			</div>
		</div>
	);
}

export default function HealthPage() {
	const [postgres, setPostgres] = useState({ loading: true, result: false, data: {} })
	const [redis, setRedis] = useState({ loading: true, result: false, data: {} })
	const [websocket, setWebsocket] = useState({ loading: true, result: false, data: {} })
	const [system, setSystem] = useState({ loading: true, result: false, data: {} })
	const [env, setEnv] = useState({ loading: true, result: false, data: {} })

    const [ws, setWs] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [wsResponse, setWSResponse] = useState('');

    const [alertMsg, setAlertMessage] = useState(null);

    const sendMessage = (payload) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(payload));
            console.log('Message sent to server');
        } else
			setAlertMessage("Can't send message. WebSocket is closed")
    };

	const sendProbeMessage = () => {
		setAlertMessage(null);

		sendMessage({
			type: 'ping',
			message: "Ping"
		})
	}

	useEffect(() => {
		const API = process.env.NEXT_PUBLIC_API_BASE_URL
		const WS = process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_BASE_URL

		fetchHealthData(`${API}/api/health/system`,
			(r) => setSystem(p => ({ ...p, result: r })),
			(d) => setSystem(p => ({ ...p, data: d })),
			() => setSystem(p => ({ ...p, loading: false }))
		)

		fetchHealthData(`${API}/api/health/postgres`,
			(r) => setPostgres(p => ({ ...p, result: r })),
			(d) => setPostgres(p => ({ ...p, data: d })),
			() => setPostgres(p => ({ ...p, loading: false }))
		)

		fetchHealthData(`${API}/api/health/redis`,
			(r) => setRedis(p => ({ ...p, result: r })),
			(d) => setRedis(p => ({ ...p, data: d })),
			() => setRedis(p => ({ ...p, loading: false }))
		)

		fetch(`${API}/api/env`)
			.then(res => res.json())
			.then(data => setEnv({ loading: false, result: true, data }))
			.catch(() => setEnv({ loading: false, result: false, data: {} })
		)

        const connectWebSocket = async () => {

            try {

                // Get a temporary token
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/token`, {
                    withCredentials: true, // NECESSARIO per mandare i cookie cross-site
                });

				let socket;

                // WebSocket
				if (ws && ws.readyState === WebSocket.OPEN) {
					console.log('WebSocket already open');
				} else 
                	socket = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}?token=${response.data.token}`);

                //console.log('socket = ', socket)

                // Eventi WebSocket
                socket.onopen = () => {
                    setConnectionStatus('Connected');
                    console.log('WebSocket connection opened');
                };

                socket.onmessage = (event) => {
                    console.log('Message from server:', event.data);

					try {
						let payload = JSON.parse(event.data);
						setWSResponse(new Date(payload.Text).toLocaleString());
					} catch (e) {
						setAlertMessage("Can't process websocket response: " + event.data);
					}
                };

                socket.onerror = (error) => {
                    console.log('WebSocket error:', error);

					setWebsocket({loading: false, result: false, data: { message: 'Unable to connect to websocket server' }})
                };

                socket.onclose = () => {
                    setConnectionStatus('Disconnected');
                    console.log('WebSocket connection closed');
                };

                // Salva la connessione WebSocket nello stato
                setWs(socket);

                // Cleanup al momento della disconnessione del componente
                return () => {
                    socket.close();
                    console.log('WebSocket connection closed on cleanup');
                };


            } catch (err) {

                if (!err.response) {
                    console.error('Network error: ' + err);
                } else {
                    // The server responded with a status other than 200 range
                    console.log(err.response.data.message);
                }
            } finally {

					fetchHealthData(`${WS}/metrics`,
						(r) => setWebsocket(p => ({ ...p, result: r })),
						(d) => setWebsocket(p => ({ ...p, data: d })),
						() => setWebsocket(p => ({ ...p, loading: false }))
					)

			}
        }

        connectWebSocket();


	}, [])

	return (
		<div >

			<div className="p-4">
			{alertMsg && (
				<div role="alert" className="alert alert-error">
				<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span>{alertMsg}</span>
				</div>
			)}
			</div>

			<div className="tabs tabs-border">

				<input type="radio" name="my_tabs_2" className="tab" aria-label="Overview" defaultChecked />
				<div className="tab-content border-base-300 bg-base-100 p-10">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

						<ResultRow icon={CpuChipIcon} label="System (EC2 instance)" loading={system.loading} result={system.result && system.data.memory_usagePercent < 90 && system.data.disk_usagePercent < 90} data={system.data} successMessage="System is healty" warningMessage="Check system metrics" />
						<ResultRow icon={CircleStackIcon} label="Postgres" loading={postgres.loading} result={postgres.result} data={postgres.data} successMessage="Database is up" />
						<ResultRow icon={CircleStackIcon} label="Redis" loading={redis.loading} result={redis.result} data={redis.data} successMessage="Database is up" />
						<ResultRow icon={ServerIcon} label="Websocket" loading={websocket.loading} result={websocket.result} data={websocket.data} successMessage="Server is up" />

					</div>
				</div>

				<input type="radio" name="my_tabs_2" className="tab" aria-label="System (EC2 instance)" />
				<div className="tab-content border-base-300 bg-base-100 p-5">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<ul className="mt-2 space-y-1">
							<li><strong>Total memory</strong>: {bytesToGigabytes(system.data.memory_total)} GB</li>
							<li><strong>Used memory</strong>: {bytesToGigabytes(system.data.memory_used)} GB</li>
							<li><strong>Free memory</strong>: {bytesToGigabytes(system.data.memory_free)} GB</li>
							<li><strong>Memory usage</strong>: {Math.round(system.data.memory_usagePercent * 10) / 10}%</li>
							<li><UsageBar title="Memory usage" used={system.data.memory_used} total={system.data.memory_total} /></li>
						</ul>
						<ul className="mt-2 space-y-1">
							<li><strong>Total disk</strong>: {bytesToGigabytes(system.data.disk_total)} GB</li>
							<li><strong>Used disk</strong>: {bytesToGigabytes(system.data.disk_used)} GB</li>
							<li><strong>Free disk</strong>: {bytesToGigabytes(system.data.disk_available)} GB</li>
							<li><strong>Disk usage</strong>: {Math.round(system.data.disk_usagePercent * 10) / 10}%</li>
							<li><UsageBar title="Disk usage" used={system.data.disk_used} total={system.data.disk_total} /></li>
						</ul>
						<div><strong>Uptime</strong>: {system.data.system_uptime}</div>
					</div>
				</div>

				<input type="radio" name="my_tabs_2" className="tab" aria-label="Postgres" />
				<div className="tab-content border-base-300 bg-base-100 p-5">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{postgres.result && (<ul className="mt-2 space-y-1">
							{Object.entries(postgres.data || {})
								.filter(([key]) => key !== 'success')
								.map(([key, value]) => (
									<li key={key}>
										<strong>{key}</strong>: {value}
									</li>
								))}
						</ul>)}
					</div>
				</div>

				<input type="radio" name="my_tabs_2" className="tab" aria-label="Redis" />
				<div className="tab-content border-base-300 bg-base-100 p-5">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{redis.result && (<ul className="mt-2 space-y-1">
							{Object.entries(redis.data || {})
								.filter(([key]) => key !== 'success')
								.map(([key, value]) => (
									<li key={key}>
										<strong>{key}</strong>: {value}
									</li>
								))}
						</ul>)}

					</div>
				</div>

				<input type="radio" name="my_tabs_2" className="tab" aria-label="Websocket" />
				<div className="tab-content border-base-300 bg-base-100 p-5">
					<ul className="mt-2 space-y-1">
						{Object.entries(websocket.data || {})
							.filter(([key]) => key !== 'success')
							.map(([key, value]) => (
								<li key={key}>
									<strong>{key}</strong>: {value}
								</li>
							))}
					</ul>
					<div className="mt-5">
						<div className="mt-5 mb-3">Check messages exchange</div>
						<button className="btn btn-soft" onClick={sendProbeMessage}>Send message</button>
						<div className="mt-5 mb-3">Websocket response</div>
						<textarea className="textarea" value={wsResponse} disabled></textarea>
					</div>
				</div>

				<input type="radio" name="my_tabs_2" className="tab" aria-label="Environment" />
				<div className="tab-content border-base-300 bg-base-100 p-10">
					{env.loading ? (
						<div className="flex items-center space-x-2 text-gray-600">
							<ArrowPathIcon className="w-6 h-6 animate-spin text-blue-500" />
							<span>Getting data...</span>
						</div>
					) : env.result ? (
						<ul className="space-y-1 text-sm">
							{Object.entries(env.data)
								.filter(([key]) => key.startsWith('NEXT_'))
								.map(([key, value]) => (
									<li key={key}>
										<strong>{key}</strong>: {value}
									</li>
								))}
						</ul>
					) : (
						<div className="flex items-center space-x-2 text-gray-600">
							<XCircleIcon className="w-6 h-6 text-red-500" />
							<span>Can't retrieve variables or not authorized</span>
						</div>
					)}
				</div>



			</div>



		</div>
	)
}
