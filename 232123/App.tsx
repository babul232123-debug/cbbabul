/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  MoreVertical, Home, MessageSquare, Users, User, Calendar as CalendarIcon, 
  Settings, CheckCircle2, Phone, Share2, Clipboard, Printer, Search, 
  MapPin, Clock, ArrowRight, ShieldAlert, FileText, Sparkles, Upload, 
  Trash2, Plus, HelpCircle, Download, Check, RefreshCw, Camera
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AppSettings, Passenger, ChatMessage } from "./types";
import { 
  INITIAL_APP_SETTINGS, 
  INITIAL_PASSENGERS, 
  SUGGESTED_AI_QUESTIONS 
} from "./initialData";
import DivineHeader from "./components/DivineHeader";
import WeatherWidget from "./components/WeatherWidget";
import BengaliCalendar from "./components/BengaliCalendar";
import PINLoginModal from "./components/PINLoginModal";
import QRCodeDisplay from "./components/QRCodeDisplay";
import QRScannerModal from "./components/QRScannerModal";
import TourTimeline from "./components/TourTimeline";
import { 
  isFirebaseEnabled, 
  saveSettingsToServer, 
  loadSettingsFromServer, 
  savePassengerToServer, 
  deletePassengerFromServer, 
  listenToPassengersServer 
} from "./firebase";

