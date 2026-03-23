import Image from "next/image";
import { RiDiscordFill, RiTwitterXLine } from "react-icons/ri";
import { FaGithub } from "react-icons/fa6";
import Link from "next/link";
import { DEFAULT_LOGO_URL, SOCIAL_LINKS } from "@/constants/site-constants";

export function Footer() {
	return (
		<footer className="bg-background border-t border-white/5">
			<div className="mx-auto max-w-5xl px-8 py-12">
				<div className="flex flex-col items-center text-center gap-8">
					{/* Brand Section */}
					<div className="flex flex-col items-center gap-4">
						<div className="flex items-center gap-3">
							<Image
								src={DEFAULT_LOGO_URL}
								alt="Kurvo"
								width={28}
								height={28}
								className="brightness-125 shadow-2xl"
							/>
							<span className="text-xl font-bold tracking-tight">Kurvo</span>
						</div>
						<p className="text-zinc-500 max-w-xs text-sm leading-relaxed">
							The AI-powered video editor for extraordinary creators.
						</p>
					</div>

					{/* Social Links */}
					<div className="flex justify-center gap-6">
						<Link
							href={SOCIAL_LINKS.github}
							className="text-zinc-500 hover:text-white transition-colors"
							target="_blank"
							rel="noopener noreferrer"
						>
							<FaGithub className="size-5" />
						</Link>
						<Link
							href={SOCIAL_LINKS.x}
							className="text-zinc-500 hover:text-white transition-colors"
							target="_blank"
							rel="noopener noreferrer"
						>
							<RiTwitterXLine className="size-5" />
						</Link>
						<Link
							href={SOCIAL_LINKS.discord}
							className="text-zinc-500 hover:text-white transition-colors"
							target="_blank"
							rel="noopener noreferrer"
						>
							<RiDiscordFill className="size-5" />
						</Link>
					</div>

					{/* Bottom Section */}
					<div className="pt-4 border-t border-white/5 w-full">
						<p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.3em]">
							© {new Date().getFullYear()} Kurvo Labs &bull; All Rights Reserved
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
