'use client';

import Image from "next/image";
import { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Import Supabase services
import { getCurrentUser, ensureUserAuthenticated, signInWithGoogle } from '@/services/database';

export default function WelcomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          // User is already authenticated, redirect to dashboard
          console.log('User already authenticated, redirecting to dashboard');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuth();
  }, [router]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Note: The redirect will happen automatically via Supabase
      // User will be redirected to /dashboard after successful authentication
    } catch (error) {
      console.error('Error with Google login:', error);
      setGoogleLoading(false);
      // You might want to show an error message to the user here
      alert('Failed to sign in with Google. Please try again.');
    }
  };

  const handleFacebookLogin = async () => {
    setFacebookLoading(true);
    // Facebook login implementation will be added later
    // For now, fall back to anonymous login
    try {
      await ensureUserAuthenticated();
      router.push('/dashboard');
    } catch (error) {
      console.error('Error with Facebook login:', error);
      setFacebookLoading(false);
    }
  };

  const handleLocalLogin = async () => {
    setIsLoading(true);
    try {
      // Use the improved authentication that preserves sessions
      await ensureUserAuthenticated();
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error with local login:', error);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-12">
      {/* App Logo */}
      <div className="w-24 h-24 bg-purple-600 rounded-2xl mb-4 flex items-center justify-center">
        <div className="w-12 h-12 text-white">💪</div>
      </div>

      {/* App Name */}
      <h1 className="text-3xl font-bold mb-2">StrongHabit</h1>
      
      {/* Tagline */}
      <p className="text-gray-400 mb-8">Build strength one rep at a time</p>

      {/* Welcome Message */}
      <h2 className="text-2xl font-semibold mb-2">Welcome to your strength journey</h2>
      <p className="text-gray-400 mb-8">Track your reps, sync across devices.</p>

      {/* Login Options */}
      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full bg-white text-black py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <button
          onClick={handleFacebookLogin}
          disabled={facebookLoading}
          className="w-full bg-[#1877F2] text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#1865F2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {facebookLoading ? (
            <div className="w-5 h-5 border-2 border-blue-300 border-t-white rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          )}
          {facebookLoading ? 'Signing in...' : 'Continue with Facebook'}
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-gray-800 flex-1" />
          <span className="text-gray-500">or</span>
          <div className="h-px bg-gray-800 flex-1" />
        </div>

        <button
          onClick={handleLocalLogin}
          disabled={isLoading}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-purple-300 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Smartphone className="w-5 h-5" />
          )}
          {isLoading ? 'Starting...' : 'Continue Locally'}
        </button>
      </div>

      {/* Terms and Privacy */}
      <p className="text-gray-500 text-sm mt-8 text-center">
        By continuing, you agree to our{' '}
        <a href="/terms" className="text-purple-500 hover:underline">Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" className="text-purple-500 hover:underline">Privacy Policy</a>.
      </p>

      {/* Updated notice */}
      <p className="text-gray-600 text-sm mt-4 text-center">
        {googleLoading ? 'Redirecting to Google...' : 'Sign in to sync your data across devices.'}
      </p>
    </main>
  );
}
