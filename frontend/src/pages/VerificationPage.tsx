import React, { useState } from 'react';
import { apiService, VerificationResponse } from '../services/api';
import './VerificationPage.css';

interface FormField {
  key: string;
  value: string;
}

const VerificationPage: React.FC = () => {
  const [fields, setFields] = useState<FormField[]>([
    { key: 'name', value: '' },
    { key: 'degree', value: '' },
    { key: 'university', value: '' },
    { key: 'year', value: '' }
  ]);
  const [jsonInput, setJsonInput] = useState('');
  const [inputMode, setInputMode] = useState<'form' | 'json'>('form');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [error, setError] = useState<string>('');

  const handleFieldChange = (index: number, type: 'key' | 'value', newValue: string) => {
    const newFields = [...fields];
    newFields[index][type] = newValue;
    setFields(newFields);
  };

  const addField = () => {
    setFields([...fields, { key: '', value: '' }]);
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      const newFields = fields.filter((_, i) => i !== index);
      setFields(newFields);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let credentialData: Record<string, any> = {};

      if (inputMode === 'json') {
        // Parse JSON input
        try {
          credentialData = JSON.parse(jsonInput);
        } catch (err) {
          setError('Invalid JSON format');
          setLoading(false);
          return;
        }
      } else {
        // Convert fields to credential data object
        let hasEmptyFields = false;

        fields.forEach(field => {
          if (!field.key.trim()) {
            hasEmptyFields = true;
            return;
          }
          credentialData[field.key.trim()] = field.value.trim();
        });

        if (hasEmptyFields) {
          setError('Please fill in all field names');
          setLoading(false);
          return;
        }

        if (Object.keys(credentialData).length === 0) {
          setError('Please add at least one field');
          setLoading(false);
          return;
        }
      }

      const response = await apiService.verifyCredential(credentialData);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to verify credential');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFields([
      { key: 'name', value: '' },
      { key: 'degree', value: '' },
      { key: 'university', value: '' },
      { key: 'year', value: '' }
    ]);
    setJsonInput('');
    setResult(null);
    setError('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Verify Credential</h1>
        <p>Check if a credential has been issued and is valid</p>
      </div>

      <div className="card">
        <div className="input-mode-toggle">
          <button
            type="button"
            onClick={() => setInputMode('form')}
            className={`toggle-btn ${inputMode === 'form' ? 'active' : ''}`}
          >
            Form Input
          </button>
          <button
            type="button"
            onClick={() => setInputMode('json')}
            className={`toggle-btn ${inputMode === 'json' ? 'active' : ''}`}
          >
            JSON Input
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {inputMode === 'form' ? (
            <div className="form-section">
              <h3>Credential Data</h3>
              
              {fields.map((field, index) => (
                <div key={index} className="field-row">
                  <input
                    type="text"
                    placeholder="Field name (e.g., name, degree)"
                    value={field.key}
                    onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
                    className="input field-name"
                  />
                  <input
                    type="text"
                    placeholder="Field value"
                    value={field.value}
                    onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                    className="input field-value"
                  />
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="btn-remove"
                    disabled={fields.length === 1}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addField}
                className="btn-secondary"
              >
                + Add Field
              </button>
            </div>
          ) : (
            <div className="form-section">
              <h3>JSON Input</h3>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"name": "John Doe", "degree": "Bachelor of Science", "university": "Test University", "year": "2024"}'
                className="json-input"
                rows={8}
              />
            </div>
          )}

          <div className="button-group">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Verifying...' : 'Verify Credential'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary"
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </form>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className={`alert ${result.status === 'valid' ? 'alert-success' : 'alert-warning'}`}>
            <h4>
              {result.status === 'valid' ? '✅ Valid Credential' : '❌ Invalid Credential'}
            </h4>
            <p><strong>Message:</strong> {result.message}</p>
            
            <div className="credential-details">
              <p><strong>Verified By:</strong> {result.verifiedBy}</p>
              <p><strong>Verified At:</strong> {new Date(result.verifiedAt).toLocaleString()}</p>
              
              {result.status === 'valid' && result.credentialId && (
                <>
                  <p><strong>Credential ID:</strong> <code>{result.credentialId}</code></p>
                  {result.issuedBy && (
                    <p><strong>Originally Issued By:</strong> {result.issuedBy}</p>
                  )}
                  {result.issuedAt && (
                    <p><strong>Issued At:</strong> {new Date(result.issuedAt).toLocaleString()}</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;