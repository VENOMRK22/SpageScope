import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { Lock, ShieldAlert, Cpu } from 'lucide-react';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect to where they wanted to go, or home
    const from = location.state?.from?.pathname || "/";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsAuthenticating(true);

        try {
            await login(email, password);
            // Artificial Delay for effect
            setTimeout(() => {
                navigate(from, { replace: true });
            }, 800);
        } catch (err: any) {
            console.error("Login Failed", err);
            setError('ACCESS DENIED: ' + (err.code === 'auth/invalid-credential' ? 'INVALID CREDENTIALS' : 'NETWORK ERROR'));
            setIsAuthenticating(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-mono">
            {/* Background Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{ backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            <div className="relative z-10 w-full max-w-md">
                {/* Header Hardware */}
                <div className="bg-gray-900 border border-neon-cyan/30 p-1 flex justify-between items-center mb-4 backdrop-blur-md">
                    <div className="text-[10px] text-neon-cyan flex items-center space-x-2">
                        <Cpu size={14} />
                        <span>SECURE_GATEWAY_V4.2</span>
                    </div>
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                </div>

                {/* Main Terminal Card */}
                <div className="bg-black/80 border-2 border-neon-cyan p-8 shadow-[0_0_50px_rgba(0,243,255,0.2)] relative backdrop-blur-xl">
                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neon-cyan" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neon-cyan" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neon-cyan" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neon-cyan" />

                    <div className="text-center mb-8">
                        <div className="inline-block p-4 border-2 border-red-500/50 rounded-full mb-4 relative group">
                            <Lock size={40} className="text-red-500" />
                            <div className="absolute inset-0 border-2 border-red-500 rounded-full animate-ping opacity-20" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-widest mb-1 font-orbitron">RESTRICTED_ACCESS</h1>
                        <p className="text-xs text-red-400 tracking-widest">AUTHORIZED PERSONNEL ONLY</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-neon-cyan mb-2">Operator ID (Email)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-blue-900/10 border border-neon-cyan/50 p-3 text-white font-mono focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all"
                                placeholder="commander@spaceforce.mil"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-neon-cyan mb-2">Access Key (Password)</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-blue-900/10 border border-neon-cyan/50 p-3 text-white font-mono focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="flex items-center space-x-2 text-red-500 bg-red-500/10 p-3 border border-red-500/50 text-xs">
                                <ShieldAlert size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isAuthenticating}
                            className={clsx(
                                "w-full py-4 text-sm font-bold tracking-[0.2em] transition-all relative overflow-hidden group",
                                isAuthenticating
                                    ? "bg-green-600 text-white cursor-wait"
                                    : "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan hover:bg-neon-cyan hover:text-black"
                            )}
                        >
                            {isAuthenticating ? "AUTHENTICATING..." : "INITIATE LINK"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
