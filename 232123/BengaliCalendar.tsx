/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Calendar, CircleAlert, Sparkles, Star } from "lucide-react";

interface PonjikaDate {
  gregorianDate: number;
  bengaliDay: string;
  tithi: string;
  festival?: string;
  isEkadashi?: boolean;
  isPurnima?: boolean;
  isAmavasya?: boolean;
  significance?: string;
}

const PONJIKA_DATA: Record<string, PonjikaDate[]> = {
  "আশ্বিন (Ashwin)": [
    { gregorianDate: 17, bengaliDay: "১", tithi: "প্রতিপদ", significance: "মহালয়া শারদীিয়া দুর্গোৎসব আরম্ভ" },
    { gregorianDate: 18, bengaliDay: "২", tithi: "দ্বিতীয়া", festival: "মহামায়া পূজা আরম্ভ" },
    { gregorianDate: 19, bengaliDay: "৩", tithi: "তৃতীয়া", significance: "শুভ পরিক্রমা ক্যাম্প প্রস্তুতি" },
    { gregorianDate: 20, bengaliDay: "৪", tithi: "চতুর্থী", festival: "শুভযাত্রা ব্রজধাম (যাত্রা প্রারম্ভ)", significance: "যাত্রী শুভ সমাবেশ ও যাত্রা সূচনা" },
    { gregorianDate: 21, bengaliDay: "৫", tithi: "পঞ্চমী", festival: "বেলতলা পূজা", significance: "কলকাতায় বিশেষ সংকীর্তন" },
    { gregorianDate: 22, bengaliDay: "৬", tithi: "ষষ্ঠী", festival: "শ্রীশারদীয়া দুর্গোৎসব ষষ্ঠী বিহিত পূজা" },
    { gregorianDate: 23, bengaliDay: "৭", tithi: "সপ্তমী", festival: "দুর্গোৎসব মহাসপ্তমী পূজা" },
    { gregorianDate: 24, bengaliDay: "৮", tithi: "অষ্টমী", festival: "মহাষ্টমী পূজা ও সন্ধিপূজা", isEkadashi: false },
    { gregorianDate: 25, bengaliDay: "৯", tithi: "নবমী", festival: "মহানবমী পূজা ও যজ্ঞহোম" },
    { gregorianDate: 26, bengaliDay: "১০", tithi: "দশমী", festival: "বিজয়া দশমী ও প্রতিমা নিরঞ্জন", significance: "অপরাজিতা পূজা ও সিঁদুর খেলা" },
    { gregorianDate: 27, bengaliDay: "১১", tithi: "একাদশী", festival: "শুভ পাপাঙ্কুশা একাদশী ব্রত", isEkadashi: true, significance: "যাত্রীদের ব্রজধামে সম্পূর্ণ উপবাস পালন" },
    { gregorianDate: 28, bengaliDay: "১২", tithi: "দ্বাদশী", significance: "একাদশী উপবাস ভঙ্গ সকাল ৫:৪৫ - ৯:৩০" },
    { gregorianDate: 29, bengaliDay: "১৩", tithi: "ত্রয়োদশী", significance: "শ্রী রাধাকুণ্ডের পথে ভক্ত সমাগম" },
    { gregorianDate: 30, bengaliDay: "১৪", tithi: "চতুর্দশী", significance: "কোচাগরী লক্ষ্মী পূজা প্রস্তুতি" },
    { gregorianDate: 31, bengaliDay: "১৫", tithi: "পূর্ণিমা", festival: "শ্রীশ্রীকোজাগরী লক্ষ্মীপূজা", isPurnima: true, significance: "রাত্রিব্যাপী জাগরণ ও লক্ষ্মী বন্দনা" },
  ],
  "ভাদ্র (Bhadra)": [
    { gregorianDate: 4, bengaliDay: "১৮", tithi: "অষ্টমী", festival: "শুভ জন্মাষ্টমী ব্রত", isEkadashi: false, significance: "ভগবান শ্রীকৃষ্ণের পবিত্র আবির্ভাব তিথি" },
    { gregorianDate: 5, bengaliDay: "১৯", tithi: "নবমী", festival: "শ্রী নন্দোৎসব", significance: "ব্রজের প্রধান উৎসব - দধি দোল ও आनंद লহরী" },
    { gregorianDate: 12, bengaliDay: "২৬", tithi: "একাদশী", festival: "অজা একাদশী ব্রত", isEkadashi: true },
    { gregorianDate: 16, bengaliDay: "৩০", tithi: "অষ্টমী", festival: "শ্রী রাধাষ্টমী মহাশুভ ব্রত", significance: "আমাদের প্রাণের আরাধ্যা শ্রীমতি রাধারাণীর মধুর আবির্ভাব তিথি, বারসানা ধামে মহোৎসব" },
  ]
};

