/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings, Passenger } from "./types";

// Gorgeous multi-colored vector SVGs for elegant presentation of divine elements
export const DEFAULT_RADHA_KRISHNA_IMAGE = `data:image/svg+xml;utf8,<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="%23FFF5E6"/>
      <stop offset="50%" stop-color="%23FFD700" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="%238B0000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="peacockColor" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23008080"/>
      <stop offset="50%" stop-color="%23000080"/>
      <stop offset="100%" stop-color="%234B0082"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="40" fill="%232A080C"/>
  <circle cx="200" cy="180" r="160" fill="url(%23goldGlow)"/>
  
  <!-- Peacock Feather Core of Govinda -->
  <path d="M200,60 C230,10 280,30 260,80 C245,115 210,130 200,160 C190,130 155,115 140,80 C120,30 170,10 200,60 Z" fill="url(%23peacockColor)" opacity="0.95"/>
  <path d="M200,75 C215,45 245,55 235,85 C225,105 205,115 200,135 C195,115 175,105 165,85 C155,55 185,45 200,75 Z" fill="%2300FF7F" opacity="0.9"/>
  <circle cx="200" cy="85" r="15" fill="%231E90FF"/>
  <circle cx="200" cy="85" r="8" fill="%23FFE4B5"/>

  <!-- Holy Flute (Bansuri) -->
  <rect x="80" y="220" width="240" height="12" rx="6" fill="%23FFD700" transform="rotate(-15 200 220)" stroke="%233E2723" stroke-width="2"/>
  <circle cx="110" cy="235" r="3" fill="%238B0000"/>
  <circle cx="140" cy="227" r="3" fill="%238B0000"/>
  <circle cx="170" cy="219" r="3" fill="%238B0000"/>
  <circle cx="200" cy="211" r="3" fill="%238B0000"/>
  <circle cx="230" cy="203" r="3" fill="%238B0000"/>
  <circle cx="260" cy="195" r="3" fill="%238B0000"/>
  
  <!-- Decorative Peacock hanging threads -->
  <path d="M300,185 Q320,195 315,220" stroke="%23FFD700" stroke-width="3" fill="none"/>
  <path d="M308,185 Q335,190 325,215" stroke="%23FFD700" stroke-width="3" fill="none"/>

  <!-- Divine Lotus Base -->
  <path d="M120,310 C140,290 160,290 200,320 C240,290 260,290 280,310 C310,340 280,370 200,370 C120,370 90,340 120,310 Z" fill="%23FF69B4"/>
  <path d="M150,320 C170,305 185,305 200,325 C215,305 230,305 250,320 C270,345 250,365 200,365 C150,365 130,345 150,320 Z" fill="%23FF1493"/>

  <!-- Spiritual Symbols -->
  <text x="200" y="280" font-family="'Inter', sans-serif" font-weight="900" font-size="28" fill="%23FFFFFF" text-anchor="middle" letter-spacing="1">শ্রী রাধা কৃষ্ণ</text>
  <text x="200" y="305" font-family="'Inter', sans-serif" font-weight="600" font-size="12" fill="%23FFD700" text-anchor="middle">বৃন্দাবন ধাম</text>
</svg>`;

export const DEFAULT_ADMIN_IMAGE = `data:image/svg+xml;utf8,<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="120" rx="30" fill="%23FFF5E6"/>
  <rect x="5" y="5" width="110" height="110" rx="25" fill="none" stroke="%23B8860B" stroke-width="2"/>
  <circle cx="60" cy="45" r="22" fill="%238B0000"/>
  <path d="M25,95 C25,75 40,70 60,70 C80,70 95,75 95,95 Z" fill="%238B0000"/>
  <!-- Gold tilak crown representation -->
  <path d="M57,20 L63,20 L60,10 Z" fill="%23FFD700"/>
  <circle cx="60" cy="5" r="3" fill="%23FFD700"/>
  <text x="60" y="112" font-family="sans-serif" font-weight="bold" font-size="11" fill="%238B0000" text-anchor="middle">ব্রজ পরিচালক</text>
</svg>`;

