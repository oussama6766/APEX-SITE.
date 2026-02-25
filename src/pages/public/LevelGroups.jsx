import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ArrowRight, ChevronLeft, Bell, BookOpen, Play, Pause, ChevronDown, ChevronUp, Image as ImageIcon, Volume2 } from 'lucide-react';

// Custom WhatsApp-style Audio Player
const AudioPlayer = ({ src }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(new Audio(src));

    useEffect(() => {
        const audio = audioRef.current;
        const updateProgress = () => setProgress((audio.currentTime / audio.duration) * 100);
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', () => setIsPlaying(false));
        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.pause();
        };
    }, []);

    const togglePlay = (e) => {
        e.stopPropagation();
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-2xl p-2 pr-4 w-full max-w-[280px] border border-white/10">
            <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-red-900/40 hover:scale-105 transition-transform shrink-0"
            >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <div className="flex-1 flex flex-col gap-1">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary-600 rounded-full transition-all duration-100"
                        style={{ width: `${progress || 0}%` }}
                    ></div>
                </div>
                <div className="flex justify-between items-center px-0.5">
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Voice Note</span>
                    <Volume2 className="w-2.5 h-2.5 text-primary-500/50" />
                </div>
            </div>
        </div>
    );
};

function LevelGroups() {
    const { levelId } = useParams();
    const [level, setLevel] = useState(null);
    const [groups, setGroups] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const [levelRes, groupsRes, announcementsRes] = await Promise.all([
                    supabase.from('levels').select('*').eq('id', levelId).single(),
                    supabase.from('groups').select('*').eq('level_id', levelId).order('name'),
                    supabase.from('announcements').select('*').eq('level_id', levelId).order('created_at', { ascending: false })
                ]);

                setLevel(levelRes.data);
                setGroups(groupsRes.data || []);
                setAnnouncements(announcementsRes.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [levelId]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="loading-spinner"></div>
                <div className="text-slate-500 font-serif tracking-widest uppercase text-xs animate-pulse">Chargement...</div>
            </div>
        );
    }

    const mainAnnouncement = announcements[0];
    const otherAnnouncements = announcements.slice(1);

    return (
        <div className="space-y-8 py-6">
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4 px-2">
                <Link to="/" className="hover:text-primary-600 transition-colors">Accueil</Link>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-white font-medium">{level?.name}</span>
            </div>

            {/* Structured & Expandable Announcements */}
            {announcements.length > 0 && (
                <section className="relative z-20">
                    <motion.div
                        initial={false}
                        animate={{ height: isExpanded ? 'auto' : 'auto' }}
                        className="glass-panel rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black overflow-hidden relative"
                    >
                        {/* Header / Active Announcement */}
                        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start relative z-10">
                            <div className="shrink-0 flex flex-col items-center gap-2">
                                <div className="w-16 h-16 rounded-3xl bg-primary-600/20 border border-primary-600/30 flex items-center justify-center text-primary-500 relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-primary-600 animate-pulse opacity-0 group-hover:opacity-10"></div>
                                    <Bell className="w-8 h-8" />
                                </div>
                                <span className="text-[10px] font-black text-primary-600/60 tracking-[0.3em] uppercase">Flash</span>
                            </div>

                            <div className="flex-1 space-y-4 w-full">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full bg-primary-600/10 border border-primary-600/20 text-primary-500 text-[10px] font-bold uppercase tracking-widest">
                                        Nouveau
                                    </span>
                                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                        {new Date(mainAnnouncement.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <p className={`text-white font-serif font-medium leading-relaxed transition-all duration-500 ${isExpanded ? 'text-xl md:text-2xl' : 'text-lg line-clamp-2 blur-[0.4px] opacity-80'}`}>
                                        {mainAnnouncement.content}
                                    </p>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="space-y-4 overflow-hidden"
                                            >
                                                {mainAnnouncement.image_url && (
                                                    <div className="relative max-w-lg rounded-3xl overflow-hidden border border-white/10 aspect-video shadow-2xl shadow-black mt-2">
                                                        <img src={mainAnnouncement.image_url} alt="Announce" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                                    </div>
                                                )}

                                                {mainAnnouncement.audio_url && (
                                                    <AudioPlayer src={mainAnnouncement.audio_url} />
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Expandable Section */}
                        <AnimatePresence>
                            {isExpanded && otherAnnouncements.length > 0 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-white/5 bg-black/20"
                                >
                                    <div className="p-8 space-y-8">
                                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Annonces Précédentes</h3>
                                        {otherAnnouncements.map((a, idx) => (
                                            <div key={a.id} className="flex gap-6 items-start">
                                                <div className="w-1 h-12 bg-white/5 rounded-full shrink-0 mt-2"></div>
                                                <div className="space-y-3 flex-1">
                                                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                                        {new Date(a.created_at).toLocaleDateString()}
                                                    </span>
                                                    <p className="text-slate-300 font-medium leading-relaxed italic">
                                                        "{a.content}"
                                                    </p>
                                                    {a.image_url && (
                                                        <img src={a.image_url} className="w-24 h-16 object-cover rounded-xl border border-white/10" />
                                                    )}
                                                    {a.audio_url && <AudioPlayer src={a.audio_url} />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Expand Button */}
                        {(otherAnnouncements.length > 0 || mainAnnouncement.image_url || mainAnnouncement.audio_url) && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="w-full py-4 bg-white/2 hover:bg-white/5 transition-colors flex items-center justify-center text-slate-500 group border-t border-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] group-hover:text-primary-500 transition-colors">
                                        {isExpanded ? 'Réduire' : 'Afficher les détails & images'}
                                    </span>
                                    {isExpanded ? <ChevronUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" /> : <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />}
                                </div>
                            </button>
                        )}
                    </motion.div>
                </section>
            )}

            <header className="space-y-4 pt-10 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-600/10 border border-primary-600/20 text-primary-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                    Niveau: {level?.name}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight font-serif">
                    Salles & <span className="text-primary-600">Groupes</span>
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">{level?.description || "Veuillez sélectionner votre groupe d'étude pour accéder aux modules."}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                {groups.map((group, index) => (
                    <motion.div
                        key={group.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link
                            to={`/group/${group.id}`}
                            className="group flex flex-col p-8 rounded-3xl glass-panel glass-panel-hover transition-all relative overflow-hidden h-full min-h-[160px]"
                        >
                            <div className="absolute top-0 right-0 p-8 text-primary-600/5 group-hover:text-primary-600/10 transition-colors">
                                <Users className="w-24 h-24" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-lg mb-6">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{group.name}</h3>
                                <p className="text-sm text-slate-500 mb-6 flex-1">{group.description || "Consulter les modules associés à ce groupe."}</p>

                                <div className="flex items-center text-primary-500 font-bold gap-2 mt-auto">
                                    <span className="text-sm">Accéder aux modules</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}

                {groups.length === 0 && (
                    <div className="col-span-full text-center py-24 glass-panel rounded-[2.5rem] text-slate-500 border border-dashed border-white/5">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p className="font-bold uppercase tracking-widest text-[10px]">Aucun groupe disponible pour ce niveau.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LevelGroups;
