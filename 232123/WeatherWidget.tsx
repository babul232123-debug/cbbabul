/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Sun, Cloud, CloudRain, CloudSun, Compass, Thermometer } from "lucide-react";

interface WeatherDay {
  day: string;
  temp: string;
  condition: string;
  icon: "sun" | "cloud" | "rain" | "cloud-sun";
  humidity: string;
}

const HOLY_PLACES_WEATHER: Record<string, WeatherDay[]> = {
  "বৃন্দাবন (Vrindavan)": [
    { day: "সোমবার", temp: "৩৪°C", condition: "রৌদ্রোজ্জ্বল", icon: "sun", humidity: "৪৫%" },
    { day: "মঙ্গলবার", temp: "৩৫°C", condition: "আংশিক মেঘলা", icon: "cloud-sun", humidity: "৫০%" },
    { day: "বুধবার", temp: "৩৩°C", condition: "মেঘলা আকাশ", icon: "cloud", humidity: "৫৫%" },
    { day: "বৃহস্পতিবার", temp: "৩২°C", condition: "বজ্রবিদ্যুৎ সহ বৃষ্টি", icon: "rain", humidity: "৭২%" },
    { day: "শুক্রবার", temp: "৩১°C", condition: "হালকা বৃষ্টি", icon: "rain", humidity: "৬৮%" },
    { day: "শনিবার", temp: "৩৪°C", condition: "মনোরম রোদ", icon: "sun", humidity: "৪৮%" },
    { day: "রবিবার", temp: "৩৫°C", condition: "পরিষ্কার আকাশ", icon: "sun", humidity: "৪০%" },
  ],
  "বারসানা (Barsana)": [
    { day: "সোমবার", temp: "৩৩°C", condition: "ঝকঝকে রোদ", icon: "sun", humidity: "৪২%" },
    { day: "মঙ্গলবার", temp: "৩৪°C", condition: "মনোরম রোদ", icon: "sun", humidity: "৪৪%" },
    { day: "বুধবার", temp: "৩২°C", condition: "আংশিক মেঘলা", icon: "cloud-sun", humidity: "৫২%" },
    { day: "বৃহস্পতিবার", temp: "৩১°C", condition: "ভারী বৃষ্টিপাত", icon: "rain", humidity: "৮০%" },
    { day: "শুক্রবার", temp: "৩০°C", condition: "ঝড়ো হাওয়া ও বৃষ্টি", icon: "rain", humidity: "৭৫%" },
    { day: "শনিবার", temp: "৩৩°C", condition: "হালকা মেঘলা", icon: "cloud-sun", humidity: "৫০%" },
    { day: "রবিবার", temp: "৩৪°C", condition: "স্বচ্ছ মৃদু হাওয়া", icon: "sun", humidity: "৪৫%" },
  ],
  "মথুরা (Mathura)": [
    { day: "সোমবার", temp: "৩৫°C", condition: "তীব্র রোদ", icon: "sun", humidity: "৪০%" },
    { day: "মঙ্গলবার", temp: "৩৬°C", condition: "তীব্র রোদ", icon: "sun", humidity: "৩৯%" },
    { day: "বুধবার", temp: "৩৪°C", condition: "মেঘের আনাগোনা", icon: "cloud-sun", humidity: "৪৮%" },
    { day: "বৃহস্পতিবার", temp: "৩৩°C", condition: "মৌসুমী বৃষ্টি", icon: "rain", humidity: "৭৮%" },
    { day: "শুক্রবার", temp: "৩২°C", condition: "বৃষ্টি ও রোদ", icon: "cloud-sun", humidity: "৭০%" },
    { day: "শনিবার", temp: "৩৪°C", condition: "পরিষ্কার আকাশ", icon: "sun", humidity: "৫০%" },
    { day: "রবিবার", temp: "৩৫°C", condition: "মনোরম রৌদ্র", icon: "sun", humidity: "৪২%" },
  ],
  "গোবর্ধন (Govardhan)": [
    { day: "সোমবার", temp: "৩৪°C", condition: "পরিষ্কার রোদ", icon: "sun", humidity: "৪৪%" },
    { day: "মঙ্গলবার", temp: "৩৫°C", condition: "আংশিক মেঘ", icon: "cloud-sun", humidity: "৪৭%" },
    { day: "বুধবার", temp: "৩৩°C", condition: "ঘন মেঘলা", icon: "cloud", humidity: "৫৮%" },
    { day: "বৃহস্পতিবার", temp: "৩১°C", condition: "পবিত্র গিরিরাজ ধারাবৃষ্টি", icon: "rain", humidity: "৮৫%" },
    { day: "Friday", temp: "৩১°C", condition: "হালকা ঝিরিঝিরি বৃষ্টি", icon: "rain", humidity: "৭২%" },
    { day: "শনিবার", temp: "৩৩°C", condition: "রৌদ্রোজ্জ্বল আকাশ", icon: "sun", humidity: "৫২%" },
    { day: "রবিবার", temp: "৩৪°C", condition: "স্নিগ্ধ রৌদ্রোজ্জ্বল", icon: "sun", humidity: "৪৬%" },
  ],
};

