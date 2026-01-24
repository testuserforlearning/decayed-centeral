class ProxyBrowser {
    constructor() {
        this.tabs = [];
        this.activeTabId = null;
        this.currentUrl = '';
        this.mathUrl = '';
        this.mounted = false;
        this.scramjet = null;
        this.connection = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startClock();
        this.createInitialTab();
        this.initTinyjet();
        this.mounted = true;
    }

    setupEventListeners() {
        const urlForm = document.getElementById('urlForm');
        const urlInput = document.getElementById('urlInput');
        
        urlForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUrlSubmit(urlInput.value.trim());
        });

        document.getElementById('backBtn').addEventListener('click', () => this.goBack());
        document.getElementById('forwardBtn').addEventListener('click', () => this.goForward());
        document.getElementById('refreshBtn').addEventListener('click', () => this.refresh());
        document.getElementById('moreBtn').addEventListener('click', () => this.showMoreOptions());

        document.querySelector('.new-tab-btn').addEventListener('click', () => this.addNewTab());

        document.getElementById('openNewTabBtn').addEventListener('click', () => this.openInNewTab());
    }

    createInitialTab() {
        const initialTab = {
            id: '1',
            title: 'New Tab',
            isActive: true
        };
        this.tabs = [initialTab];
        this.activeTabId = initialTab.id;
        this.renderTabs();
    }

    addNewTab() {
        const newTab = {
            id: Date.now().toString(),
            title: 'New Tab',
            isActive: false
        };
        
        this.tabs.forEach(tab => tab.isActive = false);
        
        newTab.isActive = true;
        this.tabs.push(newTab);
        this.activeTabId = newTab.id;
        
        this.renderTabs();
        this.resetToWelcomeScreen();
    }

    closeTab(tabId) {
        if (this.tabs.length === 1) return;
        
        const tabIndex = this.tabs.findIndex(tab => tab.id === tabId);
        const closedTab = this.tabs.find(tab => tab.id === tabId);
        
        this.tabs = this.tabs.filter(tab => tab.id !== tabId);
        
        if (closedTab.isActive && this.tabs.length > 0) {
            const newActiveIndex = Math.min(tabIndex, this.tabs.length - 1);
            this.tabs[newActiveIndex].isActive = true;
            this.activeTabId = this.tabs[newActiveIndex].id;
        }
        
        this.renderTabs();
    }

    switchTab(tabId) {
        this.tabs.forEach(tab => {
            tab.isActive = tab.id === tabId;
        });
        this.activeTabId = tabId;
        this.renderTabs();
        this.resetToWelcomeScreen();
    }

    renderTabs() {
        const container = document.getElementById('tabsContainer');
        container.innerHTML = '';
        
        this.tabs.forEach(tab => {
            const tabElement = document.createElement('div');
            tabElement.className = `tab ${tab.isActive ? 'active' : ''}`;
            tabElement.innerHTML = `
                <span class="tab-title">${tab.title}</span>
                <button class="tab-close" data-tab-id="${tab.id}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
            
            tabElement.addEventListener('click', (e) => {
                if (!e.target.closest('.tab-close')) {
                    this.switchTab(tab.id);
                }
            });
            
            const closeBtn = tabElement.querySelector('.tab-close');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeTab(tab.id);
            });
            
            container.appendChild(tabElement);
        });
    }

    startClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        
        const clockElement = document.getElementById('clock');
        if (clockElement) {
            clockElement.textContent = this.mounted ? `${displayHours}:${displayMinutes}` : '--:--';
        }
    }

    handleUrlSubmit(url) {
        if (!url) return;
        
        let processedUrl = url;
        try {
            new URL(url);
        } catch {
            processedUrl = `https://search.brave.com/search?q=${encodeURIComponent(url)}`;
        }
        
        this.currentUrl = processedUrl;
        this.loadMath();
    }

    goBack() {
        const frame = document.getElementById('mathFrame');
        if (frame.contentWindow && frame.contentWindow.history.length > 1) {
            frame.contentWindow.history.back();
        }
    }

    goForward() {
        const frame = document.getElementById('mathFrame');
        if (frame.contentWindow) {
            frame.contentWindow.history.forward();
        }
    }

    refresh() {
        const frame = document.getElementById('mathFrame');
        if (frame.src) {
            frame.src = frame.src;
        } else if (this.currentUrl) {
            this.loadMath();
        }
    }

    showMoreOptions() {
        console.log('More options clicked');
    }

    async initTinyjet() {
        try {
            const { ScramjetController } = $scramjetLoadController();
            this.scramjet = new ScramjetController({ 
                files: { 
                    wasm: "https://cdn.jsdelivr.net/gh/soap-phia/tinyjet@latest/tinyjet/wasm.wasm", 
                    all: "https://cdn.jsdelivr.net/gh/soap-phia/tinyjet@latest/tinyjet/scramjet.all.js", 
                    sync: "https://cdn.jsdelivr.net/gh/soap-phia/tinyjet@latest/tinyjet/scramjet.sync.js" 
                } 
            });
            
            await this.scramjet.init();
            
            if (window.BareMux) {
                this.connection = new window.BareMux.BareMuxConnection("/bareworker.js");
                await this.setTransport("epoxy");
            }
        } catch (e) {
            console.error("scramjet failed to initialize;", e);
        }
    }

    getWispUrl() {
        const defaultWisp = "wss://petezahgames.com/wisp/";
        return defaultWisp;
    }

    async setTransport(transportsel) {
        if (!this.connection) return;
        
        const wispUrl = this.getWispUrl();
        try {
            switch (transportsel) {
                case "epoxy":
                    await this.connection.setTransport("https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-transport/dist/index.mjs", [{ wisp: wispUrl }]);
                    break;
                case "libcurl":
                    await this.connection.setTransport("https://cdn.jsdelivr.net/npm/@mercuryworkshop/libcurl-transport/dist/index.mjs", [{ websocket: wispUrl }]);
                    break;
                default:
                    await this.connection.setTransport("https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-transport/dist/index.mjs", [{ wisp: wispUrl }]);
                    break;
            }
            console.log(`Transport set to: ${transportsel}`);
        } catch (error) {
            console.error('Failed to set transport:', error);
            try {
                await this.connection.setTransport("https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-transport/dist/index.mjs", [{ wisp: wispUrl }]);
            } catch (fallbackError) {
                console.error('Fallback transport also failed:', fallbackError);
            }
        }
    }

    async loadMath() {
        if (!this.currentUrl) return;

        try {
            // Don't proxy our own domain
            const url = new URL(this.currentUrl);
            if (url.hostname === window.location.hostname) {
                console.log('Skipping proxy for same-origin URL:', this.currentUrl);
                this.showMathFrame(this.currentUrl);
                return;
            }

            // Use scramjet proxy
            const proxyUrl = '/scramjet/' + encodeURIComponent(this.currentUrl);
            console.log('Loading via scramjet proxy:', proxyUrl);
            this.showMathFrame(proxyUrl);
            
        } catch (error) {
            console.error('Scramjet proxy failed:', error);
            // Fallback to direct loading
            try {
                this.showMathFrame(this.currentUrl);
            } catch (directError) {
                console.error('Direct load also failed:', directError);
                this.showError();
            }
        }
    }

    searchUrl(input) {
        let template = "https://search.brave.com/search?q=%s";

        try {
            return new URL(input).toString();
        } catch (err) {}

        try {
            let url = new URL(`http://${input}`);
            if (url.hostname.includes(".")) return url.toString();
        } catch (err) {}

        return template.replace("%s", input);
    }

    showMathFrame(src) {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const mathContainer = document.getElementById('mathContainer');
        const mathFrame = document.getElementById('mathFrame');
        
        welcomeScreen.style.display = 'none';
        mathContainer.style.display = 'block';
        mathFrame.src = src;
    }

    resetToWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const mathContainer = document.getElementById('mathContainer');
        const urlInput = document.getElementById('urlInput');
        
        welcomeScreen.style.display = 'flex';
        mathContainer.style.display = 'none';
        urlInput.value = '';
        this.currentUrl = '';
        this.mathUrl = '';
    }

    showError() {
        console.error('Math loading failed');
        this.resetToWelcomeScreen();
    }

    openInNewTab() {
        if (this.mathUrl) {
            window.open(this.mathUrl, '_blank');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProxyBrowser();
});