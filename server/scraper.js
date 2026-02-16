const puppeteer = require('puppeteer');
const path = require('path');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function launchBrowser() {
    const launchOptions = {
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled',
            '--window-size=1366,768',
            '--single-process',
            '--no-zygote'
        ],
        defaultViewport: { width: 1366, height: 768 }
    };

    // Use system Chromium on Render (set via PUPPETEER_EXECUTABLE_PATH env var)
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        console.log(`[Browser] Using system Chromium: ${launchOptions.executablePath}`);
    }

    return puppeteer.launch(launchOptions);
}

async function debugScreenshot(page, name) {
    try {
        await page.screenshot({ path: path.join(__dirname, `debug_${name}.png`), fullPage: false });
        console.log(`[DEBUG] Screenshot saved: debug_${name}.png`);
    } catch (e) { }
}

/**
 * Google Maps Local Search
 */
async function searchGoogleMaps(query, location) {
    console.log(`[Google] Starting search for "${query}" in "${location}"...`);
    const browser = await launchBrowser();
    const results = [];

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const searchQuery = `${query} in ${location}`;
        await page.goto(`https://www.google.com/search?tbm=lcl&q=${encodeURIComponent(searchQuery)}`, {
            waitUntil: 'domcontentloaded', timeout: 30000
        });
        await delay(3000);
        await debugScreenshot(page, 'google');

        // Check CAPTCHA
        const blocked = await page.evaluate(() => {
            return document.body.innerText.includes('unusual traffic') ||
                document.body.innerText.includes('not a robot');
        });

        if (blocked) {
            console.log('[Google] BLOCKED by CAPTCHA. Try again in 10+ minutes.');
            await browser.close();
            return results;
        }

        await page.evaluate(() => window.scrollBy(0, 1000));
        await delay(1000);

        results.push(...await page.evaluate(() => {
            const items = [];
            document.querySelectorAll('[data-cid], .VkpGBb, .CxA8M').forEach(el => {
                const nameNode = el.querySelector('[role="heading"], .dbg0pd, .OSrXXb');
                const name = nameNode ? nameNode.innerText.trim() : '';

                if (name && name.length > 2) {
                    const text = el.innerText;
                    const phoneMatch = text.match(/(?:\+91|0)?[-\s]?[6-9]\d{4}[-\s]?\d{5}/);
                    const address = el.querySelector('.rllt__details')?.innerText || '';

                    items.push({
                        name,
                        address: address.replace(name, '').trim().substring(0, 120),
                        phone: phoneMatch ? phoneMatch[0].replace(/[^\d+]/g, '') : '',
                        category: 'Business',
                        source: 'Google Maps'
                    });
                }
            });
            return items;
        }));

        console.log(`[Google] Found ${results.length} results`);
    } catch (error) { console.error("[Google] Error:", error.message); }
    finally { await browser.close(); }
    return results;
}

/**
 * IndiaMART - FIXED: Extract real company names not star ratings
 * From screenshot: company names appear as plain text links below "Contact Supplier" buttons
 * e.g. "KBP Techno India Private Limited", "Civiqo Infrastructure Private Limited"
 */
