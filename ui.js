// js/ui.js
const UI = (() => {
    const setupScreen = document.getElementById('setup-screen');
    const scannerScreen = document.getElementById('scanner-screen');
    const columnModal = document.getElementById('column-modal');
    const timeModal = document.getElementById('time-modal');
    const columnsList = document.getElementById('columns-list');
    const attendanceContainer = document.getElementById('attendance-table-container');
    const coffeeFloat = document.getElementById('coffee-float');
    const uploadStatus = document.getElementById('upload-status');
    const toastContainer = document.getElementById('toast-container');

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        if (screenId === 'setup') setupScreen.classList.add('active');
        else if (screenId === 'scanner') scannerScreen.classList.add('active');
    }

    function showColumnModal() { columnModal.classList.add('active'); }
    function hideColumnModal() { columnModal.classList.remove('active'); }
    
    function showTimeModal() { timeModal.classList.add('active'); }
    function hideTimeModal() { timeModal.classList.remove('active'); }

    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = `toast ${isError ? 'error' : 'success'}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        
        // Remove toast after animation finishes
        setTimeout(() => {
            if(toast.parentElement) toast.remove();
        }, 3000);
    }

    function renderColumnEditor(cols, onAdd, onRemove, onSave, onCancel) {
        columnsList.innerHTML = '';
        function syncInputs() {
            const inputs = columnsList.querySelectorAll('input');
            inputs.forEach((inp, i) => { if (i < cols.length) cols[i] = inp.value; });
        }

        cols.forEach((col, index) => {
            const row = document.createElement('div');
            row.className = 'column-row';
            const input = document.createElement('input');
            input.type = 'text';
            input.value = col;
            input.dataset.index = index;
            row.appendChild(input);

            if (cols.length > 1) {
                const removeBtn = document.createElement('button');
                removeBtn.className = 'btn-remove-column';
                removeBtn.textContent = '×';
                removeBtn.onclick = () => { syncInputs(); onRemove(index); };
                row.appendChild(removeBtn);
            }
            columnsList.appendChild(row);
        });

        document.getElementById('btn-add-column').onclick = () => { syncInputs(); onAdd(`Column ${cols.length + 1}`); };
        
        document.getElementById('btn-save-columns').onclick = () => {
            syncInputs();
            const newCols = cols.map(c => c.trim()).filter(v => v);
            if (newCols.length === 0) return alert('At least one column is required.');
            onSave(newCols);
        };

        document.getElementById('btn-cancel-columns').onclick = () => { hideColumnModal(); onCancel(); };
    }

    function renderAttendanceTable(data, columns) {
        if (!columns.length) {
            attendanceContainer.innerHTML = '<p>No columns defined.</p>';
            return;
        }
        let html = '<table><thead><tr>';
        columns.forEach(col => html += `<th>${col}</th>`);
        html += '</tr></thead><tbody>';
        
        if (data.length === 0) {
            html += `<tr><td colspan="${columns.length}">No records yet</td></tr>`;
        } else {
            // Reverse loop to show newest scans at the top
            for (let i = data.length - 1; i >= 0; i--) {
                html += '<tr>';
                columns.forEach(col => { html += `<td>${data[i][col] || ''}</td>`; });
                html += '</tr>';
            }
        }
        html += '</tbody></table>';
        attendanceContainer.innerHTML = html;
    }

    function showUploadStatus(msg, isError = false) {
        uploadStatus.textContent = msg;
        uploadStatus.style.color = isError ? '#e74c3c' : '#27ae60';
    }

        function initCoffeeFloat() {
        const coffeeModal = document.getElementById('coffee-modal');

        if (DataManager.isCoffeeDismissed()) {
            coffeeFloat.classList.add('hidden');
        } else {
            coffeeFloat.classList.remove('hidden');
        }
        
        // 1. Click the "X" to dismiss the float forever
        document.getElementById('btn-close-coffee').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents opening the modal when clicking X
            DataManager.dismissCoffee();
            coffeeFloat.classList.add('hidden');
        });

        // 2. Click anywhere else on the float to open your E-Wallet modal
        coffeeFloat.addEventListener('click', () => {
            coffeeModal.classList.add('active');
        });

        // 3. Click "Close" inside the modal to hide it
        document.getElementById('btn-close-coffee-modal').addEventListener('click', () => {
            coffeeModal.classList.remove('active');
        });
    }


    return {
        showScreen, showColumnModal, hideColumnModal, 
        showTimeModal, hideTimeModal, showToast,
        renderColumnEditor, renderAttendanceTable, 
        showUploadStatus, initCoffeeFloat
    };
})();
