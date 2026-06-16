/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AdminProfile {
  name: string;
  address: string;
  mobile: string;
  whatsapp: string;
  photoUrl: string;
}

export interface AppSettings {
  adminProfile: AdminProfile;
  realPhoto: string;   // Beautiful parikrama / Radha-Krishna photo shown on the home page
  trainPhoto: string;  // Train photo on the header / home page
  journeyDate: string; // Dynamic journey date (default: '২ই আশ্বিন ২০শে সেপ্টেম্বর রবিবার')
  ticketPrice: string; // Dynamic ticket price (default: '১৬০০১ টাকা')
  journeyInfo: string; // Dynamic journey details (default: 'সম্পূর্ণ রেল যোগে উত্তর ভারত পরিক্রমা')
  notification: string;
  emergencyNotice: string;
  dailyNotice: string;
  specialOffer: string;
  termsAndConditions: string;
  touristPlaces: string[]; // List of popular tour spots or custom update notes
  gallery: string[];     // Array of base64 images, 3-4 photos shown on home page
}

export interface Passenger {
  id: string;
  photo: string;        // Base64 user picture
  aadharPhoto: string;  // Base64 Aadhar picture
  name: string;
  fatherName: string;
  age: string;
  gender: string;
  address: string;
  aadhar: string;
  mobile: string;
  bookingDate: string;
  advance: string;
  totalFare: string;
  due: string;
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  date: string;
  amount: string;       // e.g. '৫০০০'
  paymentType: string;  // e.g. 'UPI (ইউপিআই)', 'Cash (নগদ)', etc.
  status: 'Completed' | 'Pending' | 'Failed' | string;
  remarks?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface WeatherDay {
  day: string;
  temp: string;
  condition: string;
  icon: string;
}
