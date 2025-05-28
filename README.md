# CropsayAI

<div align="center">
  <img src="./frontend/public/cropsay-icon.svg" alt="CropsayAI Logo" width="200" height="200">
</div>

## 🌱 About CropsayAI

CropsayAI is an innovative chat-commerce platform for the agricultural sector. It connects farmers with agricultural experts, provides product recommendations, and offers a seamless shopping experience for agricultural supplies.

---

## 📁 Project Structure

```
cropsayai/
├── backend/         # Node.js scripts and Python NLP service
├── database/        # Supabase schema and config
├── docs/            # Documentation
├── frontend/        # React + Vite frontend
├── README.md        # This file
└── ...
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn**
- **Python** 3.8+ ([Download](https://www.python.org/downloads/))
- **Supabase** account ([Sign up](https://supabase.com/))
- **Git** ([Download](https://git-scm.com/))

---

### 2. Clone the Repository
```powershell
git clone https://github.com/Gauravkrsah/Cropsay.git
cd Cropsay
```

---

### 3. Frontend Setup
```powershell
cd frontend
npm install
# or
yarn install
```

#### Start the development server:
```powershell
npm run dev
# or
yarn dev
```
- Open your browser at [http://localhost:5173](http://localhost:5173)

---

### 4. Backend Setup
#### NLP Recommendation Service (Python)
1. Install Python dependencies:
   ```powershell
   cd ../backend
   pip install -r nlp-service-requirements.txt
   ```
2. (Optional) Check all required packages:
   ```powershell
   python check_packages.py
   ```
3. Start the NLP service:
   ```powershell
   node start-nlp-service.js
   ```

#### Gemini Proxy Service (Node.js)
1. Start the Gemini proxy:
   ```powershell
   node start-gemini-proxy.js
   ```

---

### 5. Database Setup (Supabase)
1. Create a new project at [Supabase](https://app.supabase.com/).
2. Use the SQL editor to run the schema in `database/supabase/schema.sql`.
3. Update your Supabase credentials in the frontend and backend as needed (see `.env` files or integration configs).

---

### 6. Environment Variables & Configuration
- **Frontend**: Configure Supabase and API endpoints in `frontend/src/integrations/supabase/` or `.env` files if present.
- **Backend**: If needed, set up `.env` in `backend/` for API keys and secrets.
- **Database**: `database/supabase/config.toml` contains your Supabase project ID.

---

## 🛠️ Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Python (FastAPI, Transformers)
- **Database**: Supabase (Postgres)
- **Build Tool**: Vite

---

## 🧑‍💻 Development Scripts
- `npm run dev` - Start frontend dev server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

## 🧩 Troubleshooting
- **Port Conflicts**: Make sure ports 5173 (frontend), 8000 (NLP), and 3000 (Gemini proxy) are free.
- **Python Path**: If the NLP service fails, check your Python path in `backend/start-nlp-service.js`.
- **Supabase Auth**: Ensure your Supabase keys and URLs are correct in the frontend.
- **Dependencies**: If you see missing package errors, run `npm install` or `pip install -r ...` as needed.

---

## 🤝 Contributing
Contributions are welcome! Please fork the repo, create a branch, and submit a Pull Request.

---

## 📞 Contact
For questions or support, email [support@cropsayai.com](mailto:support@cropsayai.com).

<div align="center">
  <p>Built with ❤️ for farmers everywhere</p>
</div>
