'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getAssetStatus } from "../action";
import { Loader2 } from "lucide-react";

export default function VideoStatusPoller({ id, isVideoready }: { id: string, isVideoready: boolean }) {
    const router = useRouter();

    useEffect(() => {
        const checkStatus = async () => {
            const { status, transcriptionStatus } = await getAssetStatus(id);

            if (status === "ready" && !isVideoready) {
                router.refresh();
            }

            if (isVideoready && transcriptionStatus === "ready") {
                router.refresh();
            }
        }

        const interval = setInterval(checkStatus, 2000);

        return () => clearInterval(interval);
    }, [id, isVideoready, router]);
    return (
        <div className="w-full h-full flex flex-col items-center justify-centertext-slate-400 bg-slate-900">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            <p className="mt-2 text-sm">Processing video...</p>
        </div>
    );
}

