import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

const DEFAULT_PROFILE = { name: 'Kenneth', role: '管理員' };

export function SettingsProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'TWD');
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'zh-TW');
    const [profile, setProfile] = useState(() => {
        const saved = localStorage.getItem('userProfile');
        return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => { localStorage.setItem('currency', currency); }, [currency]);
    useEffect(() => { localStorage.setItem('language', language); }, [language]);
    useEffect(() => { localStorage.setItem('userProfile', JSON.stringify(profile)); }, [profile]);

    return (
        <SettingsContext.Provider value={{
            darkMode, setDarkMode,
            currency, setCurrency,
            language, setLanguage,
            profile, setProfile,
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
}
