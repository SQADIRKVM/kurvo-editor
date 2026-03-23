import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, projectId, history } = await req.json();
    
    // Simple Mock AI Logic
    let reply = "I've analyzed your request.";
    const actions = [];
    
    const msg = message.toLowerCase();
    
    if (msg.includes("split") || msg.includes("cut")) {
      reply = "Sure, I'll split the clip for you at the current playhead position.";
      actions.push({
        type: "split",
        description: "Split clip at playhead",
        params: { time: "current" }
      });
    } else if (msg.includes("delete") || msg.includes("remove")) {
      reply = "Deleting the selected clip now.";
      actions.push({
        type: "delete",
        description: "Delete selected clip",
        params: { target: "selected" }
      });
    } else if (msg.includes("caption") || msg.includes("subtitle")) {
      reply = "Generating auto-captions for your sequence. This might take a few seconds.";
      actions.push({
        type: "add_caption",
        description: "Auto-generate captions",
        params: { style: "viral" }
      });
    } else if (msg.includes("zoom")) {
      reply = "Adding a dynamic zoom effect to the active clip.";
      actions.push({
        type: "zoom",
        description: "Add dynamic zoom",
        params: { amount: 1.2 }
      });
    } else if (msg.includes("mute")) {
      reply = "Muting the audio for this clip.";
      actions.push({
        type: "mute",
        description: "Mute active clip",
        params: { mute: true }
      });
    } else {
      reply = "I understand. I'm ready to help you with your video edits. You can ask me to split clips, delete them, add captions, or apply effects.";
      actions.push({
        type: "info",
        description: "AI is ready",
      });
    }

    return NextResponse.json({
      reply,
      actions
    });
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
