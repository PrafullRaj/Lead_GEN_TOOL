import React, { useState } from 'react';

const SearchForm = ({ onSearch, isLoading }) => {
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query && location) {
            onSearch(query, location);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 className="text-center" style={{ marginBottom: '1.5rem' }}>Find Your Customers</h2>

            <div className="input-group">
                <label className="input-label">Industry / Product</label>
                <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Foundation Bolt Consumers"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                />
            </div>

            <div className="input-group">
                <label className="input-label">Location / Target Area</label>
                <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Bihar"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
                {isLoading ? 'Scraping Data...' : 'Search Leads'}
            </button>
        </form>
    );
};

export default SearchForm;