export const DEFAULT_TRAIN_IMAGE = `data:image/svg+xml;utf8,<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="120" rx="20" fill="%23E0F7FA"/>
  <rect x="5" y="5" width="190" height="110" rx="15" fill="none" stroke="%23006064" stroke-width="2"/>
  
  <!-- Train Tracks -->
  <line x1="10" y1="95" x2="190" y2="95" stroke="%2337474F" stroke-width="5"/>
  <line x1="25" y1="95" x2="15" y2="105" stroke="%2337474F" stroke-width="3"/>
  <line x1="55" y1="95" x2="45" y2="105" stroke="%2337474F" stroke-width="3"/>
  <line x1="85" y1="95" x2="75" y2="105" stroke="%2337474F" stroke-width="3"/>
  <line x1="115" y1="95" x2="105" y2="105" stroke="%2337474F" stroke-width="3"/>
  <line x1="145" y1="95" x2="135" y2="105" stroke="%2337474F" stroke-width="3"/>
  <line x1="175" y1="95" x2="165" y2="105" stroke="%2337474F" stroke-width="3"/>

  <!-- Train Engine front layout -->
  <path d="M40,35 L120,35 L135,50 L135,90 L40,90 Z" fill="%2301579B"/>
  <rect x="135" y="55" width="25" height="35" rx="3" fill="%230288D1"/>
  
  <!-- Engine Windows -->
  <rect x="50" y="45" width="20" height="20" rx="2" fill="%23E0F7FA"/>
  <rect x="80" y="45" width="20" height="20" rx="2" fill="%23E0F7FA"/>
  <rect x="110" y="45" width="15" height="20" rx="2" fill="%23E0F7FA"/>

  <!-- Dynamic steam/clouds -->
  <circle cx="55" cy="20" r="8" fill="%23B0BEC5" opacity="0.6"/>
  <circle cx="75" cy="15" r="12" fill="%23B0BEC5" opacity="0.4"/>
  <circle cx="95" cy="10" r="16" fill="%23B0BEC5" opacity="0.2"/>

  <!-- Lights and details -->
  <circle cx="150" cy="75" r="6" fill="%23FFD54F"/>
  <rect x="30" y="70" width="10" height="15" fill="%23FF5722"/>
  
  <text x="100" y="114" font-family="sans-serif" font-weight="900" font-size="10" fill="%2301579B" text-anchor="middle">Vrindavan Express</text>
</svg>`;

export const GALLERY_1 = `data:image/svg+xml;utf8,<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="200" rx="15" fill="%23FFF5EE"/>
  <text x="150" y="40" font-family="sans-serif" font-weight="bold" font-size="16" fill="%238B4513" text-anchor="middle">শ্রী বাঁকে বিহারী মন্দির</text>
  <path d="M100,160 L100,100 L120,70 L150,50 L180,70 L200,100 L200,160 Z" fill="%23CD853F"/>
  <path d="M120,100 Q150,70 180,100 Z" fill="%238B0000"/>
  <rect x="135" y="115" width="30" height="45" fill="%23FFD700"/>
  <!-- Arch Dome -->
  <path d="M125,70 C125,50 175,50 175,70 Z" fill="%23B22222"/>
  <line x1="150" y1="50" x2="150" y2="25" stroke="%23FFD700" stroke-width="3"/>
  <polygon points="150,25 170,30 150,35" fill="%23FFD700"/>
  <text x="150" y="185" font-family="sans-serif" font-size="11" fill="%235C4033" text-anchor="middle">বৃন্দাবনের প্রান প্রিয় বিহারী লাল</text>
</svg>`;

export const GALLERY_2 = `data:image/svg+xml;utf8,<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="200" rx="15" fill="%23F4EFEA"/>
  <text x="150" y="40" font-family="sans-serif" font-weight="bold" font-size="16" fill="%23000080" text-anchor="middle">রাধারানী মান মন্দির, বারসানা</text>
  <!-- Beautiful Hill View and Golden Temple -->
  <path d="M20,160 Q100,120 180,160 T300,140 L300,200 L0,200 Z" fill="%238FBC8F"/>
  <path d="M110,130 L110,80 L150,40 L190,80 L190,130 Z" fill="%23DAA520"/>
  <circle cx="150" cy="38" r="4" fill="%23FFD700"/>
  <line x1="150" y1="34" x2="150" y2="15" stroke="%23FF1493" stroke-width="2"/>
  <polygon points="150,15 165,20 150,25" fill="%23FF1493"/>
  <text x="150" y="185" font-family="sans-serif" font-size="11" fill="%23191970" text-anchor="middle">বারসানার লাডলী জীর পবিত্র ধাম</text>
</svg>`;

