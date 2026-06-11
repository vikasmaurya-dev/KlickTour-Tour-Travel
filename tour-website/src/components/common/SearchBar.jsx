import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaMapMarkerAlt, FaHistory, FaMagic } from 'react-icons/fa';
import './SearchBar.css';

const SearchBar = ({
    value,
    onChange,
    onSubmit,
    placeholder = "Where do you want to go?",
    suggestions = [],
    variant = 'standard',
    isLoading = false,
    onSuggestionClick,
    className = "",
    showAIButton = false,
    onAIAction
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputFocus = () => {
        if (suggestions.length > 0 || value) {
            setShowSuggestions(true);
        }
    };

    const handleInputChange = (e) => {
        onChange(e.target.value);
        if (e.target.value || suggestions.length > 0) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (onSubmit) onSubmit(value);
    };

    const handleItemClick = (item) => {
        setShowSuggestions(false);
        if (onSuggestionClick) {
            onSuggestionClick(item);
        } else {
            onChange(typeof item === 'string' ? item : item.name);
        }
    };

    return (
        <div
            ref={containerRef}
            className={`search-bar-container variant-${variant} ${className}`}
        >
            <form onSubmit={handleFormSubmit} className="search-input-wrapper">
                <div className="search-icon">
                    {isLoading ? <div className="search-loading" /> : <FaSearch />}
                </div>

                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    autoComplete="off"
                />

                {value && (
                    <button
                        type="button"
                        className="clear-button"
                        onClick={() => { onChange(''); setShowSuggestions(false); }}
                        style={{ background: 'none', border: 'none', color: (variant === 'hero' || variant === 'hero-input') ? 'rgba(255,255,255,0.52)' : '#999', cursor: 'pointer', marginRight: '10px' }}
                    >
                        <FaTimes />
                    </button>
                )}

                {variant !== 'admin' && variant !== 'hero-input' && (
                    <button type="submit" className="search-button">
                        {variant === 'hero' && showAIButton ? <FaMagic /> : <FaSearch />}
                        <span>{variant === 'hero' && showAIButton ? 'Plan with AI' : 'Search'}</span>
                    </button>
                )}

                {variant === 'admin' && showAIButton && (
                    <button type="button" onClick={onAIAction} className="admin-ai-btn" style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '5px' }}>
                        <FaMagic title="AI Suggestions" />
                    </button>
                )}
            </form>

            <AnimatePresence>
                {showSuggestions && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="suggestions-popover"
                    >
                        {suggestions.length > 0 ? (
                            suggestions.map((item, index) => (
                                <div
                                    key={index}
                                    className="suggestion-item"
                                    onClick={() => handleItemClick(item)}
                                >
                                    <div className="suggestion-icon">
                                        {item.type === 'history' ? <FaHistory /> : <FaMapMarkerAlt />}
                                    </div>
                                    <div className="suggestion-text">
                                        <span className="suggestion-label">{typeof item === 'string' ? item : item.name}</span>
                                        {item.location && <span className="suggestion-sub">{item.location}</span>}
                                    </div>
                                </div>
                            ))
                        ) : value ? (
                            <div className="suggestion-item" onClick={() => handleFormSubmit({ preventDefault: () => { } })}>
                                <div className="suggestion-icon"><FaSearch /></div>
                                <div className="suggestion-text">
                                    <span className="suggestion-label">Search for "{value}"</span>
                                </div>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchBar;
