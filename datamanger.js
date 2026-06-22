// js/datamanager.js
const DataManager = (() => {
    const STORAGE_KEY_DATA = 'attendanceData';
    const STORAGE_KEY_COLUMNS = 'attendanceColumns';
    const STORAGE_KEY_COFFEE = 'coffeeDismissed';
    const STORAGE_KEY_TIMES = 'attendanceTimes';

    let attendanceData = [];
    let columns = [];
    let timeSettings = { enforce: false, inStart: '', inEnd: '', outStart: '', outEnd: '' };

    function loadFromStorage() {
        const savedData = localStorage.getItem(STORAGE_KEY_DATA);
        const savedCols = localStorage.getItem(STORAGE_KEY_COLUMNS);
        const savedTimes = localStorage.getItem(STORAGE_KEY_TIMES);
        
        if (savedData) try { attendanceData = JSON.parse(savedData); } catch(e){ attendanceData = []; }
        if (savedCols) try { columns = JSON.parse(savedCols); } catch(e){ columns = []; }
        if (savedTimes) try { timeSettings = JSON.parse(savedTimes); } catch(e){}
    }

    function saveToStorage() {
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(attendanceData));
        localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(columns));
        localStorage.setItem(STORAGE_KEY_TIMES, JSON.stringify(timeSettings));
    }

    function setColumns(newColumns) { columns = [...newColumns]; saveToStorage(); }
    function getColumns() { return [...columns]; }
    function getData() { return [...attendanceData]; }
    function replaceData(newData) { attendanceData = newData; saveToStorage(); }
    
    function getTimeSettings() { return { ...timeSettings }; }
    function setTimeSettings(settings) { timeSettings = settings; saveToStorage(); }

    function processScan(qrText) {
        if (!columns.length) return { success: false, msg: 'No columns defined' };
        
        const now = new Date();
        const scanTimestamp = now.toLocaleString();
        
        // Format current time as HH:MM for checking against rules
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        const idCol = columns[0];
        const inCol = columns.length > 1 ? columns[1] : null;
        const outCol = columns.length > 2 ? columns[2] : null;

        const existingIndex = attendanceData.findIndex(record =>
            record[idCol] === qrText && (!outCol || !record[outCol])
        );

        // Determine if they are scanning IN or OUT
        const isScanningOut = existingIndex !== -1 && outCol;
        
        let statusTag = '';

        // Apply Time Rules if enforced
        if (timeSettings.enforce) {
            if (isScanningOut) {
                // Reject if too early
                if (timeSettings.outStart && currentTime < timeSettings.outStart) {
                    return { success: false, msg: `Too early! Scan OUT starts at ${timeSettings.outStart}` };
                }
                // Tag as LATE if past the deadline, otherwise ON TIME
                if (timeSettings.outEnd && currentTime > timeSettings.outEnd) {
                    statusTag = ' (LATE)';
                } else {
                    statusTag = ' (ON TIME)';
                }
            } else {
                // Reject if too early
                if (timeSettings.inStart && currentTime < timeSettings.inStart) {
                    return { success: false, msg: `Too early! Scan IN starts at ${timeSettings.inStart}` };
                }
                // Tag as LATE if past the deadline, otherwise ON TIME
                if (timeSettings.inEnd && currentTime > timeSettings.inEnd) {
                    statusTag = ' (LATE)';
                } else {
                    statusTag = ' (ON TIME)';
                }
            }
        }

        // Combine the actual time with the Late/On Time status
        const finalRecordedTime = scanTimestamp + statusTag;

        // Save data to the correct column
        if (isScanningOut) {
            attendanceData[existingIndex][outCol] = finalRecordedTime;
        } else {
            const newRecord = { [idCol]: qrText };
            if (inCol) newRecord[inCol] = finalRecordedTime;
            if (outCol) newRecord[outCol] = '';
            attendanceData.push(newRecord);
        }
        
        saveToStorage();
        
        // Return success and show the status in the popup toast!
        return { success: true, msg: `${qrText} scanned successfully! ${statusTag}`.trim() }; 
    }

    function migrateColumns(oldCols, newCols) {
        const migrated = attendanceData.map(record => {
            const newRecord = {};
            newCols.forEach(col => { newRecord[col] = oldCols.includes(col) ? (record[col] || '') : ''; });
            return newRecord;
        });
        attendanceData = migrated;
        columns = [...newCols];
        saveToStorage();
    }

    function isCoffeeDismissed() { return localStorage.getItem(STORAGE_KEY_COFFEE) === 'true'; }
    function dismissCoffee() { localStorage.setItem(STORAGE_KEY_COFFEE, 'true'); }
    
    function resetAll() {
        attendanceData = []; columns = [];
        localStorage.removeItem(STORAGE_KEY_DATA);
        localStorage.removeItem(STORAGE_KEY_COLUMNS);
    }

    loadFromStorage();

    return {
        getColumns, getData, setColumns, replaceData, processScan, migrateColumns,
        isCoffeeDismissed, dismissCoffee, resetAll, saveToStorage,
        getTimeSettings, setTimeSettings
    };
})();
