Bloodbank Directory

A modern, fast, and searchable Blood Bank Directory web application built to help users easily find blood banks across cities with real-time filtering and pagination.
The project uses Netlify Functions as a backend and Supabase as a secure database layer.

Live Demo

Live Site:
https://bloodbank-directory.netlify.app

Features

Search by City / Location

Filter by Blood Bank Type

Contact Availability Filter

Pagination for Large Datasets

Serverless Backend (Netlify Functions)

Secure Database Access via Supabase

Responsive UI (Mobile Friendly)

Direct Google Maps Integration

Scalable & Maintainable Architecture

Tech Stack
Frontend

HTML5

CSS3

Vanilla JavaScript

Backend

Netlify Functions (Node.js)

Supabase (PostgreSQL)

DevOps / Hosting

GitHub (Version Control)

Netlify (Hosting + CI/CD)

Project Structure
bloodbank-directory/
│
├── public/
│   ├── index.html          # Main UI
│   ├── get_data.php        # Legacy/local testing
│   └── get-blood.php
│
├── netlify/
│   └── functions/
│       ├── get_data.js     # Main API function
│       ├── get_data_debug.js
│       └── get_data_inspect.js
│
├── config/
│   └── db.php              # Database config (local only)
│
├── models/
│   └── Institute.php       # Data model
│
├── sql/
│   └── schema.sql          # Database schema
│
├── netlify.toml            # Netlify configuration
├── package.json
├── README.md
└── .gitignore

Environment Variables (Required)

These must be added in Netlify, not in the repository.

Variable Name	Description
SUPABASE_URL	Supabase project URL
SUPABASE_SERVICE_KEY	Supabase service role key

Netlify Path:
Project → Project configuration → Environment variables

.env file is intentionally not included for security reasons.

Netlify Configuration

Build Settings:

Setting	Value
Build Command	(leave empty)
Publish Directory	public
Functions Directory	netlify/functions
API Endpoint
Fetch Blood Bank Data
GET /.netlify/functions/get_data


Query Parameters (optional):

district → city/location search

type → blood bank type

contact → contact availability

page → page number

per_page → results per page

Local Development (Optional)
# Install dependencies
npm install

# Start Netlify local server
netlify dev


Security Notes

No secrets stored in GitHub

Environment variables secured via Netlify

Supabase accessed only via serverless functions

No direct database exposure to frontend

Future Enhancements

City auto-suggestions

UI animations & skeleton loaders

Admin dashboard

Blood group availability filters

SEO optimization

Author

Ashutosh Mishra
GitHub: https://github.com/ashutosh9503

License

This project is licensed under the MIT License.
You are free to use, modify, and distribute with attribution.
