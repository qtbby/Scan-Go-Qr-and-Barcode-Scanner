// js/scanner.js
const Scanner = (() => {
    let html5QrCode = null;
    let currentCameraId = null;
    let isScanning = false;
    let scanLock = false;
    let onScanCallback = null;

    // NEW: Configuration optimized for BOTH QR and Barcodes (wider rectangle box)
    const scannerConfig = {
        fps: 10,
        qrbox: { width: 300, height: 150 } 
    };

    async function startScanner(elementId, onScan) {
        if (isScanning) return;
        onScanCallback = onScan;
        html5QrCode = new Html5Qrcode(elementId);

        try {
            const cameras = await Html5Qrcode.getCameras();
            if (!cameras || cameras.length === 0) {
                throw new Error('No cameras found');
            }
            
            const backCam = cameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('environment'));
            currentCameraId = backCam ? backCam.id : cameras[0].id;

            await html5QrCode.start(
                currentCameraId,
                scannerConfig, // Using our new wider box
                (decodedText) => {
                    if (scanLock) return;
                    scanLock = true;
                    Sound.playBeep();
                    if (onScanCallback) onScanCallback(decodedText);
                    setTimeout(() => { scanLock = false; }, 1500);
                },
                (errorMessage) => { /* Ignore standard frame errors */ }
            );
            isScanning = true;
        } catch (err) {
            console.error('Scanner start error:', err);
            alert('Camera error: ' + err.message);
        }
    }

    async function stopScanner() {
        if (html5QrCode && isScanning) {
            try {
                await html5QrCode.stop();
                html5QrCode.clear();
            } catch (e) {
                console.error("Failed to cleanly stop scanner", e);
            }
            isScanning = false;
            html5QrCode = null;
        }
    }

    async function switchCamera() {
        if (!html5QrCode || !isScanning) return;
        try {
            const cameras = await Html5Qrcode.getCameras();
            if (cameras.length <= 1) {
                alert('Only one camera available');
                return;
            }
            
            const newCam = cameras.find(c => c.id !== currentCameraId) || cameras[0];
            await html5QrCode.stop();
            
            await html5QrCode.start(
                newCam.id,
                scannerConfig, // Using our new wider box here too
                (decodedText) => {
                    if (scanLock) return;
                    scanLock = true;
                    Sound.playBeep();
                    if (onScanCallback) onScanCallback(decodedText);
                    setTimeout(() => { scanLock = false; }, 1500);
                },
                () => {}
            );
            currentCameraId = newCam.id;
        } catch (err) {
            console.error('Switch camera error:', err);
            alert('Could not switch camera');
        }
    }

    return { startScanner, stopScanner, switchCamera };
})();
