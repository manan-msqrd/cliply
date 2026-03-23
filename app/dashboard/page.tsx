import { ArrowLeft, Loader2 } from "lucide-react";
import { listVideos } from "../action";
import Link from "next/link";
import VideoThumbnail from "../components/VideoThumbnail";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const videos = await listVideos();
    return (
        <main className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-200">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">My Recordings</h1>
                    <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-white transition duration-200">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Recorder
                    </Link>
                </div>
                {videos.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <p className="text-lg mb-4">No videos recorded yet.</p>
                        <Link href="/" className="text-blue-400 hover:text-white transition duration-200">
                            Record Your First Video
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map((video) => (
                            <div key={video.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-colors">
                                <Link href={`/video/${video.playback_ids?.[0]?.id}`} className="block relative aspect-video bg-black">
                                    {video.status === "ready" && video.playback_ids?.[0] ? (
                                        <VideoThumbnail playbackId={video.playback_ids[0].id} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <p className="text-slate-500 text-sm mt-1">{new Date(video.created_at).toLocaleDateString()}</p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}