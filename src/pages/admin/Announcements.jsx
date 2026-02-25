import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Bell, Mic, StopCircle, Play, Pause, Upload, Volume2, Type, Music, Image as ImageIcon, X } from 'lucide-react';

function Announcements() {
    const [levels, setLevels] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState('');
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [mode, setMode] = useState('text'); // 'text' or 'audio'
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState('');
    const [imageBlob, setImageBlob] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchLevels();
    }, []);

    useEffect(() => {
        if (selectedLevel) fetchAnnouncements(selectedLevel);
    }, [selectedLevel]);

    async function fetchLevels() {
        const { data } = await supabase.from('levels').select('*').order('name');
        setLevels(data || []);
        if (data?.length > 0) setSelectedLevel(data[0].id);
        setLoading(false);
    }

    async function fetchAnnouncements(lvlId) {
        const { data } = await supabase.from('announcements').select('*').eq('level_id', lvlId).order('created_at', { ascending: false });
        setAnnouncements(data || []);
    }

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
            };

            recorder.start();
            setMediaRecorder(recorder);
            setRecording(true);
        } catch (err) {
            console.error('Error recording:', err);
            alert('Veuillez autoriser l\'accès au micro');
        }
    }

    function stopRecording() {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setRecording(false);
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('audio/')) {
            setAudioBlob(file);
            setAudioUrl(URL.createObjectURL(file));
        } else {
            alert('Veuillez sélectionner un fichier audio valide');
        }
    }

    function handleImageSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setImageBlob(file);
            setImageUrl(URL.createObjectURL(file));
        } else {
            alert('Veuillez sélectionner une image valide');
        }
    }

    async function handleAdd(e) {
        e.preventDefault();
        if (mode === 'text' && !content) return;
        if (mode === 'audio' && !audioBlob) return;

        setIsUploading(true);
        try {
            let finalAudioUrl = null;
            let finalImageUrl = null;

            if (mode === 'audio' && audioBlob) {
                const fileName = `ann-${Date.now()}.webm`;
                const { error: uploadError } = await supabase.storage
                    .from('platform-files')
                    .upload(`announcements/${fileName}`, audioBlob);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('platform-files')
                    .getPublicUrl(`announcements/${fileName}`);

                finalAudioUrl = publicUrl;
            }

            if (imageBlob) {
                const fileName = `img-${Date.now()}-${imageBlob.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('platform-files')
                    .upload(`announcements/${fileName}`, imageBlob);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('platform-files')
                    .getPublicUrl(`announcements/${fileName}`);

                finalImageUrl = publicUrl;
            }

            const { error } = await supabase.from('announcements').insert([{
                level_id: selectedLevel,
                title: 'Annonce',
                content: mode === 'text' ? content : 'Note vocale',
                audio_url: finalAudioUrl,
                image_url: finalImageUrl
            }]);

            if (error) throw error;

            setContent('');
            setAudioBlob(null);
            setAudioUrl('');
            setImageBlob(null);
            setImageUrl('');
            fetchAnnouncements(selectedLevel);
        } catch (err) {
            console.error('Error adding announcement:', err);
            alert('Erreur: ' + (err.message || 'Une erreur est survenue lors de l\'ajout'));
        } finally {
            setIsUploading(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
        try {
            const { error } = await supabase.from('announcements').delete().eq('id', id);
            if (error) throw error;
            fetchAnnouncements(selectedLevel);
            alert('Supprimée avec succès');
        } catch (error) {
            console.error('Error deleting announcement:', error.message);
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
        <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-700">
            <div className="glass-panel p-8 rounded-3xl border border-white/5 flex items-center gap-6 shadow-2xl shadow-black relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Bell className="w-32 h-32" />
                </div>
                <div className="w-14 h-14 bg-primary-600/20 border border-primary-600/30 rounded-2xl flex items-center justify-center text-primary-500 relative z-10">
                    <Bell className="w-7 h-7" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold text-white font-serif uppercase tracking-tight">Flash <span className="text-primary-600">Infos</span></h1>
                    <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">Gérez les annonces du site</p>
                </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-xl shadow-black">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Sélectionnez le niveau</label>
                <select
                    value={selectedLevel}
                    onChange={e => setSelectedLevel(e.target.value)}
                    className="w-full bg-white/5 p-4 rounded-2xl border border-white/5 text-white outline-none focus:border-primary-600 transition-all font-medium"
                >
                    {levels.map(l => (
                        <option key={l.id} value={l.id} className="bg-slate-900">{l.name}</option>
                    ))}
                </select>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => setMode('text')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all ${mode === 'text' ? 'bg-primary-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                >
                    <Type className="w-5 h-5" />
                    <span>Texte</span>
                </button>
                <button
                    onClick={() => setMode('audio')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all ${mode === 'audio' ? 'bg-primary-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                >
                    <Mic className="w-5 h-5" />
                    <span>Audio</span>
                </button>
            </div>

            <form onSubmit={handleAdd} className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6 shadow-xl shadow-black">
                {mode === 'text' ? (
                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Message de l'annonce</label>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Écrivez votre annonce ici..."
                            className="w-full bg-white/5 p-6 rounded-2xl border border-white/5 text-white outline-none focus:border-primary-600 transition-all placeholder:text-slate-600 min-h-[120px]"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 gap-6 w-full">
                        {!audioUrl ? (
                            <div className="flex flex-col items-center gap-6 w-full">
                                <div className="flex gap-8 items-center">
                                    <button
                                        type="button"
                                        onClick={recording ? stopRecording : startRecording}
                                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${recording ? 'bg-red-600 animate-pulse scale-110 shadow-lg shadow-red-900/50' : 'bg-white/5 hover:bg-primary-600 group'}`}
                                    >
                                        {recording ? <StopCircle className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-slate-400 group-hover:text-white" />}
                                    </button>

                                    {!recording && (
                                        <>
                                            <div className="w-px h-12 bg-white/10"></div>
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById('audio-upload').click()}
                                                className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary-600 group transition-all"
                                            >
                                                <Music className="w-6 h-6 text-slate-400 group-hover:text-white" />
                                            </button>
                                            <input
                                                id="audio-upload"
                                                type="file"
                                                accept="audio/*"
                                                className="hidden"
                                                onChange={handleFileSelect}
                                            />
                                        </>
                                    )}
                                </div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                                    {recording ? 'Enregistrement en cours...' : 'Enregistrer un message ou importer un fichier'}
                                </p>
                            </div>
                        ) : (
                            <div className="w-full space-y-4 text-center">
                                <div className="flex items-center justify-center gap-4">
                                    <audio src={audioUrl} controls className="w-full max-w-sm rounded-full bg-white/5 accent-primary-600" />
                                    <button
                                        type="button"
                                        onClick={() => { setAudioBlob(null); setAudioUrl(''); }}
                                        className="p-3 text-white/50 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">
                                    Fichier prêt à l'envoi
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Optional Image Upload */}
                <div className="pt-4 border-t border-white/5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-4 flex items-center gap-2">
                        <ImageIcon className="w-3 h-3" />
                        Image (Optionnel)
                    </label>
                    <div className="flex gap-4 items-center">
                        {!imageUrl ? (
                            <button
                                type="button"
                                onClick={() => document.getElementById('image-upload').click()}
                                className="w-full h-20 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 hover:border-primary-600/50 hover:text-primary-500 transition-all bg-white/2"
                            >
                                <ImageIcon className="w-6 h-6 mb-1" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Ajouter une image</span>
                            </button>
                        ) : (
                            <div className="relative w-full h-32 rounded-2xl overflow-hidden group">
                                <img src={imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                <button
                                    type="button"
                                    onClick={() => { setImageBlob(null); setImageUrl(''); }}
                                    className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageSelect}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isUploading || (mode === 'text' ? !content : !audioBlob)}
                    className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUploading ? 'Chargement...' : 'Publier l\'annonce'}
                </button>
            </form>

            <div className="space-y-4">
                {announcements.map(a => (
                    <div key={a.id} className="glass-panel p-6 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-primary-600/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                            <div className="flex flex-col gap-2">
                                <p className="font-medium text-slate-200">{a.content}</p>
                                {a.image_url && (
                                    <img src={a.image_url} alt="Announce" className="w-32 h-20 object-cover rounded-lg border border-white/10" />
                                )}
                                {a.audio_url && (
                                    <div className="mt-1">
                                        <audio src={a.audio_url} controls className="h-8 max-w-[200px] opacity-60 hover:opacity-100 transition-opacity" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <button onClick={() => handleDelete(a.id)} className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>
                ))}
                {announcements.length === 0 && (
                    <div className="text-center py-20 glass-panel rounded-3xl border border-dashed border-white/5">
                        <Bell className="w-12 h-12 mx-auto mb-4 text-white/5" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Aucune annonce pour ce niveau.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Announcements;
