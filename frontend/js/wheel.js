/**
 * Wheel module — draws and animates the spinning wheel on a canvas.
 */

class SpinnerWheel {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.items = [];
        this.currentAngle = 0;
        this.isSpinning = false;
        this.onSpinEnd = null;

        // High-DPI support
        const dpr = window.devicePixelRatio || 1;
        const size = this.canvas.offsetWidth;
        this.canvas.width = size * dpr;
        this.canvas.height = size * dpr;
        this.ctx.scale(dpr, dpr);
        this.size = size;
        this.center = size / 2;
        this.radius = size / 2 - 8;
    }

    setItems(items) {
        this.items = items;
        this.draw();
    }

    draw() {
        const { ctx, center, radius, items } = this;
        ctx.clearRect(0, 0, this.size, this.size);

        if (items.length === 0) {
            ctx.fillStyle = '#1a1a2e';
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#a0a0cc';
            ctx.font = '16px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText('Add items to spin!', center, center);
            return;
        }

        const sliceAngle = (Math.PI * 2) / items.length;

        items.forEach((item, i) => {
            const startAngle = this.currentAngle + i * sliceAngle;
            const endAngle = startAngle + sliceAngle;

            // Draw slice
            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();

            // Slice border
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw label
            ctx.save();
            ctx.translate(center, center);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = this.getContrastColor(item.color);
            ctx.font = `bold ${Math.max(12, Math.min(20, 240 / items.length))}px Segoe UI`;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 3;

            const labelText = item.label.length > 16
                ? item.label.substring(0, 15) + '...'
                : item.label;
            ctx.fillText(labelText, radius - 16, 5);
            ctx.restore();
        });

        // Center circle
        ctx.beginPath();
        ctx.arc(center, center, 22, 0, Math.PI * 2);
        ctx.fillStyle = '#0f0f1a';
        ctx.fill();
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    getContrastColor(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#1a1a2e' : '#ffffff';
    }

    spin(winnerIndex, callback) {
        if (this.isSpinning || this.items.length === 0) return;

        this.isSpinning = true;
        this.canvas.classList.add('spinning');
        this.onSpinEnd = callback;

        const TWO_PI = Math.PI * 2;
        const sliceAngle = TWO_PI / this.items.length;

        // Pointer is at top = -π/2 (or 3π/2) in canvas coordinates.
        // Slice i is drawn from: currentAngle + i * sliceAngle
        //                    to: currentAngle + (i+1) * sliceAngle
        //
        // For the pointer (-π/2) to land in the MIDDLE of slice winnerIndex:
        //   finalAngle + winnerIndex * sliceAngle + sliceAngle/2 = -π/2  (mod 2π)
        //   finalAngle = -π/2 - (winnerIndex + 0.5) * sliceAngle

        // Add slight randomness within the slice so it doesn't always hit dead center
        const offsetInSlice = (Math.random() - 0.5) * sliceAngle * 0.6;

        // The exact final angle (mod 2π) we need
        const rawFinal = -Math.PI / 2 - (winnerIndex + 0.5) * sliceAngle + offsetInSlice;

        // Normalize rawFinal to [0, 2π)
        const normFinal = ((rawFinal % TWO_PI) + TWO_PI) % TWO_PI;

        // Add 6-9 full clockwise rotations on top of current angle for drama
        const fullSpins = Math.floor(6 + Math.random() * 3);
        const targetAngle = -(fullSpins * TWO_PI) + normFinal;

        const startAngle = this.currentAngle;
        const totalRotation = targetAngle - startAngle;
        const duration = 4000 + Math.random() * 1500;
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing: cubic ease-out for natural deceleration
            const eased = 1 - Math.pow(1 - progress, 3);

            this.currentAngle = startAngle + totalRotation * eased;
            this.draw();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Snap currentAngle to normalized final so it stays clean
                this.currentAngle = normFinal;
                this.draw();
                this.isSpinning = false;
                this.canvas.classList.remove('spinning');
                if (this.onSpinEnd) this.onSpinEnd();
            }
        };

        requestAnimationFrame(animate);
    }
}
