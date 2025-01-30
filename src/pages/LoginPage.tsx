import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NikeLogo } from "../components/NikeLogo";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen nike-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="glass-effect rounded-2xl p-8 nike-shadow">
          <div className="text-center mb-8">
            <div className="inline-block p-3 rounded-full bg-white/10 mb-4 animate-scale-in">
              <NikeLogo className="h-12 w-auto text-white transform transition-transform hover:scale-110" />
            </div>
            <h2
              className="text-3xl font-bold text-white mb-2 animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              Welcome Back
            </h2>
            <p
              className="text-gray-300 animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              Sign in to access your admin portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="animate-shake bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div
              className="space-y-4 animate-slide-up"
              style={{ animationDelay: "300ms" }}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full nike-input bg-white/10 border-white/10 text-white placeholder-gray-400
                           focus:bg-white/20 focus:border-white/30"
                  placeholder="you@nike.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full nike-input bg-white/10 border-white/10 text-white placeholder-gray-400
                           focus:bg-white/20 focus:border-white/30"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full nike-button bg-white text-black hover:bg-gray-100 animate-slide-up"
              style={{ animationDelay: "400ms" }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="loading-spinner border-black/10 border-t-black"></div>
                  <span className="ml-2">Signing in...</span>
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
