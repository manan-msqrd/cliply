"use client";

import Image from "next/image";
import { useState } from "react"

export default function VideoThumbnail({ playbackId }: { playbackId: string }) {
    const [isHovered, setIsHovered] = useState(false);
    const [hasError, setHasError] = useState(false);

    const posterUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0`;
    const gifUrl = `https://image.mux.com/${playbackId}/animated.gif?start=0&end=4&width=320`;

    if (hasError) {
        <div className="w-full h-full flex items-center justify-center bg-slate-800">
            No Preview
        </div>
    }

    return (
        <div className="w-full h-full relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <Image src={isHovered ? gifUrl : posterUrl} alt="Video Thumbnail" fill unoptimized className="w-full h-full object-cover" onError={() => setHasError(true)} width={320} height={180} />
        </div>
    )
}