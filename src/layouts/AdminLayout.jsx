import { useEffect, useState } from 'react';
import { Outlet, Navigate, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Users, BookOpen, FileText, Bell, LogOut, Settings } from 'lucide-react';

function AdminLayout() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
                <div className="loading-spinner"></div>
                <div className="text-slate-500 font-serif tracking-widest uppercase text-xs animate-pulse">Chargement Admin...</div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/admin/login" replace />;
    }

    const menuItems = [
        { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin/dashboard' },
        { icon: Users, label: 'Niveaux', path: '/admin/levels' },
        { icon: Users, label: 'Groupes', path: '/admin/groups' },
        { icon: BookOpen, label: 'Modules', path: '/admin/modules' },
        { icon: Bell, label: 'Annonces', path: '/admin/announcements' },
        { icon: FileText, label: 'Fichiers', path: '/admin/files' },
        { icon: Settings, label: 'Paramètres', path: '/admin/settings' },
    ];

    return (
        <div className="min-h-screen flex bg-black text-white">
            {/* Sidebar */}
            <aside className="w-64 glass-panel border-r border-white/5 flex flex-col">
                <div className="p-6 border-b border-white/5 flex items-center gap-3">
                    <Link to="/admin/dashboard" className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-black">
                        <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-widest uppercase">Platform</span>
                        <span className="font-bold text-sm tracking-widest uppercase text-primary-600">APEX</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl transition-all group"
                        >
                            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto bg-[#050505] relative">
                {/* Background Pattern Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #222 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <div className="relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;
