// js/sheetManager.js
const SheetManager = (() => {
    function parseSheet(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheet];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    if (jsonData.length === 0) {
                        reject('Empty sheet');
                        return;
                    }
                    
                    // Track header name AND its original column index to prevent data shifting
                    const headers = [];
                    const headerRow = jsonData[0];
                    headerRow.forEach((h, idx) => {
                        const headerStr = h !== undefined && h !== null ? String(h).trim() : '';
                        if (headerStr) {
                            headers.push({ name: headerStr, index: idx });
                        }
                    });

                    if (headers.length === 0) {
                        reject('No valid headers found');
                        return;
                    }
                    
                    const records = [];
                    for (let i = 1; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        const record = {};
                        headers.forEach((header) => {
                            record[header.name] = row[header.index] !== undefined ? String(row[header.index]).trim() : '';
                        });
                        
                        // Only add if there is data in the primary identifier column
                        if (record[headers[0].name]) {
                            records.push(record);
                        }
                    }
                    resolve({ columns: headers.map(h => h.name), data: records });
                } catch (err) {
                    reject('Error parsing file: ' + err.message);
                }
            };
            reader.onerror = () => reject('Failed to read file');
            reader.readAsArrayBuffer(file);
        });
    }

    return { parseSheet };
})();
