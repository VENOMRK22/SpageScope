import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { ShieldAlert } from 'lucide-react';
import { PinkRain } from '../components/PinkRain';

export const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect to where they wanted to go, or home
    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsAuthenticating(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }

            // Artificial Delay for effect
            setTimeout(() => {
                navigate(from, { replace: true });
            }, 800);
        } catch (err: any) {
            console.error("Authentication Failed", err);
            let msg = 'AUTHENTICATION FAILED';
            if (err.code === 'auth/invalid-credential') msg = 'INVALID CREDENTIALS';
            if (err.code === 'auth/email-already-in-use') msg = 'EMAIL ALREADY REGISTERED';
            if (err.code === 'auth/weak-password') msg = 'PASSWORD TOO WEAK';
            setError(msg);
            setIsAuthenticating(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex relative overflow-hidden font-mono">
            <PinkRain />
            {/* LEFT SIDE - VISUALS */}
            <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
                {/* Title - Sexy & Stylized */}
                <div className="absolute top-8 left-8 z-20">
                    <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-x drop-shadow-[0_0_10px_rgba(236,72,153,0.5)] font-orbitron">
                        SPACE<span className="text-white">SCOPE</span>
                    </h1>
                    <div className="h-1 w-24 bg-pink-500 mt-2 rounded-full shadow-[0_0_10px_#ec4899] animate-pulse" />
                </div>

                {/* Background Sphere with Blur */}
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-pink-900/10 z-10 mix-blend-overlay" />
                    <img
                        src="/login.gif"
                        alt="Atmospheric Sphere"
                        className="max-w-none w-[90%] h-[90%] object-contain opacity-100"
                    />
                </div>
            </div>

            {/* RIGHT SIDE - LOGIN FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
                {/* Mobile Background (since left side is hidden) */}
                <div className="absolute inset-0 lg:hidden z-0">
                    <img
                        src="/login.gif"
                        alt="Atmospheric Sphere"
                        className="w-full h-full object-cover opacity-40 blur-sm"
                    />
                    <div className="absolute inset-0 bg-black/60" />
                </div>

                {/* Glassmorphic Container - Pink Theme */}
                <div className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-2xl border border-pink-500/20 p-10 rounded-3xl shadow-[0_0_60px_-15px_rgba(236,72,153,0.3)]">

                    {/* Decoration */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight font-sans">
                            {isLogin ? 'Welcome Back' : 'Join the Mission'}
                        </h2>
                        <p className="text-pink-200/70 text-sm">
                            {isLogin ? 'Enter your credentials to access the system.' : 'Create your account to start your journey.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-pink-500/20 rounded-xl px-4 py-4 text-white placeholder-pink-200/30 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-sans shadow-inner"
                                    placeholder="Email Address"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-pink-500/20 rounded-xl px-4 py-4 text-white placeholder-pink-200/30 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-sans shadow-inner"
                                    placeholder="Password"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center space-x-2 text-pink-200 bg-pink-500/10 p-4 rounded-xl border border-pink-500/20 text-xs">
                                <ShieldAlert size={16} className="text-pink-500" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isAuthenticating}
                            className={clsx(
                                "w-full py-4 px-6 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-300 relative overflow-hidden group",
                                isAuthenticating
                                    ? "bg-pink-600/50 text-white cursor-wait"
                                    : "bg-pink-500/10 text-pink-300 border border-pink-500/30 hover:bg-pink-500 hover:text-white hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] hover:border-transparent"
                            )}
                        >
                            <span className="relative z-10">{isAuthenticating ? "PROCESSING..." : (isLogin ? "SIGN IN" : "CREATE ACCOUNT")}</span>
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                                className="text-xs text-pink-400/60 hover:text-pink-300 transition-colors uppercase tracking-widest hover:underline decoration-pink-500 underline-offset-4"
                            >
                                {isLogin ? "Need an account? Sign Up" : "Already have an account? Log In"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

