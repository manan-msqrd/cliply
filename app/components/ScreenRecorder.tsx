"use client"

import { useRouter } from "next/router";
import { useRef, useState } from "react"
import { createUploadUrl, getAssetsIdFromUpload } from "../action";

export default function ScreenRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    const liveVideoRef = useRef<HTMLVideoElement | null>(null);
    const liveAudioRef = useRef<HTMLAudioElement | null>(null);

    const router = useRouter();

    const startRecording = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false
            });

            const micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                },
                video: false
            });

            screenStreamRef.current = screenStream;
            micStreamRef.current = micStream;

            const combinedStream = new MediaStream([
                ...screenStream.getVideoTracks(),
                ...micStream.getAudioTracks()
            ]);

            if (liveVideoRef.current) {
                liveVideoRef.current.srcObject = combinedStream;
            }

            const mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: "video/webm;codecs=vp9"
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            //Collect chunks as they are recorded
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) chunksRef.current.push(event.data);
            }

            //handle recording completion
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "video/webm" });
                setMediaBlob(blob);

                if (liveVideoRef.current) {
                    liveVideoRef.current.srcObject = null;
                }

                // Stop all tracks : critical
                screenStreamRef.current?.getTracks().forEach((track) => track.stop());
                micStreamRef.current?.getTracks().forEach((track) => track.stop());
            }

            //Start recording
            mediaRecorder.start();
            setIsRecording(true)

            //handle native stop sharing button
            screenStream.getVideoTracks()[0].onended = stopRecording;

        } catch (error) {
            console.log("Error starting recording", error);
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }

    const handleUpload = async () => {
        if (!mediaBlob) return;

        setIsUploading(true);

        try {
            // 1. Get Signed upload url from server
            const uploadConfig = await createUploadUrl();

            // 2. Upload directly to mux
            await fetch(uploadConfig.url, {
                method: 'PUT',
                body: mediaBlob,
            })

            // 3. poll until processing completes
            while (true) {
                const result = await getAssetsIdFromUpload(uploadConfig.id);
                if (result.playbackId) {
                    router.push(`/video/${result.playbackId}`);
                    return;
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.log("Error uploading video", error);
            setIsUploading(false);
        }
    }

    return (
        <div>
            <h1>Screen Recorder</h1>
        </div>
    )
}