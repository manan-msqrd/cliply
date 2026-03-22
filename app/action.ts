"use server"

import Mux from '@mux/mux-node';
import { stat } from 'fs';

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_SECRET_KEY,

})

export async function createUploadUrl() {
    const upload = await mux.video.uploads.create({
        new_asset_settings: {
            playback_policies: ["public"],
            video_quality: "plus",
            mp4_support: "standard",
            inputs: [
                {
                    generated_subtitles: [{
                        language_code: "en",
                        name: "English (Auto)"
                    }]
                }
            ]
        },
        cors_origin: "*"
    });

    return upload;
}

export async function getAssetsIdFromUpload(uploadId: string) {
    const upload = await mux.video.uploads.retrieve(uploadId);
    if (upload.asset_id) {
        const asset = await mux.video.assets.retrieve(upload.asset_id);
        return {
            playbackId: asset.playback_ids?.[0].id,
            status: asset.status,
        }
    }

    return { status: "waiting" }
}

export async function listVideos() {
    try {
        const assets = await mux.video.assets.list({
            limit: 25
        });
        return assets.data;
    } catch (error) {
        console.log(error);
        return [];
    }
}

function formatVttTime(timestamp: string) {
    return timestamp.split(".")[0];
}

export async function getAssetStatus(playbackId: string) {
    try {
        const assets = await mux.video.assets.list({
            limit: 25
        });

        const asset = assets.data.find((a) => a.playback_ids?.some(p => p.id === playbackId));

        if (!asset) return { status: "not-found", transScripts: [] };

        let transScripts: { time: string, text: string }[] = [];
        let transcriptionStatus = 'preparing';

        if (asset.status === "ready" && asset.tracks) {
            const track = asset.tracks.find((t) => t.type === "text" && t.text_type === "subtitles");

            if (track && track.status === "ready") {
                transcriptionStatus = "ready";

                const vttUrl = `https://stream.mux.com/${playbackId}/text/${track.id}.vtt`;
                const res = await fetch(vttUrl);
                const text = await res.text();

                const blocks = text.split("\n\n");

                transScripts = blocks.reduce((acc: { time: string, text: string }[], block) => {
                    const lines = block.split("\n");
                    if (lines.length >= 2 && lines[1].includes("-->")) {
                        const time = formatVttTime(lines[1].split(" --> ")[0]);
                        const text = lines.slice(2).join(" ");
                        if (text.trim()) acc.push({ time, text });
                    }
                    return acc;
                }, []);
            }

            return {
                status: asset.status,
                transScripts,
                transcriptionStatus,
            }
        }

        return {
            status: asset?.status || "preparing",
            transScripts: [],
            transcriptionStatus: "preparing"
        }
    } catch (error) {
        return { status: "error", transScripts: [], transcriptionStatus: "error" }
    }
}
