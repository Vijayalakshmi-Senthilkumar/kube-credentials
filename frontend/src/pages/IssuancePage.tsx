import React, { useState } from 'react';
import { apiService, IssuanceResponse } from '../services/api';
import './IssuancePage.css';

interface FormField {
  key: string;
  value: string;
}

const IssuancePage: React.FC = () => {
  const [fields, setFields] = useState<FormField[]>([
    { key: 'name', value: '' },
    { key: 'degree', value: '' },
    { key: 'university', value: '' },
    { key: 'year', value: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IssuanceResponse | null>(null);
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
      // Convert fields to credential data object
      const credentialData: Record<string, any> = {};
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

      const response = await apiService.issueCredential(credentialData);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to issue credential');
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
    setResult(null);
    setError('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Issue Credential</h1>
        <p>Create and issue new credentials to the blockchain</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
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

          <div className="button-group">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Issuing...' : 'Issue Credential'}
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
          <div className={`alert ${result.success ? 'alert-success' : 'alert-error'}`}>
            <h4>{result.alreadyIssued ? '⚠️ Already Issued' : '✅ Success'}</h4>
            <p><strong>Message:</strong> {result.message}</p>
            
            {result.credential && (
              <div className="credential-details">
                <p><strong>Credential ID:</strong> <code>{result.credential.id}</code></p>
                <p><strong>Issued By:</strong> {result.credential.issuedBy}</p>
                <p><strong>Issued At:</strong> {new Date(result.credential.issuedAt).toLocaleString()}</p>
                <details>
                  <summary><strong>Credential Data</strong></summary>
                  <pre>{JSON.stringify(result.credential.data, null, 2)}</pre>
                </details>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuancePage;