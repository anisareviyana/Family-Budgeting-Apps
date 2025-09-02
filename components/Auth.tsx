import React, { useState } from 'react';
import Card from './ui/Card';
import type { User } from '../types';
import { dbGetUser, dbSaveUser } from '../utils/db';

interface AuthProps {
  onLoginSuccess: (email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }
    
    try {
      if (isLogin) {
        const user = await dbGetUser(email);
        
        if (user && user.passwordHash === password) {
          const updatedUser = { ...user, lastLogin: new Date().toISOString() };
          await dbSaveUser(updatedUser);
          onLoginSuccess(email);
        } else {
          setError('Invalid email or password.');
        }
      } else {
        const existingUser = await dbGetUser(email);
        if (existingUser) {
          setError('An account with this email already exists.');
          setIsLoading(false);
          return;
        }
        
        const newUser: User = { 
          email, 
          name,
          passwordHash: password, // In a real app, hash this password
          lastLogin: new Date().toISOString()
        };
        await dbSaveUser(newUser);
        onLoginSuccess(email);
      }
    } catch (e) {
        setError('A database error occurred. Please try again.');
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center pt-10">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Login to HomeBudget' : 'Create an Account'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
                disabled={isLoading}
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition disabled:bg-primary-400 dark:disabled:bg-primary-800" disabled={isLoading}>
            {isLoading ? (isLogin ? 'Logging in...' : 'Registering...') : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="ml-2 font-medium text-primary-600 hover:text-primary-500" disabled={isLoading}>
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </Card>
    </div>
  );
};

export default Auth;