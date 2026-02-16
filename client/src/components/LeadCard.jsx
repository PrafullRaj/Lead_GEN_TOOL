import React from 'react';

const LeadCard = ({ lead }) => {
    // Format phone number for WhatsApp (remove spaces, symbols)
    const formatPhoneNumber = (phone) => {
        if (!phone) return null;
        return phone.replace(/[^\d]/g, ''); // Keep only digits
    };

    const whatsappLink = lead.phone ? `https://wa.me/${formatPhoneNumber(lead.phone)}?text=Hi, I found your business '${lead.name}' online and would like to discuss a potential partnership.` : null;

    return (
        <div className="card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{lead.name}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{
                            fontSize: '0.75rem',
                            color: '#fff',
                            backgroundColor: lead.source === 'Google Maps' ? '#4285F4' : lead.source === 'Justdial' ? '#FF9800' : '#FF5722',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '1rem'
                        }}>
                            {lead.source || 'WEB'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>
                            {lead.category}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span>📍</span> {lead.address || 'Address not available'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span>📞</span> {lead.phone || 'Phone not available'}
                </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                {whatsappLink ? (
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ flex: 1, backgroundColor: '#25D366', backgroundImage: 'none' }}>
                        Chat on WhatsApp
                    </a>
                ) : (
                    <button className="btn" disabled style={{ flex: 1, cursor: 'not-allowed', opacity: 0.6, backgroundColor: 'var(--bg-tertiary)' }}>
                        No Phone Number
                    </button>
                )}

                {lead.mapLink && (
                    <a href={lead.mapLink} target="_blank" rel="noopener noreferrer" className="btn" style={{ flex: 1, backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                        View on Maps
                    </a>
                )}
            </div>
        </div>
    );
};

export default LeadCard;
