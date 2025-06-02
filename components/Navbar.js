
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import MainMenuItems from '@/components/MainMenuItems';
import {
  UserIcon
} from '@heroicons/react/24/solid'

export default async function Navbar() {

    const cookieStore = await cookies();
    const token = cookieStore.get(process.env.COOKIE_NAME)?.value;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //console.log('[Navbar] decoded = ', decoded)

        return (


            <div className="navbar bg-base-100 shadow-sm">
                <div className="flex-1">
                    <a href="/" className="btn btn-ghost text-xl">Control panel</a>
                </div>
                <div className="flex-none">
                    {/*<button className="btn btn-square btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-5 w-5 stroke-current"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path> </svg>
                    </button>*/}
                    {/*<DropdownMenu label={decoded.user ? decoded.user.name : ''}  />*/}
                    <div className="flex grow justify-end px-2">
                        <div className="flex items-stretch">

                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost rounded-field"><UserIcon className="w-6" /> {decoded.user ? decoded.user.name : 'Menu'}</div>
                                <MainMenuItems />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        )
    } catch (err) {
        return (<div className="pl-1">Invalid token: {err.message}</div>);
    }
}
