import type { EffectDefinition } from "@/types/effects";

export const nordicFilterDefinition: EffectDefinition = {
	type: "filter-nordic",
	name: "Nordic",
	keywords: ["cool", "blue", "cold", "desaturated"],
	params: [],
	renderer: {
		type: "webgl",
		passes: [
			{
				fragmentShader: `
					precision mediump float;
					varying vec2 v_texCoord;
					uniform sampler2D u_image;
					void main() {
						vec4 color = texture2D(u_image, v_texCoord);
						// Desaturate slightly
						float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
						vec3 desat = mix(color.rgb, vec3(gray), 0.2);
						// Add cool tint
						vec3 tinted = desat * vec3(0.9, 0.95, 1.1);
						// Boost contrast
						vec3 contrasted = (tinted - 0.5) * 1.2 + 0.5;
						gl_FragColor = vec4(contrasted, color.a);
					}
				`,
				uniforms: () => ({}),
			},
		],
	},
};

export const cinematicFilterDefinition: EffectDefinition = {
	type: "filter-cinematic",
	name: "Cinematic",
	keywords: ["movie", "teal", "orange", "pro"],
	params: [],
	renderer: {
		type: "webgl",
		passes: [
			{
				fragmentShader: `
					precision mediump float;
					varying vec2 v_texCoord;
					uniform sampler2D u_image;
					void main() {
						vec4 color = texture2D(u_image, v_texCoord);
						// Teal and Orange look
						vec3 result = color.rgb;
						result.r = pow(result.r, 1.1); // Shift towards orange/red in highlights
						result.b = pow(result.b, 1.3); // Deepen blues
						result.g = pow(result.g, 1.05);
						// Tint shadows teal
						float gray = dot(result, vec3(0.299, 0.587, 0.114));
						vec3 teal = vec3(0.4, 0.6, 0.7);
						result = mix(result * teal, result, gray);
						gl_FragColor = vec4(result, color.a);
					}
				`,
				uniforms: () => ({}),
			},
		],
	},
};

export const vintageFilterDefinition: EffectDefinition = {
	type: "filter-vintage",
	name: "Vintage",
	keywords: ["old", "retro", "warm", "faded"],
	params: [],
	renderer: {
		type: "webgl",
		passes: [
			{
				fragmentShader: `
					precision mediump float;
					varying vec2 v_texCoord;
					uniform sampler2D u_image;
					void main() {
						vec4 color = texture2D(u_image, v_texCoord);
						// Warm tint
						vec3 tinted = color.rgb * vec3(1.1, 1.0, 0.8);
						// Fade blacks
						vec3 faded = mix(tinted, vec3(0.1, 0.1, 0.1), 0.1);
						// Lower contrast slightly
						vec3 result = (faded - 0.5) * 0.9 + 0.5;
						gl_FragColor = vec4(result, color.a);
					}
				`,
				uniforms: () => ({}),
			},
		],
	},
};

export const warmFilterDefinition: EffectDefinition = {
	type: "filter-warm",
	name: "Warm",
	keywords: ["sun", "golden", "summer"],
	params: [],
	renderer: {
		type: "webgl",
		passes: [
			{
				fragmentShader: `
					precision mediump float;
					varying vec2 v_texCoord;
					uniform sampler2D u_image;
					void main() {
						vec4 color = texture2D(u_image, v_texCoord);
						vec3 result = color.rgb * vec3(1.15, 1.05, 0.9);
						gl_FragColor = vec4(result, color.a);
					}
				`,
				uniforms: () => ({}),
			},
		],
	},
};

export const coolFilterDefinition: EffectDefinition = {
	type: "filter-cool",
	name: "Cool",
	keywords: ["blue", "night", "winter"],
	params: [],
	renderer: {
		type: "webgl",
		passes: [
			{
				fragmentShader: `
					precision mediump float;
					varying vec2 v_texCoord;
					uniform sampler2D u_image;
					void main() {
						vec4 color = texture2D(u_image, v_texCoord);
						vec3 result = color.rgb * vec3(0.85, 0.95, 1.2);
						gl_FragColor = vec4(result, color.a);
					}
				`,
				uniforms: () => ({}),
			},
		],
	},
};

export const bAndWFilterDefinition: EffectDefinition = {
	type: "filter-bw",
	name: "B&W",
	keywords: ["black and white", "mono", "noir"],
	params: [],
	renderer: {
		type: "webgl",
		passes: [
			{
				fragmentShader: `
					precision mediump float;
					varying vec2 v_texCoord;
					uniform sampler2D u_image;
					void main() {
						vec4 color = texture2D(u_image, v_texCoord);
						float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
						// Boost contrast for dramatic B&W
						float contrasted = (gray - 0.5) * 1.3 + 0.5;
						gl_FragColor = vec4(vec3(contrasted), color.a);
					}
				`,
				uniforms: () => ({}),
			},
		],
	},
};

export const filterDefinitions = [
	nordicFilterDefinition,
	cinematicFilterDefinition,
	vintageFilterDefinition,
	warmFilterDefinition,
	coolFilterDefinition,
	bAndWFilterDefinition,
];
