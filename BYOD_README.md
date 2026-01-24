# Notixl Proxy Browser - BYOD (Bring Your Own Domain) Support

## 🌐 BYOD Deployment Guide

This guide helps you deploy the Notixl Proxy Browser with your own custom domain using Caddy.

### 📧 Contact Information
- **Email for SSL certificates**: `oscisadev@gmail.com`

### 🚀 Quick Deployment

1. **Run the deployment script**:
   ```bash
   ./deploy.sh
   ```

2. **Update your domain configuration**:
   ```bash
   sudo nano /etc/caddy/Caddyfile
   ```
   Replace `notixl.example.com` with your actual domain.

3. **Restart Caddy**:
   ```bash
   sudo systemctl restart caddy
   ```

### 🔧 Manual Setup

#### Prerequisites
- Ubuntu/Debian server
- Domain name pointing to your server's IP
- Port 80/443 accessible

#### Installation Steps

1. **Install Caddy**:
   ```bash
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   echo "deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update
   sudo apt install caddy -y
   ```

2. **Configure Caddy**:
   - Copy the `Caddyfile` to `/etc/caddy/Caddyfile`
   - Update the domain name
   - Set your email for SSL certificates

3. **Start Caddy**:
   ```bash
   sudo systemctl enable caddy
   sudo systemctl start caddy
   ```

### 🎨 Features Added

#### Tab Styling
- ✅ Rounded tabs with 15px border radius
- ✅ Removed curved corners (clean, modern look)
- ✅ Smooth transitions and hover effects

#### BYOD Features
- ✅ Automatic HTTPS with Let's Encrypt
- ✅ Wildcard subdomain support
- ✅ CORS headers for cross-origin requests
- ✅ Service Worker support
- ✅ Static asset optimization
- ✅ Gzip compression
- ✅ Security headers

### 🔍 Configuration Details

#### Caddy Configuration
- **Email**: `oscisadev@gmail.com` (for SSL certificates)
- **Domain**: Replace `notixl.example.com` with your domain
- **Subdomains**: Wildcard support (`*.your-domain.com`)

#### Security Headers
- CORS enabled for BYOD support
- XSS protection
- Content type protection
- Frame protection

#### Performance
- Gzip/Zstandard compression
- Static asset caching (1 year)
- HTML files set to no-cache
- Service Worker optimization

### 🌍 BYOD Subdomain Support

The configuration supports wildcard subdomains:
- `your-domain.com` - Main proxy browser
- `sub1.your-domain.com` - Custom instance
- `custom.your-domain.com` - Another instance

### 📱 Mobile Support

The proxy browser is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

### 🔧 Troubleshooting

#### Check Caddy Status
```bash
sudo systemctl status caddy
```

#### View Logs
```bash
sudo journalctl -u caddy -f
```

#### Test Configuration
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
```

#### Reload Configuration
```bash
sudo caddy reload --config /etc/caddy/Caddyfile
```

### 📄 SSL Certificate Management

- **Automatic**: Let's Encrypt certificates are auto-renewed
- **Email**: `oscisadev@gmail.com` receives renewal notifications
- **Wildcard**: Supports wildcard certificates for subdomains

### 🚀 Performance Optimization

- **Compression**: Gzip and Zstandard enabled
- **Caching**: Static assets cached for 1 year
- **Headers**: Optimized for browser caching
- **Service Worker**: Properly configured for offline support

### 🛡️ Security Features

- **HTTPS**: Automatic SSL/TLS encryption
- **CORS**: Configured for BYOD access
- **Headers**: Security headers for protection
- **Service Worker**: Secure scope configuration

### 📞 Support

For BYOD deployment issues:
1. Check the Caddy logs
2. Verify DNS configuration
3. Ensure ports 80/443 are open
4. Test SSL certificate issuance

---

**Ready to deploy your own proxy browser?** Run `./deploy.sh` and follow the instructions!
