import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, X, Volume2, VolumeX } from 'lucide-react';
import clsx from 'clsx';
import { DataContext } from '../context/DataContext';

// --- SYSTEM PROMPT / PERSONA DEFINITION ---
const SYSTEM_PROMPT = `
Act as a Creative Writer and Prompt Engineer. We need to define the "System Prompt" for our chatbot, Captain Nova.

**Your Goal:**
Create a system instruction block that forces the AI to adopt the persona of a **Retired Veteran Astronaut**.

**The Persona Profile:**
* **Name:** Captain Nova.
* **Backstory:** A mission commander who spent 20 years on the ISS and Lunar Gateway. You have "seen the void" and respect it.
* **Tone:** Warm, authoritative, fatherly/motherly, and slightly gritty. You are helpful but disciplined.
* **Language Style:**
    * Use space slang naturally: "Copy that," "Roger," "Telemetry," "All systems nominal," "Cadet."
    * Avoid dry textbook answers. Use "Field Experience" analogies.
    * *Example:* Instead of saying "Gravity is 9.8m/s²," say "Gravity? Yeah, she’s a heavy anchor down here. Up top, you float like a feather, but down here, she keeps your boots on the dirt."

**The Interaction Rules:**
1.  **Greeting:** Always address the user as "Cadet" or "Rookie."
2.  **Brevity is Key:** Keep responses SHORT (under 2-3 sentences). This is a voice comms channel; bandwidth is expensive. Do not monologue.
3.  **The Answer:** Explain complex physics (Black Holes, Orbits) using simple, mechanical analogies.
4.  **The Sign-Off:** Always end with a short mission-style closing: "Nova Out."
5.  **Safety Protocol:** If the user asks about non-space topics, deflect: "Negative, Cadet. Stick to the mission."
`;

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

// --- SITE KNOWLEDGE BASE (Navigation & Context) ---
const SITE_KNOWLEDGE = {
    'home': { path: '/', desc: "The Main Bridge. Status overview, daily APOD, and mission quick-links." },
    'dashboard': { path: '/', desc: "That's where we are, Cadet. The central hub for all operations." },
    'star gazer': { path: '/star-gazer', desc: "The Observatory. Track celestial events and view the Holographic Globe." },
    'globe': { path: '/star-gazer', desc: "The Holographic Earth projection. Real-time data visualization." },
    'weather': { path: '/cosmic-weather', desc: "Solar Weather station. Monitor solar flares and geomagnetic storms." },
    'launches': { path: '/mission-control', desc: "Mission Control. Manifest of all upcoming rocket launches worldwide." },
    'mission control': { path: '/mission-control', desc: "The Launch Command center. Tracking global liftoffs." },
    'satellite': { path: '/satellite-savior', desc: "Orbital Defense Grid. (Currently restricted/placeholder)." },
    'academy': { path: '/academy', desc: "The Training Simulator. Where rookies become astronauts." },
};

