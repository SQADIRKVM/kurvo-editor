import { hasEffect, registerEffect } from "../registry";
import { blurEffectDefinition } from "./blur";
import type { EffectDefinition, EffectParamValues } from "@/types/effects";

const grayscaleEffectDefinition: EffectDefinition = {
	type: "grayscale",
	name: "Grayscale",
	keywords: ["b&w", "black and white", "monochrome"],
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
						gl_FragColor = vec4(vec3(gray), color.a);
					}
				`,
				uniforms: () => ({}),
			},
		],
	},
};

const sepiaEffectDefinition: EffectDefinition = {
	type: "sepia",
	name: "Sepia",
	keywords: ["old", "vintage", "brown"],
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
						float r = dot(color.rgb, vec3(0.393, 0.769, 0.189));
						float g = dot(color.rgb, vec3(0.349, 0.686, 0.168));
						float b = dot(color.rgb, vec3(0.272, 0.534, 0.131));
						gl_FragColor = vec4(r, g, b, color.a);
					}
				`,
				uniforms: () => ({}),
			},
		],
	},
};

const invertEffectDefinition: EffectDefinition = {
	type: "invert",
	name: "Invert",
	keywords: ["negative", "opposite"],
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
						gl_FragColor = vec4(1.0 - color.rgb, color.a);
					}
				`,
				uniforms: () => ({}),
			},
		],
	},
};

const vignetteEffectDefinition: EffectDefinition = {
	type: "vignette",
	name: "Vignette",
	keywords: ["dark", "corners", "cinematic"],
	params: [
		{
			key: "intensity",
			label: "Intensity",
			type: "number",
			default: 0.5,
			min: 0,
			max: 1,
			step: 0.01,
		},
	],
	renderer: {
		type: "webgl",
		passes: [
			{
				fragmentShader: `
					precision mediump float;
					varying vec2 v_texCoord;
					uniform sampler2D u_image;
					uniform float u_intensity;
					void main() {
						vec4 color = texture2D(u_image, v_texCoord);
						vec2 relativePosition = v_texCoord - 0.5;
						float distance = length(relativePosition);
						float vignette = 1.0 - distance * u_intensity;
						gl_FragColor = vec4(color.rgb * vignette, color.a);
					}
				`,
				uniforms: ({ effectParams }: { effectParams: EffectParamValues }) => ({
					u_intensity: effectParams.intensity as number,
				}),
			},
		],
	},
};

import { adjustEffectDefinition, zoomEffectDefinition } from "./adjust";
import { filterDefinitions } from "./filters";

const defaultEffects: EffectDefinition[] = [
	blurEffectDefinition,
	grayscaleEffectDefinition,
	sepiaEffectDefinition,
	invertEffectDefinition,
	vignetteEffectDefinition,
	adjustEffectDefinition,
	zoomEffectDefinition,
	...filterDefinitions,
];

export function registerDefaultEffects(): void {
	for (const definition of defaultEffects) {
		if (hasEffect({ effectType: definition.type })) {
			continue;
		}
		registerEffect({ definition });
	}
}
