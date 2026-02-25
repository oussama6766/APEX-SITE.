import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { GraduationCap, ChevronRight } from 'lucide-react';

function Home() {
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data } = await supabase.from('levels').select('*').eq('is_active', true).order('name');
                setLevels(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="loading-spinner"></div>
                <div className="text-slate-500 font-serif tracking-widest uppercase text-xs animate-pulse">Initialisation...</div>
            </div>
        );
    }

    return (
        <div className="space-y-12 py-8">
            {/* Hero Section */}
            <section className="text-center space-y-10 max-w-4xl mx-auto px-4 py-8 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mx-auto w-32 h-32 rounded-3xl overflow-hidden shadow-2xl shadow-red-900/20 glass-panel p-2 mb-8"
                >
                    <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                </motion.div>

                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-none font-serif">
                        Votre succès est <span className="text-primary-600">notre mission.</span>
                    </h1>
                </div>
            </section>

            {/* Levels Grid */}
            <section className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white font-serif">Sélectionnez votre parcours</h2>
                    <div className="h-px flex-1 mx-6 bg-white/10 rounded-full hidden md:block"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {levels.map((level, index) => (
                        <motion.div
                            key={level.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                to={`/level/${level.id}`}
                                className="group relative flex flex-col p-8 rounded-3xl glass-panel glass-panel-hover transition-all overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 text-primary-600/10 group-hover:text-primary-600/20 transition-colors">
                                    <GraduationCap className="w-32 h-32 -mr-12 -mt-12" />
                                </div>

                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform">
                                        <GraduationCap className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{level.name}</h3>
                                    <p className="text-slate-400 mb-6">{level.description || "Parcourez les groupes et modules associés à ce niveau."}</p>

                                    <div className="flex items-center text-primary-500 font-bold gap-2">
                                        <span>Accéder au niveau</span>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}

                    {levels.length === 0 && (
                        <div className="col-span-full text-center py-20 glass-panel rounded-3xl">
                            <p className="text-slate-400">Aucun niveau n'a été ajouté pour le moment. Veuillez vérifier le panneau d'administration.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default Home;
