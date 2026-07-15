const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Readable } = require('stream');
const dns = require('dns');
const { URL } = require('url');
const CONFIG = require('../../../config');

const tempDir = path.join(__dirname, '..', '..', '..', '..', 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const CLEANUP_INTERVAL = CONFIG.INTERVALS.TEMP_CLEANUP;
const MAX_FILE_AGE = CONFIG.INTERVALS.TEMP_MAX_FILE_AGE;

function cleanTempDir() {
    fs.readdir(tempDir, (err, files) => {
        if (err) {
            console.error('Failed to read temp directory for cleanup:', err);
            return;
        }
        const now = Date.now();
        files.forEach(file => {
            const filePath = path.join(tempDir, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Failed to stat file for cleanup:', file, err);
                    return;
                }
                if (now - stats.mtimeMs > MAX_FILE_AGE) {
                    fs.unlink(filePath, err => {
                        if (err) {
                            console.error('Failed to delete old temp file:', file, err);
                        } else {
                            console.log('Successfully deleted old temp file:', file);
                        }
                    });
                }
            });
        });
    });
}

cleanTempDir();
const cleanupTimer = setInterval(cleanTempDir, CLEANUP_INTERVAL);
if (cleanupTimer.unref) {
    cleanupTimer.unref();
}

function resolveIP(hostname) {
    return new Promise((resolve, reject) => {
        dns.lookup(hostname, (err, address) => {
            if (err) reject(err);
            else resolve(address);
        });
    });
}

function isPrivateIP(ip) {
    if (!ip) return true;
    const ipv4Regex = /^(?:127\.|10\.|192\.168\.|169\.254\.)/;
    if (ipv4Regex.test(ip)) return true;

    if (ip.startsWith('172.')) {
        const parts = ip.split('.');
        const secondOctet = parseInt(parts[1], 10);
        if (secondOctet >= 16 && secondOctet <= 31) return true;
    }

    if (ip === '0.0.0.0') return true;

    const ipv6Lower = ip.toLowerCase();
    if (ipv6Lower === '::1' || ipv6Lower === '::' || ipv6Lower.startsWith('fe8') || ipv6Lower.startsWith('fe9') || ipv6Lower.startsWith('fea') || ipv6Lower.startsWith('feb') || ipv6Lower.startsWith('fc') || ipv6Lower.startsWith('fd')) {
        return true;
    }

    return false;
}

module.exports = (answer, mediator) => {
    return async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).send('Missing url');
        }

        try {
            const parsedUrl = new URL(url);
            if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
                return res.status(400).send('Invalid protocol');
            }

            const ip = await resolveIP(parsedUrl.hostname);
            if (isPrivateIP(ip)) {
                console.warn(`SSRF Blocked request to private IP ${ip} for URL: ${url}`);
                return res.status(403).send('Forbidden');
            }
        } catch (err) {
            console.error('Invalid URL or DNS resolution failed:', url, err.message);
            return res.status(400).send('Invalid URL');
        }

        try {
            const urlHash = crypto.createHash('md5').update(url).digest('hex');
            
            const files = await fs.promises.readdir(tempDir);
            const cachedFileName = files.find(file => file.startsWith(urlHash));

            if (cachedFileName) {
                const tempFilePath = path.join(tempDir, cachedFileName);
                const originalFilename = cachedFileName.substring(urlHash.length + 1);
                
                res.attachment(originalFilename);
                return res.sendFile(tempFilePath);
            }

            const response = await fetch(url);

            if (!response.ok) {
                const errText = await response.text().catch(() => 'no error body');
                console.error(`Failed to fetch media from okcdn. URL: ${url}, Status: ${response.status}, Response: ${errText}`);
                return res.status(response.status).send(`Failed to fetch media: ${response.status}`);
            }

            let originalFilename = 'file.bin';
            const contentDisposition = response.headers.get('content-disposition') || '';
            const filenameMatch = contentDisposition.match(/filename\*?=["']?(?:utf-8'')?([^"';\n]+)/i);
            
            if (filenameMatch && filenameMatch[1]) {
                try {
                    originalFilename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''));
                } catch (e) {
                    originalFilename = filenameMatch[1].replace(/['"]/g, '');
                }
            } else {
                const contentType = response.headers.get('content-type') || '';
                const mimeType = contentType.split(';')[0].trim().toLowerCase();
                let ext = '.bin';
                if (mimeType === 'video/mp4') ext = '.mp4';
                else if (mimeType === 'application/pdf') ext = '.pdf';
                originalFilename = `file${ext}`;
            }

            // Path Traversal Mitigation: sanitize filename to only keep basename
            originalFilename = path.basename(originalFilename);
            if (!originalFilename || originalFilename === '.' || originalFilename === '..') {
                originalFilename = 'file.bin';
            }

            const tempFilePath = path.join(tempDir, `${urlHash}_${originalFilename}`);
            const tempFilePathTmp = `${tempFilePath}.${crypto.randomBytes(4).toString('hex')}.tmp`;

            const fileStream = fs.createWriteStream(tempFilePathTmp);
            const nodeStream = Readable.fromWeb(response.body);

            try {
                await new Promise((resolve, reject) => {
                    nodeStream.pipe(fileStream);
                    fileStream.on('finish', resolve);
                    fileStream.on('error', reject);
                });

                await fs.promises.rename(tempFilePathTmp, tempFilePath);
            } catch (err) {
                if (fs.existsSync(tempFilePathTmp)) {
                    try {
                        fs.unlinkSync(tempFilePathTmp);
                    } catch (_) {}
                }
                throw err;
            }

            res.attachment(originalFilename);
            return res.sendFile(tempFilePath);
        } catch (error) {
            console.error('Video proxy error:', error);
            res.status(500).send('Internal server error');
        }
    };
};
