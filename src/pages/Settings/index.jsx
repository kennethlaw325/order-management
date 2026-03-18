import { useState } from 'react';
import { Sun, Moon, User, Globe, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input } from '../../components/ui';
import { useSettings } from '../../contexts/SettingsContext';

const LANGUAGES = [
    { value: 'zh-TW', label: '繁體中文' },
    { value: 'zh-CN', label: '简体中文' },
    { value: 'en', label: 'English' },
];

const CURRENCIES = [
    { value: 'TWD', label: 'NT$ (新台幣)' },
    { value: 'HKD', label: 'HK$ (港幣)' },
    { value: 'USD', label: 'US$ (美元)' },
    { value: 'CNY', label: '¥ (人民幣)' },
];

function ThemeOption({ icon: Icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                active
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-500'
                    : 'border-border hover:border-zinc-300 dark:hover:border-zinc-600'
            }`}
        >
            <Icon className={`h-6 w-6 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'}`} />
            <span className={`text-sm font-medium ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-foreground'}`}>{label}</span>
        </button>
    );
}

function Settings() {
    const { darkMode, setDarkMode, currency, setCurrency, language, setLanguage, profile, setProfile } = useSettings();
    const [saved, setSaved] = useState(false);

    const handleSaveProfile = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-2xl space-y-6">
            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        外觀設定
                    </CardTitle>
                    <CardDescription>選擇系統顯示主題</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                        <ThemeOption icon={Sun} label="淺色模式" active={!darkMode} onClick={() => setDarkMode(false)} />
                        <ThemeOption icon={Moon} label="深色模式" active={darkMode} onClick={() => setDarkMode(true)} />
                    </div>
                </CardContent>
            </Card>

            {/* Profile */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        個人資料
                    </CardTitle>
                    <CardDescription>設定顯示名稱及角色</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">顯示名稱</label>
                        <Input
                            value={profile.name}
                            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                            placeholder="輸入名稱"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">角色</label>
                        <Input
                            value={profile.role}
                            onChange={e => setProfile(p => ({ ...p, role: e.target.value }))}
                            placeholder="輸入角色"
                        />
                    </div>
                    <Button onClick={handleSaveProfile}>
                        {saved ? '已儲存' : '儲存資料'}
                    </Button>
                </CardContent>
            </Card>

            {/* System */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        系統設定
                    </CardTitle>
                    <CardDescription>語言及貨幣格式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">語言</label>
                        <div className="flex gap-2">
                            {LANGUAGES.map(lang => (
                                <button
                                    key={lang.value}
                                    onClick={() => setLanguage(lang.value)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                                        language === lang.value
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-muted text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                    }`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">貨幣格式</label>
                        <div className="flex flex-wrap gap-2">
                            {CURRENCIES.map(cur => (
                                <button
                                    key={cur.value}
                                    onClick={() => setCurrency(cur.value)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                                        currency === cur.value
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-muted text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                    }`}
                                >
                                    {cur.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* About */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        關於
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">系統名稱</span>
                            <span className="font-medium">OMS Pro</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">版本</span>
                            <span className="font-medium">1.0.0</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">技術架構</span>
                            <span className="font-medium">React + Express + SQLite</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default Settings;
