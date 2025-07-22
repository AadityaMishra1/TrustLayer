# Complete setup instructions for AI Trust Layer

echo "🚀 Setting up AI Trust Layer Frontend..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Install Tailwind and required packages
echo "🎨 Setting up Tailwind CSS..."
npm install -D tailwindcss postcss autoprefixer tailwindcss-animate

# Step 3: Clear any cache
echo "🧹 Clearing cache..."
rm -rf .next
rm -rf node_modules/.cache

# Step 4: Start development server
echo "🔥 Starting development server..."
npm run dev

echo "✅ Setup complete! Your app should be running on http://localhost:3000"
echo ""
echo "🔗 Backend Connection:"
echo "Make sure your Python backend is running on http://localhost:5000"
echo "The frontend will automatically proxy API calls to your backend."
echo ""
echo "📝 Available routes:"
echo "- / (Landing page)"
echo "- /demo (Interactive demo)"
echo ""
echo "🎯 Next steps:"
echo "1. Start your Python backend on port 5000"
echo "2. Visit http://localhost:3000 to see the landing page"
echo "3. Click 'Try Live Demo' to test the functionality"
