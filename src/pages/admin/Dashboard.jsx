import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Users, BookOpen, FileText, LayoutDashboard } from 'lucide-react';

function Dashboard() {
    const [stats, setStats] = useState({
        levels: 0,
        groups: 0,
        modules: 0,
        files: 0
    });

    useEffect(() => {
        async function fetchStats() {
            const [
                { count: levelsCount },
                { count: groupsCount },
                { count: modulesCount },
                { count: filesCount }
            ] = await Promise.all([
                supabase.from('levels').select('*', { count: 'exact', head: true }),
                supabase.from('groups').select('*', { count: 'exact', head: true }),
                supabase.from('modules').select('*', { count: 'exact', head: true }),
                supabase.from('files').select('*', { count: 'exact', head: true })
            ]);

            setStats({
                levels: levelsCount || 0,
                groups: groupsCount || 0,
                modules: modulesCount || 0,
                files: filesCount || 0
            });
        }

        fetchStats();
    }, []);

    const statCards = [
        { title: 'Niveaux', value: stats.levels, icon: Users, color: 'from-red-600 to-red-800' },
        { title: 'Groupes', value: stats.groups, icon: Users, color: 'from-primary-600 to-primary-700' },
        { title: 'Modules', value: stats.modules, icon: BookOpen, color: 'from-slate-700 to-slate-800' },
        { title: 'Fichiers', value: stats.files, icon: FileText, color: 'from-primary-900 to-black' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white font-serif tracking-tight">Tableau de <span className="text-primary-600">bord</span></h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-panel rounded-3xl p-6 border border-white/5 flex items-center justify-between group hover:border-primary-600/30 transition-all shadow-xl shadow-black"
                    >
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.title}</p>
                            <h3 className="text-3xl font-extrabold text-white">{stat.value}</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="glass-panel rounded-3xl p-8 border border-white/5 min-h-[400px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <LayoutDashboard className="w-full h-full -scale-150" />
                </div>
                <div className="text-center relative z-10">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-primary-600" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Bienvenue sur Platform APEX Admin</h2>
                    <p className="text-slate-500 max-w-sm mx-auto">Gérez vos niveaux, groupes, modules et fichiers depuis cet espace sécurisé.</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