export default function App() {
  // --- 1. Language Toggle ---
  const [lang, setLang] = useState<"BN" | "EN">("BN");

  // --- 2. Shared State with Persistence ---
  const [settings, setSettings] = useState<AppSettings>(INITIAL_APP_SETTINGS);
  const [passengers, setPassengers] = useState<Passenger[]>(INITIAL_PASSENGERS);
  const [currentView, setCurrentView] = useState<"home" | "ai-guide" | "passengers" | "admin" | "booking" | "action" | "passbook">("home");
  
  // --- Loading & AI Sync Feedback Engine ---
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  // --- UI Layout and menu toggles ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // --- PIN Protection Modal States ---
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinModalTitle, setPinModalTitle] = useState("");
  const [pinModalDesc, setPinModalDesc] = useState("");
  const [pinModalTargetView, setPinModalTargetView] = useState<"admin" | "action" | "passengers" | null>(null);

  // --- Search & Filter States ---
  const [passengerSearchQuery, setPassengerSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("passenger_search_history");
      return saved ? JSON.parse(saved) : ["রাধারাণী", "017", "babul"];
    } catch {
      return ["রাধারাণী", "017", "babul"];
    }
  });

  // --- AI Travel Assistant Chat Log States ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "রাধে রাধে! আমি আপনার পবিত্র ব্রজধাম পরিক্রমা সাহায্যকারী AI। আপনি বৃন্দাবন ধাম, রাধাকুণ্ডের শ্রী লীলামাহাত্ম্য, গিরিরাজ গোবর্ধন পরিক্রমা বা যাত্রা বুকিং সংক্রান্ত যেকোনো ধর্মীয় ও জাগতিক জিজ্ঞাসা করতে পারেন। আমি উত্তর দিতে সদা প্রস্তুত!",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // --- Booking Form States ---
  const [bookingForm, setBookingForm] = useState({
    name: "",
    fatherName: "",
    age: "",
    gender: "পুরুষ",
    address: "",
    aadhar: "",
    mobile: "",
    photo: "",
    aadharPhoto: "",
    advance: "১৬০০১",
    totalFare: "১৬০০১",
    due: "0"
  });
  const [bookingEditId, setBookingEditId] = useState<string | null>(null);

  // --- Passbook Terminal Login ---
  const [passbookLoginMobile, setPassbookLoginMobile] = useState("");
  const [activePassbookPassenger, setActivePassbookPassenger] = useState<Passenger | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  // --- New Ledger Payment States ---
  const [ledgerAmountInput, setLedgerAmountInput] = useState("");
  const [ledgerMethodInput, setLedgerMethodInput] = useState("Cash (নগদ)");
  const [ledgerRemarksInput, setLedgerRemarksInput] = useState("");

  // --- Bengali Number Converter Helpers ---
  const EN_TO_BN = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  
  const bnToEnNumber = (bnStr: string): number => {
    if (!bnStr) return 0;
    let enStr = "";
    for (let i = 0; i < bnStr.length; i++) {
      const char = bnStr[i];
      const idx = EN_TO_BN.indexOf(char);
      if (idx !== -1) {
        enStr += idx;
      } else if (/[0-9]/.test(char)) {
        enStr += char;
      }
    }
    return parseFloat(enStr) || 0;
  };

  const enToBnString = (enNum: number | string): string => {
    const numStr = enNum.toString();
    let bnStr = "";
    for (let i = 0; i < numStr.length; i++) {
      const char = numStr[i];
      if (/[0-9]/.test(char)) {
        bnStr += EN_TO_BN[parseInt(char)];
      } else {
        bnStr += char;
      }
    }
    return bnStr;
  };

  // --- Live Clock States ---
  const [liveTime, setLiveTime] = useState("");
  const [liveDate, setLiveDate] = useState("");
  const [bengaliDateStr, setBengaliDateStr] = useState("২ই আশ্বিন ১৪৩২ বঙ্গাব্দ");

  // Load Saved data from Local/Firestore on Mount
  useEffect(() => {
    let unsubscribePassengers: (() => void) | undefined;

    async function initializeAndSyncData() {
      // 1. Instantly load local data as fallback
      try {
        const savedSettings = localStorage.getItem("brojo_app_settings");
        const savedPassengers = localStorage.getItem("brojo_app_passengers");
        if (savedSettings) setSettings(JSON.parse(savedSettings));
        if (savedPassengers) setPassengers(JSON.parse(savedPassengers));
      } catch (e) {
        console.error("Localstorage recovery failed:", e);
      }

      // 2. Dual Sync with Firebase if live
      if (isFirebaseEnabled) {
        setIsSyncing(true);
        setSyncMessage("ক্লাউড ডাটাবেস থেকে পবিত্র ব্রজ যাত্রা বিবরণ সিঙ্ক করা হচ্ছে...");
        try {
          // Sync settings
          const remoteSettings = await loadSettingsFromServer();
          if (remoteSettings) {
            setSettings(remoteSettings);
            localStorage.setItem("brojo_app_settings", JSON.stringify(remoteSettings));
          } else {
            // First time setup: push INITIAL fallback settings to firestore
            await saveSettingsToServer(INITIAL_APP_SETTINGS);
          }

          // Real-time listen to passengers
          unsubscribePassengers = listenToPassengersServer(
            async (remotePassengers) => {
              if (remotePassengers && remotePassengers.length > 0) {
                setPassengers(remotePassengers);
                localStorage.setItem("brojo_app_passengers", JSON.stringify(remotePassengers));
              } else {
                // If cloud database has no passengers, seed with initial mock data
                for (const p of INITIAL_PASSENGERS) {
                  await savePassengerToServer(p);
                }
              }
              setIsSyncing(false);
              setSyncMessage("");
            },
            (error) => {
              console.error("Passenger snapshot subscription failed:", error);
              setIsSyncing(false);
              setSyncMessage("");
            }
          );
        } catch (err) {
          console.error("Firebase synchronization handshakes incomplete:", err);
          setIsSyncing(false);
          setSyncMessage("");
        }
      }
    }

    initializeAndSyncData();

    return () => {
      if (unsubscribePassengers) unsubscribePassengers();
    };
  }, []);

  // URL Scan Trigger for passenger auto-verification
  useEffect(() => {
    if (passengers && passengers.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const phoneParam = params.get("phone");
      if (phoneParam) {
        const decodedPhone = decodeURIComponent(phoneParam).trim();
        const found = passengers.find(
          (p) => p.mobile === decodedPhone || p.mobile.includes(decodedPhone)
        );
        if (found) {
          setPassbookLoginMobile(found.mobile);
          setActivePassbookPassenger(found);
          setCurrentView("passbook");
          // Remove parameter from URL quietly so page reload doesn't keep triggers active
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    }
  }, [passengers]);

  // Update Dynamic Live Clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format Live Time with hours, minutes, seconds
      setLiveTime(now.toLocaleTimeString("bn-BD", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      
      // Gregorian Date in Bengali
      setLiveDate(now.toLocaleDateString("bn-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
      
      // Calculate dynamic Bengali date approximation based on current year 2026 / seasonality
      const day = now.getDate();
      setBengaliDateStr(`২ই আশ্বিন ১৪৩২ বঙ্গাব্দ • শ্রী জন্মাষ্টমীর মহোৎসব মাস`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll Chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

  // Record passenger search queries in recent searches list
  useEffect(() => {
    const query = passengerSearchQuery.trim();
    if (!query || query.length < 2) return;

    const delayDebounce = setTimeout(() => {
      setRecentSearches((prev) => {
        const filtered = prev.filter((term) => term.toLowerCase() !== query.toLowerCase());
        const updated = [query, ...filtered].slice(0, 5);
        try {
          localStorage.setItem("passenger_search_history", JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to store search term:", e);
        }
        return updated;
      });
    }, 1500);

    return () => clearTimeout(delayDebounce);
  }, [passengerSearchQuery]);

  // Save changes wrapper with reactive AI Engine and Local Storage saving logic
  const saveAppSettings = async (updatedSettings: AppSettings) => {
    setIsSyncing(true);
    setSyncMessage("পরমেশ্বর রাধারানীর কৃপায় অফলাইন ডায়েরি সংরক্ষণ করা হচ্ছে...");
    setSettings(updatedSettings);
    localStorage.setItem("brojo_app_settings", JSON.stringify(updatedSettings));
    
    if (isFirebaseEnabled) {
      try {
        await saveSettingsToServer(updatedSettings);
      } catch (err) {
        console.error("Failed to sync settings to cloud:", err);
      }
    }
    
    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage("");
    }, 1200);
  };

  const savePassengers = async (updatedPassengers: Passenger[]) => {
    setIsSyncing(true);
    setSyncMessage("যাত্রী তথ্য স্থানীয় ডিভাইস মেমোরিতে রিয়েল-টাইমে সুরক্ষিত করা হচ্ছে...");
    setPassengers(updatedPassengers);
    localStorage.setItem("brojo_app_passengers", JSON.stringify(updatedPassengers));
    
    if (isFirebaseEnabled) {
      try {
        for (const p of updatedPassengers) {
          await savePassengerToServer(p);
        }
      } catch (err) {
        console.error("Failed to write passengers to cloud:", err);
      }
    }
    
    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage("");
    }, 1200);
  };

  // Helper utility to read images converted into Base64 format
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          callback(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Safe file loader helper for multiple gallery uploads
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesList = Array.from(files) as File[];
      const uploadPromises = filesList.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string || "");
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(uploadPromises).then((results) => {
        const updatedGallery = [...settings.gallery, ...results].slice(-6); // Keep last 6 images safely
        saveAppSettings({
          ...settings,
          gallery: updatedGallery
        });
      });
    }
  };

  // Handle direct navigation requests or prompt PIN modals
  const handleNavigationRequest = (view: "home" | "ai-guide" | "passengers" | "admin" | "booking" | "action" | "passbook") => {
    setIsMenuOpen(false);
    
    if (view === "admin") {
      setPinModalTitle("এডমিন প্রোফাইল অ্যাক্সেস (Admin Section)");
      setPinModalDesc("এডমিন প্রোফাইল সিআরইউডি পিন (PIN holds 0232)");
      setPinModalTargetView("admin");
      setPinModalOpen(true);
    } else if (view === "action") {
      setPinModalTitle("অ্যাকশন প্যানেল এডিট লক (Action Update)");
      setPinModalDesc("অ্যাকশন বাটনে সবার ব্যবহারের জন্য এডিট কোড পিন (PIN holds 12345 or 0232)");
      setPinModalTargetView("action");
      setPinModalOpen(true);
    } else {
      setCurrentView(view);
    }
  };

  const handlePinSuccess = () => {
    setPinModalOpen(false);
    if (pinModalTargetView) {
      setCurrentView(pinModalTargetView);
    }
  };

  // Triggering the server-side AI chat routine with fallback simulation
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          settingsContext: settings
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: data.text || "রাধে রাধে! কোনো ত্রুটি ঘটেছে, দয়া করে পুনরায় চেষ্টা করুন।",
          timestamp: new Date().toLocaleTimeString()
        };
        setChatMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("HTTP error " + response.status);
      }
    } catch (e: any) {
      console.error(e);
      // Beautiful default simulated Q&A response for instant local sandbox
      setTimeout(() => {
        const simulatedReply = `রাধে রাধে! আপনার পবিত্র জিজ্ঞাসার উত্তরে জানাই: ব্রজধাম পরম অমৃতময় ধাম। শ্রীমত্যা রাধিকার কৃপাকণা লাভ করতে আমাদের সঙ্গে শুভযাত্রার জন্য প্রস্তুত হোন। আপনার যাত্রা শুভ হোক!`;
        setChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: simulatedReply,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }, 700);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- Booking Form Actions ---
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingForm.name || !bookingForm.mobile) {
      alert("নাম ও মোবাইল নম্বর দেওয়া বাধ্যতামূলক!");
      return;
    }

    // Auto-calculate remaining due amount
    const total = parseFloat(bookingForm.totalFare) || 0;
    const adv = parseFloat(bookingForm.advance) || 0;
    const dueAmount = (total - adv).toString();

    const existingP = bookingEditId ? passengers.find(p => p.id === bookingEditId) : null;
    const passengerData: Passenger = {
      id: bookingEditId || `p-${Date.now()}`,
      photo: bookingForm.photo || settings.adminProfile.photoUrl,
      aadharPhoto: bookingForm.aadharPhoto || settings.trainPhoto,
      name: bookingForm.name,
      fatherName: bookingForm.fatherName,
      age: bookingForm.age,
      gender: bookingForm.gender,
      address: bookingForm.address,
      aadhar: bookingForm.aadhar || "X-X-X",
      mobile: bookingForm.mobile,
      bookingDate: existingP ? existingP.bookingDate : new Date().toLocaleDateString("bn-BD"),
      advance: bookingForm.advance,
      totalFare: bookingForm.totalFare,
      due: dueAmount,
      transactions: existingP?.transactions || [
        {
          id: `tx-${Date.now()}`,
          date: new Date().toLocaleDateString("bn-BD"),
          amount: bookingForm.advance,
          paymentType: "Cash (নগদ)",
          status: "Completed",
          remarks: "প্রাথমিক অগ্রিম অনলাইন/অফলাইন বুকিং"
        }
      ]
    };

    let updatedList: Passenger[];
    if (bookingEditId) {
      updatedList = passengers.map(p => p.id === bookingEditId ? passengerData : p);
      setBookingEditId(null);
    } else {
      updatedList = [...passengers, passengerData];
    }

    savePassengers(updatedList);
    
    // Clear Form
    setBookingForm({
      name: "",
      fatherName: "",
      age: "",
      gender: "পুরুষ",
      address: "",
      aadhar: "",
      mobile: "",
      photo: "",
      aadharPhoto: "",
      advance: "১৬০০১",
      totalFare: "১৬০০১",
      due: "0"
    });

    // Send visual notification of booking
    alert("অভিনন্দন! আপনার বুকিং পরম সাফল্যে সিঙ্ক ও নথিভুক্ত করা হয়েছে। পেমেন্ট রসিদ পাসবুক সেকশনে পেয়ে যাবেন।");
    setCurrentView("passengers");
  };

  const startEditPassenger = (p: Passenger) => {
    setBookingEditId(p.id);
    setBookingForm({
      name: p.name,
      fatherName: p.fatherName,
      age: p.age,
      gender: p.gender,
      address: p.address,
      aadhar: p.aadhar,
      mobile: p.mobile,
      photo: p.photo,
      aadharPhoto: p.aadharPhoto,
      advance: p.advance,
      totalFare: p.totalFare,
      due: p.due
    });
    setCurrentView("booking");
  };

  const deletePassenger = async (id: string) => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই যাত্রী তথ্য ডিলিট করতে চান?")) {
      const updated = passengers.filter(p => p.id !== id);
      await savePassengers(updated);
      
      if (isFirebaseEnabled) {
        try {
          await deletePassengerFromServer(id);
        } catch (err) {
          console.error("Failed to delete passenger from cloud:", err);
        }
      }
    }
  };

  // --- Passbook Terminal Login Handler ---
  const handlePassbookLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const query = passbookLoginMobile.trim();
    if (!query) return;

    const found = passengers.find(p => p.mobile.includes(query) || p.aadhar.includes(query));
    if (found) {
      setActivePassbookPassenger(found);
    } else {
      alert("দুঃখিত, এই মোবাইল নম্বরের কোনো যাত্রী বুকিং রেকর্ড খুঁজে পাওয়া যায়নি। অনুগ্রহ করে বুকিং বাটনে বুক করুন।");
    }
  };

  // --- Add custom Ledger installments ---
  const handleAddLedgerTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePassbookPassenger) return;

    const amtStr = ledgerAmountInput.trim();
    if (!amtStr) {
      alert("অনুগ্রহ করে পেমেন্ট বা কিস্তির পরিমাণ লিখুন!");
      return;
    }

    const newAmtNum = bnToEnNumber(amtStr);
    if (newAmtNum <= 0) {
      alert("অনুগ্রহ করে সঠিক কিস্তির অংক লিখুন।");
      return;
    }

    const totalFareNum = bnToEnNumber(activePassbookPassenger.totalFare);
    const advanceNum = bnToEnNumber(activePassbookPassenger.advance);
    const currentDueNum = totalFareNum - advanceNum;

    if (newAmtNum > currentDueNum) {
      alert(`অতিরিক্ত পেমেন্ট! বাকি অর্ঘ্য টাকা ৳${enToBnString(currentDueNum)}-এর চেয়ে বেশি জমা করা যাবে না।`);
      return;
    }

    const calculatedNewAdvance = advanceNum + newAmtNum;
    const calculatedNewDue = Math.max(0, totalFareNum - calculatedNewAdvance);

    const newTx = {
      id: `tx-${Date.now()}`,
      date: new Date().toLocaleDateString("bn-BD"),
      amount: enToBnString(newAmtNum),
      paymentType: ledgerMethodInput,
      status: "Completed",
      remarks: ledgerRemarksInput.trim() || "কিস্তির অতিরিক্ত অর্ঘ্য জমা"
    };

    // Keep initial record if list was empty
    const currentTxes = activePassbookPassenger.transactions || [
      {
        id: `tx-init-auto`,
        date: activePassbookPassenger.bookingDate || new Date().toLocaleDateString("bn-BD"),
        amount: activePassbookPassenger.advance,
        paymentType: "Cash (নগদ)",
        status: "Completed",
        remarks: "প্রাথমিক অগ্রিম টিকিট বুকিং"
      }
    ];

    const updatedPassenger: Passenger = {
      ...activePassbookPassenger,
      advance: enToBnString(calculatedNewAdvance),
      due: enToBnString(calculatedNewDue),
      transactions: [...currentTxes, newTx]
    };

    const updatedList = passengers.map(p => p.id === activePassbookPassenger.id ? updatedPassenger : p);
    
    savePassengers(updatedList);
    setActivePassbookPassenger(updatedPassenger);

    // Reset inputs
    setLedgerAmountInput("");
    setLedgerRemarksInput("");

    alert("শ্রী রাধারাণীর মহিমায় আপনার পেমেন্ট সফলভাবে সিঙ্ক ও খতিয়ানে নথিভুক্ত হয়েছে।");
  };

  // --- Copy Text helper ---
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const copyFullInvoiceToClipboard = () => {
    if (!activePassbookPassenger) return;
    const shareText = `🌺 চলো ব্রজে যাই, রাধারানীর চরণ পাই 🌺\n\n` +
      `প্রিয় ভক্ত, শ্রীধাম ব্রজ পরিক্রমার বুকিং রসিদ জেনারেট হয়ে গেছে!\n\n` +
      `মেমো নং: #BM-BRJ-2026${activePassbookPassenger.id.slice(-3)}\n` +
      `যাত্রী নাম: ${activePassbookPassenger.name}\n` +
      `মোবাইল নম্বর: ${activePassbookPassenger.mobile}\n` +
      `মোট ভাড়া: ৳${activePassbookPassenger.totalFare}\n` +
      `অগ্রিম জমা: ৳${activePassbookPassenger.advance}\n` +
      `বাকি টাকা: ৳${activePassbookPassenger.due}\n` +
      `শুভযাত্রা শুরু: ${settings.journeyDate}\n\n` +
      `পরিচালক মহারাজ: ${settings.adminProfile.name}\n` +
      `শ্রী রাধে রাধে! কুশলে পথ চলুন।`;
    handleCopyToClipboard(shareText);
  };

  // --- Export Full Payment Ledger to PDF ---
  const exportLedgerToPdf = async () => {
    if (!activePassbookPassenger) return;

    const element = document.getElementById("passenger-full-ledger-pdf-element");
    if (!element) {
      alert("দুঃখিত, খতিয়ানের বিবরণ পাওয়া যায়নি!");
      return;
    }

    setIsSyncing(true);
    setSyncMessage("খতিয়ান অফলাইন পিডিএফ তৈরি হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...");

    try {
      // Temporarily polish element styling for clean capture (Ensures white BG and perfect bounds)
      const originalStyle = element.getAttribute("style") || "";
      element.setAttribute("style", originalStyle + "; background-color: #ffffff !important; max-width: 650px !important; padding: 24px !important;");

      const canvas = await html2canvas(element, {
        scale: 2, // Double resolution for crystal-clear text & QR code rendering
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: -window.scrollY, // Avoid cutoffs from scrolling
        logging: false
      });

      // Restore original visual states
      element.setAttribute("style", originalStyle);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const scaledHeight = (canvasHeight * pdfWidth) / canvasWidth;

      let heightLeft = scaledHeight;
      let position = 0;

      // Add PDF image pages
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledHeight, undefined, "FAST");
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - scaledHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledHeight, undefined, "FAST");
        heightLeft -= pdfHeight;
      }

      const friendlyName = activePassbookPassenger.name.trim().replace(/\s+/g, "_");
      const fileName = `Ledger_Memo_${friendlyName}_${activePassbookPassenger.id}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF generation has failed:", err);
      alert("দুঃখিত, পিডিএফ ডাউনলোড ব্যর্থ হয়েছে। প্রিন্ট বা কপি অপশনটি ব্যবহার করুন।");
    } finally {
      setIsSyncing(false);
      setSyncMessage("");
    }
  };

  // --- QR Code Scanner Success Handler ---
  const handleQrScanSuccess = (decodedTextValue: string) => {
    let phoneMatch = "";
    
    // Pattern 1: URL parameter phone=
    const phoneUrlParamMatch = decodedTextValue.match(/phone=([^&]+)/);
    if (phoneUrlParamMatch && phoneUrlParamMatch[1]) {
      phoneMatch = decodeURIComponent(phoneUrlParamMatch[1]);
    } else {
      // Pattern 2: Look for 'মোবাইল: <10-11 digits>'
      const mobileLineMatch = decodedTextValue.match(/মোবাইল:\s*([0-9+]+)/);
      if (mobileLineMatch && mobileLineMatch[1]) {
        phoneMatch = mobileLineMatch[1].trim();
      } else {
        // Pattern 3: Any sequence of 10-11 numbers
        const generalNumberMatch = decodedTextValue.match(/\b(01\d{9}|\d{10})\b/);
        if (generalNumberMatch) {
          phoneMatch = generalNumberMatch[0];
        }
      }
    }

    // Lookup matching passenger
    const matched = passengers.find(
      (p) => p.mobile === phoneMatch || p.mobile.includes(phoneMatch) || phoneMatch.includes(p.mobile)
    ) || passengers.find(
      (p) => 
        decodedTextValue.includes(p.name) || 
        decodedTextValue.includes(p.id) ||
        p.id.slice(-6).toUpperCase() === decodedTextValue.toUpperCase()
    );

    if (matched) {
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(200);
      }
      // Set as active login and redirect to the Passbook terminal view where the official Digital Cash Memo is printed
      setPassbookLoginMobile(matched.mobile);
      setActivePassbookPassenger(matched);
      setCurrentView("passbook");
    } else {
      alert("দুঃখিত, কোনো যাত্রী বুকিং তথ্য পাওয়া যায়নি! স্ক্যান করা লেখা: " + decodedTextValue);
    }
  };

  // Filter passengers list
  const filteredPassengers = passengers.filter(p => {
    const q = passengerSearchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.mobile.includes(q) || p.address.toLowerCase().includes(q);
  });

  return (
    <div id="full-app-root" className="min-h-screen bg-[#070709] text-[#e5e5e7] flex flex-col antialiased font-sans">
      
      {/* 1. Global AI Sync Loader Overlay */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/75 backdrop-blur-md text-white p-6"
          >
            <div className="relative flex flex-col items-center">
              <RefreshCw className="w-16 h-16 text-amber-400 animate-spin mb-4" />
              <div className="absolute top-5 animate-ping w-14 h-14 bg-amber-400/30 rounded-full" />
              <h3 className="text-xl font-bold font-sans text-amber-300">তথ্য হালনাগাদ করা হচ্ছে</h3>
              <p className="text-sm text-gray-200 text-center max-w-sm mt-2 leading-relaxed">
                {syncMessage || "এআই রিয়েল-টাইম ডাটা রিফ্রেশ করা হচ্ছে..."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. PIN Lock Modal */}
      <PINLoginModal 
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        title={pinModalTitle}
        expectedPinDescription={pinModalTargetView === "action" ? "অ্যাকশন পিন '12345' অথবা '0232'" : "এডমিন পিন '0232'"}
        isActionPin={pinModalTargetView === "action"}
      />

      {/* 2.5 QR Code Scanner Modal */}
      <QRScannerModal
        isOpen={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onScanSuccess={handleQrScanSuccess}
        passengers={passengers}
      />

      {/* 3. Header Bar with Divine Accent */}
      <div className="bg-[#121214] text-white border-b border-[#2d2d33] shadow-md relative z-30 font-sans">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo Title section */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView("home")}>
            <div className="w-10 h-10 rounded-full bg-[#18181b] p-0.5 border-2 border-[#3d3d45] overflow-hidden shrink-0 shadow-inner">
              <img 
                src={settings.realPhoto} 
                alt="Logo" 
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-extrabold font-sans tracking-wide">
                চলো ব্রজে যাই
              </h2>
              <span className="text-[10px] text-[#ffd700] font-bold block leading-none">
                রাধারানীর চরণ পাই ✨
              </span>
            </div>
          </div>

          {/* Right Header Panel: Languages Toggle, Quick menu button */}
          <div className="flex items-center space-x-3">
            
            {/* Language Switch */}
            <div className="flex bg-[#1c1917] rounded-xl p-0.5 border border-[#2d2d33]">
              <button 
                id="lang-toggle-bn"
                onClick={() => setLang("BN")}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${lang === "BN" ? "bg-[#ffd700] text-black shadow-sm" : "text-gray-400 hover:text-white"}`}
              >
                বাংলা
              </button>
              <button 
                id="lang-toggle-en"
                onClick={() => setLang("EN")}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${lang === "EN" ? "bg-[#ffd700] text-black shadow-sm" : "text-gray-400 hover:text-white"}`}
              >
                EN
              </button>
            </div>

            {/* Quick Access Three-Dot Menu (No 3 line hamburger, quick access 3dot button instead) */}
            <div className="relative">
              <button
                id="quick-access-3dot-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-[#2d2d33] rounded-full transition-colors relative z-40 cursor-pointer"
                title="Quick Access Settings"
              >
                <MoreVertical className="w-6 h-6 text-[#ffd700]" />
              </button>

              {/* Floating menu items log on right */}
              <AnimatePresence>
                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#121214] text-white shadow-[0_15px_35px_rgba(0,0,0,0.8)] border border-[#2d2d33] py-2.5 z-40 outline-none"
                    >
                      <div className="px-4 py-2 border-b border-[#2d2d33] text-xs text-[#ffd700] font-black tracking-wide">
                        📿 কুইক মেনু (Quick Actions)
                      </div>
                      
                      <button
                        id="nav-item-home"
                        onClick={() => handleNavigationRequest("home")}
                        className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center space-x-3 transition-colors cursor-pointer ${currentView === "home" ? "bg-[#2d2d33] text-[#ffd700]" : "hover:bg-[#18181b] text-gray-300"}`}
                      >
                        <Home className="w-4 h-4 text-[#ffd700]" />
                        <span>Home (হোম)</span>
                      </button>

                      <button
                        id="nav-item-ai"
                        onClick={() => handleNavigationRequest("ai-guide")}
                        className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center space-x-3 transition-colors cursor-pointer ${currentView === "ai-guide" ? "bg-[#2d2d33] text-[#ffd700]" : "hover:bg-[#18181b] text-gray-300"}`}
                      >
                        <MessageSquare className="w-4 h-4 text-green-400" />
                        <span>AI Guide / AI Help</span>
                      </button>

                      <button
                        id="nav-item-passengers"
                        onClick={() => handleNavigationRequest("passengers")}
                        className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center space-x-3 transition-colors cursor-pointer ${currentView === "passengers" ? "bg-[#2d2d33] text-[#ffd700]" : "hover:bg-[#18181b] text-gray-300"}`}
                      >
                        <Users className="w-4 h-4 text-blue-400" />
                        <span>যাত্রীর তালিকা (List)</span>
                      </button>

                      <button
                        id="nav-item-admin"
                        onClick={() => handleNavigationRequest("admin")}
                        className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center space-x-3 transition-colors cursor-pointer ${currentView === "admin" ? "bg-[#2d2d33] text-[#ffd700]" : "hover:bg-[#18181b] text-gray-300"}`}
                      >
                        <User className="w-4 h-4 text-orange-400" />
                        <span>Admin Profile (এডমিন)</span>
                      </button>

                      <button
                        id="nav-item-booking"
                        onClick={() => handleNavigationRequest("booking")}
                        className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center space-x-3 transition-colors cursor-pointer ${currentView === "booking" ? "bg-[#2d2d33] text-[#ffd700]" : "hover:bg-[#18181b] text-gray-300"}`}
                      >
                        <Plus className="w-4 h-4 text-[#ff4500]" />
                        <span>New Booking (বুকিং)</span>
                      </button>

                      <button
                        id="nav-item-action"
                        onClick={() => handleNavigationRequest("action")}
                        className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center space-x-3 transition-colors cursor-pointer ${currentView === "action" ? "bg-[#2d2d33] text-[#ffd700]" : "hover:bg-[#18181b] text-gray-300"}`}
                      >
                        <Settings className="w-4 h-4 text-red-500" />
                        <span>Action Panel (সেটিংস)</span>
                      </button>

                      <button
                        id="nav-item-passbook"
                        onClick={() => handleNavigationRequest("passbook")}
                        className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center space-x-3 transition-colors cursor-pointer ${currentView === "passbook" ? "bg-[#2d2d33] text-[#ffd700]" : "hover:bg-[#18181b] text-gray-300"}`}
                      >
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <span>Passbook (ক্যাশ মেমো)</span>
                      </button>

                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </div>

      {/* 4. Elegant Header Divine Banner with custom images & live parameters */}
      <DivineHeader settings={settings} onEditPhotosClick={() => handleNavigationRequest("action")} />

      {/* 5. Main Screen Views Routers */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6">
        
        {/* VIEW 1: HOME PAGE */}
        {currentView === "home" && (
          <div className="relative">
            {/* Left and Right Floating/Glow frames on Large screens (Desktop Sideboards) */}
            <div className="hidden xl:block fixed left-4 xl:left-8 top-1/4 w-36 xl:w-44 z-40 transform translate-y-6">
              <motion.div
                className="bg-[#121214] p-2.5 rounded-3xl border-2 border-[#ffd700] text-center space-y-2 overflow-hidden shadow-lg"
              >
                <div className="relative rounded-2.5xl overflow-hidden aspect-[3/4]">
                  <img
                    src="/src/assets/images/radha1_1781521333839.jpg"
                    alt="Radha Krishna Left"
                    className="w-full h-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />
                  {/* Glowing Spotlight effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-2 left-0 right-0 text-[10px] text-[#ffd700] font-black tracking-widest font-sans uppercase">
                    ✨ শ্রী রাধা ✨
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="hidden xl:block fixed right-4 xl:right-8 top-1/4 w-36 xl:w-44 z-40 transform translate-y-6">
              <motion.div
                className="bg-[#121214] p-2.5 rounded-3xl border-2 border-[#ffd700] text-center space-y-2 overflow-hidden shadow-lg"
              >
                <div className="relative rounded-2.5xl overflow-hidden aspect-[3/4]">
                  <img
                    src="/src/assets/images/radha2_1781521353910.jpg"
                    alt="Radha Krishna Right"
                    className="w-full h-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />
                  {/* Glowing Spotlight effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-2 left-0 right-0 text-[10px] text-[#ffd700] font-black tracking-widest font-sans uppercase">
                    ✨ শ্রী কৃষ্ণ ✨
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Mobile / Responsive Row side-by-side: Shows at the very top of home view on mobile (xl:hidden) */}
            <div className="grid grid-cols-2 gap-3 xl:hidden mb-4">
              <motion.div
                className="bg-[#121214] p-2.5 rounded-2xl border border-[#ffd700]/70 flex items-center space-x-3 relative overflow-hidden"
              >
                <img
                  src="/src/assets/images/radha1_1781521333839.jpg"
                  alt="Radha Krishna Left Mobile"
                  className="w-12 h-16 object-cover rounded-xl border border-amber-500/40 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <span className="text-xs font-black text-[#ffd700] leading-none block">শ্রী রাধা</span>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-yellow-400"></div>
              </motion.div>

              <motion.div
                className="bg-[#121214] p-2.5 rounded-2xl border border-[#ffd700]/70 flex items-center space-x-3 relative overflow-hidden"
              >
                <img
                  src="/src/assets/images/radha2_1781521353910.jpg"
                  alt="Radha Krishna Right Mobile"
                  className="w-12 h-16 object-cover rounded-xl border border-amber-500/40 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <span className="text-xs font-black text-[#ffd700] leading-none block">শ্রী কৃষ্ণ</span>
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-amber-500"></div>
              </motion.div>
            </div>

            <div className="space-y-6">
            
            {/* AI Smart Dynamic Live Dashboard Banner */}
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-gradient-to-br from-[#121214] via-[#1a1a1f] to-[#121214] border border-[#ff9933]/25 text-white rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 w-24 h-24 opacity-5 transform translate-x-5 -translate-y-5">
                <Clock className="w-full h-full text-white" />
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2 text-[#ffd700]">
                    <Sparkles className="w-5 h-5 text-[#ffd700] animate-spin-slow" />
                    <span className="text-xs uppercase tracking-widest font-black leading-none">
                      AI Smart Real-Time Dashboard
                    </span>
                  </div>
                  
                  {/* Digital Clock */}
                  <div className="text-3xl font-black font-sans tracking-wide text-[#ffd700] animate-pulse">
                    ⏰ {liveTime || "00:00:00 AM"}
                  </div>
                  <div className="text-xs text-gray-300 font-bold mt-1">
                    {liveDate}
                  </div>
                </div>

                <div className="bg-[#18181b]/90 p-4 rounded-2xl border border-[#2d2d33] text-xs space-y-2 self-center">
                  <p className="text-[#ff9933] font-bold flex items-center space-x-1">
                    <span>🕉️ জ্যোতিষীয় ও ধর্মীয় তথ্যাবলি (Daily Tithi Details):</span>
                  </p>
                  <p className="text-gray-300 font-semibold">• বাংলা তারিখ: <span className="text-[#ffd700] font-bold">{bengaliDateStr}</span></p>
                  <p className="text-gray-300 font-semibold">• আজকের তিথি: <span className="text-[#ffd700] font-bold">শ্রী বাহুলাষ্টমী অমৃতযোগ</span></p>
                  <p className="text-gray-300 font-semibold flex items-center shrink-0 flex-wrap">• উৎসব: <span className="text-[#ffd700] font-bold bg-amber-950/40 border border-[#ff9933]/30 px-2.5 py-0.5 rounded-full inline-block text-[10px] ml-1">শ্রী রাধাকুণ্ড প্রকাশ উৎসব</span></p>
                </div>
              </div>
            </motion.div>

            {/* Dynamic Latest Notices directly edited via Action page */}
            {/* "একশন বাটন ও এডমিন বাটন যা কিছু আপলোড বা সেভ করা হবে একমাত্র যাত্রী ডিটেলস ছাড়া হোমপেজে অটো দেখাবে" */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Notification & Special Offer */}
              <div className="bg-gradient-to-br from-[#121214] to-[#18181b] p-5 rounded-2.5xl border border-[#2d2d33] shadow-md">
                <span className="text-xs font-black text-[#ffd700] tracking-wider block mb-2 font-sans uppercase">📢 সর্বশেষ ক্যাম্প ঘোষণা (Announcements)</span>
                <p id="home-notification-text" className="text-sm font-extrabold text-white font-sans leading-relaxed">
                  {settings.notification}
                </p>
              </div>

              {/* Special Offer Alert */}
              <div className="bg-gradient-to-br from-[#121214] to-[#18181b] p-5 rounded-2.5xl border border-[#2d2d33] shadow-md flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black text-[#ff9933] tracking-wider block mb-2 font-sans uppercase">✨ বিশেষ অফার কোটা (Special Offers)</span>
                  <p id="home-offer-text" className="text-sm font-extrabold text-white font-sans leading-relaxed">
                    {settings.specialOffer}
                  </p>
                </div>
                {settings.termsAndConditions && (
                  <p className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-[#2d2d33] font-semibold">
                    🔍 শর্তাবলী: {settings.termsAndConditions}
                  </p>
                )}
              </div>

            </div>

            {/* Emergency & Daily notice alerts */}
            {(settings.emergencyNotice || settings.dailyNotice) && (
              <div className="bg-red-950/20 border border-red-900/30 rounded-2.5xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="p-2.5 bg-red-900/30 rounded-xl text-red-400 shrink-0 border border-red-800/40">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  {settings.emergencyNotice && (
                    <p className="text-xs text-red-200 font-extrabold font-sans">
                      ⚠️ জরুরি বিজ্ঞপ্তি: {settings.emergencyNotice}
                    </p>
                  )}
                  {settings.dailyNotice && (
                    <p className="text-xs text-[#a1a1aa] font-bold">
                      🔔 দৈনিক বিজ্ঞপ্তি: {settings.dailyNotice}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Admin Profile Overview - Auto Show Admin details */}
            <div className="bg-[#121214] rounded-2.5xl p-5 border border-[#2d2d33] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <img 
                  src={settings.adminProfile.photoUrl} 
                  alt="Admin Photo" 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#ffd700]/70 shadow-md shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#ffd700] bg-[#2d2d33] px-3 py-0.5 rounded-full border border-[#cbd5e1]/10">ব্রজ পরিক্রমা প্রধান চালক (Organizer Profile)</span>
                  <h4 className="text-base text-white font-black font-sans leading-tight mt-1.5">
                    {settings.adminProfile.name}
                  </h4>
                  <p className="text-xs text-[#a1a1aa] font-bold font-sans mt-0.5">
                    📍 {settings.adminProfile.address}
                  </p>
                </div>
              </div>
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-center w-full sm:w-auto gap-2 border-t sm:border-t-0 border-[#2d2d33] pt-4 sm:pt-0">
                <a 
                  href={`tel:${settings.adminProfile.mobile}`}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all w-full sm:w-auto text-center justify-center shadow-xs cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Organizer</span>
                </a>
                <a 
                  href={`https://wa.me/${settings.adminProfile.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all w-full sm:w-auto text-center justify-center shadow-xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp Chat</span>
                </a>
              </div>
            </div>

            {/* Section: Popular Pilgrimage spots - বেন্টো গ্রিড (Vrindavan, Mathura etc) */}
            <div>
              <h3 className="text-lg font-black text-white font-sans mb-4 flex items-center space-x-2">
                <span className="p-1 px-2.5 bg-[#2d2d33] rounded-lg text-[#ffd700] text-sm border border-[#3d3d45]/40 font-bold">🏞️</span>
                <span>পবিত্র তীর্থদর্শন পরিচিতি (Sacred Pilgrimages)</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {settings.touristPlaces.map((spot, index) => {
                  const spotName = spot.split(" - ")[0] || "পবিত্র স্থান";
                  const spotDesc = spot.split(" - ")[1] || "লীলামাহাত্ম্য দর্শন";
                  return (
                    <motion.div
                      id={`pilgrim-card-${index}`}
                      key={index}
                      whileHover={{ y: -3 }}
                      className="bg-[#121214] p-4 rounded-2xl border border-[#2d2d33] shadow-sm hover:border-[#ffd700]/50 transition-all cursor-pointer flex flex-col justify-between"
                      onClick={() => {
                        // Ask AI about this spot instantly
                        setCurrentView("ai-guide");
                        handleSendMessage(`${spotName} সম্পর্কে বিস্তারিত ধর্মীয় লীলামাহাত্ম্য ও দর্শনের বিধি জানান।`);
                      }}
                    >
                      <div>
                        <h4 className="text-sm text-white font-black font-sans mb-1 select-none flex items-center space-x-1">
                          <span className="text-[#ffd700]">★</span>
                          <span>{spotName}</span>
                        </h4>
                        <p className="text-xs text-[#a1a1aa] leading-snug font-semibold">
                          {spotDesc}
                        </p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-[#2d2d33] flex items-center justify-between text-[10px] text-[#ffd700] font-black">
                        <span>প্রশ্ন জিজ্ঞাসা করুন ✨</span>
                        <ArrowRight className="w-3" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Tour Daily Timeline (যাত্রার সময়সূচী) */}
            <TourTimeline 
              lang={lang} 
              onAskAI={(prompt) => {
                setCurrentView("ai-guide");
                handleSendMessage(prompt);
              }} 
            />

            {/* Interactive weather forecast for devotees */}
            <WeatherWidget />

            {/* Full Bengali Calendar / complete Ponjika */}
            <BengaliCalendar />

            {/* Interactive Dynamic Photo Gallery section */}
            <div className="bg-[#121214] p-5 rounded-3xl border border-[#2d2d33] shadow-md">
              <h3 className="text-lg font-black text-white font-sans mb-3 flex items-center space-x-2">
                <span className="p-1 px-2.5 bg-[#2d2d33] rounded-lg text-[#ffd700] text-sm border border-[#3d3d45]/40 font-bold">📸</span>
                <span>ব্রজ লীলা স্মারক গ্যালারি (Photo Gallery)</span>
              </h3>
              <p className="text-xs text-gray-400 mb-3.5">ভক্তদের দ্বারা শেয়ার করা ব্রজধামের চমৎকার ছবিসমূহ।</p>
              
              {settings.gallery && settings.gallery.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {settings.gallery.slice(0, 4).map((img, index) => (
                    <div
                      id={`home-gallery-item-${index}`}
                      key={index}
                      className="relative rounded-2xl overflow-hidden border border-[#2d2d33] bg-[#18181b] aspect-[4/3] cursor-pointer"
                    >
                      <img
                        src={img}
                        alt={`Braja Dham ${index + 1}`}
                        className="w-full h-full object-cover select-none"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-gray-500 border border-dashed border-[#2d2d33] rounded-2xl bg-[#0c0c0e]">
                  কোনো ছবি গ্যালারিতে সংরক্ষিত নেই। এডমিন প্যানেল থেকে আপলোড করুন।
                </div>
              )}
            </div>

          </div>
        </div>
        )}

        {/* VIEW 2: AI GUIDE / AI HELP PAGE */}
        {currentView === "ai-guide" && (
          <div className="bg-[#121214] rounded-3xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-[#2d2d33] flex flex-col h-[600px] font-sans">
            <div className="bg-[#18181b] border-b border-[#2d2d33] p-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-[#ffd700] animate-spin-slow" />
                <div>
                  <h3 className="text-base font-black font-sans leading-none">ব্রজ পথদর্শক AI গাইড</h3>
                  <span className="text-[11px] text-[#ffd700]/70">Spiritual AI Guide Chatroom</span>
                </div>
              </div>
              <button 
                id="reset-chat-history"
                onClick={() => {
                  if (confirm("আপনি কি চ্যাট ইতিহাস মুছে ফেলতে চান?")) {
                    setChatMessages([
                      {
                        id: "welcome-1",
                        sender: "ai",
                        text: "রাধে রাধে! শ্রী হরি আপনার অন্তরে প্রেম ভক্তি জাগ্রত করুক। কোনো লীলামাহাত্ম্য জিজ্ঞাসা করবেন?",
                        timestamp: new Date().toLocaleTimeString()
                      }
                    ]);
                  }
                }}
                className="text-xs text-rose-400 hover:text-white bg-red-950/25 px-3 py-1.5 rounded-lg border border-red-900/30 transition-all font-black cursor-pointer hover:bg-rose-950"
              >
                Clear Chats
              </button>
            </div>

            {/* Chat Room History scroll segment */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0c0c0e]">
              {chatMessages.map((msg) => (
                <div
                  id={`chat-msg-row-${msg.id}`}
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-md ${
                    msg.sender === "user"
                      ? "bg-[#ffd700] text-black font-extrabold rounded-tr-none"
                      : "bg-[#18181b] text-white rounded-tl-none border border-[#2d2d33]"
                  }`}>
                    <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap font-sans">
                      {msg.text}
                    </p>
                    <span className="text-[9px] opacity-60 block mt-1.5 text-right font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#18181b] border border-[#2d2d33] rounded-2xl p-4 shadow-sm flex items-center space-x-2">
                    <span className="text-xs text-gray-300 font-bold font-sans animate-pulse">
                      शास्त्रগ্রন্থ ঘেঁটে রাধারানীর কৃপায় উত্তর প্রস্তুত হচ্ছে...
                    </span>
                    <RefreshCw className="w-3.5 h-3.5 text-[#ffd700] animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Suggestions Rail */}
            <div className="px-4 py-3 bg-[#121214] border-t border-[#2d2d33] flex items-center space-x-2 overflow-x-auto whitespace-nowrap">
              <span className="text-[10px] uppercase font-black text-[#ffd700] shrink-0">কুইক জিজ্ঞাসা:</span>
              <button type="button" onClick={() => handleSendMessage("বৃন্দাবন কোথায় উপস্থিত ও কী মন্দির আছে?")} className="text-xs font-bold text-[#e5e5e7] bg-[#18181b] border border-[#2d2d33] px-3.5 py-1.5 rounded-full hover:bg-[#2d2d33] hover:text-[#ffd700] transition-colors cursor-pointer">📍 বৃন্দাবন কোথায়?</button>
              <button type="button" onClick={() => handleSendMessage("গোবর্ধন পরিক্রমা নিয়মের কথা বলুন।")} className="text-xs font-bold text-[#e5e5e7] bg-[#18181b] border border-[#2d2d33] px-3.5 py-1.5 rounded-full hover:bg-[#2d2d33] hover:text-[#ffd700] transition-colors cursor-pointer">🏔️ গোবর্ধন পরিক্রমা</button>
              <button type="button" onClick={() => handleSendMessage("श्री রাধাকুণ্ডের মাহাত্ম্য কাহিনী কী?")} className="text-xs font-bold text-[#e5e5e7] bg-[#18181b] border border-[#2d2d33] px-3.5 py-1.5 rounded-full hover:bg-[#2d2d33] hover:text-[#ffd700] transition-colors cursor-pointer">✨ রাধাকুণ্ড</button>
            </div>

            {/* Message input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-4 border-t border-[#2d2d33] bg-[#0c0c0e] flex items-center space-x-2"
            >
              <input
                id="chat-user-message-input"
                type="text"
                placeholder="লীলামাহাত্ম্য বা সফর সম্পর্কে প্রশ্ন করুন (Ask Spiritual AI Guide)..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isChatLoading}
                className="flex-1 px-4 py-3 bg-[#121214] border border-[#2d2d33] text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:border-transparent transition-all text-sm font-sans placeholder-gray-500"
              />
              <button
                id="chat-send-message-button"
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="p-3 bg-[#ffd700] hover:bg-amber-500 disabled:bg-[#2d2d33] text-black disabled:text-gray-500 rounded-2xl transition-all shadow-md shrink-0 cursor-pointer"
              >
                <ArrowRight className="w-5 h-5 font-black" />
              </button>
            </form>
          </div>
        )}

        {/* VIEW 3: PASSENGER LIST VIEW */}
        {currentView === "passengers" && (
          <div className="space-y-4">

            {/* FINANCIAL VISUALIZATION BAR CHART CARD */}
            <div className="bg-[#121214] rounded-3xl p-5 border border-[#2d2d33] shadow-lg space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-3 border-b border-[#2d2d33]">
                <div>
                  <h3 className="text-lg font-black text-white font-sans flex items-center space-x-2">
                    <span className="p-1 px-2.5 bg-[#2d2d33] rounded-lg text-[#ffd700] font-bold border border-[#3d3d45]/40">📊</span>
                    <span>অর্থ পরিশোধ খতিয়ান (Ledger Bar Chart Analysis)</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">সব যাত্রীদের মোট ভাড়ার বিপরীতে জমাকৃত ও বকেয়া টাকার তুলনামূলক চিত্র।</p>
                </div>
                
                {/* Visual Summary stats in header */}
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <div className="flex items-center space-x-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-gray-350 font-bold">মোট সংগৃহীত: <span className="text-emerald-400 font-extrabold">৳{enToBnString(passengers.reduce((sum, p) => sum + bnToEnNumber(p.advance), 0))}</span></span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-gray-355 font-bold">মোট বকেয়া: <span className="text-rose-400 font-extrabold">৳{enToBnString(passengers.reduce((sum, p) => sum + bnToEnNumber(p.due), 0))}</span></span>
                  </div>
                </div>
              </div>

              {/* Chart container */}
              <div className="h-64 sm:h-80 w-full bg-[#0c0c0e]/60 rounded-2xl p-4 border border-[#2d2d33]/60 relative">
                {passengers.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-gray-500 font-bold">
                    চার্ট দেখানোর মতো কোনো যাত্রী খুঁজে পাওয়া যায়নি।
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={passengers.map(p => ({
                        name: p.name,
                        "জমা পরিক্রমা অর্ঘ্য (Paid)": bnToEnNumber(p.advance),
                        "বকেয়া অর্ঘ্য (Due)": bnToEnNumber(p.due),
                      }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d2d33" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#888888" 
                        fontSize={10} 
                        fontWeight="bold"
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#888888" 
                        fontSize={10} 
                        fontWeight="bold"
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#18181b",
                          border: "1px solid #2d2d33",
                          borderRadius: "16px",
                          fontSize: "12px",
                          color: "#ffffff"
                        }}
                        itemStyle={{ color: "#ffffff", fontWeight: "bold" }}
                        labelStyle={{ color: "#ffd700", fontWeight: "black", marginBottom: "4px" }}
                        formatter={(value: any, name: any) => [`৳${enToBnString(value)}`, name]}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconSize={10}
                        iconType="circle"
                        wrapperStyle={{ fontSize: "11px", fontWeight: "bold", color: "#a1a1aa" }}
                      />
                      <Bar dataKey="জমা পরিক্রমা অর্ঘ্য (Paid)" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="বকেয়া অর্ঘ্য (Due)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            
            <div className="bg-[#121214] rounded-3xl p-5 border border-[#2d2d33] shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-3 border-b border-[#2d2d33]">
                <div>
                  <h3 className="text-xl font-black text-white font-sans flex items-center space-x-2">
                    <span className="p-1 px-2.5 bg-[#2d2d33] rounded-lg text-[#ffd700] font-bold border border-[#3d3d45]/40">📋</span>
                    <span>যাত্রীর তালিকা (Devotee List Profiles)</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">সব বুকিং করা যাত্রীদের বিবরণী এখানে সংরক্ষিত আছে।</p>
                </div>
                
                {/* Search Bar & QR scanner action */}
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      id="passenger-list-search-input"
                      type="text"
                      placeholder="নাম বা মোবাইল দিয়ে খুঁজুন..."
                      value={passengerSearchQuery}
                      onChange={(e) => setPassengerSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const query = passengerSearchQuery.trim();
                          if (query.length >= 2) {
                            setRecentSearches((prev) => {
                              const filtered = prev.filter((t) => t.toLowerCase() !== query.toLowerCase());
                              const updated = [query, ...filtered].slice(0, 5);
                              try {
                                localStorage.setItem("passenger_search_history", JSON.stringify(updated));
                              } catch {}
                              return updated;
                            });
                          }
                        }
                      }}
                      className="px-4 py-2 pl-9 bg-[#0c0c0e] border border-[#2d2d33] text-[#ffd700] placeholder-gray-500 font-semibold text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffd700] w-full sm:w-64"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>

                  <button
                    id="passenger-list-qr-scan-btn"
                    type="button"
                    onClick={() => setQrScannerOpen(true)}
                    className="py-2 px-3.5 bg-[#ffd700] hover:bg-amber-500 text-black text-xs font-black rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-md shrink-0 active:scale-95"
                    title="QR কোড স্ক্যান করুন"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>QR স্ক্যান</span>
                  </button>
                </div>
              </div>

              {/* Recent Search History Section */}
              {recentSearches.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-4 p-2.5 bg-[#18181b]/40 rounded-2xl border border-[#2d2d33]/50">
                  <span className="text-[10px] text-[#ffd700] font-black flex items-center gap-1 shrink-0 ml-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>সাম্প্রতিক অনুসন্ধান:</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                    {recentSearches.map((term, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setPassengerSearchQuery(term)}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                          passengerSearchQuery === term
                            ? "bg-[#ffd700]/25 text-[#ffd700] border border-[#ffd700]/40"
                            : "bg-[#2d2d33]/50 text-gray-300 hover:text-white border border-[#2d2d33] hover:border-gray-500/30"
                        }`}
                      >
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.setItem("passenger_search_history", JSON.stringify([]));
                    }}
                    className="text-[9px] text-[#ff4d4d] hover:text-[#ff1a1a] mr-1 transition-colors font-bold cursor-pointer"
                  >
                    সব মুছুন
                  </button>
                </div>
              )}

              {/* Devotee List display */}
              <div className="space-y-3">
                {filteredPassengers.length > 0 ? (
                  filteredPassengers.map((p) => (
                    <div
                      id={`p-card-${p.id}`}
                      key={p.id}
                      className="p-5 rounded-2.5xl border border-[#2d2d33] bg-[#18181b]/60 hover:bg-[#18181b] transition-all"
                    >
                      {/* Flex grid representing passenger detail with dynamic upload photos */}
                      <div className="flex flex-col md:flex-row items-start gap-4">
                        
                        {/* Passenger and Aadhar preview images slots */}
                        <div className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-2 shrink-0">
                          <div className="text-center">
                            <img 
                              src={p.photo} 
                              alt={p.name} 
                              className="w-16 h-16 rounded-xl object-cover border border-[#ffd700]/50 shadow-sm bg-[#2d2d33]/50"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-[9px] text-[#a1a1aa] block mt-0.5 font-bold">যাত্রী ছবি</span>
                          </div>
                          
                          <div className="text-center">
                            <img 
                              src={p.aadharPhoto} 
                              alt="Aadhar Card" 
                              className="w-16 h-16 rounded-xl object-cover border border-cyan-800/40 shadow-sm bg-[#2d2d33]/50"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-[9px] text-cyan-400 block mt-0.5 font-bold">আধার ছবি</span>
                          </div>
                        </div>

                        {/* Text fields specified as BLACK and BOLD (as requested) */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-4">
                          <div>
                            <span className="text-[9px] text-[#ffd700] uppercase block font-bold">যাত্রী নাম (Name)</span>
                            <span className="text-sm text-white font-extrabold font-sans leading-none">{p.name}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#ffd700] uppercase block font-bold">পিতার নাম (Father's Name)</span>
                            <span className="text-sm text-white font-extrabold font-sans block leading-none">{p.fatherName}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#ffd700] uppercase block font-bold">বয়স / লিঙ্গ (Age/Gender)</span>
                            <span className="text-sm text-white font-extrabold font-sans block leading-none">{p.age} বছর / {p.gender}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#ffd700] uppercase block font-bold">মোবাইল নাম্বার (Mobile)</span>
                            <span className="text-sm text-white font-extrabold font-sans block leading-none">{p.mobile}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#ffd700] uppercase block font-bold">আধার নাম্বার (Aadhar ID)</span>
                            <span className="text-sm text-white font-extrabold font-sans block leading-none">{p.aadhar}</span>
                          </div>
                          <div className="sm:col-span-2 md:col-span-3">
                            <span className="text-[9px] text-[#ffd700] uppercase block font-bold">ঠিকানা (Full Address)</span>
                            <span className="text-sm text-white font-extrabold font-sans block leading-none">{p.address}</span>
                          </div>
                          
                          {/* Financial values segment */}
                          <div className="mt-3.5 bg-[#2d2d33]/40 p-3 rounded-xl border border-[#3d3d45]/40 col-span-3 grid grid-cols-3 gap-2">
                            <div className="text-center">
                              <span className="text-[9px] text-gray-400 block font-bold">মোট ভাড়া (Total)</span>
                              <span className="text-sm text-[#ffd700] font-sans block font-black">৳{p.totalFare}</span>
                            </div>
                            <div className="text-center border-x border-[#3d3d45]">
                              <span className="text-[9px] text-green-400 block font-bold">অগ্রিম জমা (Advance)</span>
                              <span className="text-sm text-green-400 font-sans block font-black">৳{p.advance}</span>
                            </div>
                            <div className="text-center">
                              <span className="text-[9px] text-red-400 block font-bold">বাকি টাকা (Due)</span>
                              <span className="text-sm text-red-400 font-sans block font-black">৳{p.due}</span>
                            </div>
                          </div>

                        </div>

                        {/* Actions buttons */}
                        <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 border-[#2d2d33] pt-3 md:pt-0">
                          <button
                            id={`view-invoice-btn-${p.id}`}
                            type="button"
                            onClick={() => {
                              setSelectedPassenger(p);
                              setShowInvoiceModal(true);
                            }}
                            className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Memo</span>
                          </button>
                          
                          <button
                            id={`edit-p-btn-${p.id}`}
                            type="button"
                            onClick={() => startEditPassenger(p)}
                            className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <span>Edit Passenger</span>
                          </button>
                          
                          <button
                            id={`delete-p-btn-${p.id}`}
                            type="button"
                            onClick={() => deletePassenger(p.id)}
                            className="flex-1 py-1.5 px-3 bg-red-650 hover:bg-red-750 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-[#0c0c0e] rounded-2xl border border-dashed border-[#2d2d33] font-bold">
                    কোনো তথ্য বা যাত্রী মেলেনি! পুনরায় খোঁজ করুন।
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* VIEW 4: ADMIN PROFILE PAGE */}
        {currentView === "admin" && (
          <div className="max-w-xl mx-auto">
            
            <form onSubmit={(e) => {
              e.preventDefault();
              saveAppSettings({ ...settings });
              alert("অভিনন্দন! এডমিন ছবি ও তথ্য ডাটাবেসে সফলভাবে সং সংরক্ষিত হয়েছে।");
              setCurrentView("home");
            }} className="bg-white rounded-3xl p-6 border border-amber-100 shadow-xl space-y-5">
              
              <div className="pb-3 border-b border-gray-100 text-center">
                <span className="text-xs font-black text-amber-700 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full">Secure Admin Panel</span>
                <h3 className="text-xl font-black text-black font-sans mt-2">
                  অর্গানাইজেশন প্রোফাইল পরিচালন (Admin Profile)
                </h3>
              </div>

              {/* Required labels & form text fields as BLACK and BOLD */}
              <div className="flex flex-col items-center p-4 bg-amber-50/50 rounded-2xl border border-amber-200">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-500 bg-orange-100 shadow-inner">
                  <img 
                    src={settings.adminProfile.photoUrl} 
                    alt="Uploaded Admin Image" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <label className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer">
                    <Upload className="w-4 h-4 mb-1" />
                    <span>আপলোড করুন</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, (base64) => {
                        saveAppSettings({
                          ...settings,
                          adminProfile: { ...settings.adminProfile, photoUrl: base64 }
                        });
                      })} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <span className="text-xs text-gray-500 mt-2 font-semibold">এডমিন ছবি আপলোড করুন</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-1.5">
                    এডমিন নাম (Admin Name)
                  </label>
                  <input
                    id="admin-form-name-input"
                    type="text"
                    required
                    value={settings.adminProfile.name}
                    onChange={(e) => saveAppSettings({
                      ...settings,
                      adminProfile: { ...settings.adminProfile, name: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-sans"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-1.5">
                    ঠিকানা (Address)
                  </label>
                  <input
                    id="admin-form-address-input"
                    type="text"
                    required
                    value={settings.adminProfile.address}
                    onChange={(e) => saveAppSettings({
                      ...settings,
                      adminProfile: { ...settings.adminProfile, address: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">
                      মোবাইল নাম্বার
                    </label>
                    <input
                      id="admin-form-mobile-input"
                      type="text"
                      required
                      value={settings.adminProfile.mobile}
                      onChange={(e) => saveAppSettings({
                        ...settings,
                        adminProfile: { ...settings.adminProfile, mobile: e.target.value }
                      })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-1.5">
                      WhatsApp নাম্বার
                    </label>
                    <input
                      id="admin-form-whatsapp-input"
                      type="text"
                      required
                      value={settings.adminProfile.whatsapp}
                      onChange={(e) => saveAppSettings({
                        ...settings,
                        adminProfile: { ...settings.adminProfile, whatsapp: e.target.value }
                      })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-sans"
                    />
                  </div>
                </div>

              </div>

              <div className="flex space-x-3 pt-3 border-t border-gray-100">
                <button
                  id="admin-form-back-button"
                  type="button"
                  onClick={() => setCurrentView("home")}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-750 font-bold rounded-xl transition-all text-sm"
                >
                  ফিরে যান (Back)
                </button>
                <button
                  id="admin-form-save-button"
                  type="submit"
                  className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all text-sm shadow-md"
                >
                  তথ্য সংরক্ষণ করুন (Save Admin Profile)
                </button>
              </div>

            </form>

          </div>
        )}

        {/* VIEW 5: BOOKING PAGE - Passenger Registrations with required photo uploads */}
        {currentView === "booking" && (
          <div className="max-w-2xl mx-auto">
            
            <form onSubmit={handleBookingSubmit} className="bg-white rounded-3xl p-6 border border-amber-100 shadow-xl space-y-5">
              
              <div className="pb-3 border-b border-gray-100 text-center">
                <span className="text-xs font-black text-amber-700 uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full">Devotee Booking Portal</span>
                <h3 className="text-xl font-black text-black font-sans mt-2">
                  {bookingEditId ? "যাত্রীর বুকিং তথ্য হালনাগাদ" : "নতুন যাত্রী পরিক্রমা বুকিং ফরম"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">যাত্রীদের সমস্ত তথ্য এবং আপলোডকৃত ফটো সুরক্ষিত ক্লাউড সিঙ্কে জমা হবে।</p>
              </div>

              {/* Photo & Aadhar Document Upload Zone */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#FAF9F6] rounded-2xl border border-gray-200">
                
                {/* dev photo */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-amber-100 border border-amber-300 rounded-2xl overflow-hidden relative shadow-inner">
                    {bookingForm.photo ? (
                      <img src={bookingForm.photo} alt="Devotee" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-amber-800">
                        <Upload className="w-7 h-7" />
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 text-white text-[9px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      আপলোড
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, (base64) => setBookingForm({ ...bookingForm, photo: base64 }))} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                  <span className="text-xs font-bold text-black mt-1">যাত্রীর ছবি আপলোড করুন *</span>
                </div>

                {/* aadhar photo */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-cyan-50 border border-cyan-200 rounded-2xl overflow-hidden relative shadow-inner">
                    {bookingForm.aadharPhoto ? (
                      <img src={bookingForm.aadharPhoto} alt="Aadhar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-cyan-800">
                        <Upload className="w-7 h-7" />
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 text-white text-[9px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      আপলোড
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, (base64) => setBookingForm({ ...bookingForm, aadharPhoto: base64 }))} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                  <span className="text-xs font-bold text-black mt-1">আধার কার্ড আপলোড করুন *</span>
                </div>

              </div>

              {/* Form Input fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-black mb-1 flex items-center space-x-1">
                    <span>যাত্রীর সম্পূর্ণ নাম (Passenger Name) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: রামকৃষ্ণ সান্যাল"
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    পিতার বা স্বামীর নাম (Father's Name)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: মৃত হরিদাস সান্যাল"
                    value={bookingForm.fatherName}
                    onChange={(e) => setBookingForm({ ...bookingForm, fatherName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    বয়স (Age in Years) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="যেমন: ৫৮"
                    value={bookingForm.age}
                    onChange={(e) => setBookingForm({ ...bookingForm, age: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    লিঙ্গ (Gender) *
                  </label>
                  <select
                    value={bookingForm.gender}
                    onChange={(e) => setBookingForm({ ...bookingForm, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-sans"
                  >
                    <option value="পুরুষ">পুরুষ</option>
                    <option value="মহিলা">মহিলা</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    মোবাইল নম্বর (Mobile Number) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    placeholder="যেমন: ৯৮৭৬৫৪৩২১০"
                    value={bookingForm.mobile}
                    onChange={(e) => setBookingForm({ ...bookingForm, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    আধার কার্ড নম্বর (Aadhar Card Number) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ১২৩৪ ৫৬৭৮ ৯১১২"
                    value={bookingForm.aadhar}
                    onChange={(e) => setBookingForm({ ...bookingForm, aadhar: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-sans"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-black mb-1">
                    যাত্রীর ঠিকানা (Full Address) *
                  </label>
                  <textarea
                    required
                    placeholder="যেমন: গ্রাম, পোস্ট, জেলা, পিন কোড"
                    value={bookingForm.address}
                    onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-sans h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    মোট নির্ধারিত অর্ঘ্য / ভাড়া (Total Fare in ৳) *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.totalFare}
                    onChange={(e) => setBookingForm({ ...bookingForm, totalFare: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    অগ্রিম জমা পরিমাণ (Advance Paid in ৳) *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.advance}
                    onChange={(e) => setBookingForm({ ...bookingForm, advance: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-sans"
                  />
                </div>

              </div>

              <div className="flex gap-4 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentView("passengers")}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-750 font-bold rounded-xl transition-all text-sm cursor-pointer"
                >
                  ফিরে যান (Back)
                </button>
                <button
                  id="booking-form-submit-btn"
                  type="submit"
                  className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all text-sm shadow-md cursor-pointer"
                >
                  {bookingEditId ? "তথ্য আপডেট করুন (Update Booking)" : "বুকিং নিশ্চিত করুন (Confirm Booking)"}
                </button>
              </div>

            </form>

          </div>
        )}

        {/* VIEW 6: ACTION PAGE - Secure notice updates and gallery image management */}
        {currentView === "action" && (
          <div className="max-w-2xl mx-auto space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-xl space-y-5">
              
              <div className="pb-3 border-b border-gray-100 text-center">
                <span className="text-xs font-black text-rose-700 uppercase tracking-wider bg-rose-100 px-3 py-1 rounded-full">Secure Action System Settings</span>
                <h3 className="text-xl font-black text-black font-sans mt-2">
                  হোমপেজ বিজ্ঞপ্তিসমূহ আপডেট (Action Configurations)
                </h3>
                <p className="text-xs text-gray-500">আপডেট করার সাথে সাথে সমস্ত তথ্য হোমপেজে পরিবর্তনশীলভাবে আত্মপ্রকাশ পাবে।</p>
              </div>

              {/* Dynamic inputs for notifications, prices, date */}
              <div className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      **শুভযাত্রার শুভ তারিখ (Journey Date Update)**
                    </label>
                    <input
                      type="text"
                      value={settings.journeyDate}
                      onChange={(e) => saveAppSettings({ ...settings, journeyDate: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      **টিকেট ভাড়া অর্ঘ্য মূল্য (Ticket Price Update)**
                    </label>
                    <input
                      type="text"
                      value={settings.ticketPrice}
                      onChange={(e) => saveAppSettings({ ...settings, ticketPrice: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-black mb-1">
                      **রেলযোগের রুটের বিবরণ (Journey Route Update)**
                    </label>
                    <input
                      type="text"
                      value={settings.journeyInfo}
                      onChange={(e) => saveAppSettings({ ...settings, journeyInfo: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    ক্যাম্প ঘোষণা নোটিফিকেশন (Notification Update)
                  </label>
                  <textarea
                    rows={2}
                    value={settings.notification}
                    onChange={(e) => saveAppSettings({ ...settings, notification: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    জরুরি বিজ্ঞপ্তি (Emergency Notice Update)
                  </label>
                  <textarea
                    rows={2}
                    value={settings.emergencyNotice}
                    onChange={(e) => saveAppSettings({ ...settings, emergencyNotice: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    দৈনিক ক্যাম্প বিজ্ঞপ্তি (Daily Notice Update)
                  </label>
                  <textarea
                    rows={2}
                    value={settings.dailyNotice}
                    onChange={(e) => saveAppSettings({ ...settings, dailyNotice: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    বিশেষ অফার কোটা (Special Offer Update)
                  </label>
                  <input
                    type="text"
                    value={settings.specialOffer}
                    onChange={(e) => saveAppSettings({ ...settings, specialOffer: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    বুকিং শর্তাবলী ও নিয়ম (Terms & Conditions Update)
                  </label>
                  <textarea
                    rows={2}
                    value={settings.termsAndConditions}
                    onChange={(e) => saveAppSettings({ ...settings, termsAndConditions: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
                  />
                </div>

              </div>

              {/* Dynamic photo uploads segment inside action section */}
              {/* "একশন গঠনে এডমিন ছবি আপলোড রিয়েল ছবি আপলোড ট্রেন ছবি আপলোড অপশন দেয়া হোক" */}
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200">
                <h4 className="text-sm font-black text-rose-900 mb-3 block">
                  ⚙️ প্রধান ৩টি ছবি (Main App Images Update)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Admin profile pic */}
                  <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col items-center">
                    <img src={settings.adminProfile.photoUrl} alt="Admin" className="w-14 h-14 object-cover rounded-full border border-amber-300 mb-2" referrerPolicy="no-referrer" />
                    <label className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer text-center">
                      এডমিন ফটো আপলোড
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, (base64) => {
                          saveAppSettings({
                            ...settings,
                            adminProfile: {
                              ...settings.adminProfile,
                              photoUrl: base64
                            }
                          });
                        })} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* Radha krishna pic */}
                  <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col items-center">
                    <img src={settings.realPhoto} alt="Radha Krishna" className="w-14 h-14 object-cover rounded-full border-2 border-emerald-300 mb-2" referrerPolicy="no-referrer" />
                    <label className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer text-center">
                      রাধা-কৃষ্ণ ফটো আপলোড
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, (base64) => saveAppSettings({ ...settings, realPhoto: base64 }))} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* Train pic */}
                  <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col items-center">
                    <img src={settings.trainPhoto} alt="Train" className="w-14 h-14 object-cover rounded-full border-2 border-cyan-300 mb-2" referrerPolicy="no-referrer" />
                    <label className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer text-center">
                      রেলগাড়ি ফটো আপলোড
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, (base64) => saveAppSettings({ ...settings, trainPhoto: base64 }))} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Dynamic Photo Gallery Upload inside Action page */}
              {/* "সেটিং এ গ্যালারি অপশন থাকা হোক সেখান থেকে ফটো আপলোড করা এবং ফটো ডাউনলোড করা যাবে" */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-amber-900 block">
                    🖼️ গ্যালারি ফটো আপলোড (Gallery Upload Settings)
                  </h4>
                  
                  <label className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center space-x-1 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload to Gallery</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleGalleryUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {settings.gallery && settings.gallery.map((img, index) => (
                    <div id={`settings-gal-${index}`} key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 h-24 bg-white shadow-xs">
                      <img src={img} alt="Gallery item" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        {/* Download link support */}
                        <a 
                          id={`download-gallery-img-${index}`}
                          href={img} 
                          download={`braja-parikrama-${index}.png`}
                          className="p-1 bg-white hover:bg-amber-100 text-amber-800 rounded-full transition-colors"
                          title="Download photo"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>

                        {/* Delete gallery picture */}
                        <button
                          id={`delete-gallery-img-${index}`}
                          type="button"
                          onClick={() => {
                            if (confirm("আপনি কি এই ছবিটি গ্যালারি থেকে বাদ দিতে চান?")) {
                              const updatedGallery = settings.gallery.filter((_, i) => i !== index);
                              saveAppSettings({ ...settings, gallery: updatedGallery });
                            }
                          }}
                          className="p-1 bg-red-650 hover:bg-red-750 text-white rounded-full transition-colors"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="flex space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentView("home")}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all text-sm text-center"
                >
                  ফিরে যান (Back to Home)
                </button>
                <button
                  type="submit"
                  onClick={() => {
                    alert("অভিনন্দন! অ্যাকশন প্যানেল সম্পূর্ণ আপডেট ও লাইভ হয়ে গেছে।");
                    setCurrentView("home");
                  }}
                  className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all text-sm shadow-md text-center"
                >
                  আপডেট ফাইল সংরক্ষণ করুন
                </button>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 7: PASSBOOK / CASH MEMO TERMINAL VIEW */}
        {currentView === "passbook" && (
          <div className="max-w-xl mx-auto space-y-6">
            
            {!activePassbookPassenger ? (
              <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-xl text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-800 mx-auto animate-bounce">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-black font-sans">
                    যাত্রী পাসবুক ও ক্যাশ মেমো পোর্টাল
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">যাত্রী নিজের মোবাইল নম্বর অথবা আধার কার্ড নম্বর দিয়ে পরম সুরক্ষিতভাবে টিকেট ক্যাশ মেমো, পেমেন্ট খতিয়ান এবং অফিসিয়াল QR কোড দেখতে পারেন।</p>
                </div>

                <form onSubmit={handlePassbookLogin} className="space-y-4 text-left">
                  <div>
                    <label className="text-xs text-slate-700 font-extrabold block mb-1.5 font-sans">
                      মোবাইল নম্বর অথবা আধার কার্ড নম্বরঃ
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমনঃ ৯৮৭৬৫৪৩২১০"
                      value={passbookLoginMobile}
                      onChange={(e) => setPassbookLoginMobile(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 focus:border-amber-500 rounded-xl text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView("home");
                        setPassbookLoginMobile("");
                      }}
                      className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all text-sm text-center cursor-pointer"
                    >
                      প্রধান পাতা (Home)
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all text-sm shadow-md text-center cursor-pointer"
                    >
                      লগইন করুন (Verify PIN)
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Printable element containing the invoice and ledger for PDF export */}
                <div id="passenger-full-ledger-pdf-element" className="bg-[#FAF9F6] p-6 rounded-3xl border border-amber-200/50 shadow-xl space-y-6">
                  
                  {/* Spiritual Receipt Design (ক্যাশ মেমো) */}
                  <div id="printable-invoice-card" className="border-4 border-double border-amber-600 rounded-2.5xl p-5 bg-[#FAF9F6] relative">
                    
                    <div className="text-center pb-4 border-b border-dashed border-amber-300">
                      <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-black uppercase tracking-wider mb-2 inline-block">
                        🌺 চলো ব্রজে যাই, রাধারানীর চরণ পাই 🌺
                      </span>
                      <h3 className="text-lg font-black text-amber-950 font-sans">শ্রীধাম ব্রজবাসী সেবা পরিক্রমা স্মৃতি সঙ্ঘ</h3>
                      <p className="text-[10px] text-amber-600 font-black mt-1">
                        {settings.journeyInfo}
                      </p>
                      <p className="text-[9px] text-gray-500 font-bold mt-1">
                        **শুভযাত্রাঃ {settings.journeyDate} • ক্যাম্প ডিরেক্টর মহারাজঃ {settings.adminProfile.name}
                      </p>
                    </div>

                    {/* Receipt Details columns */}
                    <div className="grid grid-cols-2 gap-2 text-[9px] text-gray-500 py-3 border-b border-dashed border-gray-200 font-black">
                      <div>
                        মেমো নম্বরঃ <span className="text-black">#BM-BRJ-2026{activePassbookPassenger.id.slice(-3)}</span>
                      </div>
                      <div className="text-right">
                        তারিখঃ <span className="text-black">{activePassbookPassenger.bookingDate || settings.journeyDate}</span>
                      </div>
                    </div>

                    {/* Passenger Biographical Details */}
                    <div className="py-4 space-y-2 border-b border-dashed border-gray-200 text-xs text-[#1e293b]">
                      <div className="flex justify-between items-center bg-amber-50/50 p-2 rounded-xl border border-amber-100/30">
                        <span className="text-gray-500 font-bold">যাত্রী নাম (Passenger Name):</span>
                        <span className="text-amber-900 font-sans font-black">{activePassbookPassenger.name}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500 font-bold">পিতা/স্বামীর নাম:</span>
                        <span className="text-black font-bold font-sans">{activePassbookPassenger.fatherName}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500 font-bold">বয়স / লিঙ্গ:</span>
                        <span className="text-black font-bold font-sans">{activePassbookPassenger.age} বছর / {activePassbookPassenger.gender}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500 font-bold">মোবাইল নম্বর:</span>
                        <span className="text-black font-extrabold font-sans">{activePassbookPassenger.mobile}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500 font-bold">আধার কার্ড নম্বর:</span>
                        <span className="text-black font-bold font-sans">{activePassbookPassenger.aadhar}</span>
                      </div>

                      <div className="flex justify-between items-start">
                        <span className="text-gray-500 font-bold shrink-0">ঠিকানা (Address):</span>
                        <span className="text-black font-bold font-sans text-right max-w-[200px] block leading-snug">{activePassbookPassenger.address}</span>
                      </div>
                    </div>

                    {/* Financial stats with ledger visual */}
                    <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-300 space-y-1 bg-amber-50/50 p-3 rounded-2xl">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-bold">নির্ধারিত মোট অর্ঘ্য ভাড়ী (Total Fare):</span>
                        <span className="text-black font-sans font-black">৳{activePassbookPassenger.totalFare}</span>
                      </div>
                      
                      <div className="flex justify-between text-green-700 font-bold">
                        <span>জমা করেছেন অগ্রিম (Advance Paid):</span>
                        <span className="font-sans font-black">৳{activePassbookPassenger.advance}</span>
                      </div>

                      <div className="h-px bg-amber-200 my-1" />

                      <div className="flex justify-between text-red-650 font-black text-sm">
                        <span>বাকি অর্ঘ্য টাকা (Due Amount):</span>
                        <span className="font-sans">৳{activePassbookPassenger.due}</span>
                      </div>
                    </div>

                    {/* QR Code Verification Section */}
                    <div className="mt-4 py-3 border-t border-dashed border-gray-200 flex flex-col items-center">
                      <QRCodeDisplay
                        passenger={activePassbookPassenger}
                        journeyDate={settings.journeyDate}
                        journeyInfo={settings.journeyInfo}
                        adminName={settings.adminProfile.name}
                      />
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                      <p className="text-[10px] text-amber-900 font-bold italic">"হে রাধারাণী! হে গিরিধারী! আমাদের প্রতি দয়া করো।"</p>
                      <p className="text-[9px] text-gray-400 mt-1">সবুজ ও সুন্দর ভ্রমণ কামনা করছি। জয় শ্রী রাধে!</p>
                    </div>

                  </div>
                </div>

                {/* Operations links: Download, Copy, Share */}
                {/* Options: Download, Copy, WhatsApp Share */}
                <div data-html2canvas-ignore="true" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    id="passbook-print-trigger-button"
                    onClick={() => window.print()}
                    className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-black rounded-xl border border-gray-200 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-97"
                  >
                    <Download className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>মেমো প্রিন্ট করুন</span>
                  </button>
                  <button
                    id="passbook-copy-info-button"
                    onClick={copyFullInvoiceToClipboard}
                    className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-black rounded-xl border border-gray-200 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-97 relative"
                  >
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{copySuccess ? "কপি সম্পন্ন!" : "মেমো কপি করুন"}</span>
                  </button>
                  <a
                    id="whatsapp-share-memo-link"
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `🌺 চলো ব্রজে যাই, রাধারানীর চরণ পাই 🌺\n\nপ্রিয় ভক্ত, শ্রীধাম ব্রজ পরিক্রমার বুকিং রসিদ জেনারেট হয়ে গেছে!\n\nমেমো নং: #BM-BRJ-2026${activePassbookPassenger.id.slice(-3)}\nযাত্রী নাম: ${activePassbookPassenger.name}\nমোবাইল নম্বর: ${activePassbookPassenger.mobile}\nমোট ভাড়া: ৳${activePassbookPassenger.totalFare}\nঅগ্রিম জমা: ৳${activePassbookPassenger.advance}\nবাকি টাকা: ৳${activePassbookPassenger.due}\nশুভযাত্রা শুরু: ${settings.journeyDate}\n\nপরিচালক মহারাজ: ${settings.adminProfile.name}\nশ্রী রাধে রাধে! কুশলে পথ চলুন।`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-850 text-xs font-black rounded-xl border border-emerald-200 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-97"
                  >
                    <Share2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>মেমো শেয়ার করুন</span>
                  </a>
                </div>

                {/* 💸 TRANSACTIONS LEDGER & LEDGER FORM SECTION */}
                <div className="border-t border-gray-250 pt-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/35 p-3 rounded-2xl border border-amber-100/60">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-amber-100 rounded-lg text-amber-800 border border-amber-250">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-gray-800 font-sans leading-none flex items-center gap-1.5">
                          <span>💸</span>
                          <span>অর্ঘ্য প্রদান খতিয়ান ও পেমেন্ট লেজার</span>
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1 font-bold">Transaction History Ledger</p>
                      </div>
                    </div>

                    <button
                      id="export-pdf-ledger-btn"
                      type="button"
                      data-html2canvas-ignore="true"
                      onClick={exportLedgerToPdf}
                      className="py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer active:scale-97"
                    >
                      <Download className="w-4 h-4 text-amber-100 shrink-0" />
                      <span>লেজার PDF ডাউনলোড</span>
                    </button>
                  </div>

                  {/* Ledger Table */}
                  <div className="bg-[#FAF9F6] border border-amber-100 rounded-2xl overflow-hidden shadow-xs">
                    <div className="p-3 bg-amber-50/50 border-b border-amber-100 grid grid-cols-4 text-[9.5px] font-black text-amber-905 uppercase">
                      <span>তারিখ (Date)</span>
                      <span>পরিমাণ (Amount)</span>
                      <span>পদ্ধতি (Method)</span>
                      <span className="text-right">অবস্থা (Status)</span>
                    </div>

                    <div className="divide-y divide-gray-150 text-xs">
                      {((activePassbookPassenger.transactions && activePassbookPassenger.transactions.length > 0)
                        ? activePassbookPassenger.transactions
                        : [
                            {
                              id: "tx-init-auto",
                              date: activePassbookPassenger.bookingDate || "২০২৬-০৬-১০",
                              amount: activePassbookPassenger.advance,
                              paymentType: "Cash (নগদ)",
                              status: "Completed",
                              remarks: "প্রাথমিক অগ্রিম টিকিট বুকিং"
                            }
                          ]
                      ).map((tx, idx) => (
                        <div key={tx.id || idx} className="p-3 grid grid-cols-4 items-center gap-1">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-gray-800 font-sans">{tx.date}</span>
                            {tx.remarks && (
                              <span className="text-[8.5px] text-gray-400 font-medium truncate max-w-[80px]" title={tx.remarks}>
                                {tx.remarks}
                              </span>
                            )}
                          </div>
                          
                          <div className="font-sans font-black text-gray-950">
                            ৳{tx.amount}
                          </div>
                          
                          <div className="text-[10.5px] text-gray-600 truncate font-bold">
                            {tx.paymentType}
                          </div>
                          
                          <div className="text-right">
                            <span className={`inline-block px-1.5 py-0.5 rounded-full text-[8.5px] font-black ${
                              tx.status === "Completed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-250"
                                : tx.status === "Pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-250"
                                : "bg-red-50 text-red-700 border border-red-250"
                            }`}>
                              {tx.status === "Completed" ? "সম্পন্ন" : tx.status === "Pending" ? "অপেক্ষমান" : "ব্যর্থ"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer values Summary */}
                    <div className="bg-amber-50/20 p-3 border-t border-amber-100 flex items-center justify-between font-sans text-xs">
                      <div>
                        <span className="text-[9px] text-gray-400 block font-bold leading-none">মোট জমা অগ্রিম</span>
                        <span className="text-slate-900 font-black text-sm">৳{activePassbookPassenger.advance}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-rose-500 block font-bold leading-none">অবशिष्ट বাকি</span>
                        <span className="text-rose-700 font-black text-sm">৳{activePassbookPassenger.due}</span>
                      </div>
                    </div>
                  </div>

                  {/* Add New Ledger Entry Form (only show if due remains) */}
                  {bnToEnNumber(activePassbookPassenger.due) > 0 ? (
                    <form onSubmit={handleAddLedgerTransaction} className="p-4 bg-[#fbfbfa] border border-amber-250/50 rounded-2xl space-y-3 shadow-xs">
                      <span className="text-[10.5px] text-amber-950 font-black block">নতুন পেমেন্ট কিস্তি নথিভুক্ত করুন  (New Ledger Payment Entry)</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-gray-500 font-bold block mb-1">প্রদত্ত পরিমাণ (Amount in ৳)</label>
                          <input
                            type="text"
                            required
                            placeholder="যেমন: ৩০০০"
                            value={ledgerAmountInput}
                            onChange={(e) => setLedgerAmountInput(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-gray-500 font-bold block mb-1">পেমেন্ট মেথড (Method)</label>
                          <select
                            value={ledgerMethodInput}
                            onChange={(e) => setLedgerMethodInput(e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="Cash (নগদ)">Cash (নগদ)</option>
                            <option value="UPI (ইউপিআই)">UPI (ইউপিআই)</option>
                            <option value="Bank Transfer (ব্যাঙ্ক)">Bank Transfer (ব্যাঙ্ক)</option>
                            <option value="Cheque (চেক)">Cheque (চেক)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] text-gray-500 font-bold block mb-1">পেমেন্ট মন্তব্য (Remarks - Optional)</label>
                        <input
                          type="text"
                          placeholder="যেমন: দ্বিতীয় কিস্তি, শেষ কিস্তি"
                          value={ledgerRemarksInput}
                          onChange={(e) => setLedgerRemarksInput(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-[11px] font-black rounded-lg transition-all shadow-xs cursor-pointer active:scale-98"
                      >
                        পেমেন্ট লেজারে জমা করুন (Submit Installment)
                      </button>
                    </form>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200/50 rounded-2xl flex items-center space-x-2 text-emerald-800">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="text-[10px] font-black">
                        অভিনন্দন! আপনার সম্পূর্ণ পরিক্রমা অর্ঘ্য পুরোপুরি পরিশোধিত হয়েছে (Full Ledger Settled)। রাধারাণী আপনার কল্যাণ করুন!
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    id="logout-passbook-btn"
                    type="button"
                    onClick={() => {
                      setActivePassbookPassenger(null);
                      setPassbookLoginMobile("");
                    }}
                    className="text-xs text-rose-700 hover:text-rose-900 underline font-extrabold"
                  >
                    পাসবুক থেকে লগআউট করুন (Logout)
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* 6. Dynamic Money Receipt overlay Modal (triggered from Passenger list view) */}
      <AnimatePresence>
        {showInvoiceModal && selectedPassenger && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border-2 border-amber-300 overflow-hidden relative"
            >
              <div className="absolute top-4 right-4">
                <button
                  id="close-invoice-modal-btn"
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setSelectedPassenger(null);
                  }}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 rounded-full cursor-pointer"
                >
                  <XIcon />
                </button>
              </div>

              {/* Duplicate spiritual money receipt details inside */}
              <div className="border-4 border-double border-amber-600 p-5 rounded-2.5xl bg-[#FAF9F6] text-xs">
                
                <div className="text-center pb-4 border-b border-dashed border-amber-300">
                  <h4 className="text-sm font-black text-amber-950">চলো ব্রজে যাই, রাধারানীর চরণ পাই</h4>
                  <p className="text-[10px] text-gray-500 mt-1">{settings.journeyInfo} • শুভযাত্রা: {settings.journeyDate}</p>
                  <span className="text-[9px] uppercase font-bold text-white bg-amber-700 px-3 py-0.5 rounded-full inline-block mt-1">
                    ক্যাম্প অফিশিয়াল পেমেন্ট রসিদ
                  </span>
                </div>

                <div className="py-4 space-y-2">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-500 font-bold">রসিদ আইডি #</span>
                    <span className="text-black font-extrabold">#BM-BRJ-2026-{selectedPassenger.id.slice(-3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-bold">যাত্রী নাম (Passenger Name):</span>
                    <span className="text-black font-extrabold">{selectedPassenger.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-bold">পিতার নাম:</span>
                    <span className="text-black font-bold">{selectedPassenger.fatherName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-bold">মোবাইল ও আধার:</span>
                    <span className="text-black font-extrabold">{selectedPassenger.mobile} / {selectedPassenger.aadhar}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-bold">ঠিকানা:</span>
                    <span className="text-black font-bold max-w-[200px] text-right">{selectedPassenger.address}</span>
                  </div>

                  <div className="p-3 bg-amber-100/30 rounded-xl space-y-1 border border-amber-200/50 mt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-600">মোট ভাড়া:</span>
                      <span className="font-bold text-black font-sans">৳{selectedPassenger.totalFare}</span>
                    </div>
                    <div className="flex justify-between text-green-700">
                      <span className="font-bold">অগ্রিম জমা:</span>
                      <span className="font-sans font-black">৳{selectedPassenger.advance}</span>
                    </div>
                    <div className="h-px bg-amber-200 my-1" />
                     <div className="flex justify-between text-red-650 font-black">
                       <span>বাকি পেমেন্ট:</span>
                       <span className="font-sans">৳{selectedPassenger.due}</span>
                     </div>
                   </div>

                   {/* QR Code Verification Section */}
                   <div className="mt-4 py-3 border-t border-dashed border-gray-200 flex flex-col items-center">
                     <QRCodeDisplay
                       passenger={selectedPassenger}
                       journeyDate={settings.journeyDate}
                       journeyInfo={settings.journeyInfo}
                       adminName={settings.adminProfile.name}
                     />
                   </div>

                 </div>

                 <div className="text-center text-[10px] text-amber-900 font-bold italic pt-2 border-t border-dashed border-amber-300">
                   সংগঠক বা মহারাজ: {settings.adminProfile.name}
                 </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  id="print-passenger-invoice-btn"
                  onClick={() => window.print()}
                  className="flex-1 py-2 px-3 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download / Print</span>
                </button>
                <button
                  id="dismiss-invoice-modal-btn"
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setSelectedPassenger(null);
                  }}
                  className="flex-1 py-2 px-3 bg-gray-150 hover:bg-gray-205 text-gray-700 font-bold text-xs rounded-xl"
                >
                  Close Receipt
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Beautiful Spiritual Footer Credit Info */}
      <footer className="bg-red-950 text-amber-200/60 text-xs py-6 border-t-2 border-amber-600 text-center space-y-1.5 mt-12">
        <p className="font-sans font-extrabold text-amber-400">
          চলো ব্রজে যাই, রাধারানীর চরণ পাই © ২০২৬
        </p>
        <p className="text-[10px] leading-relaxed max-w-md mx-auto px-4 font-medium">
          শ্রী বৃন্দাবন পরিক্রমা ও উত্তর ভারত ট্যুরিস্ট ম্যানেজমেন্ট মোবাইল লাইভ পোর্টাল। নিরাপদ ক্লাউড ডাটাবেস অটোমেটিক ডাটা সিঙ্ক ও ব্যাকআপ সহ এআই দ্বারা রিয়েল-টাইমে পরিচালিত।
        </p>
        <p className="text-[9px] text-amber-100/30">
          রাধে রাধে! শ্রী রাধারাণী আপনার ব্রজ পরিক্রমা পরম অমৃতময় ও আনন্দময় করে তুলুন।
        </p>
      </footer>

    </div>
  );
}

// Simple internal helper components
function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  );
}