async function searchIndiaMart(query, location) {
    console.log(`[IndiaMART] Starting search...`);
    const browser = await launchBrowser();
    const results = [];

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(`https://dir.indiamart.com/search.mp?ss=${encodeURIComponent(query + ' ' + location)}`, {
            waitUntil: 'networkidle2', timeout: 60000
        });
        await delay(5000);

        for (let i = 0; i < 5; i++) {
            await page.evaluate(() => window.scrollBy(0, 600));
            await delay(500);
        }

        await debugScreenshot(page, 'indiamart');

        // Extract: Find ALL links on page, filter to company profile links
        const extracted = await page.evaluate(() => {
            const items = [];
            const seen = new Set();

            // On IndiaMART, company names are <a> linking to company profiles
            // URLs look like: https://www.indiamart.com/companyname/ or similar patterns
            // Company names are SHORT text (3-60 chars), NOT star ratings, NOT product names

            const allLinks = document.querySelectorAll('a');

            allLinks.forEach(link => {
                const href = link.href || '';
                const text = link.innerText.trim();

                // Filter: Must be an IndiaMART company link
                // Company profile URLs typically match: indiamart.com/companyslug/
                // But NOT search, NOT dir.indiamart, NOT help pages
                if (!href.includes('indiamart.com')) return;
                if (href.includes('search.mp')) return;
                if (href.includes('dir.indiamart.com')) return;
                if (href.includes('/helpcenter')) return;
                if (href.includes('javascript:')) return;
                if (href.includes('#')) return;

                // Filter out garbage names
                if (!text || text.length < 4 || text.length > 70) return;
                if (text.includes('★')) return;
                if (text.includes('View')) return;
                if (text.includes('Contact')) return;
                if (text.includes('Get Best')) return;
                if (text.includes('Help')) return;
                if (text.includes('Sell')) return;
                if (text.includes('Sign')) return;
                if (text.includes('Messages')) return;
                if (text.includes('Exporters')) return;
                if (text.includes('₹')) return;
                if (text.includes('Share')) return;
                if (text.includes('Feedback')) return;
                if (text.includes('Complaint')) return;
                if (text.includes('Academy')) return;
                if (text.includes('Buying')) return;
                if (text.includes('Selling')) return;
                if (text.match(/^\d/)) return;
                if (text.includes('Type')) return;
                if (text.includes('Plate')) return;
                if (text.includes('mm')) return;
                // Footer/Nav blocklist
                if (text.includes('About Us')) return;
                if (text.includes('Join Sales')) return;
                if (text.includes('Success Stories')) return;
                if (text.includes('Press Section')) return;
                if (text.includes('Advertise')) return;
                if (text.includes('Jobs')) return;
                if (text.includes('Careers')) return;
                if (text.includes('Customer Care')) return;
                if (text.includes('Tool Kit')) return;
                if (text.includes('BuyLead')) return;
                if (text.includes('Learning Centre')) return;
                if (text.includes('Ship With')) return;
                if (text.includes('Products You')) return;
                if (text.includes('Search Products')) return;
                if (text.includes('Terms of')) return;
                if (text.includes('Privacy Policy')) return;
                if (text.includes('Link to')) return;
                if (text.includes('My Orders')) return;
                if (text.includes('Export')) return;
                if (text.includes('Easy booking')) return;
                if (text.includes('IndiaMART')) return; // Any link with "IndiaMART" in text is nav

                // Must look like a company name: Contains at least one capital letter word
                if (!text.match(/[A-Z][a-z]/)) return;

                // Check if this looks like a company (not a product)
                // Products: "Foundation Bolt", "Anchor Foundation Bolts"
                // Companies: "KBP Techno India Private Limited", "Samir Enterprise"
                // Heuristic: companies often end with Ltd, Enterprise, Industries, etc.
                // Or are multi-word names
                const words = text.split(/\s+/);
                if (words.length < 2) return; // Single word unlikely to be company

                if (seen.has(text)) return;
                seen.add(text);

                // Check parent/grandparent for location info
                let container = link.parentElement;
                let locationText = '';
                let phoneText = '';

                for (let i = 0; i < 5 && container; i++) {
                    const cText = container.innerText;
                    // Look for city names
                    const locMatch = cText.match(/(?:Patna|Bihar|Delhi|Mumbai|Kolkata|Chennai|Jamshedpur|Howrah|Ludhiana|Hyderabad|Ahmedabad|Faridabad|Rajkot|Fatwa|Kumhrar|Noida|Gurgaon|Pune|Bangalore|Bengaluru)/i);
                    if (locMatch && !locationText) locationText = locMatch[0];

                    // Phone
                    const phMatch = cText.match(/(?:\+91[\s-]?)?[6-9]\d{9}/);
                    if (phMatch && !phoneText) phoneText = phMatch[0].replace(/[\s-]/g, '');

                    container = container.parentElement;
                }

                items.push({
                    name: text,
                    address: locationText || 'IndiaMART Supplier',
                    phone: phoneText,
                    category: 'Supplier',
                    source: 'IndiaMART'
                });
            });

            return items;
        });

        console.log(`[IndiaMART] Extracted ${extracted.length} suppliers`);
        results.push(...extracted);

    } catch (error) { console.error("[IndiaMART] Error:", error.message); }
    finally { await browser.close(); }
    return results;
}

/**
 * Justdial - with Access Denied detection
 */
async function searchJustdial(query, location) {
    console.log(`[Justdial] Starting search...`);
    const browser = await launchBrowser();
    const results = [];

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(`https://www.justdial.com/${location}/${encodeURIComponent(query)}`, {
            waitUntil: 'domcontentloaded', timeout: 60000
        });
        await delay(3000);

        // Check for access denied
        const denied = await page.evaluate(() => {
            return document.body.innerText.includes('Access Denied');
        });

        if (denied) {
            console.log('[Justdial] ACCESS DENIED - Rate limited. Try again in a few minutes.');
            await browser.close();
            return results;
        }

        await debugScreenshot(page, 'justdial');
        await page.evaluate(() => window.scrollBy(0, 2000));
        await delay(1000);

        results.push(...await page.evaluate(() => {
            const items = [];
            document.querySelectorAll('.resultbox, .cntanr').forEach(card => {
                const name = card.querySelector('.resultbox_title_anchor, .store-name, .lng_md_ttl')?.innerText || '';
                const address = card.querySelector('.address-info, .cont_fl_addr')?.innerText || '';

                let phone = '';
                const telLink = card.querySelector('a[href^="tel:"]');
                if (telLink) phone = telLink.href.replace('tel:', '');

                if (!phone) {
                    const txt = card.innerText;
                    const m = txt.match(/(?:\+91|0)?[6-9]\d{9}/);
                    if (m) phone = m[0];
                }

                if (name) {
                    items.push({
                        name, address,
                        phone: phone.replace(/[^\d+]/g, ''),
                        category: 'Business',
                        source: 'Justdial'
                    });
                }
            });
            return items;
        }));

        console.log(`[Justdial] Extracted ${results.length} items`);
    } catch (error) { console.error("[Justdial] Error:", error.message); }
    finally { await browser.close(); }
    return results;
}

module.exports = { searchGoogleMaps, searchIndiaMart, searchJustdial };