export const ChatbotModule: React.FC = () => {
    const navigate = useNavigate(); // Hook into Site Navigation
    const [isOpen, setIsOpen] = useState(false);
    
    // Voice Config
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);

    // Persist Voice Preference
    useEffect(() => {
        const saved = localStorage.getItem('nova_voice_enabled');
        if (saved) setIsVoiceEnabled(saved === 'true');
    }, []);

    useEffect(() => {
        localStorage.setItem('nova_voice_enabled', String(isVoiceEnabled));
    }, [isVoiceEnabled]);

    // Log persona init (silences unused variable warning)
    useEffect(() => { console.log("Initializing Persona:", SYSTEM_PROMPT.substring(0, 50) + "..."); }, []);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Captain Nova online. Systems nominal. What's the mission today, Cadet?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isWriting, setIsWriting] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages, isOpen]);

    // --- VOICE SYNTHESIS (Groq + Fallback) ---
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    
    // Load Browser Voices for Fallback
    useEffect(() => {
        const loadVoices = () => {
            const vs = window.speechSynthesis.getVoices();
            setVoices(vs);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const speak = async (text: string) => {
        if (!isVoiceEnabled) return;
        window.speechSynthesis.cancel();
        setIsPlaying(true);
        setAudioError(null);

        try {
            // 1. Attempt Groq API (High Quality)
            const res = await fetch('/api/groq/audio/speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "canopylabs/orpheus-v1-english",
                    input: text,
                    voice: "diana", // Supported voices: autumn, diana, hannah, austin, daniel, troy
                    response_format: "wav"
                })
            });

            if (!res.ok) throw new Error(`Groq TTS Failed: ${res.status}`);

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            
            audio.onended = () => setIsPlaying(false);
            audio.onerror = () => {
                console.error("Audio playback error");
                setIsPlaying(false); 
            };
            
            await audio.play();

        } catch (err) {
            console.warn("Falling back to Browser TTS:", err);
            
            // 2. Fallback to Browser Native
            const utterance = new SpeechSynthesisUtterance(text);
            const preferred = voices.find(v => v.name.includes('Zira') || v.name.includes('Google US English') || v.name.includes('Samantha'));
            if (preferred) utterance.voice = preferred;
            utterance.pitch = 1.0;
            utterance.rate = 1.0;
            
            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = (e) => {
                console.error("Browser TTS Error:", e);
                setAudioError("Voice Module Glitch.");
                setIsPlaying(false);
            };

            window.speechSynthesis.speak(utterance);
        }
    };

    // --- REAL AI ENGINE (Groq / Llama3) ---
    const { launches, events } = useContext(DataContext); // Access Data

    const generateResponse = async (userText: string) => {
        setIsWriting(true);
        
        // Prepare Context (History + System)
        const history = messages.slice(-10).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
        }));

        // Dynamically Generate Manifests
        const now = new Date();
        const upcomingLaunches = launches.filter((l: any) => new Date(l.net) > now).slice(0, 5);
        const upcomingEvents = events.filter((e: any) => new Date(e.date) >= now || e.date === 'Indefinite').slice(0, 5);
        
        const launchContext = [
            "**UPCOMING LAUNCH MANIFEST (Next 5):**",
            ...upcomingLaunches.map((l: any) => `- MISSION: ${l.name} | TIME: ${l.net} | ID: ${l.id} | DESC: ${l.mission?.description || 'Classified'}`),
        ].join('\n');

        const eventContext = [
             "**CELESTIAL EVENTS (Star Gazer Network):**",
             ...upcomingEvents.map((e: any) => `- EVENT: ${e.title} | TYPE: ${e.type} | ID: ${e.id} | DATE: ${e.date}`)
        ].join('\n');

        const systemContent = `
${SYSTEM_PROMPT}

**MISSION DATA (Site Knowledge):**
${Object.entries(SITE_KNOWLEDGE).map(([k, v]) => `- ${k.toUpperCase()}: ${v.desc} (ID: ${v.path})`).join('\n')}

${launchContext}

${eventContext}

**NAVIGATION PROTOCOL:**
1. SECTION: [[NAVIGATE: /path]]
2. LAUNCH DETAIL: [[NAVIGATE: /mission-control?launchId=ID]]
3. EVENT DETAIL: [[NAVIGATE: /star-gazer?eventId=ID]]

Example: "Locating the Perseids. [[NAVIGATE: /star-gazer?eventId=104]]"
`;

        try {
            // Call Groq via Vite Proxy (Auth injected by server)
            const res = await fetch('/api/groq/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: systemContent },
                        ...history,
                        { role: "user", content: userText }
                    ],
                    temperature: 0.7,
                    max_tokens: 150
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error("LLM Error:", errText);
                throw new Error(`Neural Link Error: ${res.status} | ${errText.substring(0, 200)}...`);
            }

            const data = await res.json();
            let botText = data.choices[0]?.message?.content || "Comms silent.";

            // 1. Parse Navigation Command
            let navPath = null;
            const navMatch = botText.match(/\[\[NAVIGATE:\s*([^\s\]]+)\s*\]\]/);
            if (navMatch) {
                navPath = navMatch[1];
                botText = botText.replace(navMatch[0], '').trim(); // Remove tag from speech
            }

            // 2. Add Sign-off if missing (and not already short)
            if (botText.length > 50 && !botText.includes("Nova Out") && !botText.includes("Cadet")) {
                 botText += " Over.";
            }

            const botMsg: Message = { id: Date.now().toString(), text: botText, sender: 'bot', timestamp: new Date() };
            setMessages(prev => [...prev, botMsg]);
            
            // 3. Speak & Navigate
            speak(botText);
            if (navPath) {
                setTimeout(() => navigate(navPath), 1500); 
            }

        } catch (err: any) {
             console.error("Generation Failed:", err);
             // Show actual error for debugging
             const fallback = `⚠️ System Failure: ${err.message}`;
             setMessages(prev => [...prev, { id: Date.now().toString(), text: fallback, sender: 'bot', timestamp: new Date() }]);
             speak("System Failure. Check visual display.");
        } finally {
            setIsWriting(false);
        }
    };

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), text: inputText, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        const textToProcess = inputText;
        setInputText('');
        
        generateResponse(textToProcess);
    };

    return (
        <div className="absolute top-6 right-6 z-50 pointer-events-auto flex flex-col items-end font-sans">
             {/* Toggle Button */}
             <button 
                onClick={() => setIsOpen(!isOpen)}
                className= {clsx(
                    "w-12 h-12 flex items-center justify-center rounded-full border transition-all duration-300 shadow-[0_0_15px_rgba(0,243,255,0.1)]",
                    isOpen 
                        ? "bg-neon-cyan text-black border-neon-cyan" 
                        : "bg-black/60 backdrop-blur-md text-neon-cyan border-neon-cyan/30 hover:bg-neon-cyan/10 hover:scale-110"
                )}
            >
                {isOpen ? <X size={20} /> : <Bot size={20} />}
            </button>

            {/* Chat Dropdown */}
            {isOpen && (
                <div className="mt-3 w-80 h-96 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 flex flex-col">
                    {/* Header */}
                    <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <div className="flex items-center space-x-2">
                             <div className={clsx("w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]", isPlaying ? "bg-neon-cyan" : "bg-green-500")} />
                             <span className="text-xs font-bold text-white font-orbitron tracking-widest">CAPT. NOVA</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <button 
                                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                                className={clsx(
                                    "p-1.5 rounded transition-colors",
                                    isVoiceEnabled ? "text-neon-cyan bg-neon-cyan/20" : "text-gray-500 hover:text-white"
                                )}
                                title="Toggle Voice Comms"
                            >
                                {isVoiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                            </button>
                        </div>
                    </div>
                    
                    {/* Error Toast */}
                    {audioError && (
                        <div className="bg-red-500/20 border-b border-red-500/30 px-3 py-1 text-[10px] text-red-300 text-center font-mono">
                            {audioError}
                        </div>
                    )}

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={clsx("flex", msg.sender === 'user' ? "justify-end" : "justify-start")}>
                                <div className={clsx(
                                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                                    msg.sender === 'user' 
                                        ? "bg-neon-cyan/20 text-white rounded-br-none border border-neon-cyan/30" 
                                        : "bg-white/10 text-gray-200 rounded-bl-none border border-white/5"
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isWriting && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 rounded-2xl rounded-bl-none px-3 py-2 flex space-x-1 items-center">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-white/10 bg-black/40">
                        <div className="flex items-center bg-white/5 rounded-full px-1 py-1 border border-white/10 focus-within:border-neon-cyan/50 transition-colors">
                            <input 
                                ref={inputRef}
                                className="bg-transparent border-none outline-none text-white text-xs px-3 py-2 flex-1 placeholder-white/30 font-mono"
                                placeholder="Transmit message..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button 
                                onClick={handleSend}
                                className="p-2 bg-neon-cyan text-black rounded-full hover:scale-105 transition-transform"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
