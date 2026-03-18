export const getRecentEntries = (label: string): string[] => {
    if (typeof window === 'undefined') return [];
    const key = `recent_${label.toLowerCase().replace(/\s+/g, '_')}`;
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    try {
        return JSON.parse(saved);
    } catch (e) {
        return [];
    }
};

export const saveRecentEntry = (label: string, value: string) => {
    if (typeof window === 'undefined' || !value.trim()) return;
    const key = `recent_${label.toLowerCase().replace(/\s+/g, '_')}`;
    const recent = getRecentEntries(label);

    // Add to front, remove duplicates, limit to 5
    const updated = [value, ...recent.filter(item => item !== value)].slice(0, 5);
    localStorage.setItem(key, JSON.stringify(updated));
};
