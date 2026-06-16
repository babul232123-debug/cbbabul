/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Calendar, MapPin, Compass, ChevronDown, ChevronUp, Sparkles, 
  Clock, Footprints, AlertCircle, Eye, Flower2, Heart, Sunset
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ItineraryDay {
  day: number;
  titleBN: string;
  titleEN: string;
  locationBN: string;
  locationEN: string;
  descBN: string;
  descEN: string;
  timeBN: string;
  timeEN: string;
  activityBN: string;
  activityEN: string;
  tipsBN: string;
  tipsEN: string;
  iconName: "Compass" | "Calendar" | "Footprints" | "Flower2" | "Heart" | "Sunset" | "Sparkles";
  color: string;
  bgGlow: string;
}

interface TourTimelineProps {
  lang: "BN" | "EN";
  onAskAI?: (prompt: string) => void;
}

const ITINERARY_DATA: ItineraryDay[] = [
  {
    day: 1,
    titleBN: "প্রথম দিন: মথুরায় আগমন ও শ্রীকৃষ্ণ জন্মভূমি দর্শন",
    titleEN: "Day 1: Arrival in Mathura & Janmabhoomi Darshanam",
    locationBN: "দ্বারকাধীশ জীর মন্দির ও পবিত্র জন্মভূমি",
    locationEN: "Dwarkadhish Temple & Janmabhoomi",
    descBN: "মথুরা রেলওয়ে জংশনে সকল ভক্তদের আনন্দময় অভ্যর্থনার মধ্য দিয়ে পবিত্র পরিক্রমার সূচনা। এরপর মথুরার আদি শ্রীকৃষ্ণ জন্মস্থান মন্দির দর্শন ও দ্বারকাধীশ জীর মন্দির পরিক্রমা শেষ করে প্রথম রাতের ভক্তিপূর্ণ বিশ্রাম ক্যাম্প।",
    descEN: "Warm and traditional reception at Mathura railway junction. Visit the sacred birthplace of Lord Krishna (Janmabhoomi Complex) and perform parikrama of the beautiful Sri Dwarkadhish Temple, ending the day with holy evening rest camp.",
    timeBN: "সকাল ৯:০০ - সন্ধ্যা ৮:৩০",
    timeEN: "09:00 AM - 08:30 PM",
    activityBN: "মঙ্গলাময় শঙ্খধ্বনি, সংকল্প গ্রহণ ও সন্ধ্যার যমুনা আরতি মহোৎসব দর্শন।",
    activityEN: "Sacred conch-blowing ceremony, parikrama vow commitment, and evening Yamuna Arati darshan.",
    tipsBN: "মোবাইল ও ক্যামেরা মন্দির প্রাঙ্গণে সম্পূর্ণ নিষিদ্ধ। লকার রুমে রাখার জন্য প্রস্তুত থাকুন।",
    tipsEN: "Mobile phones/cameras are strictly forbidden inside the temple complex. Safe lockers are available.",
    iconName: "Calendar",
    color: "from-amber-500 to-yellow-400",
    bgGlow: "rgba(245, 158, 11, 0.15)"
  },
  {
    day: 2,
    titleBN: "দ্বিতীয় দিন: বৃন্দাবন ধাম পরিক্রমা ও শ্রী বাঁকে বিহারী দর্শন",
    titleEN: "Day 2: Vrindavan Dham Parikrama & Bankey Bihari Darshanam",
    locationBN: "বাঁকে বিহারী মন্দির, নিধিবন ও কালীয়দহ ঘাট",
    locationEN: "Bankey Bihari, Nidhivan & Kaliyadaha Ghat",
    descBN: "সাত মাইল পবিত্র শ্রীধাম বৃন্দাবন ধাম ধূলি পরিক্রমা। এরপর স্বনামধন্য শ্রী বাঁকে বিহারী মন্দির, মদন মোহন জীর পরিক্রমা লীলাস্থল, কালীয়দহ ঘাট এবং নিধিবনের পবিত্র বন দর্শন যেখানে আজও রাধারাণী ও কানাই রাত কাটাতে আসেন।",
    descEN: "Divine 7-mile foot parikrama of Sri Vrindavan Dham. Visit the world-famous Shri Bankey Bihari Temple, ancient Shri Madan Mohan Mandir, Kaliyadaha Ghat, and Nidhivan where it is believed the eternal Rasalila still takes place at night.",
    timeBN: "ভোর ৪:৩০ - রাত ৮:০০",
    timeEN: "04:30 AM - 08:00 PM",
    activityBN: "বৃন্দাবনের পবিত্র ধূলি কপালে লেপন, পদব্রজে ভজন কীর্তন পরিক্রমা ও নিধিবন দর্শন।",
    activityEN: "Applying sacred dust of Vrindavan, congregational street chanting (Sankirtan), and exploring Nidhivan.",
    tipsBN: "বাঁকে বিহারী মন্দিরে প্রচুর বানর ও ভিড় থাকে। চশমা ও ব্যাগ অত্যন্ত সাবধানে রাখুন।",
    tipsEN: "Monkeys are active around Bankey Bihari temple. Keep eyeglasses, caps, and food items tucked inside.",
    iconName: "Footprints",
    color: "from-yellow-400 to-amber-500",
    bgGlow: "rgba(234, 179, 8, 0.15)"
  },
  {
    day: 3,
    titleBN: "তৃতীয় দিন: গিরিরাজ গোবর্ধন মহিমান্বিত সাত কোশী পরিক্রমা",
    titleEN: "Day 3: Majestic Govardhan Hill Parikrama (7 Koshi)",
    locationBN: "দানঘাটি মন্দির, জঠিপুরা ও মানসী গঙ্গা",
    locationEN: "Danghati Mandir, Jatipura & Mansi Ganga",
    descBN: "একবিংশ শতাব্দীর শ্রেষ্ঠ আধ্যাত্মিক অভিজ্ঞতা - গিরিরাজ গোবর্ধন পর্বতের ২১ কিমি (৭ কোশী) পদব্রজে বা দণ্ডবত পরিক্রমা। মানসী গঙ্গা তীর্থে চরণ স্পর্শ, দানঘাটি ও জঠিপুরায় শ্রী গিরিরাজের চরণে পবিত্র দুগ্ধ অভিষেক।",
    descEN: "An unmatched spiritual milestone: 21-km foot parikrama around the glorious Govardhan Hill. Cleanse in Mansi Ganga holy reservoir and witness the divine milk oblation (Abhishekam) on Giriraj Maharaja at Danghati and Jatipura.",
    timeBN: "ভোর ৪:০০ - রাত ৯:০০",
    timeEN: "04:00 AM - 09:00 PM",
    activityBN: "সঙ্কির্তনের তালে তালে গিরিরাজ পরিক্রমা, রাঁধাকুণ্ডে মধ্যাহ্ন প্রসাদ গ্রহণ।",
    activityEN: "Nectar bhajan chanting session during walk, lunch prasadam stop at Radha Kund base.",
    tipsBN: "পরিক্রমার জন্য হালকা নরম জুতো পরিধান করুন অথবা খালি পায়ে হেঁটে পরম আধ্যাত্মিক সুফল লাভ করুন।",
    tipsEN: "Wear light, soft-soled shoes or walk barefoot to experience deep spiritual mercy connected with Govardhan dust.",
    iconName: "Compass",
    color: "from-emerald-500 to-teal-400",
    bgGlow: "rgba(16, 185, 129, 0.15)"
  },
  {
    day: 4,
    titleBN: "চতুর্থ দিন: বরসানা ধাম ও রাধারাণী লাডলী জী দর্শন",
    titleEN: "Day 4: Barsana Dham & Srimati Radharani's Palace",
    locationBN: "লাডলী জী মন্দির, মানগড় ও পিলী পুখুর",
    locationEN: "Ladli Ji Mandir, Maangarh & Pili Pokhar",
    descBN: "শ্রীমতী রাধারাণীর পিতৃগৃহ বরসানা ধামের পবিত্র পাহাড়ে অধিষ্ঠিত লাডলী জী মন্দির দর্শন। রাধারাণীর মান ভাঙানোর জায়গা 'মানগড়' এবং পিলী পুখুরের দর্শন যেখানে রাধারাণীর হলুদ হাতের রঙ্গে আজ ও জল সোনালী রূপ ধারণ করে।",
    descEN: "Journey to Barsana, Srimati Radharani's childhood hometown. Clamber up Bhanugarh Hill for Sri Ladli Ji Temple's grand darshanam. Experience Maangarh (where Krishna appeased Radha) and the serene yellow-tinged water of Pili Pokhar.",
    timeBN: "সকাল ৬:০০ - সন্ধ্যা ৭:০০",
    timeEN: "06:00 AM - 07:00 PM",
    activityBN: "লাঠমার হলি প্রাঙ্গণ ও রাধানাথের লীলাময় কীর্তন সম্ভাষণ।",
    activityEN: "Visiting legendary Lathmar Holi grounds and attending sweet pre-love pastimes discourses.",
    tipsBN: "পাহাড়ে চড়ার জন্য আরামদায়ক সাধারণ পোশাক পরিধান করুন ও প্রচুর সিঁড়ি আরোহণের শক্তি রাখুন।",
    tipsEN: "Wear highly comfortable cotton clothing. Be prepared for climbing about 250 steps to reach the hilltop.",
    iconName: "Flower2",
    color: "from-pink-500 to-rose-400",
    bgGlow: "rgba(244, 63, 94, 0.15)"
  },
  {
    day: 5,
    titleBN: "পঞ্চম দিন: পবিত্র রাধাকুণ্ড ও শ্যামকুণ্ড পঞ্চস্নান ও আরতি",
    titleEN: "Day 5: Sacred Radha Kund & Shyam Kund Holy Dip",
    locationBN: "রাধাকুণ্ড, শ্যামকুণ্ড ও কুসুম সরোবর",
    locationEN: "Radha Kund, Shyam Kund & Kusum Sarovar",
    descBN: "ব্রজমণ্ডলের সর্বোৎকৃষ্ট রত্ন - শ্রী রাধাকুণ্ড ও শ্যামকুণ্ডের অমৃতময় সরোবরের ঘাটে ঘাটে প্রণাম ও পূর্ণস্নান। অষ্টসখীর কুঞ্জ সমূহের দর্শন এবং কুসুম সরোবরের রাজকীয় শৈল্পিক ঘাটের চমৎকার চিত্রকলা দর্শন ও সন্ধ্যা আরতি।",
    descEN: "Immerse in the ultimate spiritual nectar: The most sacred dual lakes Radha Kund & Shyam Kund. Offer prayers along the historic stone steps, take a purifying dip, explore the serene Kusum Sarovar pavilions and experience daily sunset arati.",
    timeBN: "ভোর ৫:০০ - সন্ধ্যা ৮:০০",
    timeEN: "05:00 AM - 08:00 PM",
    activityBN: "সরোবরের ঘাটে যুগল আরতি দর্শন, শান্ত সমাহিত পরিবেশে জপ ও মহাপ্রসাদ সভা।",
    activityEN: "Watching Jugal Arati over the water, deep chanting sessions, and traditional Bhandara prasadam feast.",
    tipsBN: "রাধাকুণ্ড সোপানগুলি পিচ্ছিল হতে পারে। স্নানের সময় অতিরিক্ত সতর্কতা অবলম্বন করুন।",
    tipsEN: "Stone steps at Radha Kund can be slippery. Tread carefully during bathing and wear appropriate swimwear.",
    iconName: "Heart",
    color: "from-cyan-500 to-blue-450",
    bgGlow: "rgba(6, 182, 212, 0.15)"
  },
  {
    day: 6,
    titleBN: "ষষ্ঠ দিন: নন্দগাঁও ও গোকুল মহাবন ধূলি লস লীলা",
    titleEN: "Day 6: Nandgaon & Gokul Pastimes Recalling",
    locationBN: "পবিত্র নন্দীশ্বর মন্দির, রমণ রেতি ও ব্রহ্মাণ্ড ঘাট",
    locationEN: "Nandishwar Temple, Raman Reti & Brahmand Ghat",
    descBN: "নন্দ মহারাজের সুরম্য নন্দগ্রামের নন্দীশ্বর পাহাড়ের উপর মন্দির দর্শন। এর পর পুরাতন গোকুল ধামে যাত্রা করে রমণ রেতির অত্যন্ত নরম পবিত্র বালিতে গড়াগড়ি ও ধূলি খেলা, যেখানে বাল্যকালে কানাই বাললীল খেলিছিলেন ও ব্রহ্মাণ্ড ঘাট দর্শন।",
    descEN: "Climb to the hilltop fortress of Nandotsav inside Nandagram (Nandeshwar Temple). Travel to Mahavan / Gokul, rolling in the exceptionally soft divine sand of Raman Reti where Bal-Gopal actively played, and visiting Brahmand Ghat.",
    timeBN: "সকাল ৭:০০ - সন্ধ্যা ৬:৩০",
    timeEN: "07:00 AM - 06:30 PM",
    activityBN: "রমণ রেতির পবিত্র বালিতে লীলা অনুকরণ ও ব্রহ্মাণ্ড মাটির মাহাত্ম্য শ্রবণ।",
    activityEN: "Enjoying the soft sands of Raman Reti, hearing stories of Krishna eating clay at Brahmand Ghat.",
    tipsBN: "রমণ রেতিতে ঢোকার সময় জুতো জমা দিয়ে যেতে হবে। কপালে পবিত্র মাটি ধারণ শুভফলদায়ক।",
    tipsEN: "Footwear must be deposited before entering Raman Reti. Collecting a pinch of sacred clay brings goodwill.",
    iconName: "Sunset",
    color: "from-orange-500 to-amber-600",
    bgGlow: "rgba(249, 115, 22, 0.15)"
  },
  {
    day: 7,
    titleBN: "সপ্তম দিন: সমাপনী সংকীর্তন ও বিদায় সম্ভাষণ",
    titleEN: "Day 7: Grand Sankirtan Ceremony & Spiritual Blessings",
    locationBN: "বৃন্দাগোবিন্দ প্রধান পরিক্রমা ক্যাম্প",
    locationEN: "Grand Vrinda-Govinda Pilgrimage Camp",
    descBN: "পবিত্র ব্রজভূমি পরিক্রমার সমাপনী দিবস। বৃন্দাবন প্রধান ক্যাম্পে সকল ভক্তদের মিলন মেলা, শ্রী হরে কৃষ্ণ মহামন্ত্রের অবিরাম নাম যজ্ঞ, পরিক্রমার প্রাপ্তি ভাগাভাগি এবং ব্রজ রজ (পবিত্র ধূলি) উপহার বিতরণ ও বিদায় সম্মিলনী।",
    descEN: "The glorious culmination of our Brajmandal pilgrimage. Congregational Hare Krishna Mahamantra chanting, sharing individual realizations, special blessings, distribution of holy Braj-Raj soil gift souvenirs, and farewell prasadam banquet.",
    timeBN: "সকাল ৮:০০ - দুপুর ২:০০",
    timeEN: "08:00 AM - 02:00 PM",
    activityBN: "১০৮ বার রাধানাম সংকীর্তন, মহান প্রসাদী ভোজ ও ক্যাম্প প্রধানের বিশেষ বিদায়ী প্রবচন।",
    activityEN: "108 names chanting of Sri Radha, sumptuous feast, and final send-off address by our spiritual organizers.",
    tipsBN: "পরিক্রমার যাবতীয় সার্টিফিকেট ও পবিত্র স্মৃতি স্মারক এই দিনে প্রতিটি যাত্রীকে প্রদান করা হবে।",
    tipsEN: "Parikrama completion digital certificates and sacred souvenirs will be handed to all devotees on this day.",
    iconName: "Sparkles",
    color: "from-purple-500 to-indigo-500",
    bgGlow: "rgba(168, 85, 247, 0.15)"
  }
];

