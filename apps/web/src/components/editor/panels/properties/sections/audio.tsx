import { NumberField } from "@/components/ui/number-field";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useEditor } from "@/hooks/use-editor";
import type { AudioElement, VideoElement } from "@/types/timeline";
import {
	Section,
	SectionContent,
	SectionField,
	SectionFields,
	SectionHeader,
	SectionTitle,
} from "../section";
import { KeyframeToggle } from "../keyframe-toggle";
import { useKeyframedNumberProperty } from "../hooks/use-keyframed-number-property";
import { getElementLocalTime, resolveVolumeAtTime } from "@/lib/animation";
import { TIME_EPSILON_SECONDS } from "@/constants/animation-constants";

export function AudioSection({
	element,
	trackId,
	showTopBorder = true,
}: {
	element: AudioElement | VideoElement;
	trackId: string;
	showTopBorder?: boolean;
}) {
	const editor = useEditor();
	const playheadTime = editor.playback.getCurrentTime();
	
	const localTime = getElementLocalTime({
		timelineTime: playheadTime,
		elementStartTime: element.startTime,
		elementDuration: element.duration,
	});

	const isPlayheadWithinElementRange =
		playheadTime >= element.startTime - TIME_EPSILON_SECONDS &&
		playheadTime <= element.startTime + element.duration + TIME_EPSILON_SECONDS;

	const resolvedVolume = resolveVolumeAtTime({
		baseVolume: element.volume,
		animations: element.animations,
		localTime,
	});

	const volume = useKeyframedNumberProperty({
		trackId,
		elementId: element.id,
		animations: element.animations,
		propertyPath: "volume",
		localTime,
		isPlayheadWithinElementRange,
		displayValue: Math.round(resolvedVolume * 100).toString(),
		parse: (input) => {
			const parsed = parseFloat(input);
			if (isNaN(parsed)) return null;
			return Math.max(0, parsed) / 100;
		},
		valueAtPlayhead: resolvedVolume,
		buildBaseUpdates: ({ value }) => ({
			volume: value,
		}),
	});

	const handleFadeInChange = (values: number[]) => {
		editor.timeline.previewElements({
			updates: [{
				trackId,
				elementId: element.id,
				updates: { fadeInDuration: values[0] },
			}]
		});
	};

	const handleFadeInCommit = () => {
		editor.timeline.commitPreview();
	};

	const handleFadeOutChange = (values: number[]) => {
		editor.timeline.previewElements({
			updates: [{
				trackId,
				elementId: element.id,
				updates: { fadeOutDuration: values[0] },
			}]
		});
	};

	const handleFadeOutCommit = () => {
		editor.timeline.commitPreview();
	};

	return (
		<Section
			collapsible
			sectionKey={`${element.type}:audio`}
			showTopBorder={showTopBorder}
		>
			<SectionHeader>
				<SectionTitle>Audio</SectionTitle>
			</SectionHeader>
			<SectionContent>
				<SectionFields>
					<SectionField
						label="Volume"
						beforeLabel={
							<KeyframeToggle
								isActive={volume.isKeyframedAtTime}
								isDisabled={!isPlayheadWithinElementRange}
								title="Toggle volume keyframe"
								onToggle={volume.toggleKeyframe}
							/>
						}
					>
						<div className="flex flex-col gap-3">
							<div className="flex items-center gap-2">
								<Slider
									value={[resolvedVolume * 100]}
									onValueChange={(values) => volume.scrubTo(values[0])}
									onValueCommit={() => volume.commitScrub()}
									min={0}
									max={200}
									step={1}
									className="flex-1"
								/>
								<NumberField
									value={volume.displayValue}
									onFocus={volume.onFocus}
									onChange={volume.onChange}
									onBlur={volume.onBlur}
									className="w-16"
								/>
							</div>
						</div>
					</SectionField>

					<SectionField label="Fade In">
						<div className="flex items-center gap-2">
							<Slider
								value={[element.fadeInDuration ?? 0]}
								onValueChange={handleFadeInChange}
								onValueCommit={handleFadeInCommit}
								min={0}
								max={Math.min(5, element.duration)}
								step={0.1}
								className="flex-1"
							/>
							<div className="text-xs text-muted-foreground w-12 text-right">
								{(element.fadeInDuration ?? 0).toFixed(1)}s
							</div>
						</div>
					</SectionField>

					<SectionField label="Fade Out">
						<div className="flex items-center gap-2">
							<Slider
								value={[element.fadeOutDuration ?? 0]}
								onValueChange={handleFadeOutChange}
								onValueCommit={handleFadeOutCommit}
								min={0}
								max={Math.min(5, element.duration)}
								step={0.1}
								className="flex-1"
							/>
							<div className="text-xs text-muted-foreground w-12 text-right">
								{(element.fadeOutDuration ?? 0).toFixed(1)}s
							</div>
						</div>
					</SectionField>

					<SectionField label="Auto Duck">
						<div className="flex items-center justify-end">
							<Switch
								checked={element.autoDucking ?? false}
								onCheckedChange={(checked: boolean) => {
									editor.timeline.updateElements({
										updates: [{
											trackId,
											elementId: element.id,
											updates: { autoDucking: checked },
										}]
									});
								}}
							/>
						</div>
					</SectionField>

					<SectionField label="Noise Reduction">
						<div className="flex items-center justify-end">
							<Switch
								checked={element.noiseReduction ?? false}
								onCheckedChange={(checked: boolean) => {
									editor.timeline.updateElements({
										updates: [{
											trackId,
											elementId: element.id,
											updates: { noiseReduction: checked },
										}]
									});
								}}
							/>
						</div>
					</SectionField>

					<SectionField label="Voice Enhancement">
						<div className="flex items-center justify-end">
							<Switch
								checked={element.voiceEnchancement ?? false}
								onCheckedChange={(checked: boolean) => {
									editor.timeline.updateElements({
										updates: [{
											trackId,
											elementId: element.id,
											updates: { voiceEnchancement: checked },
										}]
									});
								}}
							/>
						</div>
					</SectionField>

					<SectionField label="Voice Effects">
						<div className="flex items-center justify-end">
							<Select
								value={element.voiceChanger ?? "none"}
								onValueChange={(value: string) => {
									editor.timeline.updateElements({
										updates: [{
											trackId,
											elementId: element.id,
											updates: { voiceChanger: value === "none" ? undefined : value },
										}]
									});
								}}
							>
								<SelectTrigger className="w-32 h-7 text-xs">
									<SelectValue placeholder="None" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">None</SelectItem>
									<SelectItem value="deep">Deep</SelectItem>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="robot">Robot</SelectItem>
									<SelectItem value="chipmunk">Chipmunk</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</SectionField>

					<SectionField label="Equalizer">
						<div className="flex items-center justify-end">
							<Select
								value={element.equalizer ?? "none"}
								onValueChange={(value: string) => {
									editor.timeline.updateElements({
										updates: [{
											trackId,
											elementId: element.id,
											updates: { equalizer: value === "none" ? undefined : value },
										}]
									});
								}}
							>
								<SelectTrigger className="w-32 h-7 text-xs">
									<SelectValue placeholder="None" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">None</SelectItem>
									<SelectItem value="pop">Pop</SelectItem>
									<SelectItem value="rock">Rock</SelectItem>
									<SelectItem value="jazz">Jazz</SelectItem>
									<SelectItem value="classical">Classical</SelectItem>
									<SelectItem value="electronic">Electronic</SelectItem>
									<SelectItem value="dance">Dance</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</SectionField>
				</SectionFields>
			</SectionContent>
		</Section>
	);
}
