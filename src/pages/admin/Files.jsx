import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, FileText, Upload, Database } from 'lucide-react';

function Files() {
    const [modules, setModules] = useState([]);
    const [sections, setSections] = useState([]);
    const [files, setFiles] = useState([]);
    const [selectedModule, setSelectedModule] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [fileTitle, setFileTitle] = useState('');

    useEffect(() => {
        fetchModules();
    }, []);

    useEffect(() => {
        if (selectedModule) fetchSections(selectedModule);
        else { setSections([]); setSelectedSection(''); }
    }, [selectedModule]);

    useEffect(() => {
        if (selectedSection) fetchFiles(selectedSection);
        else setFiles([]);
    }, [selectedSection]);

    async function fetchModules() {
        const { data } = await supabase.from('modules').select('*, groups(name, levels(name))');
        setModules(data || []);
        if (data?.length > 0) setSelectedModule(data[0].id);
        setLoading(false);
    }

    async function fetchSections(modId) {
        const { data } = await supabase.from('module_sections').select('*').eq('module_id', modId).order('order_index');
        setSections(data || []);
        if (data?.length > 0) setSelectedSection(data[0].id);
    }

    async function fetchFiles(secId) {
        const { data } = await supabase.from('files').select('*').eq('section_id', secId).order('created_at', { ascending: false });
        setFiles(data || []);
    }

    async function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file || !selectedSection || !fileTitle) return;

        setUploading(true);
        try {
            // 1. Upload to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { error: uploadError, data } = await supabase.storage
                .from('platform-files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage.from('platform-files').getPublicUrl(filePath);

            // 3. Save to Database
            let type = 'file';
            if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt.toLowerCase())) type = 'image';
            else if (['mp4', 'webm'].includes(fileExt.toLowerCase())) type = 'video';
            else if (fileExt.toLowerCase() === 'pdf') type = 'pdf';

            const { error: dbError } = await supabase.from('files').insert([{
                section_id: selectedSection,
                title: fileTitle,
                file_url: publicUrl,
                file_type: type
            }]);

            if (dbError) throw dbError;

            setFileTitle('');
            fetchFiles(selectedSection);
            alert('Upload réussi !');
        } catch (error) {
            console.error(error);
            alert('Erreur lors de l\'upload : ' + error.message);
        } finally {
            setUploading(false);
        }
    }

    async function handleDelete(file) {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) return;
        try {
            // 1. Extract path from URL
            const urlParts = file.file_url.split('/platform-files/');
            if (urlParts.length > 1) {
                const filePath = urlParts[1];
                const { error: storageError } = await supabase.storage
                    .from('platform-files')
                    .remove([filePath]);

                if (storageError) console.error('Error deleting from storage:', storageError);
            }

            // 2. Delete from DB
            const { error: dbError } = await supabase.from('files').delete().eq('id', file.id);
            if (dbError) throw dbError;

            fetchFiles(selectedSection);
            alert('Supprimé avec succès');
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la suppression');
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="loading-spinner"></div>
            <p className="text-slate-500 text-xs font-bold tracking-widest uppercase animate-pulse">Chargement...</p>
        </div>
    );

    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-700">
            <div className="glass-panel p-8 rounded-3xl border border-white/5 flex items-center gap-6 shadow-2xl shadow-black relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Database className="w-32 h-32" />
                </div>
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 relative z-10">
                    <Database className="w-7 h-7" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold text-white font-serif uppercase tracking-tight">Gestion des <span className="text-emerald-500">Fichiers</span></h1>
                    <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">Uploadez et gérez vos documents</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-xl shadow-black">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">1. Sélectionner le module</label>
                        <select
                            value={selectedModule}
                            onChange={e => setSelectedModule(e.target.value)}
                            className="w-full bg-white/5 p-4 rounded-2xl border border-white/5 text-white outline-none focus:border-primary-600 transition-all font-medium mb-6"
                        >
                            {modules.map(m => (
                                <option key={m.id} value={m.id} className="bg-slate-900">{m.groups?.levels?.name} - {m.groups?.name} - {m.name}</option>
                            ))}
                        </select>

                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">2. Sélectionner la section</label>
                        <select
                            value={selectedSection}
                            onChange={e => setSelectedSection(e.target.value)}
                            className="w-full bg-white/5 p-4 rounded-2xl border border-white/5 text-white outline-none focus:border-primary-600 transition-all font-medium"
                        >
                            {sections.map(s => (
                                <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-xl shadow-black">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">3. Upload nouveau fichier</label>
                        <input
                            type="text"
                            placeholder="Titre du fichier (ex: Cours 1 - Introduction)"
                            value={fileTitle}
                            onChange={e => setFileTitle(e.target.value)}
                            className="w-full bg-white/5 p-4 rounded-2xl border border-white/5 text-white outline-none focus:border-primary-600 transition-all placeholder:text-slate-600 mb-6"
                        />
                        <div className="relative group/upload">
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                disabled={uploading || !fileTitle}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
                            />
                            <div className={`p-12 border-2 border-dashed rounded-3xl flex flex-col items-center gap-4 transition-all duration-500 ${uploading ? 'bg-white/5 border-primary-600/50' : 'border-white/5 hover:border-primary-600/30 hover:bg-white/5'}`}>
                                {uploading ? (
                                    <div className="loading-spinner"></div>
                                ) : (
                                    <Upload className="w-12 h-12 text-slate-500 group-hover/upload:text-primary-500 group-hover/upload:scale-110 transition-all" />
                                )}
                                <div className="text-center">
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-1">
                                        {uploading ? 'Upload en cours...' : 'Cliquez pour uploader'}
                                    </span>
                                    {!uploading && <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Formats supportés: PDF, Vidéo, Images</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel rounded-3xl border border-white/5 p-8 shadow-2xl shadow-black">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white font-serif uppercase tracking-tight flex items-center gap-3">
                        <FileText className="w-6 h-6 text-primary-600" />
                        Fichiers existants
                    </h2>
                    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {files.length} Éléments
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {files.map(f => (
                        <div key={f.id} className="glass-panel-hover p-5 rounded-2xl border border-white/5 flex items-center justify-between group transition-all">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-bold text-slate-300 truncate uppercase tracking-widest">{f.title}</span>
                            </div>
                            <button onClick={() => handleDelete(f)} className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    {files.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-white/5" />
                            <p className="text-slate-600 font-bold uppercase tracking-widest text-xs italic">Aucun fichier dans cette section.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Files;
