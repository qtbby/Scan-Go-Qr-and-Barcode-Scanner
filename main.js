// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const savedColumns = DataManager.getColumns();
    const savedData = DataManager.getData();

    if (savedColumns.length > 0) {
        UI.showScreen('scanner');
        startScanningAndUI();
    } else {
        UI.showScreen('setup');
    }

    UI.initCoffeeFloat();
        // ---------- Time Rules Handling ----------
    document.getElementById('btn-time-rules').addEventListener('click', () => {
        const settings = DataManager.getTimeSettings();
        document.getElementById('enforce-time').checked = settings.enforce;
        document.getElementById('in-start').value = settings.inStart || '';
        document.getElementById('in-end').value = settings.inEnd || '';
        document.getElementById('out-start').value = settings.outStart || '';
        document.getElementById('out-end').value = settings.outEnd || '';
        UI.showTimeModal();
    });

    document.getElementById('btn-save-times').addEventListener('click', () => {
        DataManager.setTimeSettings({
            enforce: document.getElementById('enforce-time').checked,
            inStart: document.getElementById('in-start').value,
            inEnd: document.getElementById('in-end').value,
            outStart: document.getElementById('out-start').value,
            outEnd: document.getElementById('out-end').value
        });
        UI.hideTimeModal();
        UI.showToast('Time rules saved successfully!', false);
    });

    document.getElementById('btn-cancel-times').addEventListener('click', () => {
        UI.hideTimeModal();
    });

    document.getElementById('btn-sheet-ready').addEventListener('click', () => {
        document.getElementById('file-input').click();
    });

    document.getElementById('file-input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        UI.showUploadStatus('Processing file...', false);
        try {
            const result = await SheetManager.parseSheet(file);
            if (!result.columns || result.columns.length === 0) {
                throw new Error('No columns found');
            }
            
            const existingData = DataManager.getData();
            if (existingData.length > 0) {
                if (!confirm('Existing attendance data will be replaced. Continue?')) {
                    UI.showUploadStatus('Upload cancelled', true);
                    return;
                }
            }
            
            DataManager.setColumns(result.columns);
            DataManager.replaceData(result.data);
            UI.showUploadStatus('Sheet loaded successfully', false);
            
            UI.showScreen('scanner');
            startScanningAndUI();
        } catch (err) {
            UI.showUploadStatus(err, true);
        }
        e.target.value = ''; // Reset input
    });

    document.getElementById('btn-no-sheet').addEventListener('click', () => {
        openColumnEditor();
    });

    // Cleaned up logic to prevent recursive callback nesting
    function openColumnEditor(existingCols = null) {
        const cols = existingCols || DataManager.getColumns();
        const startCols = cols.length ? [...cols] : ['Name', 'In', 'Out'];
        let workingCols = [...startCols];

        UI.showColumnModal();
        refreshEditor();

        function refreshEditor() {
            UI.renderColumnEditor(
                workingCols,
                (newCol) => { 
                    workingCols.push(newCol); 
                    refreshEditor(); 
                },
                (idx) => { 
                    workingCols.splice(idx, 1); 
                    refreshEditor(); 
                },
                (newCols) => {
                    const oldCols = DataManager.getColumns();
                    if (oldCols.length > 0) {
                        DataManager.migrateColumns(oldCols, newCols);
                    } else {
                        DataManager.setColumns(newCols);
                    }
                    UI.hideColumnModal();
                    
                    if (!document.getElementById('scanner-screen').classList.contains('active')) {
                        UI.showScreen('scanner');
                        startScanningAndUI();
                    } else {
                        UI.renderAttendanceTable(DataManager.getData(), DataManager.getColumns());
                    }
                },
                () => UI.hideColumnModal()
            );
        }
    }

    document.getElementById('btn-edit-columns').addEventListener('click', () => {
        openColumnEditor(DataManager.getColumns());
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
        if (confirm('Reset all attendance data and start over?')) {
            Scanner.stopScanner();
            DataManager.resetAll();
            UI.showScreen('setup');
        }
    });

    document.getElementById('btn-switch-camera').addEventListener('click', () => {
        Scanner.switchCamera();
    });

    document.getElementById('btn-export-csv').addEventListener('click', () => {
        const data = DataManager.getData();
        const cols = DataManager.getColumns();
        if (cols.length === 0) {
            alert('No data to export');
            return;
        }
        let csv = cols.join(',') + '\n';
        data.forEach(record => {
            csv += cols.map(col => `"${(record[col] || '').replace(/"/g, '""')}"`).join(',') + '\n';
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    });

    function startScanningAndUI() {
        UI.renderAttendanceTable(DataManager.getData(), DataManager.getColumns());
        Scanner.startScanner('reader', (qrText) => {
            
            // Check scan result against time rules
            const result = DataManager.processScan(qrText);
            
            if (result.success) {
                UI.showToast(result.msg, false);
                UI.renderAttendanceTable(DataManager.getData(), DataManager.getColumns());
            } else {
                UI.showToast(result.msg, true);
            }
            
        }).catch(err => {
            console.error(err);
        });
    }

});
