// components/Sidebar.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  ListBulletIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const pathname = usePathname();

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-2 rounded hover:bg-base-300 transition ${
      pathname === path ? "bg-base-200 font-bold" : ""
    }`;

  const iconClass = "h-5 w-5";

  return (
    <aside className="w-64 bg-base-100 border-r border-t border-base-300 min-h-screen p-4 hidden md:block">
      <nav className="space-y-2">
        <Link href="/" className={linkClass("/")}>
          <HomeIcon className={iconClass} />
          Home
        </Link>
        <Link href="/users" className={linkClass("/users")}>
          <UsersIcon className={iconClass} />
          Users
        </Link>
        <Link href="/sessions" className={linkClass("/sessions")}>
          <ListBulletIcon className={iconClass} />
          Sessions
        </Link>
        <Link href="/health" className={linkClass("/health")}>
          <CheckCircleIcon className={iconClass} />
          Health
        </Link>
      </nav>
    </aside>
  );
}