export const GALLERY_3 = `data:image/svg+xml;utf8,<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="200" rx="15" fill="%23E6F2FF"/>
  <text x="150" y="40" font-family="sans-serif" font-weight="bold" font-size="16" fill="%23008080" text-anchor="middle">পবিত্র রাধাকুণ্ড ও শ্যামকুণ্ড</text>
  <!-- Sacred pond water with lotus -->
  <ellipse cx="150" cy="120" rx="120" ry="50" fill="%2300BFFF"/>
  <ellipse cx="150" cy="120" rx="110" ry="42" fill="%231E90FF"/>
  <!-- Lotus details inside pond -->
  <circle cx="100" cy="120" r="8" fill="%23FF69B4"/>
  <circle cx="120" cy="130" r="10" fill="%23FF69B4"/>
  <circle cx="180" cy="115" r="7" fill="%23FF69B4"/>
  <circle cx="150" cy="135" r="9" fill="%23FF1493"/>
  <!-- Steps/Ghats -->
  <path d="M50,160 L250,160 L270,190 L30,190 Z" fill="%23D3D3D3" stroke="%23A9A9A9" stroke-width="2"/>
  <path d="M65,145 L235,145 L245,160 L55,160 Z" fill="%23E0E0E0" stroke="%23C0C0C0" stroke-width="1"/>
  <text x="150" y="182" font-family="sans-serif" font-size="11" fill="%23005A9C" text-anchor="middle">ব্রজপ্রেমের চরম সীমা শ্রী রাধাকুণ্ড</text>
</svg>`;

export const INITIAL_APP_SETTINGS: AppSettings = {
  adminProfile: {
    name: "শ্রী কৃষ্ণদাস বাবাজী মহারাজ",
    address: "শ্রী রাধাকুণ্ড, কুসুম সরোবর লেন, মথুরা, উত্তর প্রদেশ",
    mobile: "9876543210",
    whatsapp: "9876543210",
    photoUrl: DEFAULT_ADMIN_IMAGE,
  },
  realPhoto: DEFAULT_RADHA_KRISHNA_IMAGE,
  trainPhoto: DEFAULT_TRAIN_IMAGE,
  journeyDate: "২ই আশ্বিন ২০শে সেপ্টেম্বর রবিবার",
  ticketPrice: "১৬০০১ টাকা",
  journeyInfo: "সম্পূর্ণ রেল যোগে উত্তর ভারত পরিক্রমা",
  notification: "রাধে রাধে! শ্রীধাম ব্রজ পরিক্রমা যাত্রা শুরু করার শুভ দিন আসন্ন। যাত্রীরা অনুগ্রহ করে অতিসত্বর আধার কার্ড ভেরিফিকেশন সম্পন্ন করুন।",
  emergencyNotice: "কোনো জরুরি পরিস্থিতিতে অবিলম্বে মেইন সার্ভিসের হোয়াটসঅ্যাপ গ্রুপ অথবা ব্রজ পরিচালক নম্বরে যোগাযোগ করুন।",
  dailyNotice: "দৈনিক মঙ্গলারতি ও ভাগবত পাঠের শুভ আয়োজন প্রতিদিন সকালে বৃন্দাবন হেড ক্যাম্পে অনুষ্ঠিত হবে।",
  specialOffer: "আগে বুকিং করলে নিশ্চিত লোয়ার বার্থ স্পেশাল কোটা সিট বরাদ্দ থাকবে!",
  termsAndConditions: "১. যাত্রার সময় মূল আধার কার্ড সাথে রাখা বাধ্যতামূলক। ২. অগ্রিম বুকিং ফি অফেরতযোগ্য। ৩. ধর্মীয় অনুশাসন ও নিরামিষ ভোজন নিয়ম মেনে চলতে হবে।",
  touristPlaces: [
    "বৃন্দাবন - শ্রী বাঁকে বিহারী জীর দর্শন ও রাধারাণী নিধিবন পরিক্রমা।",
    "মথুরা - ভগবান শ্রী কৃষ্ণের পবিত্র জন্মভূমি দর্শন।",
    "বারসানা - রাধারাণীর জন্মস্থান ও পবিত্র মান মন্দির পরিভ্রমণ।",
    "গোবর্ধন - সাত কোশী পবিত্র গোবর্ধন গিরিরাজ পরিক্রমা।",
    "রাধাকুণ্ড - ব্রজপ্রেমের শ্রেষ্ঠ ও পবিত্রতম সরোবর স্নান ও দর্শন।",
    "নন্দগাঁও - নন্দ মহারাজের ভবন ও পবিত্র নন্দীশ্বর মন্দির দর্শন।"
  ],
  gallery: [GALLERY_1, GALLERY_2, GALLERY_3],
};