const iconMap = {
  Compass: Compass,
  Calendar: Calendar,
  Footprints: Footprints,
  Flower2: Flower2,
  Heart: Heart,
  Sunset: Sunset,
  Sparkles: Sparkles
};

export default function TourTimeline({ lang, onAskAI }: TourTimelineProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  return (
    <div id="tour-timeline-section" className="bg-[#121214] p-5 sm:p-6 rounded-3xl border border-[#2d2d33] shadow-lg relative overflow-hidden">
      {/* Absolute Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full filter blur-xl pointer-events-none"></div>

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2d2d33] pb-4">
        <div>
          <h3 className="text-xl font-black text-white font-sans flex items-center space-x-2">
            <span className="p-1 px-2 bg-gradient-to-br from-[#ffd700] to-amber-500 rounded-lg text-black text-xs font-black shadow-md flex items-center justify-center font-sans tracking-tight">সময়সূচী</span>
            <span>{lang === "BN" ? "যাত্রার দিনভিত্তিক সময়সূচী" : "Tour Daily Timeline"}</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1.5 font-medium leading-relaxed">
            {lang === "BN" 
              ? "শ্রীধাম ব্রজমণ্ডলের অতি পবিত্র সনাতন ৭ দিনের দিনভিত্তিক লীলা দর্শন ও পরিক্রমা ডায়েরি।" 
              : "Day-by-day spiritual itinerary of the infinite glories and pilgrimage parikrama of Sri Brajmandal."}
          </p>
        </div>

        {/* Legend Indicator */}
        <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0 bg-[#18181b] px-3 py-1.5 rounded-xl border border-[#2d2d33] text-[10px] text-gray-300 font-bold">
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span>{lang === "BN" ? "পবিত্র পরিক্রমার ৭টি স্তম্ভ" : "7 Glorious Pillars"}</span>
        </div>
      </div>

      {/* Vertical Timeline container */}
      <div className="relative pl-3 sm:pl-6 space-y-6">
        {/* Continuous Solid Center Line */}
        <div className="absolute left-[23px] sm:left-[35px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-amber-500 via-emerald-500 to-indigo-500 opacity-20"></div>

        {ITINERARY_DATA.map((item) => {
          const IconComponent = iconMap[item.iconName] || Compass;
          const isExpanded = expandedDay === item.day;
          
          return (
            <div key={item.day} className="relative flex items-start space-x-4 sm:space-x-6 group">
              
              {/* Day Tracker Ring + Icon Indicator */}
              <div className="relative z-10 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleDay(item.day)}
                  style={{ boxShadow: isExpanded ? `0 0 15px ${item.bgGlow}` : 'none' }}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border-2 transition-all cursor-pointer ${
                    isExpanded 
                      ? "bg-[#1d1d22] border-[#ffd700] text-[#ffd700]" 
                      : "bg-[#18181b] border-[#2d2d33] text-gray-400 group-hover:border-amber-500/40 group-hover:text-[#ffd700]"
                  }`}
                >
                  <IconComponent className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform" />
                </motion.button>
                <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[9px] font-black w-5 h-5 rounded-lg flex items-center justify-center font-sans shadow-md border border-[#121214]">
                  {lang === "BN" ? `${item.day}` : `${item.day}`}
                </div>
              </div>

              {/* Day Card Details */}
              <div className="flex-1 bg-gradient-to-b from-[#18181b] to-[#121214] border border-[#2d2d33] rounded-2.5xl p-4 sm:p-5 transition-all group-hover:border-[#ffd700]/15 relative overflow-hidden shadow-xs">
                
                {/* Accent Color Band inside card */}
                <div className={`absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b ${item.color}`}></div>

                {/* Card Title Header */}
                <div 
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                  onClick={() => toggleDay(item.day)}
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-black tracking-widest text-[#ffd700] uppercase block font-sans">
                      {lang === "BN" ? `দিন - ০${item.day}` : `JOURNEY DAY 0${item.day}`}
                    </span>
                    <h4 className="text-sm sm:text-base text-white font-extrabold font-sans leading-snug mt-1 group-hover:text-[#ffd700] transition-colors">
                      {lang === "BN" ? item.titleBN : item.titleEN}
                    </h4>
                    
                    {/* Compact Location display */}
                    <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-semibold mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{lang === "BN" ? item.locationBN : item.locationEN}</span>
                    </div>
                  </div>

                  {/* Toggle Indicator Button */}
                  <div className="bg-[#1e1e24] p-1.5 rounded-xl border border-[#2d2d33] text-gray-400 hover:text-white shrink-0">
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {/* Always-Visible Quick Stats Line */}
                <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-[#2d2d33] text-[10px] text-gray-400 font-bold shrink-0">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-[#ff9933]" />
                    <span>{lang === "BN" ? item.timeBN : item.timeEN}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-[#ffd700] hidden sm:block"></div>
                  <div className="flex items-center space-x-1 bg-amber-950/20 border border-amber-500/20 text-[#ffd700] px-2 py-0.5 rounded-lg">
                    <Sparkles className="w-2.5 h-2.5 shrink-0" />
                    <span>{lang === "BN" ? "পবিত্র লীলাস্থল" : "Sacred Leela Spot"}</span>
                  </div>
                </div>

                {/* Expanded Section with Rich Information */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-[#2d2d33]/60 space-y-4">
                        
                        {/* Day Description */}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">
                            {lang === "BN" ? "লীলার ইতিহাস ও বিবরণ" : "Spiritual Background"}
                          </span>
                          <p className="text-slate-300 text-xs sm:text-sm font-sans leading-relaxed">
                            {lang === "BN" ? item.descBN : item.descEN}
                          </p>
                        </div>

                        {/* Core Activity highlights */}
                        <div className="bg-[#18181b]/55 p-3 rounded-xl border border-[#2d2d33] text-xs">
                          <span className="text-[10px] uppercase font-extrabold text-[#ffd700] tracking-wider block mb-1">
                            🎯 {lang === "BN" ? "প্রধান ধর্মীয় আচরণ ও পরিক্রমা" : "Core Sacred Ceremony & Activities"}
                          </span>
                          <span className="text-gray-300 font-semibold leading-relaxed block">
                            {lang === "BN" ? item.activityBN : item.activityEN}
                          </span>
                        </div>

                        {/* Helpful Devotional tips */}
                        <div className="flex items-start space-x-2 bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl text-xs">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                          <div>
                            <span className="text-[10px] uppercase font-black text-amber-500 tracking-wider block">
                              📌 {lang === "BN" ? "যাত্রীদের জন্য বিশেষ নির্দেশাবলি" : "Advice for Devotees"}
                            </span>
                            <span className="text-slate-300 font-medium leading-normal mt-0.5 block">
                              {lang === "BN" ? item.tipsBN : item.tipsEN}
                            </span>
                          </div>
                        </div>

                        {/* Quick AI Action Interlink */}
                        {onAskAI && (
                          <div className="pt-2">
                            <button
                              onClick={() => {
                                const q = lang === "BN" 
                                  ? `${item.locationBN} এ পরিক্রমা ও লীলামাহাত্ম্য কি?`
                                  : `Tell me the spiritual significance and pilgrimage history of ${item.locationEN}`;
                                onAskAI(q);
                              }}
                              className="w-full py-2 bg-[#1b1c22] hover:bg-[#202129] border border-amber-500/20 text-[#ffd700] hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-inner"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>
                                {lang === "BN" 
                                  ? "AI গাইডকে এই দিনের লীলা জিজ্ঞাসা করুন ✨" 
                                  : "Ask AI Guide about this Day's pastimes ✨"}
                              </span>
                            </button>
                          </div>
                        )}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          );
        })}
      </div>

      {/* Decorative summary block */}
      <div className="mt-8 pt-4 border-t border-[#2d2d33] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
        <span className="flex items-center space-x-1 font-semibold text-center sm:text-left">
          <Calendar className="w-4 h-4 text-[#ffd700]" />
          <span>{lang === "BN" ? "১ম দিন থেকে ৭ম দিন অবিরাম ভক্তি-সংগীত পরিক্রমা" : "Continuous devotion and chanting from Day 1 to Day 7"}</span>
        </span>
        
        {onAskAI && (
          <button 
            type="button"
            onClick={() => {
              const q = lang === "BN" 
                ? "ব্রজ পরিক্রমার সার্বিক রুট ম্যাপ এবং যাতায়াতের বিস্তারিত গাইড দিন।"
                : "Give me the complete route map and transportation guide of Brajmandal Parikrama.";
              onAskAI(q);
            }}
            className="text-[#ffd700] hover:underline font-extrabold flex items-center space-x-0.5 cursor-pointer"
          >
            <span>{lang === "BN" ? "সম্পূর্ণ পরিক্রম ম্যাপ নিয়ে প্রশ্ন করুন" : "Ask for Complete Parikrama Map"}</span>
            <ChevronUp className="w-3 h-3 rotate-90" />
          </button>
        )}
      </div>
    </div>
  );
}
