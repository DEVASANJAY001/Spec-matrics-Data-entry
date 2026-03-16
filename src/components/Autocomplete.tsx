'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, ChevronsUpDown, Loader2, Plus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Option {
    _id?: string;
    name: string;
}

interface AutocompleteProps {
    label: string;
    placeholder: string;
    apiUrl: string;
    value: string;
    onChange: (value: string) => void;
    extraParams?: Record<string, string>;
    required?: boolean;
}

export default function Autocomplete({
    label,
    placeholder,
    apiUrl,
    value,
    onChange,
    extraParams = {},
    required = false,
}: AutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const [options, setOptions] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Stringify extraParams for stable dependency check
    const extraParamsString = JSON.stringify(extraParams);

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

    const handleSelect = (option: string) => {
        onChange(option);
        setQuery(option);
        setIsOpen(false);
    };

    const normalizedQuery = query.trim().toLowerCase();
    const exactMatch = Array.isArray(options) ? options.find(o => o.name.toLowerCase() === normalizedQuery) : null;
    const showCreateOption = query.trim().length > 0 && !exactMatch;

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
                        "hover:border-gray-300"
                    )}
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400 pointer-events-none">
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronsUpDown className="w-3 h-3" />}
                </div>
            </div>

            {isOpen && (query.trim().length > 0 || options.length > 0) && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    {options.length > 0 ? (
                        <div className="max-h-48 overflow-auto px-1 scrollbar-hide">
                            {options.map((opt) => (
                                <button
                                    key={opt._id || opt.name}
                                    onClick={() => handleSelect(opt.name)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-2.5 py-1.5 text-xs sm:text-sm rounded-lg transition-all text-left mb-0.5",
                                        "hover:bg-blue-50 hover:text-blue-700",
                                        value === opt.name ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                                    )}
                                >
                                    <span className="truncate pr-3">{opt.name}</span>
                                    {value === opt.name && <Check className="w-3 h-3 flex-shrink-0" />}
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
                </div>
            )}
        </div>
    );
}
