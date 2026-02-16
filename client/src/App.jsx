import React, { useState } from 'react';
import SearchForm from './components/SearchForm';
import ResultsList from './components/ResultsList';
import './index.css';

function App() {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchLeads = async (query, location) => {
    setIsLoading(true);
    setError(null);
    setLeads([]);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, location }),
      });

      const data = await response.json();

      if (data.success) {
        setLeads(data.data);
      } else {
        setError(data.error || 'Failed to fetch leads.');
      }
    } catch (err) {
      setError('Network error. Ensure the backend server is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="text-center" style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
          LeadGen Pro <span style={{ fontSize: '1rem', color: '#666' }}>v2.0</span>
        </h1>
        <p className="text-secondary" style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>
          Find B2B Consumers & Connect Instantly
        </p>
      </header>

      <main>
        <SearchForm onSearch={searchLeads} isLoading={isLoading} />

        {error && (
          <div className="card text-center animate-fade-in" style={{ marginTop: '1rem', borderColor: 'var(--error-color)', color: 'var(--error-color)' }}>
            {error}
          </div>
        )}

        <ResultsList leads={leads} />
      </main>
    </div>
  );
}

export default App;
