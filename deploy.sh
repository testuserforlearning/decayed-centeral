#!/bin/bash

set -e

echo "🚀 Deploying Notixl Proxy Browser with BYOD support..."

if ! command -v caddy &> /dev/null; then
    echo "📦 Installing Caddy..."
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    echo "deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt update
    sudo apt install caddy -y
fi

echo "📁 Creating directories..."
sudo mkdir -p /var/log/caddy
sudo mkdir -p /etc/caddy/sites-available

echo "⚙️ Setting up Caddy configuration..."
sudo cp Caddyfile /etc/caddy/Caddyfile

echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data /var/www/notixl
sudo chmod -R 755 /var/www/notixl

echo "✅ Validating Caddy configuration..."
sudo caddy validate --config /etc/caddy/Caddyfile

echo "🔄 Starting Caddy..."
sudo systemctl enable caddy
sudo systemctl restart caddy

sleep 3

if sudo systemctl is-active --quiet caddy; then
    echo "✅ Caddy is running successfully!"
else
    echo "❌ Caddy failed to start. Check logs with: sudo journalctl -u caddy -f"
    exit 1
fi

echo "🎉 Deployment complete!"
echo ""
echo "📋 BYOD Setup Instructions:"
echo "1. Update your DNS to point your domain to this server's IP"
echo "2. Replace 'notixl.example.com' in /etc/caddy/Caddyfile with your actual domain"
echo "3. Restart Caddy: sudo systemctl restart caddy"
echo "4. Your proxy browser will be available at: https://your-domain.com"
echo ""
echo "📧 Email for SSL certificates: oscisadev@gmail.com"
echo ""
echo "🔍 Check logs with: sudo journalctl -u caddy -f"
