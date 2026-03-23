import { Slider } from "@/components/ui/slider";
import { NumberField } from "@/components/ui/number-field";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/ui";
import { KeyframeToggle } from "@/components/editor/panels/properties/keyframe-toggle";

interface CapCutSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (val: number) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    isKeyframable?: boolean;
    isKeyframeActive?: boolean;
    isPlayheadWithinRange?: boolean;
    onToggleKeyframe?: () => void;
    className?: string;
}

export function CapCutSlider({
    label,
    value,
    min,
    max,
    step = 1,
    onChange,
    onFocus,
    onBlur,
    isKeyframable,
    isKeyframeActive,
    isPlayheadWithinRange,
    onToggleKeyframe,
    className
}: CapCutSliderProps) {
    return (
        <div className={cn("group flex h-7 w-full items-center gap-2", className)}>
            {/* Minimalist Label designed to align seamlessly on the left */}
            <Label 
                className="w-[52px] shrink-0 text-[11px] font-medium text-muted-foreground truncate"
                title={label}
            >
                {label}
            </Label>
            
            {/* Immersive core Slider taking up remaining flex space */}
            <div className="flex-1 px-1">
                <Slider
                    min={min}
                    max={max}
                    step={step}
                    value={[value]}
                    onValueChange={(val) => {
                        if (val[0] !== undefined) onChange(val[0]);
                    }}
                    onPointerDown={onFocus}
                    onPointerUp={onBlur}
                    className="w-full"
                />
            </div>
            
            {/* Tiny precise numerical input replicating desktop behavior */}
            <div className="w-[42px] shrink-0">
                <NumberField
                    value={value}
                    onChange={(e) => {
                        const parsed = parseFloat(e.target.value);
                        if (!Number.isNaN(parsed)) onChange(parsed);
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    className="h-6 w-full px-1 text-center text-[10px] bg-secondary/30 border-transparent hover:bg-secondary focus:bg-background transition-colors"
                />
            </div>

            {/* Optional Keyframe diamond toggle - only visible exactly when needed or hovered like CapCut */}
            {isKeyframable && (
                <div className={cn("w-4 shrink-0 flex items-center justify-center transition-opacity", 
                    isKeyframeActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                    <KeyframeToggle
                        isActive={isKeyframeActive ?? false}
                        isDisabled={!isPlayheadWithinRange}
                        title={`Toggle ${label.toLowerCase()} keyframe`}
                        onToggle={onToggleKeyframe ?? (() => {})}
                    />
                </div>
            )}
        </div>
    );
}
