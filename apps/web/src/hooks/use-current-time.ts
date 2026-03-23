import { useEffect, useState } from "react";
import { useEditor } from "./use-editor";

/**
 * A specialized hook for high-frequency current time updates.
 * Use this ONLY where you need frame-accurate time (playhead, timecode, etc.).
 * Most components should use useEditor() which only updates on state changes.
 */
export function useCurrentTime(): number {
	const editor = useEditor();
	const [time, setTime] = useState(editor.playback.getCurrentTime());

	useEffect(() => {
		const unsubscribe = editor.playback.subscribeTime((newTime) => {
			setTime(newTime);
		});
		return unsubscribe;
	}, [editor]);

	return time;
}
