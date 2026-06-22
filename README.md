# Scan-Go-Qr-and-Barcode-Scanner
Perfect for the sidebar description field on the right side of your repository (fits within character limits). A lightweight, serverless web app that scans QR codes &amp; Barcodes to log attendance. Features flexible Excel/CSV template uploads, custom time-window enforcement, automatic "On Time" or "Late" status tagging, and instant CSV log exports.

# 📊 QR & Barcode Attendance Scanner with Time Rules

A lightweight, powerful, serverless web application designed to track event or workspace attendance using **QR Codes** and **1D Barcodes**. This tool runs entirely in the browser, stores your records safely in `localStorage` so data isn't lost on page refresh, and operates perfectly across mobile devices and desktops.

🚀 **[CLICK HERE TO VIEW LIVE DEMO](https://qtbby.github.io/Scan-Go-Qr-and-Barcode-Scanner/)**

---

## ✨ Key Features

- **Double Compatibility:** Seamlessly scans both 2D QR codes and standard 1D Barcodes (IDs, badges, product labels) using an optimized rectangular camera overlay.
- **Dynamic Flexible Setup:** - **With Excel/CSV:** Upload your own master list sheet (`.xlsx`, `.xls`, `.csv`) to pre-load student/employee profiles and column layouts.
  - **Without Excel:** Manually design custom column frameworks from scratch.
- **Smart Time Rule Enforcement:** Define specific allowed windows for checking in and out.
  - Blocks entries scanned *too early*.
  - Automatically appends status markers (`(ON TIME)` or `(LATE)`) directly beside timestamps if users check-in/out past deadlines.
- **Live Interactive Data Grid:** Displays attendance logs on-screen in real-time, placing the latest scans at the top for immediate visual verification.
- **Instant CSV Export:** Download data cleanly formatted into a standard CSV file with a single click, ready for Microsoft Excel or Google Sheets.
- **Toast Notifications:** Smooth pop-up overlay feedback detailing scan success, errors, or time penalties.
- **Interactive E-Wallet Support Panel:** A custom-styled "Buy me a coffee" widget that reveals a fully integrated pop-up modal containing an E-wallet QR image option and manual transaction details.

---

## 🛠️ Built With

- **HTML5 & CSS3** - Responsive layout tailored to modern mobile views.
- **Vanilla JavaScript (ES6)** - Modular design following clean architectural separation of concerns (UI, Data, Hardware Scanner, Sheet Utilities).
- **[html5-qrcode](https://github.com/mebjas/html5-qrcode)** - Hardware camera integration package.
- **[SheetJS (XLSX)](https://github.com/SheetJS/sheetjs)** - Client-side spreadsheet parsing utility.

---

## 📂 File Directory

```text
├── index.html           # Main template structures, layouts, and interactive modals
├── styles.css           # Layout configurations, animations, and toast notifications
├── main.js             # Core DOM events listener, state router, and file initializer
├── datamanger.js       # LocalStorage wrapper, time validator, logic compiler 
├── ui.js                # On-screen visual content rendering controllers
├── scanner.js           # Rectangular viewport settings, camera stream toggles
├── sheetManager.js     # Promise handler converting file uploads to active objects
└── sound.js             # Auditory hardware trigger providing high-pitch scan beeps

