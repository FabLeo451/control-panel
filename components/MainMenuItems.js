
'use client'

function About() {
	return (
		<dialog id="modal_about" className="modal">
			<div className="modal-box">
				<h3 className="font-bold text-lg">Control panel</h3>
				<p className="py-4">Version</p>
				<div className="modal-action">
					<form method="dialog">
						{/* if there is a button in form, it will close the modal */}
						<button className="btn">Close</button>
					</form>
				</div>
			</div>
		</dialog>
	);
}
export default function MainMenuItems({ label = "You" }) {

	const handleLogout = async (e) => {
		e.preventDefault();

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`, {
				method: 'POST',
				credentials: 'include', // cookie with SameSite=None
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error('[Logout error]', errorData.message || 'Generic error');
				// Qui puoi mostrare un messaggio all’utente, ad esempio con una toast
				return;
			}

			window.location.href = '/login';
		} catch (err) {
			console.error('[Logout exception]', err);
			// Anche qui puoi mostrare un messaggio d'errore all'utente
		}
	};


	return (
		<>
		<About />
		<ul
			tabIndex={0}
			className="menu dropdown-content bg-base-200 rounded-box z-1 mt-4 w-52 p-2 shadow-sm">
			<li><a href="/" onClick={handleLogout}>Log out</a></li>
		</ul>
		</>
	);
}
