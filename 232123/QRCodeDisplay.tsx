/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { QrCode, ShieldCheck, RefreshCw, Smartphone } from "lucide-react";

interface QRCodeDisplayProps {
  passenger: {
    id: string;
    name: string;
    mobile: string;
    totalFare: string;
    advance: string;
    due: string;
  };
  journeyDate: string;
  journeyInfo: string;
  adminName: string;
}

export default function QRCodeDisplay({
  passenger,
  journeyDate,
  journeyInfo,
  adminName,
}: QRCodeDisplayProps) {
  const [qrSrc, setQrSrc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let active = true;
    setLoading(true);

    const generateCode = async () => {
      try {
        // Build a robust, highly-compatible validation string
        // Includes detailed metadata and a quick-scan login link
        const verificationUrl = `${window.location.origin}/?phone=${encodeURIComponent(passenger.mobile)}`;
        
        const payload = [
          `🕉️ ব্রজ পরিক্রমা যাচাইকরণ 🕉️`,
          `মেমো নং: #BM-BRJ-2026${passenger.id.slice(-3)}`,
          `যাত্রী: ${passenger.name}`,
          `মোবাইল: ${passenger.mobile}`,
          `মোট ভাড়া: ৳${passenger.totalFare}`,
          `অগ্রিম জমা: ৳${passenger.advance}`,
          `বাকি অর্ঘ্য: ৳${passenger.due}`,
          `যাত্রা: ${journeyDate}`,
          `গাইড: ${adminName}`,
          `লিংক: ${verificationUrl}`
        ].join("\n");

        // Generate QR code using the installed library
        const dataUrl = await QRCode.toDataURL(payload, {
          errorCorrectionLevel: "M",
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
          width: 180,
        });

        if (active) {
          setQrSrc(dataUrl);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("QR Generation failed", err);
        if (active) {
          setError("QR কোড তৈরি করা সম্ভব হয়নি");
          setLoading(false);
        }
      }
    };

    generateCode();

    return () => {
      active = false;
    };
  }, [passenger, journeyDate, adminName]);

  return (
    <div className="flex flex-col items-center bg-white border border-[#2d2d33]/15 rounded-2xl p-4 shadow-sm w-full max-w-[240px] mx-auto text-center">
      <div className="flex items-center space-x-1 mb-2 text-emerald-700 font-extrabold text-[10px] tracking-wide uppercase">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        <span>গাইড মেমো ভেরিফিকেশন</span>
      </div>

      <div className="relative border-4 border-amber-500/20 rounded-xl p-1 bg-white mb-2 shadow-inner group transition-transform duration-200">
        {loading ? (
          <div className="w-[180px] h-[180px] flex flex-col items-center justify-center space-y-2 text-gray-500 bg-gray-50 rounded-lg">
            <RefreshCw className="w-6 h-6 animate-spin text-[#ffd700]" />
            <span className="text-[10px] font-bold">জেনারেট হচ্ছে...</span>
          </div>
        ) : error ? (
          <div className="w-[180px] h-[180px] flex items-center justify-center text-red-500 font-bold text-xs bg-red-50 p-2 text-center rounded-lg">
            {error}
          </div>
        ) : (
          <div className="relative">
            <img
              src={qrSrc}
              alt="Verification QR Code"
              className="w-[180px] h-[180px] object-contain block mx-auto"
            />
            
            {/* Tiny spiritual overlay emblem in center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full border border-amber-500 shadow-md">
              <span className="text-[10px] font-black text-amber-600 font-sans leading-none block select-none">ॐ</span>
            </div>
          </div>
        )}
      </div>

      <p className="text-[9px] text-[#a1a1aa] font-black leading-snug flex items-center justify-center space-x-1">
        <Smartphone className="w-3" />
        <span>মোবাইল ক্যামেরা দিয়ে স্ক্যান করুন</span>
      </p>
      
      <p className="text-[8px] text-gray-400 font-bold mt-1 max-w-[170px] leading-tight-none border-t border-gray-100 pt-1">
        Verify ID: #BM-BRJ-{passenger.id.slice(-6).toUpperCase()}
      </p>
    </div>
  );
}
