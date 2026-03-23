"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
	ArrowLeft01Icon, 
	ArrowRight01Icon, 
	AiMagicIcon 
} from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { DEFAULT_LOGO_URL } from "@/constants/site-constants";
import Image from "next/image";

const STORAGE_KEY = "mobile-acknowledged";

interface MobileGateProps {
	children: React.ReactNode;
}

export function MobileGate({ children }: MobileGateProps) {
	const router = useRouter();
	const [show, setShow] = useState<boolean | null>(null);

	useEffect(() => {
		const isMobile = window.innerWidth < 1024;
		const acknowledged = localStorage.getItem(STORAGE_KEY) === "true";
		setShow(isMobile && !acknowledged);
	}, []);

	if (show === null) return null;
	if (!show) return <>{children}</>;

	const handleContinue = () => {
		localStorage.setItem(STORAGE_KEY, "true");
		setShow(false);
	};

	const handleGoBack = () => {
		router.back();
	};

	return (
		<div className="dark bg-[#050508] relative flex h-screen w-screen flex-col overflow-hidden selection:bg-purple-500/30">
			{/* Cinematic Aura Background */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<motion.div 
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.15, 0.25, 0.15],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
					className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[120px]" 
				/>
				<motion.div 
					animate={{
						scale: [1.2, 1, 1.2],
						opacity: [0.1, 0.2, 0.1],
					}}
					transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
					className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px]" 
				/>
			</div>

			{/* Header */}
			<header className="relative z-10 flex items-center justify-between p-8">
				<Button
					variant="ghost"
					className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
					onClick={handleGoBack}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" />
					<span className="text-sm font-medium">Exit</span>
				</Button>
				<Image src={DEFAULT_LOGO_URL} alt="Kurvo" width={80} height={22} className="opacity-50 grayscale hover:grayscale-0 transition-all duration-500" />
			</header>

			{/* Content */}
			<div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-8">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="flex flex-col items-center"
				>
					<div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-2xl backdrop-blur-xl">
						<HugeiconsIcon icon={AiMagicIcon} className="size-8 text-white/40" />
					</div>
					
					<h1 className="text-white text-4xl md:text-5xl font-bold tracking-tighter mb-4 leading-tight">
						Extraordinary scale.<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Desktop only experience.</span>
					</h1>
					
					<p className="text-zinc-500 text-lg max-w-md mx-auto mb-10 leading-relaxed font-light">
						Kurvo is a professional-grade editor built for larger displays. 
						For the best experience, please return on a desktop machine.
					</p>

					<div className="flex flex-col items-center gap-4 w-full max-w-sm">
						<Button 
							size="lg"
							onClick={handleContinue}
							className="w-full bg-white text-black hover:bg-zinc-200 rounded-xl font-bold h-12 shadow-xl shadow-white/5"
						>
							Take a look anyway
						</Button>
					</div>
				</motion.div>
			</div>

			{/* Footer */}
			<footer className="relative z-10 p-8 text-center">
				<p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.3em]">
					Kurvo &bull; © 2026
				</p>
			</footer>
		</div>
	);
}
