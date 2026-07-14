import CONFIG from '../../config';

class FileService {
    constructor() {
        this.host = CONFIG.HOST.startsWith('http') ? CONFIG.HOST : `http://${CONFIG.HOST}`;
    }

    async upload(file, conversationGuid) {
        const formData = new FormData();
        formData.append('conversationGuid', conversationGuid);
        formData.append('file', file);

        const response = await fetch(`${this.host}/upload`, {
            method: 'POST',
            body: formData,
        });

        const res = await response.json();
        if (res.result !== 'ok') {
            throw new Error(res.error?.message || 'Ошибка загрузки файла');
        }

        const localUrl = URL.createObjectURL(file);
        return {
            request: res.data.attachmentRequest,
            filename: res.data.filename,
            type: res.data.type,
            localUrl
        };
    }

    getProxiedUrl(attachmentUrl, attachmentType) {
        if (!attachmentUrl) return '';
        if (attachmentType === 'image') {
            return attachmentUrl;
        }
        return `${this.host}/videoProxy?url=${encodeURIComponent(attachmentUrl)}`;
    }

    downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'file';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

export default FileService;
