

const PagePlaceholder = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] glass-panel rounded-3xl p-12 text-center animate-fade-in border border-white/5 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-starlight-white to-muted-gray mb-6 font-orbitron">
            {title}
        </h2>
        <p className="text-xl text-neon-cyan font-light tracking-widest uppercase border-b border-neon-cyan/30 pb-2">
            {subtitle}
        </p>
    </div>
);


export const StarGazer = () => <PagePlaceholder title="Star Gazer Module" subtitle="Coming Soon" />;
export const CosmicWeather = () => <PagePlaceholder title="Cosmic Weather Station" subtitle="Offline" />;
export const MissionControl = () => <PagePlaceholder title="Mission Control" subtitle="System Initialization..." />;
export const SatelliteSavior = () => <PagePlaceholder title="Satellite Savior" subtitle="No Threats Detected" />;
export const TheAcademy = () => <PagePlaceholder title="The Academy" subtitle="Access Restricted" />;

export const PlaceholderPage = PagePlaceholder;
