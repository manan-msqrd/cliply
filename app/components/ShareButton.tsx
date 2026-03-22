'use client';

import { Check, Share2 } from "lucide-react";

import { useState } from "react";

export default function ShareButton() {
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (
        <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? "Copied Link!" : "Share Video"}
        </button>
    );
}