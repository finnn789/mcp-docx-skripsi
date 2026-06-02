'use strict';

const { createCanvas } = require('canvas');
const fs   = require('fs');
const path = require('path');

// ─── Anchor helpers ──────────────────────────────────────────────────────────

const ANCHOR_DIR = {
  top:    [ 0, -1],
  bottom: [ 0,  1],
  left:   [-1,  0],
  right:  [ 1,  0],
};

function getAnchorPoint(shape, anchor) {
  const { x, y, width: w, height: h } = shape;
  switch (anchor) {
    case 'top':    return { x: x + w / 2, y };
    case 'bottom': return { x: x + w / 2, y: y + h };
    case 'left':   return { x,             y: y + h / 2 };
    case 'right':  return { x: x + w,      y: y + h / 2 };
    default:       return { x: x + w / 2,  y: y + h / 2 };
  }
}

function autoAnchor(fromShape, toShape) {
  const fc = { x: fromShape.x + fromShape.width / 2, y: fromShape.y + fromShape.height / 2 };
  const tc = { x: toShape.x  + toShape.width  / 2,  y: toShape.y  + toShape.height  / 2  };
  const dx = tc.x - fc.x, dy = tc.y - fc.y;
  if (Math.abs(dx) >= Math.abs(dy))
    return { from: dx > 0 ? 'right' : 'left', to: dx > 0 ? 'left' : 'right' };
  return { from: dy > 0 ? 'bottom' : 'top', to: dy > 0 ? 'top' : 'bottom' };
}

// ─── Shape drawing ───────────────────────────────────────────────────────────

function tracePath(ctx, shape) {
  const { type = 'rounded_rect', x, y, width: w, height: h, radius = 8 } = shape;

  ctx.beginPath();
  switch (type) {

    case 'rect':
      ctx.rect(x, y, w, h);
      break;

    case 'rounded_rect':
    default: {
      const r = Math.min(radius, w / 2, h / 2);
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y,     x + w, y + r,   r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h,     x, y + h - r,   r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y,         x + r, y,        r);
      ctx.closePath();
      break;
    }

    case 'diamond': {
      const cx = x + w / 2, cy = y + h / 2;
      ctx.moveTo(cx,     y);
      ctx.lineTo(x + w,  cy);
      ctx.lineTo(cx,     y + h);
      ctx.lineTo(x,      cy);
      ctx.closePath();
      break;
    }

    case 'oval':
    case 'ellipse':
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      break;

    case 'circle': {
      const r2 = Math.min(w, h) / 2;
      ctx.arc(x + w / 2, y + h / 2, r2, 0, Math.PI * 2);
      break;
    }

    case 'stadium': {
      const r3 = h / 2;
      ctx.moveTo(x + r3, y);
      ctx.lineTo(x + w - r3, y);
      ctx.arc(x + w - r3, y + r3, r3, -Math.PI / 2,  Math.PI / 2);
      ctx.lineTo(x + r3, y + h);
      ctx.arc(x + r3,    y + r3, r3,  Math.PI / 2, -Math.PI / 2);
      ctx.closePath();
      break;
    }

    case 'parallelogram': {
      const sk = shape.skew ?? 15;
      ctx.moveTo(x + sk,     y);
      ctx.lineTo(x + w,      y);
      ctx.lineTo(x + w - sk, y + h);
      ctx.lineTo(x,          y + h);
      ctx.closePath();
      break;
    }

    case 'cylinder': {
      const ry = h * 0.13;
      ctx.ellipse(x + w / 2, y + ry,     w / 2, ry, 0, Math.PI, 0);
      ctx.lineTo(x + w, y + h - ry);
      ctx.ellipse(x + w / 2, y + h - ry, w / 2, ry, 0, 0, Math.PI);
      ctx.lineTo(x, y + ry);
      ctx.closePath();
      break;
    }

    case 'hexagon': {
      const cx2 = x + w / 2, cy2 = y + h / 2;
      const rx  = w / 2,     ry2 = h / 2;
      for (let i = 0; i < 6; i++) {
        const a  = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx2 + rx * Math.cos(a);
        const py = cy2 + ry2 * Math.sin(a);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }
  }
}

