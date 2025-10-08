import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders navigation', () => {
  render(<App />);
  const brandElement = screen.getByText(/Kube Credential/i);
  expect(brandElement).toBeInTheDocument();
});

test('renders issue credential link', () => {
  render(<App />);
  const issueLink = screen.getByText(/Issue Credential/i);
  expect(issueLink).toBeInTheDocument();
});

test('renders verify credential link', () => {
  render(<App />);
  const verifyLink = screen.getByText(/Verify Credential/i);
  expect(verifyLink).toBeInTheDocument();
});