"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Loader2, AlertCircle, ExternalLink, RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiClassroomProps {
  roomName: string;
  domain?: string;
  displayName?: string;
  email?: string;
  subject?: string;
  onLeave?: () => void;
  className?: string;
}

export function JitsiClassroom({
  roomName,
  domain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || "meet.jit.si",
  displayName = "Levchary Student",
  email,
  subject = "Levchary Live Class Session",
  onLeave,
  className = "",
}: JitsiClassroomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Jitsi Conference when script is ready
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.JitsiMeetExternalAPI) {
      return;
    }

    try {
      setLoadingRoom(true);
      setHasError(false);

      // Clean up previous instance if any
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }

      const options = {
        roomName,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        userInfo: {
          displayName,
          email,
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          enableWelcomePage: false,
          enableClosePage: false,
          subject,
          toolbarButtons: [
            "microphone",
            "camera",
            "desktop",
            "chat",
            "raisehand",
            "tileview",
            "settings",
            "fullscreen",
            "fodeviceselection",
            "hangup",
            "videoquality",
            "stats",
          ],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: "",
          DEFAULT_REMOTE_DISPLAY_NAME: "Class Participant",
          TOOLBAR_ALWAYS_VISIBLE: false,
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);
      jitsiApiRef.current = api;

      api.addEventListener("videoConferenceJoined", () => {
        setLoadingRoom(false);
      });

      api.addEventListener("videoConferenceLeft", () => {
        if (onLeave) {
          onLeave();
        }
      });

      api.addEventListener("readyToClose", () => {
        if (onLeave) {
          onLeave();
        }
      });
    } catch (err) {
      console.error("Failed to initialize Jitsi Meet Classroom:", err);
      setHasError(true);
      setLoadingRoom(false);
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [scriptLoaded, roomName, domain, displayName, email, subject, onLeave]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen error:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const directUrl = `https://${domain}/${roomName}`;

  return (
    <div className={`relative flex flex-col w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl ${className}`}>
      {/* Jitsi External API Script */}
      <Script
        src={`https://${domain}/external_api.js`}
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
        onError={() => {
          setHasError(true);
          setLoadingRoom(false);
        }}
      />

      {/* Loading Overlay */}
      {loadingRoom && !hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-navy-950/90 backdrop-blur-sm text-white space-y-4">
          <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
          <div className="text-center">
            <h4 className="font-bold text-base text-white">Connecting to Virtual Classroom</h4>
            <p className="text-xs text-slate-400 mt-1">
              Securing room audio, camera, and whiteboard connection...
            </p>
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-navy-950 p-6 text-white text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Classroom Connection Notice</h3>
            <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
              We couldn&apos;t load the in-app conference player directly. You can launch the classroom in a dedicated window with one click.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="default"
              className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
              asChild
            >
              <a href={directUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Launch Standalone Classroom
              </a>
            </Button>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-2"
              onClick={() => {
                setHasError(false);
                setLoadingRoom(true);
                setScriptLoaded(false);
                setTimeout(() => setScriptLoaded(true), 300);
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Connection
            </Button>
          </div>
        </div>
      )}

      {/* Meeting Container */}
      <div ref={containerRef} className="w-full h-full min-h-[560px] flex-1 relative bg-black" />

      {/* Classroom Quick Controls Bar */}
      <div className="h-10 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium text-slate-300">
            Encrypted Jitsi Classroom Session
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullscreen}
            className="hover:text-white transition-colors flex items-center gap-1 text-[11px]"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-teal-400 transition-colors flex items-center gap-1 text-[11px]"
            title="Open classroom in a separate window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Tab</span>
          </a>
        </div>
      </div>
    </div>
  );
}
