import { OcDataBuddyIcon, OcMarbleIcon } from "@kurvo/ui/icons";

export const SITE_URL = "https://kurvo.app";

export const SITE_INFO = {
	title: "Kurvo",
	description:
		"The professional, AI-powered video editor for extraordinary creators.",
	url: SITE_URL,
	openGraphImage: "/open-graph/default.jpg",
	twitterImage: "/open-graph/default.jpg",
	favicon: "/favicon.ico",
};

export const DASHBOARD_URL = "/projects";

export const BRAND_NAME = "Kurvo";

export type ExternalTool = {
	name: string;
	description: string;
	url: string;
	icon: React.ElementType;
};

export const EXTERNAL_TOOLS: ExternalTool[] = [
	{
		name: "Marble",
		description:
			"Modern headless CMS for content management and the blog for Kurvo",
		url: "https://marblecms.com?utm_source=kurvo",
		icon: OcMarbleIcon,
	},
	{
		name: "Databuddy",
		description: "GDPR compliant analytics and user insights for Kurvo",
		url: "https://databuddy.cc?utm_source=kurvo",
		icon: OcDataBuddyIcon,
	},
];

export const DEFAULT_LOGO_URL = "/brand/kurvo-logo.png";

export const SOCIAL_LINKS = {
	x: "https://x.com/kurvoapp",
	github: "https://github.com/Kurvo-app/Kurvo",
	discord: "https://discord.com/invite/Kurvo",
};

export type Sponsor = {
	name: string;
	url: string;
	logo: string;
	description: string;
	invertOnDark?: boolean;
};

export const SPONSORS: Sponsor[] = [
	{
		name: "Fal.ai",
		url: "https://fal.ai?utm_source=kurvo",
		logo: "/logos/others/fal.svg",
		description: "Generative image, video, and audio models all in one place.",
		invertOnDark: true,
	},
	{
		name: "Vercel",
		url: "https://vercel.com?utm_source=kurvo",
		logo: "/logos/others/vercel.svg",
		description: "Platform where we deploy and host Kurvo.",
		invertOnDark: true,
	},
];
