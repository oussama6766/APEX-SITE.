import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, ChevronLeft, Bookmark } from 'lucide-react';

function GroupModules() {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [groupRes, modulesRes] = await Promise.all([
                    supabase.from('groups').select('*, levels(id, name)').eq('id', groupId).single(),
                    supabase.from('modules').select('*').eq('group_id', groupId).order('created_at')
                ]);

                setGroup(groupRes.data);
                setModules(modulesRes.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [groupId]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="loading-spinner"></div>
                <div className="text-slate-500 font-serif tracking-widest uppercase text-xs animate-pulse">Chargement des modules...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 py-6">
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4 overflow-x-auto whitespace-nowrap pb-2">
                <Link to="/" className="hover:text-primary-600 transition-colors shrink-0">Accueil</Link>
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <Link to={`/level/${group?.levels?.id}`} className="hover:text-primary-600 transition-colors shrink-0">{group?.levels?.name}</Link>
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span className="text-white font-medium shrink-0">{group?.name}</span>
            </div>

            <header className="space-y-4">
                <h1 className="text-3xl font-extrabold text-white tracking-tight font-serif">
                    Unités <span className="text-primary-600">d'Enseignement</span> (Modules)
                </h1>
                <p className="text-slate-400 max-w-2xl">Sélectionnez un module pour accéder aux cours, exercices, vidéos et annonces correspondantes.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {modules.map((module, index) => (
                    <motion.div
                        key={module.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link
                            to={`/module/${module.id}`}
                            className="flex flex-col h-full p-6 rounded-3xl glass-panel glass-panel-hover transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary-600 mb-6 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-7 h-7" />
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-2 truncate">{module.name}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                                    {module.description || "Consultez le contenu de cette unité d'enseignement."}
                                </p>
                            </div>

                            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-sm font-bold text-primary-500">
                                <span>Voir le contenu</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </motion.div>
                ))}

                {modules.length === 0 && (
                    <div className="col-span-full text-center py-20 glass-panel rounded-3xl text-slate-400">
                        Aucun module n'a encore été ajouté pour ce groupe.
                    </div>
                )}
            </div>
        </div>
    );
}

export default GroupModules;
