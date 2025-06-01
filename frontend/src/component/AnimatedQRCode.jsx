import React, { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

// Helper to get pixel data from QR code canvas
function getCanvasPixelData(canvas) {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  return imageData;
}

const AnimatedQRCode = ({
  value,
  size = 200,
  delay = 2, // ms per pixel
  ...props
}) => {
  const [revealedPixels, setRevealedPixels] = useState(0);
  const [pixelOrder, setPixelOrder] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const canvasRef = useRef(null);
  const qrCanvasRef = useRef(null);

  // Reset animation state when value or size changes
  useEffect(() => {
    setIsReady(false);
    setRevealedPixels(0);
    setPixelOrder([]);
  }, [value, size]);

  // Generate pixel order (randomized for effect) when ready
  useEffect(() => {
    if (!isReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas;
    const order = [];
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) order.push({ x, y });
    // Shuffle for a more interesting effect
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    setPixelOrder(order);
    setRevealedPixels(0);
  }, [isReady, value, size]);

  // Animate pixel reveal
  useEffect(() => {
    if (!isReady || pixelOrder.length === 0) return;
    if (revealedPixels >= pixelOrder.length) return;
    const timer = setTimeout(() => {
      setRevealedPixels((prev) => prev + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [revealedPixels, pixelOrder, isReady, delay]);

  // Draw revealed pixels
  useEffect(() => {
    if (!isReady || pixelOrder.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = getCanvasPixelData(canvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < revealedPixels; i++) {
      const { x, y } = pixelOrder[i];
      const idx = (y * canvas.width + x) * 4;
      const [r, g, b, a] = [
        imageData.data[idx],
        imageData.data[idx + 1],
        imageData.data[idx + 2],
        imageData.data[idx + 3],
      ];
      ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }, [revealedPixels, pixelOrder, isReady]);

  // Copy QR code pixels after QRCodeCanvas is rendered
  useEffect(() => {
    // Wait for QRCodeCanvas to render
    const timeout = setTimeout(() => {
      const qrCanvas = qrCanvasRef.current;
      if (qrCanvas && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.drawImage(qrCanvas, 0, 0, size, size);
        setIsReady(true);
      }
    }, 100); // small delay to ensure QR is rendered
    return () => clearTimeout(timeout);
  }, [value, size]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* Hidden QR code for pixel data */}
      <div style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}>
        <QRCodeCanvas
          id="hidden-qr-canvas"
          value={value}
          size={size}
          includeMargin={false}
          ref={qrCanvasRef}
        />
      </div>
      {/* Our animated canvas */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          background: "#fff",
          transition: "box-shadow 0.3s",
        }}
      />
      {/* Overlay for fade-in effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "linear-gradient(135deg, #e0e7ff 0%, #fff 100%)",
          opacity: revealedPixels < pixelOrder.length ? 0.2 : 0,
          transition: "opacity 0.5s",
          borderRadius: 16,
        }}
      />
    </div>
  );
};

export default AnimatedQRCode; 