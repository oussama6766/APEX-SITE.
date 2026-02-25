import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Settings as SettingsIcon, Save, Lock, AlertCircle, CheckCircle2, Mail } from 'lucide-react';

function Settings() {
    const [settings, setSettings] = useState({ timetable_url: '', site_title: 'المنصة التعليمية' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Auth state
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [authSaving, setAuthSaving] = useState(false);
    const [authError, setAuthError] = useState('');
    const [authSuccess, setAuthSuccess] = useState('');

    useEffect(() => {
        fetchSettings();
        // Fetch current user email
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setNewEmail(user.email);
        };
        getUser();
    }, []);

    async function fetchSettings() {
        try {
            const { data, error } = await supabase.from('settings').select('*').limit(1).single();
            if (error && error.code !== 'PGRST116') throw error;
            if (data) setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        try {
            if (settings.id) {
                const { error } = await supabase.from('settings').update({
                    site_title: settings.site_title,
                    timetable_url: settings.timetable_url
                }).eq('id', settings.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('settings').insert([{
                    site_title: settings.site_title,
                    timetable_url: settings.timetable_url
                }]);
                if (error) throw error;
            }
            alert('Paramètres enregistrés avec succès');
            fetchSettings();
        } catch (error) {
            console.error('Error saving settings:', error.message);
            alert('Erreur lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    }

    async function handleAuthUpdate(e) {
        e.preventDefault();
        setAuthError('');
        setAuthSuccess('');

        // Prepare update object
        const updates = {};

        if (newEmail) {
            updates.email = newEmail;
        }

        if (newPassword) {
            if (newPassword !== confirmPassword) {
                setAuthError('كلمات المرور غير متطابقة');
                return;
            }
            if (newPassword.length < 6) {
                setAuthError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
                return;
            }
            updates.password = newPassword;
        }

        if (Object.keys(updates).length === 0) return;

        setAuthSaving(true);
        try {
            const { error } = await supabase.auth.updateUser(updates);

            if (error) throw error;

            if (updates.email && updates.password) {
                setAuthSuccess('تم تحديث البريد وكلمة المرور بنجاح (راجع بريدك لتأكيد التغيير إذا لزم الأمر)');
            } else if (updates.email) {
                setAuthSuccess('تم تحديث البريد بنجاح (راجع بريدك الجديد لتأكيد التغيير)');
            } else {
                setAuthSuccess('تم تغيير كلمة المرور بنجاح');
            }

            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error updating auth:', error.message);
            setAuthError(error.message || 'خطأ أثناء التحديث');
        } finally {
            setAuthSaving(false);
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="loading-spinner"></div>
            <p className="text-slate-500 text-xs font-bold tracking-widest uppercase animate-pulse">Chargement...</p>
        </div>
    );

    return (
        <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in duration-700 pb-12">
            <div className="glass-panel p-8 rounded-3xl border border-white/5 flex items-center gap-6 shadow-2xl shadow-black relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <SettingsIcon className="w-32 h-32" />
                </div>
                <div className="w-14 h-14 bg-primary-600/20 border border-primary-600/30 rounded-2xl flex items-center justify-center text-primary-500 relative z-10">
                    <SettingsIcon className="w-7 h-7" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold text-white font-serif uppercase tracking-tight">Paramètres <span className="text-primary-600">Généraux</span></h1>
                    <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">Configurez les infos de base du site</p>
                </div>
            </div>

            {/* General Settings Form */}
            <form onSubmit={handleSubmit} className="glass-panel p-10 rounded-3xl border border-white/5 shadow-xl shadow-black space-y-8">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4 text-primary-600" />
                    Informations du site
                </h3>

                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 px-1">Titre de la plateforme</label>
                    <input
                        type="text"
                        required
                        value={settings.site_title || ''}
                        onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                        className="w-full bg-white/5 rounded-2xl border border-white/5 px-6 py-4 text-white focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10 outline-none transition-all placeholder:text-slate-600 font-medium"
                        placeholder="Ex: Platform APEX"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 px-1">Lien de l'Emploi du Temps (URL)</label>
                    <input
                        type="url"
                        value={settings.timetable_url || ''}
                        onChange={(e) => setSettings({ ...settings, timetable_url: e.target.value })}
                        className="w-full bg-white/5 rounded-2xl border border-white/5 px-6 py-4 text-white focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10 outline-none transition-all placeholder:text-slate-600 font-medium text-left"
                        placeholder="https://example.com/emploi.pdf"
                    />
                </div>

                <div className="pt-4 border-t border-white/5">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-3 bg-primary-600 text-white px-8 py-4 rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center font-bold uppercase tracking-widest"
                    >
                        <Save className="w-5 h-5" />
                        <span>{saving ? 'Enregistrement...' : 'Sauvegarder les modifications'}</span>
                    </button>
                </div>
            </form>

            {/* Account Security (Email & Password Change) */}
            <form onSubmit={handleAuthUpdate} className="glass-panel p-10 rounded-3xl border border-white/5 shadow-xl shadow-black space-y-8">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary-600" />
                    Sécurité du compte
                </h3>

                {authError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold transition-all" dir="rtl">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{authError}</p>
                    </div>
                )}

                {authSuccess && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-500 text-xs font-bold transition-all" dir="rtl">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <p>{authSuccess}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 px-1">البريد الإلكتروني (Gmail)</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-600 group-focus-within:text-primary-500 transition-colors">
                                <Mail className="h-4 w-4" />
                            </div>
                            <input
                                type="email"
                                required
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="w-full bg-white/5 rounded-2xl border border-white/5 px-11 py-4 text-white focus:border-primary-600 outline-none transition-all placeholder:text-slate-600 font-medium"
                                placeholder="votre@gmail.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                        <div className="md:col-span-2">
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2 px-1">تغيير كلمة المرور (اختياري)</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 px-1">كلمة المرور الجديدة</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-white/5 rounded-2xl border border-white/5 px-6 py-4 text-white focus:border-primary-600 outline-none transition-all placeholder:text-slate-600 font-medium font-sans"
                                placeholder="6 أحرف على الأقل"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 px-1">تأكيد كلمة المرور</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-white/5 rounded-2xl border border-white/5 px-6 py-4 text-white focus:border-primary-600 outline-none transition-all placeholder:text-slate-600 font-medium font-sans"
                                placeholder="أعد الكتابة"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <button
                        type="submit"
                        disabled={authSaving}
                        className="flex items-center gap-3 bg-white/5 text-white px-8 py-4 rounded-2xl hover:bg-white/10 transition-all border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center font-bold uppercase tracking-widest"
                    >
                        <Lock className="w-5 h-5 text-primary-600" />
                        <span>{authSaving ? 'Mise à jour...' : 'Sauvegarder les informations d\'accès'}</span>
                    </button>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-4 text-center">
                        ملاحظة: عند تغيير البريد، ستصلك رسالة تأكيد على البريد الجديد.
                    </p>
                </div>
            </form>
        </div>
    );
}

export default Settings;
