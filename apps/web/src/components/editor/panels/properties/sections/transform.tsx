import { NumberField } from "@/components/ui/number-field";
import { useEditor } from "@/hooks/use-editor";
import { clamp, isNearlyEqual } from "@/utils/math";
import type { AnimationPropertyPath } from "@/types/animation";
import type { VisualElement } from "@/types/timeline";
import {
	Section,
	SectionContent,
	SectionField,
	SectionFields,
	SectionHeader,
	SectionTitle,
} from "../section";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	ArrowExpandIcon,
	Link05Icon,
	RotateClockwiseIcon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { DEFAULT_TRANSFORM } from "@/constants/timeline-constants";
import { TIME_EPSILON_SECONDS } from "@/constants/animation-constants";
import { getElementLocalTime, resolveTransformAtTime } from "@/lib/animation";
import { KeyframeToggle } from "../keyframe-toggle";
import { useKeyframedNumberProperty } from "../hooks/use-keyframed-number-property";
import { CapCutSlider } from "@/components/ui/capcut-slider";

export function parseNumericInput({ input }: { input: string }): number | null {
	const parsed = parseFloat(input);
	return Number.isNaN(parsed) ? null : parsed;
}

export function isPropertyAtDefault({
	hasAnimatedKeyframes,
	isPlayheadWithinElementRange,
	resolvedValue,
	staticValue,
	defaultValue,
}: {
	hasAnimatedKeyframes: boolean;
	isPlayheadWithinElementRange: boolean;
	resolvedValue: number;
	staticValue: number;
	defaultValue: number;
}): boolean {
	if (hasAnimatedKeyframes && isPlayheadWithinElementRange) {
		return isNearlyEqual({
			leftValue: resolvedValue,
			rightValue: defaultValue,
		});
	}

	return staticValue === defaultValue;
}

