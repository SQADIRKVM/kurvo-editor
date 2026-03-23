"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { SOCIAL_LINKS, DEFAULT_LOGO_URL } from "@/constants/site-constants";
import { useLocalStorage } from "@/hooks/storage/use-local-storage";
import { Button } from "../ui/button";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
	ArrowRight01Icon, 
	AiMagicIcon, 
	Layers01Icon, 
	UserGroupIcon 
} from "@hugeicons/core-free-icons";

const STEPS = [
	{
		id: "welcome",
		title: "Welcome to Kurvo",
		subtitle: "The Future of Professional Video Editing",
		content: "You're among the first to experience Kurvo - the AI-powered, open-source editor designed for creators who demand excellence.",
		icon: AiMagicIcon,
		color: "from-purple-500 to-blue-500",
	},
	{
		id: "beta",
		title: "Early Access Beta",
		subtitle: "Help Us Shape the Evolution",
		content: "We're in active development. Some features are still coming, and things might change quickly. Your feedback is what drives our roadmap.",
		icon: Layers01Icon,
		color: "from-blue-500 to-cyan-500",
	},
	{
		id: "community",
		title: "Join the Creators",
		subtitle: "Exclusive Discord Access",
		content: `Connect with our engineers and fellow creators. Share your work, report bugs, and suggest features in our [official Discord](${SOCIAL_LINKS.discord}).`,
		icon: UserGroupIcon,
		color: "from-cyan-500 to-purple-500",
	}
];

export function Onboarding() {
	const [step, setStep] = useState(0);
	const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage({
		key: "hasSeenOnboarding",
		defaultValue: false,
	});

	if (hasSeenOnboarding) return null;

	const handleNext = () => {
		if (step < STEPS.length - 1) {
			setStep(step + 1);
		} else {
			setHasSeenOnboarding({ value: true });
		}
	};

	const currentStep = STEPS[step];

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#050508]/80 backdrop-blur-sm">
			{/* Cinematic Aura Background */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<motion.div 
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.1, 0.2, 0.1],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
					className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[100px]" 
				/>
				<motion.div 
					animate={{
						scale: [1.2, 1, 1.2],
						opacity: [0.05, 0.15, 0.05],
					}}
					transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
					className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[80px]" 
				/>
			</div>

			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				className="relative w-full max-w-lg p-px rounded-2xl bg-gradient-to-b from-white/10 to-transparent overflow-hidden shadow-2xl mx-4"
			>
				{/* Glassmorphic Panel */}
				<div className="relative bg-[#0a0a0f]/90 backdrop-blur-2xl rounded-[15px] p-8">
					<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-blue-500/0" />
					
					<div className="flex flex-col items-center text-center">
						<motion.div 
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="mb-6"
						>
							<Image src={DEFAULT_LOGO_URL} alt="Kurvo" width={100} height={28} className="brightness-125 opacity-80" />
						</motion.div>

						<div className="relative w-full overflow-hidden min-h-[220px]">
							<AnimatePresence mode="wait">
								<motion.div
									key={step}
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20 }}
									transition={{ duration: 0.4, ease: "easeOut" }}
									className="flex flex-col items-center"
								>
									<div className={`p-4 rounded-xl bg-gradient-to-br ${currentStep.color} bg-opacity-10 mb-6 ring-1 ring-white/10`}>
										<HugeiconsIcon icon={currentStep.icon} className="size-8 text-white" />
									</div>
									
									<h2 className="text-2xl font-bold text-white mb-2 leading-tight">
										{currentStep.title}
									</h2>
									<p className={`text-sm font-semibold mb-4 uppercase tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r ${currentStep.color}`}>
										{currentStep.subtitle}
									</p>
									
									<div className="text-zinc-400 text-base leading-relaxed max-w-[340px]">
										<ReactMarkdown
											components={{
												p: ({ children }) => <p className="mb-0">{children}</p>,
												a: ({ href, children }) => (
													<a
														href={href}
														target="_blank"
														rel="noopener noreferrer"
														className="text-white hover:text-purple-400 underline underline-offset-4 decoration-white/20 transition-colors"
													>
														{children}
													</a>
												),
											}}
										>
											{currentStep.content}
										</ReactMarkdown>
									</div>
								</motion.div>
							</AnimatePresence>
						</div>

						{/* Progress Bar */}
						<div className="w-full flex justify-center gap-1.5 mt-8 mb-8">
							{STEPS.map((_, i) => (
								<div 
									key={i}
									className={`h-1 rounded-full transition-all duration-500 ${
										i === step ? "w-8 bg-purple-500" : "w-2 bg-white/10"
									}`}
								/>
							))}
						</div>

						<Button 
							size="lg"
							onClick={handleNext}
							className={`w-full h-12 rounded-xl text-white font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r ${currentStep.color} shadow-lg shadow-purple-500/20`}
						>
							{step === STEPS.length - 1 ? "Start Creating" : "Next Step"}
							<HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 size-5" />
						</Button>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
