import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, Bell, FileText, Download, PlayCircle, Image as ImageIcon, File, ArrowRight, Bookmark } from 'lucide-react';

function ModuleDetails() {
    const { moduleId } = useParams();
    const [module, setModule] = useState(null);
    const [sections, setSections] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingFiles, setLoadingFiles] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const [moduleRes, sectionsRes] = await Promise.all([
                    supabase.from('modules').select('*, groups(id, name, levels(id, name))').eq('id', moduleId).single(),
                    supabase.from('module_sections').select('*').eq('module_id', moduleId).order('order_index')
                ]);

                setModule(moduleRes.data);
                setSections(sectionsRes.data || []);
                if (sectionsRes.data?.length > 0) setActiveTab(sectionsRes.data[0].id);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [moduleId]);

    useEffect(() => {
        if (activeTab) {
            async function fetchFiles() {
                setLoadingFiles(true);
                const { data } = await supabase.from('files').select('*').eq('section_id', activeTab).order('created_at', { ascending: false });
                setFiles(data || []);
                setLoadingFiles(false);
            }
            fetchFiles();
        }
    }, [activeTab]);

    const getFileIcon = (type) => {
        if (type === 'pdf') return <FileText className="text-primary-500" />;
        if (type === 'video') return <PlayCircle className="text-primary-500" />;
        if (type === 'image') return <ImageIcon className="text-primary-500" />;
        return <File className="text-slate-400" />;
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="loading-spinner"></div>
                <div className="text-slate-500 font-serif tracking-widest uppercase text-xs animate-pulse">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 py-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4 overflow-x-auto whitespace-nowrap pb-2">
                <Link to="/" className="hover:text-primary-600 transition-colors shrink-0">Accueil</Link>
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <Link to={`/level/${module?.groups?.levels?.id}`} className="hover:text-primary-600 transition-colors shrink-0">{module?.groups?.levels?.name}</Link>
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <Link to={`/group/${module?.groups?.id}`} className="hover:text-primary-600 transition-colors shrink-0">{module?.groups?.name}</Link>
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span className="text-white font-medium shrink-0">{module?.name}</span>
            </div>



            {/* Main Content Grid */}
            <div className="flex flex-col lg:flex-row gap-8 mt-12">
                {/* Navigation Tabs */}
                <aside className="lg:w-72 space-y-2">
                    <div className="flex items-center gap-3 px-2 mb-6 text-slate-500 uppercase tracking-widest text-[10px] font-bold">
                        <Bookmark className="w-3 h-3" />
                        <span>SÉCTIONS</span>
                    </div>
                    <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveTab(section.id)}
                                className={`flex-1 lg:flex-none flex items-center justify-between gap-4 px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === section.id
                                    ? 'bg-primary-600 text-white shadow-lg shadow-black'
                                    : 'bg-white/5 text-slate-400 border border-white/5 hover:border-primary-600/30'
                                    }`}
                            >
                                <span>{section.name}</span>
                                {activeTab === section.id && <ArrowRight className="w-4 h-4 hidden lg:block" />}
                            </button>
                        ))}
                        {sections.length === 0 && <p className="text-slate-500 text-sm italic px-2">Aucune section.</p>}
                    </div>
                </aside>

                {/* Content Area */}
                <div className="flex-1 min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col md:flex-row gap-6 items-start justify-between mb-8 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden glass-panel shrink-0 border-primary-600/20 shadow-xl shadow-black">
                                        <img
                                            src={`/${sections.find(s => s.id === activeTab)?.name.toLowerCase()}.jpeg`}
                                            onError={(e) => e.target.src = '/logo.jpeg'}
                                            className="w-full h-full object-cover"
                                            alt="Section Icon"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-white font-serif tracking-wide uppercase">
                                            {sections.find(s => s.id === activeTab)?.name || "Chargement..."}
                                        </h2>
                                        <p className="text-slate-500 text-sm mt-1">{module?.name} / {module?.groups?.name}</p>
                                    </div>
                                </div>
                                {files.length > 0 && (
                                    <div className="bg-primary-600/10 border border-primary-600/20 px-4 py-2 rounded-full">
                                        <span className="text-primary-500 text-[10px] font-bold uppercase tracking-widest">{files.length} DOCUMENTS</span>
                                    </div>
                                )}
                            </div>

                            {loadingFiles ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4">
                                    <div className="loading-spinner scale-75"></div>
                                    <div className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Recherche des documents...</div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {files.map((file) => (
                                        <div key={file.id} className="group flex items-center gap-4 p-5 rounded-3xl glass-panel glass-panel-hover transition-all">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl shrink-0 group-hover:bg-primary-600/10 transition-colors">
                                                {getFileIcon(file.file_type)}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="font-bold text-slate-200 text-sm truncate mb-1">{file.title}</h4>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{file.file_type}</p>
                                            </div>
                                            <a
                                                href={file.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    ))}

                                    {files.length === 0 && (
                                        <div className="col-span-full py-20 text-center glass-panel rounded-3xl">
                                            <FileText className="w-12 h-12 mx-auto mb-4 text-white/5" />
                                            <p className="text-slate-500">Aucun document disponible dans cette section.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default ModuleDetails;
