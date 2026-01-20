# 🩸 Bloodbank Directory India

A modern, fast, and reliable web platform to discover blood banks across India.  
Built with Supabase, Netlify Functions, and a clean medical-grade UI.

---

## 🌐 Live Demo

https://bloodbank-directory.netlify.app/

(Replace with your real URL after deployment)

---

## ✨ Features

- 🔍 Search blood banks by **city / district / pincode**
- 🗂 Filter by organization type (Govt, Private, Charitable, etc.)
- 🗺 Google Maps integration for locations
- 📞 One-click calling support
- 📰 Medical news section (Supabase powered)
- 📊 Pagination for large datasets
- ⚡ Serverless backend using Netlify Functions
- 🔐 Secure environment variables (no secrets in frontend)
- 📱 Fully responsive UI
- ❤️ Medical themed professional design

---

## 🏗 Tech Stack

**Frontend**
- HTML5
- CSS3 (Custom UI)
- Vanilla JavaScript

**Backend**
- Supabase (PostgreSQL)
- Netlify Serverless Functions

**Hosting**
- Netlify

---

## 📁 Project Structure



.
├── index.html
├── news.html
├── assets/
├── js/
│ ├── app.js
│ └── app_news.js
├── netlify/
│ └── functions/
│ ├── get_data.js
│ └── get_news.js
├── .gitignore
└── README.md


---

## 🚀 Getting Started (Local Setup)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

2️⃣ Install Netlify CLI
npm install -g netlify-cli

3️⃣ Create .env file (local only)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key


⚠️ Never commit this file.

4️⃣ Start development server
netlify dev


App will run at:

http://localhost:8888

🗄 Supabase Setup
Required Tables
institutes

Stores blood bank data.

medical_news

Stores news articles.

Example schema:

create table medical_news (
  id bigint generated always as identity primary key,
  title text not null,
  summary text,
  category text,
  source text,
  url text,
  created_at timestamptz default now()
);

Enable Public Read Access
alter table medical_news enable row level security;

create policy "Public read"
on medical_news
for select
using (true);

🌍 Deployment (Netlify)
1. Push code to GitHub
git add .
git commit -m "Deploy bloodbank directory"
git push origin main

2. Connect to Netlify

Login to Netlify

Add new site → Import from GitHub

Select your repository

Deploy

3. Add environment variables in Netlify

Netlify → Site Settings → Environment Variables:

SUPABASE_URL
SUPABASE_SERVICE_KEY


Redeploy after saving.

🔐 Security Notes

.env file is ignored via .gitignore

Supabase Service Role key used only in Netlify functions

Frontend uses only public endpoints

RLS enabled on tables

🧪 API Endpoints
Endpoint	Description
/.netlify/functions/get_data	Fetch blood banks
/.netlify/functions/get_news	Fetch medical news
📌 Roadmap

 Real-time online users counter

 Admin dashboard

 Auto medical news sync (API)

 State-wise browsing

 Advanced analytics

 Offline PWA support

🤝 Contributing

Pull requests are welcome.
For major changes, please open an issue first.

📄 License

MIT License

❤️ Acknowledgements

Supabase

Netlify

Indian Health Data Providers

📞 Contact

Created by [Your Name]

If you found this project helpful, give it a ⭐ on GitHub!
