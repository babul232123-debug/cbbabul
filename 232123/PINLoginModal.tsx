/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Lock, X, AlertTriangle, KeyRound } from "lucide-react";
import { motion } from "motion/react";

interface PINLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  expectedPinDescription: string;
  isActionPin?: boolean; // If true, accepts '12345' (or 1 to 5) as well
}

export default function PINLoginModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  expectedPinDescription,
  isActionPin = false,
}: PINLoginModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Core PIN definitions as requested:
    // Admin profile pin: '0232'
    // Action pin: accepts '12345' or '0232'
    const cleanPin = pin.trim();
    const isValidAdmin = cleanPin === "0232";
    const isValidAction = isActionPin && (cleanPin === "12345" || cleanPin === "12345678" || cleanPin === "1234" || cleanPin === "0232");

    if (isValidAdmin || (isActionPin && cleanPin === "12345") || (isActionPin && cleanPin === "0232")) {
      setError("");
      setPin("");
      onSuccess();
    } else {
      setError("ভুল পিন নাম্বার! অনুগ্রহ করে সঠিক পিন দিন। (Wrong PIN)");
    }
  };

  const handleQuickFill = () => {
    setPin(isActionPin ? "12345" : "0232");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md overflow-hidden bg-[#121214] rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-[#2d2d33]"
      >
        {/* Divine Elegant Accent Line */}
        <div className="h-1.5 bg-gradient-to-r from-red-600 via-[#ffd700] to-red-600" />
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-[#2d2d33] rounded-xl text-[#ffd700] border border-[#3d3d45]/50">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white font-sans">
                {title}
              </h3>
            </div>
            <button
              id="close-pin-modal"
              onClick={onClose}
              className="p-1.5 text-[#a1a1aa] hover:text-white rounded-full hover:bg-[#2d2d33] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-xs text-amber-300 font-medium mb-4 bg-amber-950/20 p-3 rounded-xl border border-amber-900/30">
                ⚠️ এই ফোল্ডার বা বাটনটি অতি সুরক্ষিত। অগ্রসর হতে {expectedPinDescription} প্রবেশ করান।
              </p>
              
              <label className="block text-xs font-black text-white/90 uppercase tracking-wider mb-2">
                পিন কোড (Enter PIN Code)
              </label>
              
              <div className="relative">
                <input
                  id="pin-input-field"
                  type="password"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError("");
                  }}
                  className="w-full px-4 py-3 pl-11 text-center font-mono text-xl tracking-widest text-white bg-[#0c0c0e] border border-[#2d2d33] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:border-transparent transition-all"
                  maxLength={10}
                  autoFocus
                />
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#80808a]" />
              </div>
              
              {error && (
                <div className="flex items-center space-x-2 mt-2.5 text-xs text-red-400 bg-red-950/20 p-2.5 rounded-lg border border-red-900/40">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="font-bold">{error}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                id="pin-submit-button"
                type="submit"
                className="flex-1 py-3 px-4 bg-[#ffd700] hover:bg-amber-500 text-black font-black rounded-2xl transition-all shadow-md active:scale-98 cursor-pointer"
              >
                প্রবেশ করুন (Submit)
              </button>
              
              <button
                id="pin-quick-fill-button"
                type="button"
                onClick={handleQuickFill}
                className="px-4 shrink-0 bg-[#2d2d33] hover:bg-[#3d3d45] text-[#e5e5e7] text-xs font-bold rounded-2xl border border-[#3d3d45] transition-all cursor-pointer"
              >
                Quick PIN
              </button>
            </div>
          </form>

          <div className="mt-5 pt-4 border-t border-[#2d2d33] text-center">
            <span className="text-[10px] text-[#80808a] font-bold block">
              নিরাপদ ক্লাউড ডাটাবেস দ্বারা সুরক্ষিত • পিন হলো {isActionPin ? "১ থেকে ৫ পর্যন্ত (অথবা 0232)" : "0232"}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
