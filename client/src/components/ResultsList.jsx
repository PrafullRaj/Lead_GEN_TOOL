import React from 'react';
import LeadCard from './LeadCard';

const Section = ({ title, results, color }) => {
    if (!results || results.length === 0) return null;

    return (
        <div className="animate-fade-in" style={{ marginBottom: '3rem' }}>
            <h2 style={{
                borderBottom: `2px solid ${color}`,
                paddingBottom: '0.5rem',
                marginBottom: '1.5rem',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <span style={{ backgroundColor: color, width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>
                {title}
                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal', marginLeft: 'auto' }}>
                    {results.length} results
                </span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {results.map((lead, index) => (
                    <LeadCard key={index} lead={lead} />
                ))}
            </div>
        </div>
    );
};

const ResultsList = ({ leads }) => {
    if (!leads || leads.length === 0) {
        return (
            <div className="text-center animate-fade-in" style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>
                <p>No results found yet. Try searching for a business category and location.</p>
            </div>
        );
    }

    // Group by source
    const googleLeads = leads.filter(l => l.source === 'Google Maps');
    const justdialLeads = leads.filter(l => l.source === 'Justdial');
    const indiamartLeads = leads.filter(l => l.source === 'IndiaMART');
    const otherLeads = leads.filter(l => !['Google Maps', 'Justdial', 'IndiaMART'].includes(l.source));

    return (
        <div style={{ marginTop: '2rem' }}>
            <Section title="Google Maps / Local" results={googleLeads} color="#4285F4" />
            <Section title="Justdial" results={justdialLeads} color="#FF9800" />
            <Section title="IndiaMART" results={indiamartLeads} color="#FF5722" />
            <Section title="Other Sources" results={otherLeads} color="#9E9E9E" />
        </div>
    );
};

export default ResultsList;
