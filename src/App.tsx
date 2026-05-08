/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Zap, 
  BookOpen, 
  Target, 
  MessageCircle, 
  ChevronDown,
  ArrowRight,
  Play,
  Volume2,
  Loader2,
  Download,
  FileText,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { generateSpeech, pcmBase64ToWav } from './services/geminiService';
import { QRCodeSVG } from 'qrcode.react';

const DEFAULT_SCRIPT = ``;

const ensureAbsoluteUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

export default function App() {
  const [script, setScript] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAudioBlob, setLastAudioBlob] = useState<Blob | null>(null);

  const finalUrl = ensureAbsoluteUrl(telegramLink);

  const handleGenerateAndPlay = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const audioBase64 = await generateSpeech(script || "Namaste, script likhiye.");
      if (audioBase64) {
        const wavBlob = pcmBase64ToWav(audioBase64);
        setLastAudioBlob(wavBlob);
        
        const audioUrl = URL.createObjectURL(wavBlob);
        const audio = new Audio(audioUrl);
        
        setIsPlaying(true);
        setIsLoading(false);
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error("Failed to generate audio:", error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const handleDownload = () => {
    if (!lastAudioBlob) return;
    const url = URL.createObjectURL(lastAudioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "VARUN_TTS_Voice.wav";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-orange-500 selection:text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl z-10"
      >
        {/* Branding */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-block px-4 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-black uppercase tracking-[0.3em] mb-4"
          >
            Premium AI Voice
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
            VARUN <span className="text-orange-500">HINDI</span> <br /> TTS
          </h1>
        </div>

        {/* Main Studio Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/20">
          <textarea 
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Apna Hindi script yahan likhein (Emotional & Natural)..."
            className="w-full h-48 bg-transparent border-none focus:ring-0 text-xl md:text-2xl font-medium leading-relaxed resize-none placeholder:opacity-20 text-white/90"
          />

          <div className="mt-8 space-y-4">
             <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase opacity-40 tracking-widest leading-none">Add Telegram Link (Optional)</span>
                {telegramLink && (
                  <a href={finalUrl} target="_blank" rel="noreferrer" className="text-[10px] text-orange-400 hover:underline">Test Link</a>
                )}
             </div>
             <input 
                type="text"
                value={telegramLink}
                onChange={(e) => setTelegramLink(e.target.value)}
                placeholder="t.me/your_username"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-mono focus:border-orange-500 focus:bg-white/10 outline-none transition-all"
             />
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-10">
            <button
              onClick={handleGenerateAndPlay}
              disabled={isLoading}
              className={`flex-[3] flex items-center justify-center gap-4 py-6 rounded-3xl font-black uppercase text-xl transition-all ${
                isPlaying 
                  ? 'bg-green-500 text-white shadow-[0_0_40px_rgba(34,197,94,0.3)]' 
                  : 'bg-white text-black hover:bg-orange-500 hover:text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95`}
            >
              {isLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : isPlaying ? (
                <Volume2 className="w-8 h-8 animate-pulse" />
              ) : (
                <Play className="w-8 h-8 fill-current" />
              )}
              {isLoading ? 'Processing...' : isPlaying ? 'Playing...' : 'Suno Voice'}
            </button>

            {lastAudioBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 py-6 rounded-3xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all group active:scale-95"
                title="Download Voice"
              >
                <Download className="w-8 h-8 group-hover:translate-y-1 transition-transform text-white/70" />
              </button>
            )}
          </div>
          
          {telegramLink && (
             <div className="mt-8 flex justify-center">
                <div className="bg-white p-2 rounded-2xl">
                   <QRCodeSVG value={finalUrl} size={100} />
                </div>
             </div>
          )}
        </div>

        {/* Big Developer Credit */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 flex flex-col items-center gap-4"
        >
          <div className="text-xl md:text-3xl font-bold flex items-center gap-3">
            <span className="opacity-40 font-medium">Made with</span> 
            <span className="text-red-500 animate-bounce scale-150">❤️</span> 
            <span className="opacity-40 font-medium">by</span> 
            <span className="text-white bg-orange-600 px-4 py-1 rounded-xl transform -rotate-2">VARUN</span>
          </div>
          <div className="opacity-20 text-[10px] font-black uppercase tracking-[1em] mt-4">
            Selection Lekar Rahenge
          </div>
        </motion.footer>
      </motion.div>
    </div>
  );
}
