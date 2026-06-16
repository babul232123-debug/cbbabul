/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings } from "../types";
import { Train, User, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface DivineHeaderProps {
  settings: AppSettings;
  onEditPhotosClick?: () => void; // Quick link to action section to update
}

export default function DivineHeader({ settings, onEditPhotosClick }: DivineHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#121214] to-[#1a1a1f] py-8 px-4 border-b border-[#2d2d33]">
      
      {/* Dynamic Background Sparkle Lights */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
        <div className="absolute top-4 left-10 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
        <div className="absolute top-20 right-12 w-2 h-2 bg-red-500 rounded-full animate-ping" />
        <div className="absolute bottom-4 left-1/3 w-2.5 h-2.5 bg-amber-600 rounded-full animate-bounce" />
      </div>

      <div className="max-w-2xl mx-auto flex flex-col items-center">
        
        {/* Top Segment: "ব্রজ পরিক্রমা" Heading */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2d2d33] text-[#ffd700] px-5 py-1.5 rounded-full text-xs font-extrabold tracking-wider shadow-md mb-5 font-sans uppercase flex items-center space-x-1.5 border border-[#3d3d45]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ffd700] animate-spin" />
          <span>ব্রজ পরিক্রমা</span>
        </motion.div>

        {/* Triple Divine Images Frame */}
        {/* "মাঝে রাধাকৃষ্ণের ছবির দুইদিকে এডমিন ছবি এবং একটা রিয়েল ছবি এড করা হবে" */}
        <div className="flex items-center justify-center space-x-4 md:space-x-8 mb-6 relative w-full">
          
          {/* LEFT: Admin Image */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-[#ffd700]/60 shadow-[0_4px_12px_rgba(0,0,0,0.5)] bg-[#1e1e24]">
              {settings.adminProfile.photoUrl ? (
                <img 
                  src={settings.adminProfile.photoUrl} 
                  alt="Admin" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-[#2d2d33] text-white">
                  <User className="w-7 h-7" />
                </div>
              )}
            </div>
            <span className="text-[9px] font-bold text-[#e5e5e7] mt-2 bg-[#2d2d33] px-2.5 py-0.5 rounded-full border border-[#3d3d45]/80">
              পরিচালক
            </span>
          </motion.div>

          {/* CENTER: Holy Radha-Krishna */}
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center z-10"
          >
            <div className="relative p-1 bg-gradient-to-tr from-[#ff9933] via-[#ffd700] to-[#ff4500] rounded-3xl shadow-[0_10px_25px_rgba(255,165,0,0.25)]">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-black/20 bg-[#1e1e24]">
                <img 
                  src={settings.realPhoto} 
                  alt="Radha Krishna" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <span className="text-[11px] font-extrabold text-[#ffd700] font-sans mt-2.5 bg-[#2d2d33] px-3 py-1 rounded-full shadow-md border border-[#3d3d45]">
              শ্রী রাধা-মাধব
            </span>
          </motion.div>

          {/* RIGHT: Train/Real Image */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-cyan-500/60 shadow-[0_4px_12px_rgba(0,0,0,0.5)] bg-[#1e1e24]">
              {settings.trainPhoto ? (
                <img 
                  src={settings.trainPhoto} 
                  alt="Train Tour" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-[#2d2d33] text-white">
                  <Train className="w-7 h-7" />
                </div>
              )}
            </div>
            <span className="text-[9px] font-bold text-cyan-400 mt-2 bg-[#2d2d33] px-2.5 py-0.5 rounded-full border border-cyan-900/40">
              রেল যাত্রা
            </span>
          </motion.div>

        </div>

        {/* Master Heading Title */}
        <div className="text-center px-2">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl md:text-3xl font-black text-[#ffd700] tracking-tight font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          >
            চলো ব্রজে যাই, রাধারানীর চরণ পাই
          </motion.h1>

          <p className="text-xs text-[#a1a1aa] font-medium italic mt-1.5">
            "শ্রী রাধা চরণকমল ভজ মন রে"
          </p>
        </div>

        {/* Sacred Sub-head Details Card - Required Text Styling */}
        <div className="mt-5 bg-[#18181b] border border-[#2d2d33] rounded-2xl p-5 text-center max-w-md w-full shadow-xl relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ffd700] text-black text-[9px] font-black px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            शुभ यात्रा विवरण (Journey details)
          </div>
          
          <div className="space-y-2.5 pt-1">
            <p className="text-sm md:text-base text-white font-extrabold font-sans">
              ✨ {settings.journeyDate}
            </p>
            <div className="h-px bg-[#2d2d33] w-2/3 mx-auto" />
            <p className="text-lg md:text-xl text-[#ff9933] font-black tracking-wide font-sans">
              🙏 অর্ঘ্য: <span className="underline decoration-wavy decoration-[#ffd700] text-[#ffd700]">{settings.ticketPrice}</span>
            </p>
            <div className="h-px bg-[#2d2d33] w-2/3 mx-auto" />
            <p className="text-xs md:text-sm text-amber-200/90 font-bold font-sans bg-[#2d2d33]/50 py-1.5 px-3 rounded-lg border border-[#3d3d45]/30">
              🚂 {settings.journeyInfo}
            </p>
          </div>
        </div>

        {/* Quick Edit Overlay Button for Admins */}
        {onEditPhotosClick && (
          <button
            id="quick-image-uploader-link"
            onClick={onEditPhotosClick}
            className="mt-4 text-xs text-[#a1a1aa] hover:text-[#ffd700] underline font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <span>⚙️ ছবি পরিবর্তনের জন্য অ্যাকশন প্যানেলে যান</span>
          </button>
        )}

      </div>
    </div>
  );
}
