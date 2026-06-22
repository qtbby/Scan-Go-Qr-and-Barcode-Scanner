// js/sound.js
const Sound = (() => {
    let audioCtx = null;

    function getContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playBeep(frequency = 800, duration = 0.1, volume = 0.3) {
        try {
            const ctx = getContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(volume, ctx.currentTime);
            
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (e) {
            console.warn('Beep failed:', e);
        }
    }

    return { playBeep };
})();
