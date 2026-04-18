# SPEC - Car Quality Inspection System (A to Z Guide)

A comprehensive, high-performance digital inspection management system designed for automotive manufacturing plants. This system replaces manual checklists with an interactive, real-time digital workflow, ensuring 100% traceability and quality compliance.

---

## 📊 Current Project Status (V1.0 - Stable)

The SPEC system is currently in its deployment-ready phase, moving from MVP to its next major evolution.

- **Current Hosting**: Vercel (Next.js App)
- **Source Control**: GitHub (Public/Private Repo)
- **Database**: MongoDB Atlas (Free Tier Shared Cluster)
- **Stability**: Tested with car inspection logic and live dashboard metrics.

### 🏆 Key Achievements
✅ **Digital Checklist Integration**: Successfully replaced manual paper-based car inspection with digital forms.
✅ **Metric Tracking**: Implemented real-time duration and pass/fail logic.
✅ **A4 Print Support**: Digital Travel Cards are fully optimized for standard industrial printers.
✅ **Data Safety**: Auto-recovery trash system with 7-day TTL lifecycle.

---

## 🏗 Data Mapping & Models

The system architecture utilizes a "Relational-Flat" hybrid mapping in MongoDB to balance data integrity with query performance.

### 1. Specification Mapping (`specifications` collection)
This collection stores the "Source of Truth" for every part that must be checked for a specific car configuration.
- **Object References**: Linked via `carModelId`, `variantId`, `regionId`, `categoryId`, and `partId`.
- **Flat Headers**: Stores redundant string fields (e.g., `'Car Model'`, `'Specification Details'`) to match legacy Excel headers for easy export/import.
- **Identifier**: `Code` (e.g., `FR-BMP-01`) acts as the primary grouping key for a vehicle's specifications.

### 2. Inspection Mapping (`inspections` collection)
Stores completed quality records for individual vehicles.
- **Vehicle Info**: `vin` (unique chassis), `lcdv`, `carModel`, `variant`, `region`.
- **Items Array**: A snapshot of the checklist at the moment of inspection, storing `partName`, `spec`, `image`, and `status` ('correct' | 'wrong').
- **Metrics**: `totalCorrect`, `totalWrong`, `duration` (seconds), `startedAt`, `endedAt`.

### 3. Trash & Recovery Mapping (`trash` collection)
- **TTL Index**: Automatically purges documents after **7 days** (`deletedAt` field).
- **Snapshot Storage**: Stores the entire deleted document in the `data` field to allow perfect restoration.

---

## 🧭 Navigation Architecture

The application follows a streamlined flow designed for rapid operator access.

### 🛣 Routes & Pages
- **`/dashboard`**: The command center. Displays Today's Progress, Pass/Fail ratios, and Common Failure Trends.
- **`/checklist`**: The main terminal. Operators enter VIN/LCDV and select a Code to load the dynamic checklist.
- **`/inspections`**: Historical data logs. View chronological records of all vehicles that have passed through the line.
- **`/travel-cards`**: The printing hub. Search by VIN to retrieve and print Digital Travel Cards.
- **`/entries` / `/master`**: Master data management. Add new car models, variants, parts, and their corresponding specifications.
- **`/trash`**: The safety net. List and restore accidentally deleted records.

---

## 🔄 Core Workflows

### 🛠 Workflow A: System Configuration (Admin)
1. **Define Assets**: Create Car Models, Variants, Regions, and Categories.
2. **Add Parts**: Register parts and assign them to categories.
3. **Set Specs**: Link a Part to a specific Car Code and define the "Specification Detail" (what the operator should look for).

### 🚗 Workflow B: Production Inspection (Operator)
1. **Login & Scan**: Access the `/checklist` page. Enter the vehicle's VIN and LCDV.
2. **Load Specs**: Select the vehicle's unique **Code**. The system populates the checklist instantly.
3. **Execution**: Mark items as **OK (Check)** or **NO (Cross)**. Use **Fast Mode** for rapid-fire validation.
4. **Save**: The session ends, calculating the duration and result metrics, then persists the record to the database.

### 🖨 Workflow C: Quality Records (Auditor)
1. **Retrieve**: Access `/travel-cards`.
2. **Print**: Open the Digital Travel Card for a specific VIN.
3. **Archive**: Print to PDF or physical printer using the A4-optimized layout for internal documentation.

---

## � MVP Scope (Minimum Viable Product)

The current version of SPEC includes the following mission-critical features:
- **Real-time Checklist Engine**: Dynamic specification loading based on car configuration codes.
- **High-Visibility UI**: Optimized for industrial environments with large touch-targets and high-contrast status icons.
- **Digital Travel Card**: Printer-friendly (A4) document generation with corporate branding (Citroën/Stellantis).
- **Automated Data Lifecycle**: Trash system with 7-day retention to prevent data loss.
- **Basic Quality Analytics**: Live dashboard showing rejects and performance trends.

---

## 🛠 Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion (Animations), Lucide (Icons).
- **Backend**: Next.js Serverless API Routes, Mongoose ODM.
- **Database**: MongoDB (Atlas/Local).
- **Developer Tools**: TypeScript, ESLint, PostCSS.

---

## 🚀 Setup & Startup

1. **Install Dependencies**: `npm install`
2. **Env Config**: Add `MONGODB_URI` to `.env.local`.
3. **Run Dev**: `npm run dev`
4. **Production Build**: `npm run build && npm start`

---

*Precision Automotive Inspection Logic (PAIPL/QCP/TC-02)*