export default function BengaliCalendar() {
  const [selectedMonth, setSelectedMonth] = useState("আশ্বিন (Ashwin)");
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(3); // Default to our Shubhojatra day!

  const dates = PONJIKA_DATA[selectedMonth] || [];
  const activeDay = dates[selectedDayIdx];

  return (
    <div id="calendar-section" className="bg-[#121214] rounded-3xl p-5 border border-[#2d2d33] shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-3 border-b border-[#2d2d33]">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-[#ffd700] animate-pulse" />
          <h3 className="text-base font-black text-white font-sans">
            বাংলা ক্যালেন্ডার ও পঞ্জিকা (Bengali Calendar & Ponjika)
          </h3>
        </div>

        <div className="mt-2 sm:mt-0 flex space-x-2">
          {Object.keys(PONJIKA_DATA).map((month) => (
            <button
              id={`month-selector-${month}`}
              key={month}
              onClick={() => {
                setSelectedMonth(month);
                setSelectedDayIdx(0);
              }}
              className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                selectedMonth === month
                  ? "bg-[#ffd700] text-black shadow-md font-bold"
                  : "bg-[#2d2d33] hover:bg-[#3d3d45] text-[#a1a1aa]"
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Days Circle Grid */}
        <div className="md:col-span-2">
          <p className="text-[11px] text-[#a1a1aa] font-semibold mb-3.5 italic">
            * পঞ্জিকার যেকোনো তারিখে ক্লিক করে তিথি, ব্রত বা উৎসবের বিস্তারিত আলোচনা দেখুন:
          </p>
          
          <div className="grid grid-cols-5 gap-2">
            {dates.map((day, idx) => {
              const isSelected = selectedDayIdx === idx;
              return (
                <button
                  id={`ponjika-day-button-${idx}`}
                  key={idx}
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl cursor-pointer border transition-all ${
                    isSelected
                      ? "bg-[#ffd700] text-black border-[#ffd700] shadow-md scale-102 font-black"
                      : day.isEkadashi
                      ? "bg-yellow-500/10 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/20"
                      : day.isPurnima
                      ? "bg-orange-500/10 text-orange-300 border-orange-500/30 hover:bg-orange-500/20"
                      : "bg-[#18181b] text-[#e5e5e7] border-[#2d2d33] hover:bg-[#2d2d33]"
                  }`}
                >
                  {/* Subtle Top badge/dot for festivals */}
                  {(day.festival || day.isEkadashi) && (
                    <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  )}
                  
                  <span className="text-base font-black font-sans">{day.bengaliDay}</span>
                  <span className="text-[9px] opacity-70 font-bold">{day.tithi}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Panel */}
        {activeDay && (
          <div className="bg-gradient-to-br from-[#18181b]/80 to-[#121214] rounded-2xl p-4 border border-[#2d2d33] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-[#ffd700] bg-[#2d2d33] px-2.5 py-0.5 rounded-full font-sans border border-[#3d3d45]/60">
                  বাংলা {activeDay.bengaliDay}ই {selectedMonth.split(" ")[0]}
                </span>
                {activeDay.isEkadashi && (
                  <span className="flex items-center space-x-1 text-[9px] font-black text-red-400 bg-red-950/40 p-1.5 rounded-full border border-red-900/30 animate-bounce">
                    <Star className="w-2.5 h-2.5 fill-red-400" />
                    <span>একাদশী</span>
                  </span>
                )}
                {activeDay.isPurnima && (
                  <span className="text-[9px] font-black text-orange-400 bg-orange-950/40 p-1.5 rounded-full border border-orange-900/30">
                    🌕 পূর্ণিমা
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[9px] text-[#80808a] uppercase tracking-wider block font-bold">চন্দ্রের তিথি</span>
                  <h4 className="text-sm font-extrabold text-white font-sans">
                    শ্রীমৎ {activeDay.tithi} তিথি
                  </h4>
                </div>

                {activeDay.festival && (
                  <div className="bg-[#ff4500]/10 border border-red-900/40 p-2.5 rounded-xl">
                    <span className="text-[9px] text-red-400 font-bold uppercase block">উৎসব / পার্বণ</span>
                    <span className="text-xs font-bold text-orange-300 leading-tight">
                      🎉 {activeDay.festival}
                    </span>
                  </div>
                )}

                {activeDay.significance && (
                  <div>
                    <span className="text-[9px] text-[#80808a] uppercase tracking-wider block font-bold block">দিনের গুরুত্ব</span>
                    <p className="text-xs text-[#a1a1aa] font-medium leading-relaxed bg-[#2d2d33]/30 p-2.5 rounded-xl border border-[#3d3d45]/30">
                      📜 {activeDay.significance}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#2d2d33] text-[9px] text-[#a1a1aa] flex items-center space-x-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#ffd700] animate-spin-slow" />
              <span>শ্রী রাধারাণী পরিক্রমা ক্যাম্প নির্দেশিকা</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
