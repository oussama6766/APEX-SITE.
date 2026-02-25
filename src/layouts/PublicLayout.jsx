import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar } from 'lucide-react';

function PublicLayout() {
    const [settings, setSettings] = useState(null);
    const [clickCount, setClickCount] = useState(0);
    const [lastClickTime, setLastClickTime] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchSettings() {
            const { data } = await supabase.from('settings').select('*').limit(1).single();
            if (data) setSettings(data);
        }
        fetchSettings();
    }, []);

    const handleLogoClick = (e) => {
        // Prevent accidental link navigation for the secret clicks
        const currentTime = Date.now();

        // If clicks are more than 1 second apart, reset count
        if (currentTime - lastClickTime > 1000) {
            setClickCount(1);
        } else {
            const newCount = clickCount + 1;
            setClickCount(newCount);

            if (newCount === 7) {
                e.preventDefault();
                navigate('/admin/login');
                setClickCount(0);
            }
        }

        setLastClickTime(currentTime);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="glass-panel sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLogoClick}
                            className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-black group active:scale-95 transition-transform"
                        >
                            <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </button>
                        <Link to="/" className="flex items-center">
                            <h1 className="text-xl font-bold text-white font-serif tracking-widest uppercase">
                                Platform <span className="text-primary-600 underline decoration-red-600 underline-offset-8">APEX</span>
                            </h1>
                        </Link>
                    </div>

                    {settings?.timetable_url && (
                        <a
                            href={settings.timetable_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl glass-panel text-white text-xs font-bold hover:bg-white/10 transition-all group"
                        >
                            <Calendar className="w-4 h-4 text-primary-500 group-hover:rotate-12 transition-transform" />
                            Emploi du temps
                        </a>
                    )}
                </div>
            </header>

            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            <footer className="glass-panel border-t border-white/5 py-12 mt-12 bg-black/60 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 text-center space-y-8 relative z-10">
                    <div className="flex flex-col items-center gap-4">
                        <a
                            href="https://wa.me/606891769212"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-black text-white font-bold hover:scale-105 transition-all shadow-xl shadow-black/40 group border border-white/10"
                        >
                            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-primary-600" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            <span className="font-serif italic tracking-widest text-lg">CICADA</span>
                        </a>
                    </div>
                </div>
                {/* Visual decoration */}
                <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] -z-0"></div>
            </footer>
        </div>
    );
}

export default PublicLayout;
