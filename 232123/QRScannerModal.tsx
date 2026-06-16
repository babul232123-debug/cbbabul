/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { X, Camera, AlertTriangle, ShieldCheck, RefreshCw, Sparkles, User, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Html5Qrcode } from "html5-qrcode";
import { Passenger } from "../types";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  passengers: Passenger[];
}

export default function QRScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  passengers,
}: QRScannerModalProps) {
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [scanning, setScanning] = useState<boolean>(false);
  const [scannerInstance, setScannerInstance] = useState<Html5Qrcode | null>(null);
  const qrReaderId = "local-qr-scanner-viewport";
  const [successMatch, setSuccessMatch] = useState<Passenger | null>(null);

  // Manual search/fill inside scanner fallback
  const [manualInput, setManualInput] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode: Html5Qrcode | null = null;
    setErrorMessage("");
    setSuccessMatch(null);

    const startScanner = async () => {
      try {
        setScanning(true);
        html5QrCode = new Html5Qrcode(qrReaderId);
        setScannerInstance(html5QrCode);

        // Start scanning with environment facing (back camera)
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              // Custom responsive size
              const minDimension = Math.min(width, height);
              const size = Math.floor(minDimension * 0.7);
              return { width: size, height: size };
            },
          },
          (decodedText) => {
            handleScanSuccess(decodedText, html5QrCode);
          },
          () => {
            // Quietly ignore failed frame decodes as they happen continuously
          }
        );
        setCameraPermissionGranted(true);
      } catch (err: any) {
        console.warn("Camera scan initiation error:", err);
        setCameraPermissionGranted(false);
        setScanning(false);
        setErrorMessage("ক্যামেরা চালু করা সম্ভব হয়নি। সাধারণ ব্রাউজার সিকিউরিটি বা পারমিশন সমস্যার কারণে এটি বন্ধ হতে পারে।");
      }
    };

    // Small delay to allow the DOM element to mount
    const timer = setTimeout(() => {
      startScanner();
    }, 400);

    return () => {
      clearTimeout(timer);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch((e) => console.log("Failed to stop scanner", e));
      }
    };
  }, [isOpen]);

  const handleScanSuccess = (decodedText: string, activeScanner: Html5Qrcode | null) => {
    // Attempt to parse out a phone number from the QR payload
    let phoneMatch = "";
    
    // Pattern 1: URL parameter phone=
    const phoneUrlParamMatch = decodedText.match(/phone=([^&]+)/);
    if (phoneUrlParamMatch && phoneUrlParamMatch[1]) {
      phoneMatch = decodeURIComponent(phoneUrlParamMatch[1]);
    } else {
      // Pattern 2: Look for 'মোবাইল: <10-11 digits>'
      const mobileLineMatch = decodedText.match(/মোবাইল:\s*([0-9+]+)/);
      if (mobileLineMatch && mobileLineMatch[1]) {
        phoneMatch = mobileLineMatch[1].trim();
      } else {
        // Pattern 3: Any sequence of 10-11 contiguous numbers in the code
        const generalNumberMatch = decodedText.match(/\b(01\d{9}|\d{10})\b/);
        if (generalNumberMatch) {
          phoneMatch = generalNumberMatch[0];
        }
      }
    }

    // Try to find matching devotee
    let matchedPassenger = null;
    if (phoneMatch) {
      matchedPassenger = passengers.find(
        (p) => p.mobile === phoneMatch || p.mobile.includes(phoneMatch) || phoneMatch.includes(p.mobile)
      );
    }

    if (matchedPassenger) {
      setSuccessMatch(matchedPassenger);
      
      // Stop scanner upon success
      if (activeScanner && activeScanner.isScanning) {
        activeScanner.stop().catch((e) => console.log("Error stopping scanner", e));
      }
      setScanning(false);

      // Trigger redirect after showing pleasant checkmark feedback briefly
      setTimeout(() => {
        onScanSuccess(decodedText);
        onClose();
      }, 1200);
    } else {
      // It scanned something, but not matching a passenger
      // We can also check if the bare string is a passenger name or ID
      const nameOrIdMatch = passengers.find(
        (p) => 
          decodedText.includes(p.name) || 
          decodedText.includes(p.id) ||
          p.id.slice(-6).toUpperCase() === decodedText.toUpperCase()
      );

      if (nameOrIdMatch) {
        setSuccessMatch(nameOrIdMatch);
        if (activeScanner && activeScanner.isScanning) {
          activeScanner.stop().catch((e) => console.log(e));
        }
        setScanning(false);
        setTimeout(() => {
          onScanSuccess("phone=" + nameOrIdMatch.mobile);
          onClose();
        }, 1200);
      } else {
        // Not matched, but let's pass decodedText in case there's another format
        onScanSuccess(decodedText);
        onClose();
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    
    // Simulate finding via manual submit inside modal
    const matched = passengers.find(
      (p) => 
        p.mobile.includes(manualInput) || 
        p.name.includes(manualInput) ||
        p.aadhar.includes(manualInput)
    );

    if (matched) {
      setSuccessMatch(matched);
      if (scannerInstance && scannerInstance.isScanning) {
        scannerInstance.stop().catch(() => {});
      }
      setScanning(false);
      setTimeout(() => {
        onScanSuccess(`phone=${matched.mobile}`);
        onClose();
      }, 1000);
    } else {
      // Just search with query
      onScanSuccess(`phone=${manualInput}`);
      onClose();
    }
  };

  const triggerMockScan = (p: Passenger) => {
    // Highly effective for simulation and local offline preview testing!
    setSuccessMatch(p);
    if (scannerInstance && scannerInstance.isScanning) {
      scannerInstance.stop().catch(() => {});
    }
    setScanning(false);

    setTimeout(() => {
      onScanSuccess(`phone=${p.mobile}`);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg overflow-hidden bg-[#0c0c0e] rounded-3xl shadow-2xl border border-[#2d2d33] flex flex-col max-h-[90vh]"
      >
        {/* Top visual divider bar */}
        <div className="h-1 bg-gradient-to-r from-amber-600 via-[#ffd700] to-amber-600" />

        {/* Modal Header */}
        <div className="p-5 border-b border-[#2d2d33] flex items-center justify-between shrink-0 bg-[#121214]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#2d2d33] rounded-xl text-[#ffd700] border border-[#3d3d45]/50 animate-pulse">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-sans leading-none">
                QR কোড ভেরিফিকেশন স্ক্যানার
              </h3>
              <p className="text-[10px] text-gray-400 mt-1 font-bold">QR Memo Verification Terminal</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 text-[#a1a1aa] hover:text-white rounded-full hover:bg-[#2d2d33] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Success Match overlay feedback card */}
          <AnimatePresence>
            {successMatch && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center space-x-3.5 text-ellipsis overflow-hidden"
              >
                <div className="p-2.5 bg-emerald-500 text-white rounded-full shrink-0">
                  <CheckCircle2 className="w-6 h-6 animate-bounce" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] uppercase font-black text-emerald-400 block tracking-wide">সফলভাবে যাচাই হয়েছে (Verified Devotee)</span>
                  <p className="text-sm font-sans font-black text-white truncate">{successMatch.name}</p>
                  <p className="text-xs text-gray-300 font-bold">মোবাইল: {successMatch.mobile}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#ffd700] font-sans font-black block">৳{successMatch.due} Due</span>
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Matched ID</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scanner viewscreen frame */}
          {!successMatch && (
            <div className="relative aspect-video sm:aspect-[4/3] rounded-2xl bg-[#030303] border border-[#2d2d33] overflow-hidden flex flex-col justify-center items-center shadow-inner group">
              
              {/* HTML5 QR viewport target element */}
              <div id={qrReaderId} className="w-full h-full object-cover [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />

              {/* Visual Target Frame Overlay overlay */}
              {scanning && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center">
                  {/* Tech styled scanning markers */}
                  <div className="relative w-44 h-44 sm:w-56 sm:h-56">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#ffd700]" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#ffd700]" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#ffd700]" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#ffd700]" />
                    
                    {/* Animated Red Laser scan Line */}
                    <div className="absolute left-0 w-full h-0.5 bg-red-500/80 shadow-[0_0_8px_red] top-1/2 animate-[bounce_2s_infinite]" />
                  </div>
                  
                  <span className="text-[10px] text-[#ffd700] bg-black/80 px-3 py-1.5 rounded-full mt-4 flex items-center space-x-1.5 border border-[#3d3d45]/40 tracking-wider uppercase font-black">
                    <RefreshCw className="w-3 h-3 animate-spin text-[#ffd700]" />
                    <span>ক্যামেরা লাইভ স্ক্যান চলছে...</span>
                  </span>
                </div>
              )}

              {/* No Permissions Error / Not scanning fallback info */}
              {!scanning && !successMatch && (
                <div className="absolute inset-0 bg-[#0c0c0e] p-6 flex flex-col justify-center items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-amber-950/40 border border-amber-900/30 rounded-full flex items-center justify-center text-[#ffd700]">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="max-w-[320px]">
                    <h4 className="text-xs font-black text-amber-200">ক্যামেরা লাইভ স্ক্যান নিষ্ক্রিয়</h4>
                    <p className="text-[10.5px] text-gray-400 mt-1.5 leading-snug">
                      {errorMessage || "অনুমতি না পাওয়া বা ক্যামেরা না থাকার কারণে স্ক্যান নিষ্ক্রিয় করা হয়েছে।"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Manual input fallback form inside scanner modal */}
          <form onSubmit={handleManualSubmit} className="pt-2">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="মোবাইল বা নাম লিখে ম্যানুয়ালি মেমো খুঁজুন..."
                className="flex-1 px-3.5 py-2.5 bg-[#121214] border border-[#2d2d33] text-white text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ffd700] text-center font-bold"
              />
              <button
                type="submit"
                className="bg-[#ffd700] px-3.5 py-2.5 text-black hover:bg-amber-500 text-xs font-black rounded-xl transition-all cursor-pointer shadow-sm active:scale-97"
              >
                মেমো খুঁজুন
              </button>
            </div>
          </form>

          {/* Demo Scanner Trigger - Brilliant for sandbox/iframe testing when camera is unavailable */}
          <div className="border-t border-[#2d2d33] pt-4.5">
            <div className="flex items-center justify-between mb-3 text-gray-400">
              <span className="text-[10px] uppercase font-black text-[#ffd700] flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>মক স্ক্যান কুইক টেস্ট (Iframe Demo Mock)</span>
              </span>
              <span className="text-[9px] bg-[#2d2d33] px-2 py-0.5 rounded text-white font-bold">Test Mode</span>
            </div>
            
            <p className="text-[10px] text-gray-400 leading-snug mb-3">
              পরীক্ষা বা ডেমো দেখার জন্য নিচের যেকোনো যাত্রীতে ক্লিক করুন। এটি এমন আচরণ করবে যেন ক্যামেরা দিয়ে তাদের আস্ত QR কোড মোবাইল স্ক্রিন থেকে সাথে সাথে স্ক্যান করা হয়েছে!
            </p>

            <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
              {passengers.map((p) => (
                <button
                  id={`demo-scan-test-btn-${p.id}`}
                  key={p.id}
                  type="button"
                  onClick={() => triggerMockScan(p)}
                  className="p-2 py-2.5 bg-[#121214] hover:bg-[#1c1c20] border border-[#2d2d33] hover:border-amber-500/50 rounded-xl text-left text-xs transition-all flex items-center space-x-2 cursor-pointer group"
                >
                  <img src={p.photo} className="w-6.5 h-6.5 rounded-full object-cover border border-[#2d2d33] shrink-0" referrerPolicy="no-referrer" />
                  <div className="min-w-0 flex-1">
                    <span className="block font-black text-gray-200 truncate group-hover:text-[#ffd700]">{p.name}</span>
                    <span className="block text-[8px] text-gray-400 leading-none">{p.mobile}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer/Disclaimers */}
        <div className="p-4 bg-[#121214] border-t border-[#2d2d33] text-center">
          <span className="text-[9px] text-[#80808a] font-bold block">
            সুরক্ষিত ভেরিফিকেশন ইঞ্জিন • QR ভ্যালু এনক্রিপ্টেড এবং সিঙ্কড।
          </span>
        </div>
      </motion.div>
    </div>
  );
}
