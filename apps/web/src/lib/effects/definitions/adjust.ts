import type { EffectDefinition, EffectParamValues } from "@/types/effects";

export const adjustEffectDefinition: EffectDefinition = {
	type: "adjust",
	name: "Adjust",
	keywords: ["brightness", "contrast", "saturation", "color", "lighting"],
	params: [
		{
			key: "brightness",
			label: "Brightness",
			type: "number",
			default: 0,
			min: -1,
			max: 1,
			step: 0.01,
		},
		{
			key: "contrast",
			label: "Contrast",
			type: "number",
			default: 1,
			min: 0,
			max: 3,
			step: 0.01,
		},
		{
			key: "saturation",
			label: "Saturation",
			type: "number",
			default: 1,
			min: 0,
			max: 3,
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
					uniform float u_brightness;
					uniform float u_contrast;
					uniform float u_saturation;

					void main() {
						vec4 color = texture2D(u_image, v_texCoord);
						
						// Brightness
						vec3 rgb = color.rgb + u_brightness;
						
						// Contrast
						rgb = (rgb - 0.5) * u_contrast + 0.5;
						
						// Saturation
						float gray = dot(rgb, vec3(0.299, 0.587, 0.114));
						rgb = mix(vec3(gray), rgb, u_saturation);
						
						gl_FragColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
					}
				`,
				uniforms: ({ effectParams }: { effectParams: EffectParamValues }) => ({
					u_brightness: (effectParams.brightness as number) ?? 0,
					u_contrast: (effectParams.contrast as number) ?? 1,
					u_saturation: (effectParams.saturation as number) ?? 1,
				}),
			},
		],
	},
};

export const zoomEffectDefinition: EffectDefinition = {
	type: "zoom",
	name: "Zoom",
	keywords: ["scale", "magnify", "punch", "motion"],
	params: [
		{
			key: "scale",
			label: "Scale",
			type: "number",
			default: 1,
			min: 0.1,
			max: 5,
			step: 0.01,
		},
		{
			key: "centerX",
			label: "Center X",
			type: "number",
			default: 0.5,
			min: 0,
			max: 1,
			step: 0.01,
		},
		{
			key: "centerY",
			label: "Center Y",
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
					uniform float u_scale;
					uniform vec2 u_center;

					void main() {
						// Map texCoord to be centered around u_center
						vec2 transformedCoord = (v_texCoord - u_center) / u_scale + u_center;
						
						// Check bounds to avoid wrapping/clamping artifacts if desired
						if (transformedCoord.x < 0.0 || transformedCoord.x > 1.0 || 
							transformedCoord.y < 0.0 || transformedCoord.y > 1.0) {
							gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
						} else {
							gl_FragColor = texture2D(u_image, transformedCoord);
						}
					}
				`,
				uniforms: ({ effectParams }: { effectParams: EffectParamValues }) => ({
					u_scale: (effectParams.scale as number) ?? 1,
					u_center: [
						(effectParams.centerX as number) ?? 0.5,
						(effectParams.centerY as number) ?? 0.5,
					],
				}),
			},
		],
	},
};
