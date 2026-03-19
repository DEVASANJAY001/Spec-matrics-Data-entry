'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, ChevronsUpDown, Loader2, Plus, History } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getRecentEntries, saveRecentEntry } from '@/lib/recent-entries';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type Option = any;

interface AutocompleteProps {
    value: string;
    onChange: (value: string, option?: any) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    apiUrl: string;
    extraParams?: Record<string, string>;
    onCreateNew?: (name: string) => void;
    renderOption?: (option: any) => React.ReactNode;
    className?: string;
    disabled?: boolean;
}

export default function Autocomplete({
    value,
    onChange,
    placeholder = "Search...",
    label,
    required = false,
    apiUrl,
    extraParams = {},
    onCreateNew,
    renderOption,
    className,
    disabled = false
}: AutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const [options, setOptions] = useState<Option[]>([]);
    const [recentEntries, setRecentEntries] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load recent entries on mount and whenever label changes
    useEffect(() => {
        setRecentEntries(getRecentEntries(label || ''));
    }, [label]);

    // Stringify extraParams for stable dependency check
    const extraParamsString = React.useMemo(() => JSON.stringify(extraParams), [extraParams]);

    const fetchOptions = useCallback(async (searchQuery: string) => {
        if (!searchQuery) {
            setOptions([]);
            return;
        }

        setIsLoading(true);
        try {
            const currentParams = JSON.parse(extraParamsString);
            const params = new URLSearchParams({ q: searchQuery, ...currentParams });
            const res = await fetch(`${apiUrl}?${params.toString()}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                setOptions(data);
            } else {
                console.warn('Autocomplete received non-array data:', data);
                setOptions([]);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setOptions([]);
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, extraParamsString]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query !== value && isOpen) {
                fetchOptions(query);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, fetchOptions, value, isOpen]);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionName: string, option?: any) => {
        saveRecentEntry(label || 'Search', optionName);
        onChange(optionName, option);
        setQuery(optionName);
        setIsOpen(false);
    };

    const normalizedQuery = query.trim().toLowerCase();
    const exactMatch = Array.isArray(options) ? options.find(o => {
        const optionName = (o.name || o['Code'] || o['Part Name'] || '').toString().toLowerCase();
        return optionName === normalizedQuery;
    }) : null;
    const showCreateOption = query.trim().length > 0 && !exactMatch;

    // Determine what to show in the dropdown
    const showRecent = isOpen && query.trim().length === 0 && recentEntries.length > 0;
    const showOptions = isOpen && (query.trim().length > 0 || options.length > 0);

    return (
        <div className="flex flex-col gap-1.5 w-full relative" ref={containerRef}>
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative group/input">
                <input
                    type="text"
                    className={cn(
                        "w-full px-3 py-1.5 sm:py-2 bg-white border rounded-lg outline-none transition-all duration-200",
                        "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
                        "placeholder:text-gray-400 text-gray-900 text-xs sm:text-sm",
                        "hover:border-gray-300 uppercase",
                        disabled && "opacity-50 cursor-not-allowed bg-gray-50",
                        className
                    )}
                    placeholder={placeholder}
                    value={query}
                    disabled={disabled}
                    onChange={(e) => {
                        if (disabled) return;
                        const val = e.target.value.toUpperCase();
                        setQuery(val);
                        setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (disabled) return;
                        setIsOpen(true);
                        // Refresh recent entries on focus
                        setRecentEntries(getRecentEntries(label || ''));
                    }}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400 pointer-events-none">
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : !disabled && <ChevronsUpDown className="w-3 h-3" />}
                </div>
            </div>

            {isOpen && (showRecent || showOptions) && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.15)] py-1.5 z-[110] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    {showRecent && (
                        <div className="mb-1">
                            <div className="px-3 py-1 text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <History className="w-2.5 h-2.5" />
                                Recent Entries
                            </div>
                            <div className="max-h-48 overflow-auto px-1 scrollbar-hide">
                                {recentEntries.map((entry) => (
                                    <button
                                        key={`recent-${entry}`}
                                        onClick={() => handleSelect(entry, entry)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3 sm:px-2.5 sm:py-1.5 text-sm sm:text-xs rounded-lg transition-all text-left mb-0.5 min-h-[44px] sm:min-h-0",
                                            "hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100",
                                            value === entry ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                                        )}
                                    >
                                        <span className="truncate pr-3">{entry}</span>
                                        {value === entry && <Check className="w-4 h-4 sm:w-3 sm:h-3 flex-shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {showOptions && (
                        <>
                            {options.length > 0 ? (
                                <div className="max-h-48 overflow-auto px-1 scrollbar-hide">
                                    {options.map((opt, i) => (
                                        <button
                                            key={opt._id || i}
                                            onClick={() => handleSelect(opt.name || opt['Code'] || opt['Part Name'], opt)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-4 py-3 sm:px-2.5 sm:py-1.5 text-sm sm:text-xs rounded-lg transition-all text-left mb-0.5 min-h-[44px] sm:min-h-0",
                                                "hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100",
                                                value === (opt.name || opt['Code'] || opt['Part Name']) ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                                            )}
                                        >
                                            {renderOption ? (
                                                renderOption(opt)
                                            ) : (
                                                <>
                                                    <span className="truncate pr-3">{opt.name || opt['Code'] || opt['Part Name']}</span>
                                                    {value === (opt.name || opt['Code'] || opt['Part Name']) && <Check className="w-4 h-4 sm:w-3 sm:h-3 flex-shrink-0" />}
                                                </>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : !isLoading && !showCreateOption && (
                                <div className="px-3 py-3 text-[10px] text-gray-400 text-center italic">
                                    No matches
                                </div>
                            )}

                            {showCreateOption && (
                                <div className="border-t border-gray-50 mt-1 pt-1 px-1">
                                    <button
                                        onClick={() => handleSelect(query)}
                                        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all text-left"
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                        <span className="truncate">Create <span className="text-blue-800">"{query}"</span></span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
