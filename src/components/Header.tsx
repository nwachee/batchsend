import Image from "next/image";
import { FaGithub } from "react-icons/fa";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
  return (
    <header className="w-full border-b border-gray-200 bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo and GitHub */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              {/* Custom SVG Logo from previous version */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 50"
                className="w-8 h-8 md:w-10 md:h-10 fill-current text-gray-900"
              >
                <title>BatchSend Logo: Coin Waterfall</title>
                {/* Coin stack entering */}
                <circle cx="15" cy="10" r="4" />
                <circle cx="25" cy="15" r="4" />
                <circle cx="35" cy="10" r="4" />
                {/* Funnel / Channel */}
                <path
                  d="M10 20 L40 20 L30 40 L20 40 Z"
                  fill="currentColor"
                  opacity="0.4"
                />
                {/* Single coin exiting */}
                <circle cx="25" cy="45" r="4" fill="currentColor" />
              </svg>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                BatchSend
              </span>
            </div>
            <a
              href="https://github.com/nwachee/batchsend"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 hidden sm:block"
              aria-label="View source on GitHub"
            >
              <FaGithub size={24} />
            </a>
          </div>

          {/* Middle: Tagline */}
          <div className="flex-grow text-center hidden md:block">
            <p className="text-sm font-medium text-gray-500 italic px-4">
              Send tokens to hundreds. Pay gas for one.
            </p>
          </div>

          {/* Right: Connect Button */}
          <div>
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
