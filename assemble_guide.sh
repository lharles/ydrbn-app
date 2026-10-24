import os
import json
import subprocess

BUILD_DIR = "./video_build"
OUTPUT_MP4 = "./public/video/guide.mp4"
VOICE = "en-US-AndrewNeural"
RATE = "+12%"

SCENES = [
    {
        "id": "seg_01",
        "text": (
            "Welcome to Y.D.R.B.N. On first launch, the User Functionality Guide "
            "presents a link to this walkthrough video, core feature summaries, "
            "and a Troubleshooting section with a one-tap cache purge. Click Understood to continue."
        ),
    },
    {
        "id": "seg_02",
        "text": (
            "Next, the Data Sheet outlines the offline procedural engine, "
            "custom photo memory notes, aesthetic credits, and a voluntary maintenance link. "
            "Click Understood to enter the main deck."
        ),
    },
    {
        "id": "seg_03",
        "text": (
            "Across the top bar from left to right: open the Archive to search or filter favorites, "
            "jump to Today's record, tap the Heart to favorite, open Share to export sleeve images and text, "
            "or launch the Apparel Terminal to configure 300 D P I shirt graphics and tour rosters."
        ),
    },
    {
        "id": "seg_04",
        "text": (
            "On the main deck, browse records with the carousel arrows, or press Daily Drop to mint a new pressing. "
            "Tap Zoom to inspect artwork up close. Flip the sleeve and tap Spin Audio Clip to drop the needle, "
            "switch between 33, 45, and 16 R P M speeds, or tap any track on the back cover to audition it."
        ),
    },
    {
        "id": "seg_05",
        "text": (
            "Tap the bottom-right Gear icon to open System Settings. Switch between Walnut, Light, Dark, "
            "and Contrast color modes. Open The Cargo Bay to install expansion packs, or launch The Crate Forge "
            "to build custom word lists and transparent cutout stamps."
        ),
    },
    {
        "id": "seg_06",
        "text": (
            "Inside The Director's Chair, toggle default words, subjects, backdrops, or emojis on and off. "
            "Settings also includes the anonymous Dispatch Terminal for suggestions, manifest update checks, "
            "a factory reset option, and Developer Controls."
        ),
    },
    {
        "id": "seg_07",
        "text": (
            "Finally, back on the main deck, open Customize A Drop. Use Custom Photo Cover to process your own "
            "snapshots through the 1970s darkroom, or open Custom Drop to enter your own band name, title, "
            "soundscape, and tracklist."
        ),
    },
]


def get_audio_duration_ms(filepath):
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        filepath,
    ]
    out = subprocess.check_output(cmd).decode("utf-8").strip()
    return int(float(out) * 1000)


def main():
    os.makedirs(BUILD_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(OUTPUT_MP4), exist_ok=True)

    print("🎙️  Step 1/3: Generating brisk per-scene voiceover segments...")
    segments_meta = []
    for idx, scene in enumerate(SCENES):
        mp3_path = os.path.join(BUILD_DIR, f"{scene['id']}.mp3")
        subprocess.run(
            [
                "edge-tts",
                "--voice",
                VOICE,
                f"--rate={RATE}",
                "--text",
                scene["text"],
                "--write-media",
                mp3_path,
            ],
            check=True,
        )
        dur_ms = get_audio_duration_ms(mp3_path)
        segments_meta.append({"index": idx, "id": scene["id"], "file": mp3_path, "durationMs": dur_ms})
        print(f"   ✓ {scene['id']}.mp3 ({dur_ms / 1000:.1f}s)")

    with open(os.path.join(BUILD_DIR, "segments.json"), "w", encoding="utf-8") as f:
        json.dump(segments_meta, f, indent=2)

    print("\n🎬 Step 2/3: Recording live browser choreography locked to voiceover timing...")
    subprocess.run(["node", "record_guide.mjs"], check=True)

    print("\n🎞️  Step 3/3: Mixing timestamp-locked voiceover into final H.264 MP4...")
    with open(os.path.join(BUILD_DIR, "timeline.json"), "r", encoding="utf-8") as f:
        timeline = json.load(f)

    raw_webm = os.path.join(BUILD_DIR, "raw_walkthrough.webm")
    ffmpeg_cmd = ["ffmpeg", "-y", "-i", raw_webm]

    for seg in segments_meta:
        ffmpeg_cmd.extend(["-i", seg["file"]])

    # Build exact millisecond adelay filter for each scene's audio clip
    filter_parts = []
    mix_inputs = []
    for i, seg in enumerate(segments_meta):
        start_ms = timeline[i]["startMs"] if i < len(timeline) else 0
        input_idx = i + 1
        filter_parts.append(f"[{input_idx}:a]adelay={start_ms}|{start_ms}[a{i}]")
        mix_inputs.append(f"[a{i}]")

    amix_str = (
        f"{';'.join(filter_parts)};"
        f"{''.join(mix_inputs)}amix=inputs={len(segments_meta)}:dropout_transition=0:normalize=0[aout]"
    )

    ffmpeg_cmd.extend(
        [
            "-filter_complex",
            amix_str,
            "-map",
            "0:v:0",
            "-map",
            "[aout]",
            "-c:v",
            "libx264",
            "-preset",
            "slow",
            "-crf",
            "23",
            "-pix_fmt",
            "yuv420p",
            "-r",
            "30",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-movflags",
            "+faststart",
            OUTPUT_MP4,
        ]
    )

    subprocess.run(ffmpeg_cmd, check=True)
    size_mb = os.path.getsize(OUTPUT_MP4) / (1024 * 1024)
    print(f"\n✅ Done! Synced walkthrough saved to {OUTPUT_MP4} ({size_mb:.2f} MB)")


if __name__ == "__main__":
    main()