export default function WeatherWidget() {
  const [selectedPlace, setSelectedPlace] = useState("বৃন্দাবন (Vrindavan)");
  const forecast = HOLY_PLACES_WEATHER[selectedPlace] || HOLY_PLACES_WEATHER["বৃন্দাবন (Vrindavan)"];

  const renderIcon = (type: string) => {
    switch (type) {
      case "sun":
        return <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />;
      case "cloud":
        return <Cloud className="w-8 h-8 text-blue-400" />;
      case "rain":
        return <CloudRain className="w-8 h-8 text-cyan-400 animate-pulse" />;
      case "cloud-sun":
      default:
        return <CloudSun className="w-8 h-8 text-amber-400" />;
    }
  };

  return (
    <div id="weather-section-container" className="bg-[#121214] rounded-3xl p-5 border border-[#2d2d33] shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-3 border-b border-[#2d2d33]">
        <div className="flex items-center space-x-2">
          <Thermometer className="w-5 h-5 text-red-500 animate-bounce" />
          <h3 className="text-base font-black text-white font-sans">
            আবহাওয়ার ৭ দিনের পূর্বাভাস (Weather Forecast)
          </h3>
        </div>
        
        {/* Holy Town Selection Dropdown */}
        <select
          id="weather-place-selector"
          value={selectedPlace}
          onChange={(e) => setSelectedPlace(e.target.value)}
          className="mt-2 sm:mt-0 px-3.5 py-1.5 bg-[#18181b] border border-[#2d2d33] text-[#ffd700] font-black text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffd700] font-sans"
        >
          {Object.keys(HOLY_PLACES_WEATHER).map((place) => (
            <option key={place} value={place}>
              📍 {place}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-[#a1a1aa] mb-4 bg-[#18181b] p-3 rounded-xl flex items-center space-x-2 border border-[#2d2d33]">
        <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow shrink-0" />
        <span>ব্রজধামের পবিত্র যাত্রা চলাকালীন আবহাওয়া পর্যবেক্ষণ অত্যন্ত গুরুত্বপূর্ণ। ছাতা সাথে রাখুন।</span>
      </p>

      {/* Grid of 7 Days */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {forecast.map((day, idx) => (
          <div
            id={`weather-day-${idx}`}
            key={day.day}
            className="flex flex-col items-center p-3 rounded-2xl border border-[#2d2d33] bg-gradient-to-b from-[#18181b] to-[#121214] hover:border-[#ffd700]/50 hover:shadow-md transition-all text-center"
          >
            <span className="text-xs font-bold text-[#a1a1aa] mb-1">{day.day}</span>
            <div className="my-2">{renderIcon(day.icon)}</div>
            <span className="text-sm font-black text-white font-sans">{day.temp}</span>
            <span className="text-[10px] text-[#ffd700] font-bold mt-1.5 bg-[#2d2d33] px-2 py-0.5 rounded-full border border-[#3d3d45]/40">{day.condition}</span>
            <span className="text-[9px] text-[#80808a] mt-1.5">আর্দ্রতা: {day.humidity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
