const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Readable } = require('stream');

const tempDir = path.join(__dirname, '..', '..', '..', '..', 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

module.exports = (answer, mediator) => {
    return async (req, res) => {
        const { url } = req.query;
        if (!url) {
            return res.status(400).send('Missing url');
        }

        try {
            const urlHash = crypto.createHash('md5').update(url).digest('hex');
            
            const files = fs.readdirSync(tempDir);
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

            const tempFilePath = path.join(tempDir, `${urlHash}_${originalFilename}`);

            const fileStream = fs.createWriteStream(tempFilePath);
            const nodeStream = Readable.fromWeb(response.body);

            await new Promise((resolve, reject) => {
                nodeStream.pipe(fileStream);
                fileStream.on('finish', resolve);
                fileStream.on('error', reject);
            });

            res.attachment(originalFilename);
            return res.sendFile(tempFilePath);
        } catch (error) {
            console.error('Video proxy error:', error);
            res.status(500).send('Internal server error');
        }
    };
};
