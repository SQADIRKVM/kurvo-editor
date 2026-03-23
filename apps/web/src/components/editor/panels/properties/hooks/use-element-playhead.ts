import { useEditor } from "@/hooks/use-editor";
import { useCurrentTime } from "@/hooks/use-current-time";
import { getElementLocalTime } from "@/lib/animation";
import { TIME_EPSILON_SECONDS } from "@/constants/animation-constants";

export function useElementPlayhead({
	startTime,
	duration,
}: {
	startTime: number;
	duration: number;
}) {
	const editor = useEditor();
	const playheadTime = useCurrentTime();
	const localTime = getElementLocalTime({
		timelineTime: playheadTime,
		elementStartTime: startTime,
		elementDuration: duration,
	});
	const isPlayheadWithinElementRange =
		playheadTime >= startTime - TIME_EPSILON_SECONDS &&
		playheadTime <= startTime + duration + TIME_EPSILON_SECONDS;

	return { localTime, isPlayheadWithinElementRange };
}