export function TransformSection({
	element,
	trackId,
	showTopBorder = true,
}: {
	element: VisualElement;
	trackId: string;
	showTopBorder?: boolean;
}) {
	const editor = useEditor();
	const [isScaleLocked, setIsScaleLocked] = useState(false);
	const playheadTime = editor.playback.getCurrentTime();
	const localTime = getElementLocalTime({
		timelineTime: playheadTime,
		elementStartTime: element.startTime,
		elementDuration: element.duration,
	});
	const resolvedTransform = resolveTransformAtTime({
		baseTransform: element.transform,
		animations: element.animations,
		localTime,
	});
	const isPlayheadWithinElementRange =
		playheadTime >= element.startTime - TIME_EPSILON_SECONDS &&
		playheadTime <= element.startTime + element.duration + TIME_EPSILON_SECONDS;

	const positionX = useKeyframedNumberProperty({
		trackId,
		elementId: element.id,
		animations: element.animations,
		propertyPath: "transform.position.x",
		localTime,
		isPlayheadWithinElementRange,
		displayValue: Math.round(resolvedTransform.position.x).toString(),
		parse: (input) => parseNumericInput({ input }),
		valueAtPlayhead: resolvedTransform.position.x,
		buildBaseUpdates: ({ value }) => {
			const currentTransform = element.transform ?? DEFAULT_TRANSFORM;
			const currentPosition = currentTransform.position ?? DEFAULT_TRANSFORM.position;
			return {
				transform: {
					...currentTransform,
					position: {
						...currentPosition,
						x: value,
					},
				},
			};
		},
	});

	const positionY = useKeyframedNumberProperty({
		trackId,
		elementId: element.id,
		animations: element.animations,
		propertyPath: "transform.position.y",
		localTime,
		isPlayheadWithinElementRange,
		displayValue: Math.round(resolvedTransform.position.y).toString(),
		parse: (input) => parseNumericInput({ input }),
		valueAtPlayhead: resolvedTransform.position.y,
		buildBaseUpdates: ({ value }) => {
			const currentTransform = element.transform ?? DEFAULT_TRANSFORM;
			const currentPosition = currentTransform.position ?? DEFAULT_TRANSFORM.position;
			return {
				transform: {
					...currentTransform,
					position: {
						...currentPosition,
						y: value,
					},
				},
			};
		},
	});

	const scale = useKeyframedNumberProperty({
		trackId,
		elementId: element.id,
		animations: element.animations,
		propertyPath: "transform.scale",
		localTime,
		isPlayheadWithinElementRange,
		displayValue: Math.round(resolvedTransform.scale * 100).toString(),
		parse: (input) => {
			const parsed = parseNumericInput({ input });
			if (parsed === null) return null;
			return Math.max(parsed, 1) / 100;
		},
		valueAtPlayhead: resolvedTransform.scale,
		buildBaseUpdates: ({ value }) => ({
			transform: {
				...(element.transform ?? DEFAULT_TRANSFORM),
				scale: value,
			},
		}),
	});
	const scaleFieldProps = {
		className: "flex-1",
		value: scale.displayValue,
		onFocus: scale.onFocus,
		onChange: scale.onChange,
		onBlur: scale.onBlur,
		dragSensitivity: "slow" as const,
		onScrub: scale.scrubTo,
		onScrubEnd: scale.commitScrub,
		onReset: () => scale.commitValue({ value: DEFAULT_TRANSFORM.scale }),
		isDefault: isPropertyAtDefault({
			hasAnimatedKeyframes: scale.hasAnimatedKeyframes,
			isPlayheadWithinElementRange,
			resolvedValue: resolvedTransform.scale,
			staticValue: element.transform?.scale ?? DEFAULT_TRANSFORM.scale,
			defaultValue: DEFAULT_TRANSFORM.scale,
		}),
	};

	const rotation = useKeyframedNumberProperty({
		trackId,
		elementId: element.id,
		animations: element.animations,
		propertyPath: "transform.rotate",
		localTime,
		isPlayheadWithinElementRange,
		displayValue: Math.round(resolvedTransform.rotate).toString(),
		parse: (input) => {
			const parsed = parseNumericInput({ input });
			if (parsed === null) return null;
			return clamp({ value: parsed, min: -360, max: 360 });
		},
		valueAtPlayhead: resolvedTransform.rotate,
		buildBaseUpdates: ({ value }) => ({
			transform: {
				...(element.transform ?? DEFAULT_TRANSFORM),
				rotate: value,
			},
		}),
	});

	const hasPositionKeyframe =
		positionX.isKeyframedAtTime || positionY.isKeyframedAtTime;

	const togglePositionKeyframe = () => {
		if (!isPlayheadWithinElementRange) {
			return;
		}

		if (positionX.keyframeIdAtTime || positionY.keyframeIdAtTime) {
			const keyframesToRemove: Array<{
				trackId: string;
				elementId: string;
				propertyPath: AnimationPropertyPath;
				keyframeId: string;
			}> = [];
			if (positionX.keyframeIdAtTime) {
				keyframesToRemove.push({
					trackId,
					elementId: element.id,
					propertyPath: "transform.position.x" as const,
					keyframeId: positionX.keyframeIdAtTime,
				});
			}
			if (positionY.keyframeIdAtTime) {
				keyframesToRemove.push({
					trackId,
					elementId: element.id,
					propertyPath: "transform.position.y" as const,
					keyframeId: positionY.keyframeIdAtTime,
				});
			}

			editor.timeline.removeKeyframes({
				keyframes: keyframesToRemove,
			});
			return;
		}

		editor.timeline.upsertKeyframes({
			keyframes: [
				{
					trackId,
					elementId: element.id,
					propertyPath: "transform.position.x",
					time: localTime,
					value: resolvedTransform.position.x,
				},
				{
					trackId,
					elementId: element.id,
					propertyPath: "transform.position.y",
					time: localTime,
					value: resolvedTransform.position.y,
				},
			],
		});
	};

	return (
		<Section
			collapsible
			sectionKey={`${element.type}:transform`}
			showTopBorder={showTopBorder}
		>
			<SectionHeader><SectionTitle>Transform</SectionTitle></SectionHeader>
			<SectionContent>
				<SectionFields>
					<div className="flex flex-col gap-1 w-full pl-2">
						<div className="flex items-center w-full relative group pr-2">
							<CapCutSlider
								label="Scale"
								value={Math.round(resolvedTransform.scale * 100)}
								min={1}
								max={500}
								onChange={(val) => {
									const commitVal = Math.max(val, 1) / 100;
									scale.commitValue({ value: commitVal });
								}}
								onFocus={scale.onFocus}
								onBlur={scale.onBlur}
								isKeyframable
								isKeyframeActive={scale.isKeyframedAtTime}
								isPlayheadWithinRange={isPlayheadWithinElementRange}
								onToggleKeyframe={scale.toggleKeyframe}
							/>
						</div>
					</div>
					<SectionField
						label="Position"
						beforeLabel={
							<KeyframeToggle
								isActive={hasPositionKeyframe}
								isDisabled={!isPlayheadWithinElementRange}
								title="Toggle position keyframe"
								onToggle={togglePositionKeyframe}
							/>
						}
					>
						<div className="flex items-center gap-2">
							<NumberField
								icon="X"
								className="flex-1"
								value={positionX.displayValue}
								onFocus={positionX.onFocus}
								onChange={positionX.onChange}
								onBlur={positionX.onBlur}
								onScrub={positionX.scrubTo}
								onScrubEnd={positionX.commitScrub}
								onReset={() =>
									positionX.commitValue({ value: DEFAULT_TRANSFORM.position.x })
								}
								isDefault={isPropertyAtDefault({
									hasAnimatedKeyframes: positionX.hasAnimatedKeyframes,
									isPlayheadWithinElementRange,
									resolvedValue: resolvedTransform.position.x,
									staticValue: element.transform?.position?.x ?? DEFAULT_TRANSFORM.position.x,
									defaultValue: DEFAULT_TRANSFORM.position.x,
								})}
							/>
							<NumberField
								icon="Y"
								className="flex-1"
								value={positionY.displayValue}
								onFocus={positionY.onFocus}
								onChange={positionY.onChange}
								onBlur={positionY.onBlur}
								onScrub={positionY.scrubTo}
								onScrubEnd={positionY.commitScrub}
								onReset={() =>
									positionY.commitValue({ value: DEFAULT_TRANSFORM.position.y })
								}
								isDefault={isPropertyAtDefault({
									hasAnimatedKeyframes: positionY.hasAnimatedKeyframes,
									isPlayheadWithinElementRange,
									resolvedValue: resolvedTransform.position.y,
									staticValue: element.transform?.position?.y ?? DEFAULT_TRANSFORM.position.y,
									defaultValue: DEFAULT_TRANSFORM.position.y,
								})}
							/>
						</div>
					</SectionField>

					<div className="flex flex-col gap-1 w-full pl-2 pb-2">
						<div className="flex items-center w-full relative group pr-2">
							<CapCutSlider
								label="Rotate"
								value={Math.round(resolvedTransform.rotate)}
								min={-360}
								max={360}
								onChange={(val) => rotation.commitValue({ value: val })}
								onFocus={rotation.onFocus}
								onBlur={rotation.onBlur}
								isKeyframable
								isKeyframeActive={rotation.isKeyframedAtTime}
								isPlayheadWithinRange={isPlayheadWithinElementRange}
								onToggleKeyframe={rotation.toggleKeyframe}
							/>
						</div>
					</div>
				</SectionFields>
			</SectionContent>
		</Section>
	);
}
