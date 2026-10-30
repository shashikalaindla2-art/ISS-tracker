'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Film,
  Volume2,
  VolumeX,
  Volume1,
  Headphones,
  Sliders,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { soundEffects } from '@/lib/audio';
import { getAssetPath } from '@/lib/basePath';

export default function VideoBackground({
  overlayTheme = 'cinema',
  onChangeTheme
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Audio State Management
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.75);
  const [showAudioBanner, setShowAudioBanner] = useState(true);

  // Initialize playback on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.volume = volume;

    const startPlayback = async () => {
      try {
        await video.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Video autoplay deferred until user interaction:', err);
        setIsPlaying(false);
        const unlock = () => {
          if (video && video.paused) {
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        };
        window.addEventListener('click', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
      }
    };

    startPlayback();
  }, [volume]);

  // Toggle Video Play/Pause
  const togglePlay = () => {
    soundEffects.playClick();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Toggle Mute / Unmute
  const toggleAudio = useCallback((forcedMute = null) => {
    const video = videoRef.current;
    if (!video) return;

    soundEffects.playClick();
    const nextMuted = forcedMute !== null ? forcedMute : !isMuted;

    video.muted = nextMuted;
    setIsMuted(nextMuted);

    if (!nextMuted) {
      video.volume = volume > 0 ? volume : 0.75;
      if (volume === 0) setVolume(0.75);
      if (video.paused) {
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      setShowAudioBanner(false);
    }
  }, [isMuted, volume]);

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const overlayClasses = {
    cinema: 'bg-slate-950/45 backdrop-blur-[1px]',
    vivid: 'bg-slate-950/25 backdrop-blur-none',
    focus: 'bg-slate-950/65 backdrop-blur-[2px]'
  };

  return (
    <>
      {/* Background Video Element with Audio Support */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none select-none">
        <video
          ref={videoRef}
          src={getAssetPath('/gemini_generated_video_0a46d2c2.mp4')}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          disablePictureInPicture
          onLoadedData={() => setIsVideoLoaded(true)}
          onCanPlay={() => {
            setIsVideoLoaded(true);
            if (videoRef.current && videoRef.current.paused) {
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          }}
          onPlaying={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-cover transform scale-105 transition-opacity duration-1000"
          style={{ opacity: isVideoLoaded ? 1 : 0.85 }}
        />
      </div>

      {/* Glassy Translucent Overlay to ensure contrast while showing video */}
      <div
        className={`fixed inset-0 w-full h-full z-0 transition-all duration-500 pointer-events-none ${
          overlayClasses[overlayTheme] || overlayClasses.cinema
        }`}
      />

      {/* Subtle Aerospace Shiny Blue Scanline Grid Effect */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-25 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.18),rgba(255,255,255,0))]" />

      {/* Floating Prompt Banner: Unmute Cosmic Video Soundtrack */}
      {isMuted && showAudioBanner && isVideoLoaded && (
        <div className="fixed bottom-20 left-4 sm:left-6 z-40 pointer-events-auto animate-bounce-gentle max-w-sm">
          <div className="glass-panel-blue p-3.5 rounded-2xl text-white font-mono text-xs flex items-center justify-between gap-3 shadow-[0_0_30px_rgba(56,189,248,0.3)] border border-cyan-400/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0">
                <Headphones className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-cyan-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5 font-display">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Cosmic Atmosphere Audio
                </p>
                <p className="text-[10px] text-slate-300">
                  Video soundscape is muted by default
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                id="btn-quick-unmute-banner"
                onClick={() => toggleAudio(false)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(56,189,248,0.5)] cursor-pointer active:scale-95"
              >
                Unmute
              </button>
              <button
                type="button"
                onClick={() => setShowAudioBanner(false)}
                className="p-1 hover:text-cyan-300 text-slate-400 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Shiny Blue Aerospace Media Controller (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-40 pointer-events-auto font-mono">
        <div className="relative">
          {showControls && (
            <div className="absolute bottom-12 right-0 mb-2 p-4 rounded-2xl glass-panel-blue text-xs space-y-3.5 min-w-[270px] text-white border border-cyan-400/40 shadow-[0_0_35px_rgba(56,189,248,0.25)]">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 font-bold">
                <span className="flex items-center gap-1.5 text-cyan-300 font-display">
                  <Film className="w-4 h-4 text-cyan-400" />
                  <span className="uppercase tracking-wider text-[11px]">Cosmic Media Engine</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  MP4 + Audio
                </span>
              </div>

              {/* Audio Controls Section */}
              <div className="space-y-2 p-2.5 rounded-xl bg-slate-950/60 border border-white/8">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>Soundtrack:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleAudio()}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      isMuted
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                    }`}
                  >
                    {isMuted ? 'Muted' : 'Unmuted'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-7 font-mono">{Math.round(volume * 100)}%</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Video Playback Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-300 text-[11px]">Video Motion:</span>
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all text-[11px] cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Pause Motion</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Play Motion</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tint Style Preset */}
              {onChangeTheme && (
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Glass Transparency:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['cinema', 'vivid', 'focus'].map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => {
                          soundEffects.playClick();
                          onChangeTheme(theme);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-medium uppercase transition-all cursor-pointer ${
                          overlayTheme === theme
                            ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 font-bold'
                            : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Floating Toggle Buttons (Glassy Shiny Blue) */}
          <div className="flex items-center gap-2">
            {/* 1-Click Audio Toggle */}
            <button
              type="button"
              id="btn-quick-audio-toggle"
              onClick={() => toggleAudio()}
              title={isMuted ? 'Cosmic Audio is Muted — Click to Play Audio' : 'Cosmic Audio Playing — Click to Mute'}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl glass-panel font-bold text-xs transition-all active:scale-95 cursor-pointer ${
                !isMuted
                  ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-200 shadow-[0_0_18px_rgba(56,189,248,0.35)]'
                  : 'text-slate-300 hover:text-white hover:border-cyan-400/40'
              }`}
            >
              {!isMuted ? (
                <>
                  <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="uppercase tracking-wider text-[11px]">Audio On</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <span className="uppercase tracking-wider text-[11px] text-slate-400">Muted</span>
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                </>
              )}
            </button>

            {/* Video Controls Toggle */}
            <button
              type="button"
              id="btn-video-controls"
              onClick={() => {
                soundEffects.playClick();
                setShowControls(!showControls);
              }}
              title="Cosmic Video Atmosphere Settings"
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl glass-panel text-white font-bold text-xs transition-all hover:border-cyan-400/50 active:scale-95 cursor-pointer"
            >
              <Film className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline uppercase tracking-wider text-[11px]">Ambience</span>
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-cyan-400 shadow-[0_0_6px_#38bdf8]' : 'bg-slate-600'}`} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
