const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

module.exports = (bot, answer) => {
    return async (req, res) => {
        const { file } = req;
        if (!file) {
            return res.send(answer.bad(244));
        }

        const { buffer, originalname, mimetype } = file;

        // Ensure temp directory exists for uploads
        const tempDir = path.join(__dirname, '..', '..', 'temp_uploads');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        let tempFilePath = null;
        try {
            let type;
            let uploadResult;

            if (mimetype.startsWith('image/')) {
                type = 'image';
                // Images can be uploaded directly from buffer
                uploadResult = await bot.api.uploadImage({ source: buffer });
            } else if (mimetype.startsWith('video/') || mimetype.startsWith('audio/')) {
                type = mimetype.startsWith('video/') ? 'video' : 'audio';
                
                // Write buffer to temp file so the Max Bot API can query its size and stream it
                tempFilePath = path.join(tempDir, `${randomUUID()}_${originalname}`);
                fs.writeFileSync(tempFilePath, buffer);

                if (type === 'video') {
                    uploadResult = await bot.api.uploadVideo({ source: tempFilePath, timeout: 120000 });
                } else {
                    uploadResult = await bot.api.uploadAudio({ source: tempFilePath, timeout: 120000 });
                }
            } else {
                type = 'file';
                // Use monkeypatched buffer upload to bypass custom multipart stream bug
                uploadResult = await bot.api.uploadFile({
                    source: { buffer, fileName: originalname },
                    timeout: 120000
                });
            }

            let attachmentRequest;
            if (uploadResult && typeof uploadResult.toJson === 'function') {
                attachmentRequest = uploadResult.toJson();
            } else {
                attachmentRequest = {
                    type,
                    payload: uploadResult
                };
            }

            return res.send(answer.good({
                attachmentRequest,
                filename: originalname,
                type
            }));
        } catch (error) {
            console.error('Upload to max failed:', error);
            return res.send(answer.bad(2003));
        } finally {
            // Clean up the temp file if one was written
            if (tempFilePath && fs.existsSync(tempFilePath)) {
                try {
                    fs.unlinkSync(tempFilePath);
                } catch (err) {
                    console.error('Failed to delete temp upload file:', err);
                }
            }
        }
    };
};
