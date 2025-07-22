# Complete reset script

# 1. Stop the dev server (Ctrl+C if running)

# 2. Remove all build artifacts and node_modules
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json

# 3. Reinstall everything
npm install

# 4. Install missing Tailwind dependencies
npm install -D tailwindcss postcss autoprefixer tailwindcss-animate

# 5. Initialize Tailwind (this will overwrite config)
npx tailwindcss init -p

# 6. Start dev server
npm run dev