export const INITIAL_PASSENGERS: Passenger[] = [
  {
    id: "p1",
    photo: DEFAULT_ADMIN_IMAGE,
    aadharPhoto: DEFAULT_TRAIN_IMAGE,
    name: "গোপাল চ্যাটার্জী",
    fatherName: "রামচন্দ্র চ্যাটার্জী",
    age: "৫৪",
    gender: "পুরুষ",
    address: "১২/এ বাগবাজার স্ট্রীট, কলকাতা, পশ্চিমবঙ্গ",
    aadhar: "১২৩৪-৫৬৭৮-৯MDE",
    mobile: "9830098300",
    bookingDate: "২০২৬-০৬-১০",
    advance: "৬০০০",
    totalFare: "১৬০০১",
    due: "১০০০১",
    transactions: [
      {
        id: "tx-p1-1",
        date: "২০২৬-০৬-০৫",
        amount: "৪০০০",
        paymentType: "Cash (নগদ)",
        status: "Completed",
        remarks: "বুকিং টোকেন অগ্রিম"
      },
      {
        id: "tx-p1-2",
        date: "২০২৬-০৬-১০",
        amount: "২০০০",
        paymentType: "UPI (ইউপিআই)",
        status: "Completed",
        remarks: "যাত্রার প্রথম কিস্তি টিকিট বুকিং"
      }
    ]
  },
  {
    id: "p2",
    photo: DEFAULT_ADMIN_IMAGE,
    aadharPhoto: DEFAULT_TRAIN_IMAGE,
    name: "রাধারাণী দাসী",
    fatherName: "স্বামী: বিপিন দাস",
    age: "৪৬",
    gender: "মহিলা",
    address: "নবদ্বীপধাম, নদীয়া, পশ্চিমবঙ্গ",
    aadhar: "৯৮৭৬-৫৪৩২-১০১১",
    mobile: "9732197321",
    bookingDate: "২০২৬-০৬-১১",
    advance: "১০০০০",
    totalFare: "১৬০০১",
    due: "৬MDA",
    transactions: [
      {
        id: "tx-p2-1",
        date: "২০২৬-০৬-০৮",
        amount: "৫০০০",
        paymentType: "Bank Transfer (ব্যাঙ্ক)",
        status: "Completed",
        remarks: "আসন সংরক্ষণ ও অগ্রিম"
      },
      {
        id: "tx-p2-2",
        date: "২০২৬-০৬-১১",
        amount: "৫০০০",
        paymentType: "UPI (ইউপিআই)",
        status: "Completed",
        remarks: "দ্বিতীয় কিস্তির পেমেন্ট"
      }
    ]
  }
];

export const SUGGESTED_AI_QUESTIONS = [
  { q: "বৃন্দাবন কোথায়?", category: "location" },
  { q: "রাধাকুণ্ডের মাহাত্ম্য কী?", category: "significance" },
  { q: "গোবর্ধন পরিক্রমা কত কিমি?", category: "distance" },
  { q: "ব্রজ ভ্রমণের নিয়ম কী?", category: "rules" }
];
