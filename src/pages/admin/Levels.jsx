import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, FolderPlus, Layers } from 'lucide-react';

function Levels() {
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLevel, setCurrentLevel] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', is_active: true });

    useEffect(() => {
        fetchLevels();
    }, []);

    async function fetchLevels() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('levels')
                .select(`
          *,
          groups ( count )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLevels(data || []);
        } catch (error) {
            console.error('Error fetching levels:', error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            if (currentLevel) {
                const { error } = await supabase.from('levels').update(formData).eq('id', currentLevel.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('levels').insert([formData]);
                if (error) throw error;
            }
            setIsModalOpen(false);
            fetchLevels();
        } catch (error) {
            console.error('Error saving level:', error.message);
            alert('Une erreur est survenue lors de l\'enregistrement');
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce niveau ? Cela supprimera tous les groupes et fichiers associés.')) return;
        try {
            const { error } = await supabase.from('levels').delete().eq('id', id);
            if (error) throw error;
            fetchLevels();
            alert('Supprimé avec succès');
        } catch (error) {
            console.error('Error deleting level:', error);
            alert('Erreur lors de la suppression : ' + error.message);
        }
    }

    const openModal = (level = null) => {
        if (level) {
            setCurrentLevel(level);
            setFormData({ name: level.name, description: level.description || '', is_active: level.is_active });
        } else {
            setCurrentLevel(null);
            setFormData({ name: '', description: '', is_active: true });
        }
        setIsModalOpen(true);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="loading-spinner"></div>
            <p className="text-slate-500 text-xs font-bold tracking-widest uppercase animate-pulse">Chargement...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl shadow-black relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Layers className="w-32 h-32" />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 bg-primary-600/20 rounded-2xl flex items-center justify-center text-primary-500 border border-primary-600/30">
                        <Layers className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white font-serif tracking-tight uppercase">Niveaux <span className="text-primary-600">Académiques</span></h1>
                        <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">Gérez vos niveaux d'enseignement (ex: SMP1)</p>
                    </div>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-2xl hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-900/20 relative z-10"
                >
                    <Plus className="w-5 h-5" />
                    <span>Ajouter un niveau</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {levels.map((level) => (
                    <div key={level.id} className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-primary-600/30 transition-all shadow-xl shadow-black relative group overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">{level.name}</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => openModal(level)} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(level.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        {level.description && <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed uppercase tracking-widest">{level.description}</p>}

                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                            <span className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest">
                                <FolderPlus className="w-4 h-4" />
                                {level.groups?.[0]?.count || 0} Groupes
                            </span>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${level.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                {level.is_active ? 'Actif' : 'Inactif'}
                            </span>
                        </div>
                    </div>
                ))}
                {levels.length === 0 && (
                    <div className="col-span-full text-center py-20 glass-panel rounded-3xl border border-dashed border-white/10 bg-black/40">
                        <Layers className="w-16 h-16 mx-auto mb-4 text-white/5" />
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Aucun niveau trouvé. Comencez par en ajouter un.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
                    <div className="glass-panel border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
                        <div className="p-8 border-b border-white/5 bg-white/5">
                            <h2 className="text-xl font-bold text-white uppercase tracking-widest">{currentLevel ? 'Modifier le niveau' : 'Nouveau niveau'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nom du niveau (ex: SMP 1)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 rounded-2xl border border-white/5 px-6 py-4 text-white focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="Entrez le nom du niveau..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Description (optionnel)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white/5 rounded-2xl border border-white/5 px-6 py-4 text-white focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10 outline-none min-h-[100px] transition-all"
                                    placeholder="Détails du niveau..."
                                />
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 group">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 accent-primary-600 bg-white/10 border-white/10 rounded-lg cursor-pointer"
                                />
                                <label htmlFor="isActive" className="text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer select-none">Niveau Actif</label>
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button type="submit" className="flex-1 bg-primary-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/10">
                                    Enregistrer
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white/5 text-slate-400 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Levels;
