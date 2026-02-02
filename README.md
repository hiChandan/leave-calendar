# Deployment Changes

next.config.mjs

/\*_ @type {import('next').NextConfig} _/
const nextConfig = {
basePath: '/leave-calendar',
publicRuntimeConfig: {
basePath: '/leave-calendar',
},
assetPrefix: '/leave-calendar/',
trailingSlash:true,
};

vi app/api/events/route.ts

changed from /api/members to api/members

nginx.config

location /leave-calendar/ {
proxy_pass http://10.x.x.x:5050/leave-calendar/;
proxy_http_version 1.1;

                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;

                proxy_cache_bypass $http_upgrade;
        }

    # ---- NEXT.JS STATIC FILES (CRITICAL) ----
    location /leave-calendar/_next/ {
        proxy_pass http://10.x.x.x:5050/leave-calendar/_next/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Optional but recommended
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # ---- PUBLIC ASSETS (optional but good) ----
    location /leave-calendar/public/ {
        proxy_pass http://10.x.x.x:5050/leave-calendar/public/;
    }

export default nextConfig;

# React Leave Calendar

Motivation
https://github.com/farzany/continuous-calendar


Leave Calendar is a bare-bones calendar built with React and Tailwindcss. It does not include event creation and display, as that's left up to your discretion.


### So what does it do? ✨

- Displays 12 months at once, with respect to the specified year.
- Allows for quick-navigation to specific months and Today.
- Clicking on a cell triggers the onClick event with (day, month, year).
- Responsive; supports mobile, tablet, and desktop views.

### Installation 💻

There is no npm package, it's just 1 file you can customize. Simply download or copy the file:

`/components/LeaveCalendar.tsx`.
