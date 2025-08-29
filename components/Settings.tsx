import React from 'react';
import Card from './ui/Card';
import type { Settings } from '../types';
import { CURRENCIES } from '../constants';

interface SettingsProps {
  settings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
}

const SettingsPage: React.FC<SettingsProps> = ({ settings, onSettingsChange }) => {
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({ ...settings, currency: e.target.value });
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="space-y-4 max-w-sm">
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Currency
          </label>
          <select
            id="currency"
            value={settings.currency}
            onChange={handleCurrencyChange}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Choose the currency for displaying all financial values.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SettingsPage;