function drawShape(ctx, shape) {
  const {
    fill = '#4A90D9', stroke = '#1A3A6B',
    strokeWidth = 2,  shadow = false,
  } = shape;

  if (shadow) {
    ctx.save();
    ctx.shadowColor   = 'rgba(0,0,0,0.18)';
    ctx.shadowBlur    = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
  }

  tracePath(ctx, shape);
  ctx.fillStyle = fill;
  ctx.fill();

  if (shadow) ctx.restore();

  if (strokeWidth > 0) {
    tracePath(ctx, shape);
    ctx.strokeStyle = stroke;
    ctx.lineWidth   = strokeWidth;
    ctx.stroke();
  }

  // Cylinder top ellipse (redraw for border visibility)
  if (shape.type === 'cylinder') {
    const { x, y, width: w, height: h } = shape;
    const ry = h * 0.13;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + ry, w / 2, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = shape.stroke ?? '#1A3A6B';
    ctx.lineWidth   = shape.strokeWidth ?? 2;
    ctx.stroke();
  }
}

function drawShapeText(ctx, shape) {
  const {
    x, y, width: w, height: h,
    text, textColor = '#FFFFFF',
    fontSize = 13, bold = false,
    fontFamily = 'Arial',
  } = shape;

  if (!text) return;

  ctx.save();
  ctx.fillStyle    = textColor;
  ctx.font         = `${bold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  const lines  = String(text).split('\n');
  const lineH  = fontSize * 1.35;
  const totalH = lines.length * lineH;
  const startY = y + h / 2 - totalH / 2 + lineH / 2;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x + w / 2, startY + i * lineH);
  }
  ctx.restore();
}

// ─── Arrow / connection drawing ──────────────────────────────────────────────

function drawArrowhead(ctx, x, y, angle, { color = '#333', size = 10 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size * 0.42);
  ctx.lineTo(-size,  size * 0.42);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function isCoord(v) {
  return v && typeof v === 'object' && 'x' in v && 'y' in v;
}

function drawConnection(ctx, conn, shapesMap) {
  const {
    from, to,
    fromAnchor, toAnchor,
    style   = 'solid',
    curved  = false,
    color   = '#444444',
    width   = 2,
    label   = null,
    tension = 0.45,
    arrowSize = 10,
  } = conn;

  // Resolve shapes
  const fromShape = isCoord(from) ? null : shapesMap[from];
  const toShape   = isCoord(to)   ? null : shapesMap[to];

  // Resolve anchors
  let rFromAnchor = fromAnchor, rToAnchor = toAnchor;
  if ((!rFromAnchor || rFromAnchor === 'auto') && fromShape && toShape) {
    const a = autoAnchor(fromShape, toShape);
    rFromAnchor = a.from; rToAnchor = rToAnchor || a.to;
  }
  if ((!rToAnchor || rToAnchor === 'auto') && fromShape && toShape) {
    const a = autoAnchor(fromShape, toShape);
    rToAnchor = a.to;
  }

  // Get start / end points
  const startPt = isCoord(from) ? from : (fromShape ? getAnchorPoint(fromShape, rFromAnchor) : null);
  const endPt   = isCoord(to)   ? to   : (toShape   ? getAnchorPoint(toShape,   rToAnchor)   : null);
  if (!startPt || !endPt) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth   = width;
  ctx.setLineDash(style === 'dashed' ? [8, 4] : []);

  let arrowAngle;

  if (curved) {
    // Cubic bezier — control points follow anchor directions
    const dist = Math.hypot(endPt.x - startPt.x, endPt.y - startPt.y);
    const t    = dist * tension;

    const fd = ANCHOR_DIR[rFromAnchor] ?? [0, 0];
    const td = ANCHOR_DIR[rToAnchor]   ?? [0, 0];

    const cp1x = startPt.x + fd[0] * t;
    const cp1y = startPt.y + fd[1] * t;
    const cp2x = endPt.x   - td[0] * t;
    const cp2y = endPt.y   - td[1] * t;

    ctx.beginPath();
    ctx.moveTo(startPt.x, startPt.y);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endPt.x, endPt.y);
    ctx.stroke();

    // Tangent at t=1: direction from cp2 to endpoint
    arrowAngle = Math.atan2(endPt.y - cp2y, endPt.x - cp2x);
  } else {
    ctx.beginPath();
    ctx.moveTo(startPt.x, startPt.y);
    ctx.lineTo(endPt.x, endPt.y);
    ctx.stroke();

    arrowAngle = Math.atan2(endPt.y - startPt.y, endPt.x - startPt.x);
  }

  ctx.restore();

  // Arrowhead
  drawArrowhead(ctx, endPt.x, endPt.y, arrowAngle, { color, size: arrowSize });

  // Connection label
  if (label) {
    const mx = (startPt.x + endPt.x) / 2;
    const my = (startPt.y + endPt.y) / 2 - 12;
    ctx.save();
    ctx.font         = `bold 11px Arial`;
    ctx.fillStyle    = color;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, mx, my);
    ctx.restore();
  }
}

// ─── Standalone label drawing ─────────────────────────────────────────────────

function drawLabel(ctx, label) {
  const {
    x, y, text,
    fontSize = 14, bold = false,
    color = '#1A1A1A', align = 'center',
    fontFamily = 'Arial',
    italic = false,
  } = label;

  if (!text) return;

  ctx.save();
  const weight = bold ? 'bold ' : '';
  const style  = italic ? 'italic ' : '';
  ctx.font         = `${style}${weight}${fontSize}px ${fontFamily}`;
  ctx.fillStyle    = color;
  ctx.textAlign    = align;
  ctx.textBaseline = 'middle';

  const lines  = String(text).split('\n');
  const lineH  = fontSize * 1.35;
  const startY = y - ((lines.length - 1) * lineH) / 2;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, startY + i * lineH);
  }
  ctx.restore();
}

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * generateDiagram — engine utama generator diagram universal.
 *
 * @param {object} config
 * @param {object} config.canvas      - { width, height, background }
 * @param {Array}  config.shapes      - array objek shape (lihat schema di MCP tool)
 * @param {Array}  config.connections - array objek koneksi/panah
 * @param {Array}  config.labels      - array teks bebas
 * @param {string} outputPath         - direktori output
 * @param {string} filename           - nama file PNG, default 'diagram.png'
 * @returns {string} absolute path file PNG yang disimpan
 */
function generateDiagram(config, outputPath, filename = 'diagram.png') {
  const {
    canvas: cv  = {},
    shapes      = [],
    connections = [],
    labels      = [],
  } = config;

  const W  = cv.width      ?? 700;
  const H  = cv.height     ?? 500;
  const BG = cv.background ?? '#FFFFFF';

  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // Build id → shape map for connection lookup
  const shapesMap = {};
  for (const s of shapes) {
    if (s.id) shapesMap[s.id] = s;
  }

  // 1. Connections (drawn behind shapes)
  for (const conn of connections) drawConnection(ctx, conn, shapesMap);

  // 2. Shapes
  for (const shape of shapes) {
    drawShape(ctx, shape);
    drawShapeText(ctx, shape);
  }

  // 3. Labels (always on top)
  for (const lbl of labels) drawLabel(ctx, lbl);

  // Save
  const filePath = path.join(outputPath, filename);
  fs.mkdirSync(outputPath, { recursive: true });
  fs.writeFileSync(filePath, canvas.toBuffer('image/png'));
  return filePath;
}

module.exports = { generateDiagram };
