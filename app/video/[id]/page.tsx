import { getAssetStatus } from "@/app/action";
import MuxPlayerWrapper from "@/app/components/MuxPlayerWrapper";
import ShareButton from "@/app/components/ShareButton";
import VideoStatusPoller from "@/app/components/VideoStatusPoller";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: playbackId } = await params;
    const { status, transScripts, transcriptionStatus } = await getAssetStatus(playbackId);

    const isVideoready = status === "ready";
    const isTranscriptionReady = transcriptionStatus === "ready";

    const downloadUrl = `https://stream.mux.com/${playbackId}/high.mp4?download=screen-recording.mp4`;
    return (
        <main className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-200">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Navigation */}
                <div className="lg:col-span-3 mb-2">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition duration-200">
                        <ArrowLeft className="w-4 h-4 inline mr-2" />
                        Record New Video
                    </Link>
                </div>

                {/* Left Column: Video Player */}
                <div className="lg:col-span-2">
                    <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 aspect-video relative">
                        {isVideoready ? (
                            <>
                                <MuxPlayerWrapper playbackId={playbackId} />
                                {!isTranscriptionReady && <VideoStatusPoller id={playbackId} isVideoready={true} />}
                            </>
                        ) : (
                            <VideoStatusPoller id={playbackId} isVideoready={false} />
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h1 className="text-xl font-bold text-white">Screen Recording</h1>
                    <div className="flex gap-3">
                        <ShareButton />

                        {isVideoready && (
                            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors">
                                <Download className="w-4 h-4" />
                                Download
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Transcripts Section */}
            {isTranscriptionReady ? (transScripts.length > 0 ? (
                <div className="max-w-6xl mx-auto mt-8">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <h2 className="text-xl font-bold text-white mb-4">AI Transcripts</h2>
                        <div className="space-y-4">
                            {transScripts.map((script, index) => (
                                <div key={index} className="flex gap-3">
                                    <span className="text-slate-500 font-mono text-sm">{script.time}</span>
                                    <p className="text-slate-300">{script.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-center text-slate-500 mt-8">No Speech Detected</p>
            )) : (
                <p className="text-center text-slate-500 mt-8">Transcripts are being generated...</p>
            )}
        </main>
    );
}