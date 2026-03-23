"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { DEFAULT_LOGO_URL, SITE_INFO } from "@/constants/site-constants";

export default function Home() {
	return (
		<main className="relative min-h-screen w-full overflow-hidden bg-[#050505] flex flex-col items-center justify-center p-6 selection:bg-purple-500/30">
			{/* Cinematic Background Gradients */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<motion.div 
					animate={{
						opacity: [0.15, 0.3, 0.15],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						ease: "easeInOut"
					}}
					style={{ willChange: "opacity" }}
					className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[64px]" 
				/>
				<motion.div 
					animate={{
						opacity: [0.1, 0.2, 0.1],
					}}
					transition={{
						duration: 6,
						repeat: Infinity,
						ease: "easeInOut"
					}}
					style={{ willChange: "opacity" }}
					className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[48px]" 
				/>
			</div>

			{/* Main Content */}
			<div className="relative z-10 flex flex-col items-center text-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="mb-8"
				>
					<div className="relative group">
						<div className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
						<Image
							src={DEFAULT_LOGO_URL}
							alt="Kurvo Logo"
							width={220}
							height={60}
							className="relative opacity-90 brightness-110"
							priority
						/>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
				>
					<h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
						Something <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Extraordinary</span>
						<br />
						is coming.
					</h1>
					<p className="text-zinc-400 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-light">
						{SITE_INFO.description}
						<br />
						The next evolution of video creation is almost here.
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8, delay: 0.4 }}
					className="flex flex-col sm:flex-row items-center gap-4"
				>
					<div className="relative group cursor-not-allowed">
						<div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000" />
						<div className="relative flex px-8 py-3 bg-zinc-900 rounded-lg text-zinc-300 font-medium border border-zinc-800 pointer-events-none">
							Coming Soon
						</div>
					</div>
					
					<Link
						href="/projects"
						className="text-zinc-500 hover:text-white transition-colors text-sm font-medium underline underline-offset-4 decoration-zinc-800"
					>
						Beta Access
					</Link>
				</motion.div>
			</div>

			{/* Footer */}
			<motion.footer
				initial={{ opacity: 0 }}
				animate={{ opacity: 0.5 }}
				transition={{ duration: 1, delay: 1 }}
				className="absolute bottom-8 left-0 right-0 text-center"
			>
				<p className="text-zinc-600 text-sm tracking-widest uppercase">
					© {new Date().getFullYear()} Kurvo. All rights reserved.
				</p>
			</motion.footer>
		</main>
	);
}
