"use client";

import { useEffect, useRef, useState } from 'react';

const TC = '#1e3a8a';
const PI2 = Math.PI * 2;
const DASH = 7;
const GAP = 5;
const PERIOD = DASH + GAP;

const T_INTRO = 40;
const T_START = 50;
const T_TRUNK = 80;
const T_SPINE = 80;
const T_BRANCH = 60;
const T_CARD = 50;
const T_STAGGER = 26;
const T_HOLD = 180;
const T_FADE = 70;
const T_CYCLE = T_START + T_TRUNK + T_SPINE + T_BRANCH * 5 + T_CARD + T_HOLD + T_FADE + 30;

const CARD_WIDTH = 238;
const CARD_HEIGHT = 150;
const CARD_GAP = 24;
const SOURCE_WIDTH = 162;
const SOURCE_HEIGHT = 42;
const PILL_WIDTH = 136;
const PILL_HEIGHT = 22;

type ModuleNode = {
  c: string;
  tag: string;
  f: [string, string, string];
};

const MODS_L: ModuleNode[] = [
  { c: '#7B8FFF', tag: 'Recruitement', f: ['Job posting & JD builder', 'Applicant tracking system', 'Interview pipeline mgmt'] },
  { c: '#29d9ff', tag: 'Onboarding', f: ['Digital documentation', 'Smart task checklists', 'Asset allocation flow'] },
  { c: '#FFB347', tag: 'Leave', f: ['Dynamic leave policies', 'Custom approval chains', 'Team leave calendars'] },
  { c: '#df6fff', tag: 'Hierarchy', f: ['Position-based org tree', 'Reporting line config', 'Role delegation tools'] },
  { c: '#ff6b8a', tag: 'Payroll', f: ['Dynamic pay config', 'PF PT ESIC TDS', 'FnF settlement suite'] },
];

const MODS_R: ModuleNode[] = [
  { c: '#00e8a2', tag: 'Attendance', f: ['Gamified check-in portal', 'Shift scheduling engine', 'Geo & biometric capture'] },
  { c: '#7B8FFF', tag: 'Performance', f: ['OKR & goal tracking', '360 feedback cycles', 'Appraisal workflows'] },
  { c: '#29d9ff', tag: 'Learning', f: ['Course library mgmt', 'Skill gap analysis', 'Certification tracking'] },
  { c: '#FFB347', tag: 'Exit', f: ['Resignation workflows', 'Exit interview suite', 'NOC & clearance mgmt'] },
  { c: '#df6fff', tag: 'Reports', f: ['Custom report builder', 'Workforce dashboards', 'Compliance reports'] },
];

type Geometry = {
  W: number;
  H: number;
  CY: number;
  SBX: number;
  SBY: number;
  SB_L: number;
  SB_R: number;
  cardTopY: number;
  R_CARD_L: number;
  L_CARD_R: number;
  L_CARD_L: number;
  R_SPINE: number;
  L_SPINE: number;
  R_SPINE_EDGE: number;
  L_SPINE_EDGE: number;
  SPINE_TOP: number;
  SPINE_BOT: number;
};

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease3 = (t: number) => {
  const c = clamp(t, 0, 1);
  return 1 - (1 - c) * (1 - c) * (1 - c);
};
const prog = (frame: number, start: number, duration: number) => ease3((frame - start) / duration);

function cardCY(geo: Geometry, index: number) {
  return geo.cardTopY + index * (CARD_HEIGHT + CARD_GAP) + CARD_HEIGHT / 2;
}

function cardTY(geo: Geometry, index: number) {
  return geo.cardTopY + index * (CARD_HEIGHT + CARD_GAP);
}

function spineXAt(geo: Geometry, side: 'L' | 'R', y: number) {
  const centerX = side === 'R' ? geo.R_SPINE : geo.L_SPINE;
  const edgeX = side === 'R' ? geo.R_SPINE_EDGE : geo.L_SPINE_EDGE;

  if (y <= geo.CY) {
    return lerp(centerX, edgeX, clamp((geo.CY - y) / Math.max(1, geo.CY - geo.SPINE_TOP), 0, 1));
  }

  return lerp(centerX, edgeX, clamp((y - geo.CY) / Math.max(1, geo.SPINE_BOT - geo.CY), 0, 1));
}

function drawBrandBadge(
  target: CanvasRenderingContext2D,
  bx: number,
  by: number,
  size: number,
  alpha: number,
  fill: string,
  glyph: string,
  stroke?: string,
) {
  if (alpha <= 0) {
    return;
  }

  target.save();
  target.globalAlpha = alpha;
  target.fillStyle = fill;
  target.beginPath();
  target.roundRect(bx, by, size, size, Math.max(3, size * 0.22));
  target.fill();

  if (stroke) {
    target.strokeStyle = stroke;
    target.lineWidth = Math.max(0.7, size * 0.05);
    target.beginPath();
    target.roundRect(bx, by, size, size, Math.max(3, size * 0.22));
    target.stroke();
  }

  target.fillStyle = glyph;
  target.beginPath();
  target.moveTo(bx + size * 0.64, by + size * 0.11);
  target.lineTo(bx + size * 0.3, by + size * 0.41);
  target.lineTo(bx + size * 0.51, by + size * 0.41);
  target.lineTo(bx + size * 0.39, by + size * 0.84);
  target.lineTo(bx + size * 0.79, by + size * 0.49);
  target.lineTo(bx + size * 0.58, by + size * 0.49);
  target.closePath();
  target.fill();
  target.restore();
}

function drawBrandWordmark(
  target: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  alpha: number,
  fontSize: number,
  textFill: string,
  badgeFill: string,
  glyphFill: string,
  badgeStroke?: string,
) {
  if (alpha <= 0) {
    return;
  }

  const brandLeft = 'Payrollea';
  const brandRight = 'y';
  const badgeSize = Math.max(12, fontSize * 0.82);
  const gap = Math.max(2, fontSize * 0.14);

  target.save();
  target.globalAlpha = alpha;
  target.textAlign = 'left';
  target.textBaseline = 'middle';
  target.fillStyle = textFill;
  target.font = `700 ${fontSize}px monospace`;

  const leftWidth = target.measureText(brandLeft).width;
  const rightWidth = target.measureText(brandRight).width;
  const totalWidth = leftWidth + gap + badgeSize + gap + rightWidth;
  const startX = centerX - totalWidth / 2;

  target.fillText(brandLeft, startX, centerY);
  const badgeX = startX + leftWidth + gap;
  drawBrandBadge(target, badgeX, centerY - badgeSize / 2, badgeSize, 1, badgeFill, glyphFill, badgeStroke);
  target.fillStyle = textFill;
  target.fillText(brandRight, badgeX + badgeSize + gap, centerY);
  target.restore();
}

function drawWatermarkConnector(target: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  target.save();
  target.strokeStyle = 'rgba(100,116,139,0.06)';
  target.lineWidth = 1.15;
  target.lineCap = 'round';
  target.beginPath();
  target.moveTo(x1, y1);
  target.lineTo(x2, y2);
  target.stroke();
  target.restore();
}

function drawWatermarkCard(target: CanvasRenderingContext2D, x: number, y: number, mod: ModuleNode) {
  const bg = target.createLinearGradient(x, y, x + CARD_WIDTH, y + CARD_HEIGHT);
  bg.addColorStop(0, 'rgba(226,232,240,0.07)');
  bg.addColorStop(1, 'rgba(226,232,240,0.04)');

  target.save();
  target.fillStyle = bg;
  target.beginPath();
  target.roundRect(x, y, CARD_WIDTH, CARD_HEIGHT, 10);
  target.fill();

  target.fillStyle = 'rgba(203,213,225,0.05)';
  target.beginPath();
  target.roundRect(x, y, CARD_WIDTH, 40, [10, 10, 0, 0]);
  target.fill();

  target.strokeStyle = 'rgba(148,163,184,0.06)';
  target.lineWidth = 0.9;
  target.beginPath();
  target.roundRect(x, y, CARD_WIDTH, CARD_HEIGHT, 10);
  target.stroke();

  target.strokeStyle = 'rgba(148,163,184,0.05)';
  target.lineWidth = 1.35;
  target.lineCap = 'round';
  target.beginPath();
  target.moveTo(x, y + 14);
  target.lineTo(x, y + CARD_HEIGHT - 14);
  target.stroke();

  target.fillStyle = 'rgba(71,85,105,0.06)';
  target.beginPath();
  target.roundRect(x + 10, y + 11, PILL_WIDTH, PILL_HEIGHT, 4);
  target.fill();
  target.strokeStyle = 'rgba(100,116,139,0.07)';
  target.lineWidth = 0.7;
  target.beginPath();
  target.roundRect(x + 10, y + 11, PILL_WIDTH, PILL_HEIGHT, 4);
  target.stroke();

  target.fillStyle = 'rgba(255,255,255,0.14)';
  target.font = '700 17px monospace';
  target.textAlign = 'center';
  target.textBaseline = 'middle';
  target.fillText(mod.tag, x + 78, y + 22);

  target.textAlign = 'left';
  target.font = '400 11.6px monospace';
  mod.f.forEach((feature, index) => {
    const fy = y + 52 + index * 26;
    target.fillStyle = 'rgba(100,116,139,0.09)';
    target.beginPath();
    target.arc(x + 16, fy + 5, 2.2, 0, PI2);
    target.fill();
    target.fillStyle = 'rgba(30,41,59,0.1)';
    target.fillText(feature, x + 29, fy + 6);
  });

  target.restore();
}

function drawWatermarkSourceBox(target: CanvasRenderingContext2D, geo: Geometry) {
  const x = geo.SBX;
  const y = geo.SBY;

  target.save();
  target.fillStyle = 'rgba(226,232,240,0.08)';
  target.beginPath();
  target.roundRect(x, y, SOURCE_WIDTH, SOURCE_HEIGHT, 10);
  target.fill();

  target.strokeStyle = 'rgba(148,163,184,0.07)';
  target.lineWidth = 0.9;
  target.beginPath();
  target.roundRect(x, y, SOURCE_WIDTH, SOURCE_HEIGHT, 10);
  target.stroke();

  target.strokeStyle = 'rgba(255,255,255,0.08)';
  target.lineWidth = 0.8;
  target.beginPath();
  target.roundRect(x + 0.8, y + 0.8, SOURCE_WIDTH - 1.6, SOURCE_HEIGHT - 1.6, 9.2);
  target.stroke();
  target.restore();

  drawBrandWordmark(
    target,
    x + SOURCE_WIDTH / 2,
    y + SOURCE_HEIGHT / 2 + 0.5,
    1,
    16.6,
    'rgba(71,85,105,0.1)',
    'rgba(203,213,225,0.18)',
    'rgba(51,65,85,0.1)',
    'rgba(148,163,184,0.03)',
  );
}

function drawStaticLayer(target: CanvasRenderingContext2D, geo: Geometry) {
  target.clearRect(0, 0, geo.W, geo.H);
  target.fillStyle = 'rgba(255,255,255,1)';
  target.fillRect(0, 0, geo.W, geo.H);

  target.save();
  target.globalAlpha = 0.022;
  target.strokeStyle = '#4466aa';
  target.lineWidth = 0.5;
  for (let x = 0; x < geo.W; x += 48) {
    target.beginPath();
    target.moveTo(x, 0);
    target.lineTo(x, geo.H);
    target.stroke();
  }
  for (let y = 0; y < geo.H; y += 48) {
    target.beginPath();
    target.moveTo(0, y);
    target.lineTo(geo.W, y);
    target.stroke();
  }
  target.restore();

  drawWatermarkSourceBox(target, geo);
  drawWatermarkConnector(target, geo.SB_R, geo.CY, geo.R_SPINE, geo.CY);
  drawWatermarkConnector(target, geo.SB_L, geo.CY, geo.L_SPINE, geo.CY);
  drawWatermarkConnector(target, geo.R_SPINE, geo.CY, geo.R_SPINE_EDGE, geo.SPINE_TOP);
  drawWatermarkConnector(target, geo.R_SPINE, geo.CY, geo.R_SPINE_EDGE, geo.SPINE_BOT);
  drawWatermarkConnector(target, geo.L_SPINE, geo.CY, geo.L_SPINE_EDGE, geo.SPINE_TOP);
  drawWatermarkConnector(target, geo.L_SPINE, geo.CY, geo.L_SPINE_EDGE, geo.SPINE_BOT);

  for (let i = 0; i < 5; i += 1) {
    const y = cardCY(geo, i);
    drawWatermarkConnector(target, spineXAt(geo, 'R', y), y, geo.R_CARD_L, y);
    drawWatermarkConnector(target, spineXAt(geo, 'L', y), y, geo.L_CARD_R, y);
    drawWatermarkCard(target, geo.R_CARD_L, cardTY(geo, i), MODS_R[i]);
    drawWatermarkCard(target, geo.L_CARD_L, cardTY(geo, i), MODS_L[i]);
  }
}

function drawGlowLine(target: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, col: string, alpha: number) {
  if (alpha <= 0 || (x1 === x2 && y1 === y2)) {
    return;
  }

  target.lineCap = 'round';
  target.strokeStyle = col;
  target.shadowColor = col;

  target.globalAlpha = alpha * 0.01;
  target.lineWidth = 7;
  target.shadowBlur = 14;
  target.beginPath();
  target.moveTo(x1, y1);
  target.lineTo(x2, y2);
  target.stroke();

  target.globalAlpha = alpha * 0.045;
  target.lineWidth = 2.2;
  target.shadowBlur = 0;
  target.beginPath();
  target.moveTo(x1, y1);
  target.lineTo(x2, y2);
  target.stroke();

  target.globalAlpha = alpha * 0.62;
  target.lineWidth = 1.55;
  target.beginPath();
  target.moveTo(x1, y1);
  target.lineTo(x2, y2);
  target.stroke();

  target.globalAlpha = 1;
  target.shadowBlur = 0;
}

function drawAnimatedLine(
  target: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  col: string,
  alpha: number,
  progressValue: number,
) {
  if (alpha > 0 && progressValue > 0) {
    drawGlowLine(target, x1, y1, lerp(x1, x2, clamp(progressValue, 0, 1)), lerp(y1, y2, clamp(progressValue, 0, 1)), col, alpha);
  }
}

function drawGhostLine(target: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, col: string, alpha: number) {
  if (alpha <= 0) {
    return;
  }

  target.globalAlpha = alpha;
  target.strokeStyle = col;
  target.lineWidth = 0.5;
  target.lineCap = 'round';
  target.setLineDash([3, 5]);
  target.beginPath();
  target.moveTo(x1, y1);
  target.lineTo(x2, y2);
  target.stroke();
  target.setLineDash([]);
  target.globalAlpha = 1;
}

function drawFlowingDash(
  target: CanvasRenderingContext2D,
  x1: number,
  y: number,
  x2: number,
  col: string,
  alpha: number,
  frame: number,
) {
  if (alpha <= 0 || Math.abs(x2 - x1) < 1) {
    return;
  }

  const dir = x2 > x1 ? 1 : -1;
  const offset = ((frame * 1.4 * dir) % PERIOD + PERIOD) % PERIOD;

  target.lineCap = 'round';
  target.strokeStyle = col;
  target.setLineDash([DASH, GAP]);
  target.lineDashOffset = -offset * dir;

  target.globalAlpha = alpha * 0.06;
  target.lineWidth = 3.2;
  target.beginPath();
  target.moveTo(x1, y);
  target.lineTo(x2, y);
  target.stroke();

  target.globalAlpha = alpha;
  target.lineWidth = 1.7;
  target.beginPath();
  target.moveTo(x1, y);
  target.lineTo(x2, y);
  target.stroke();

  target.setLineDash([]);
  target.globalAlpha = 1;
}

function drawJunctionDot(target: CanvasRenderingContext2D, x: number, y: number, col: string, alpha: number) {
  if (alpha <= 0) {
    return;
  }

  target.globalAlpha = alpha;
  target.shadowColor = col;
  target.shadowBlur = 2;
  target.fillStyle = col;
  target.beginPath();
  target.arc(x, y, 3, 0, PI2);
  target.fill();
  target.globalAlpha = 1;
  target.shadowBlur = 0;
}

function drawBranch(
  target: CanvasRenderingContext2D,
  spineX: number,
  cardX: number,
  cy: number,
  col: string,
  alpha: number,
  progressValue: number,
  frame: number,
) {
  if (alpha <= 0 || progressValue <= 0) {
    return;
  }

  const dashLength = 30;
  const total = Math.abs(cardX - spineX);
  const dashStart = cardX + (spineX > cardX ? dashLength : -dashLength);
  const solidFraction = Math.abs(spineX - dashStart) / total;

  drawGlowLine(target, spineX, cy, lerp(spineX, dashStart, clamp(progressValue / solidFraction, 0, 1)), cy, col, alpha);

  if (progressValue >= solidFraction) {
    const dashProgress = clamp((progressValue - solidFraction) / (1 - solidFraction), 0, 1);
    drawFlowingDash(target, dashStart, cy, lerp(dashStart, cardX, dashProgress), col, alpha, frame);
  }
}

function drawSourceBox(target: CanvasRenderingContext2D, geo: Geometry, alpha: number) {
  if (alpha <= 0) {
    return;
  }

  const x = geo.SBX;
  const y = geo.SBY;

  target.globalAlpha = alpha;
  target.shadowColor = 'rgba(15,23,42,0.28)';
  target.shadowBlur = 10;
  target.fillStyle = 'rgba(30,58,138,0.92)';
  target.beginPath();
  target.roundRect(x, y, SOURCE_WIDTH, SOURCE_HEIGHT, 10);
  target.fill();

  target.shadowBlur = 0;
  target.strokeStyle = 'rgba(59,130,246,0.78)';
  target.lineWidth = 1;
  target.beginPath();
  target.roundRect(x, y, SOURCE_WIDTH, SOURCE_HEIGHT, 10);
  target.stroke();

  target.strokeStyle = 'rgba(255,255,255,0.28)';
  target.lineWidth = 0.8;
  target.beginPath();
  target.roundRect(x + 0.8, y + 0.8, SOURCE_WIDTH - 1.6, SOURCE_HEIGHT - 1.6, 9.2);
  target.stroke();

  drawBrandWordmark(
    target,
    x + SOURCE_WIDTH / 2,
    y + SOURCE_HEIGHT / 2 + 0.5,
    1,
    16.6,
    'rgba(255,255,255,0.98)',
    'rgba(250,204,21,0.98)',
    'rgba(15,23,42,0.96)',
    'rgba(255,255,255,0.14)',
  );

  target.globalAlpha = 1;
}

function drawCard(target: CanvasRenderingContext2D, x: number, y: number, mod: ModuleNode, alpha: number) {
  if (alpha <= 0) {
    return;
  }

  const col = mod.c;

  target.globalAlpha = alpha;
  target.shadowColor = `${col}55`;
  target.shadowBlur = 18;
  target.fillStyle = `${col}12`;
  target.beginPath();
  target.roundRect(x + 3, y + 4, CARD_WIDTH, CARD_HEIGHT, 10);
  target.fill();

  target.shadowBlur = 0;
  const bg = target.createLinearGradient(x, y, x + CARD_WIDTH, y + CARD_HEIGHT);
  bg.addColorStop(0, `${col}18`);
  bg.addColorStop(1, `${col}0d`);
  target.fillStyle = bg;
  target.beginPath();
  target.roundRect(x, y, CARD_WIDTH, CARD_HEIGHT, 10);
  target.fill();

  target.fillStyle = `${col}24`;
  target.beginPath();
  target.roundRect(x, y, CARD_WIDTH, 40, [10, 10, 0, 0]);
  target.fill();

  target.strokeStyle = `${col}55`;
  target.lineWidth = 0.8;
  target.shadowColor = col;
  target.shadowBlur = 6;
  target.beginPath();
  target.roundRect(x, y, CARD_WIDTH, CARD_HEIGHT, 10);
  target.stroke();

  target.shadowBlur = 10;
  target.strokeStyle = `${col}cc`;
  target.lineWidth = 1.2;
  target.beginPath();
  target.moveTo(x + 10, y);
  target.lineTo(x + CARD_WIDTH - 10, y);
  target.stroke();

  target.shadowBlur = 2;
  target.strokeStyle = `${col}66`;
  target.lineWidth = 1.5;
  target.lineCap = 'round';
  target.beginPath();
  target.moveTo(x, y + 14);
  target.lineTo(x, y + CARD_HEIGHT - 14);
  target.stroke();
  target.shadowBlur = 0;

  target.fillStyle = `${col}c8`;
  target.beginPath();
  target.roundRect(x + 10, y + 11, PILL_WIDTH, PILL_HEIGHT, 4);
  target.fill();
  target.strokeStyle = `${col}ee`;
  target.lineWidth = 0.5;
  target.beginPath();
  target.roundRect(x + 10, y + 11, PILL_WIDTH, PILL_HEIGHT, 4);
  target.stroke();

  target.fillStyle = 'rgba(255,255,255,0.98)';
  target.font = '700 17px monospace';
  target.textAlign = 'center';
  target.textBaseline = 'middle';
  target.fillText(mod.tag, x + 78, y + 22);

  target.textAlign = 'left';
  target.font = '400 11.6px monospace';
  mod.f.forEach((feature, index) => {
    const fy = y + 52 + index * 26;
    target.shadowColor = col;
    target.shadowBlur = 2;
    target.fillStyle = col;
    target.beginPath();
    target.arc(x + 16, fy + 5, 2.4, 0, PI2);
    target.fill();
    target.shadowBlur = 0;
    target.fillStyle = 'rgba(15,23,42,0.92)';
    target.fillText(feature, x + 29, fy + 6);
  });

  target.globalAlpha = 1;
}

export function HrmsLifecycleCanvas({ isActive }: { isActive: boolean }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startRef = useRef<() => void>(() => {});
  const stopRef = useRef<(reset?: boolean) => void>(() => {});
  const activeRef = useRef(isActive);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;

    if (!canvas || !stage) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    let geo: Geometry = {
      W: 0,
      H: 0,
      CY: 0,
      SBX: 0,
      SBY: 0,
      SB_L: 0,
      SB_R: 0,
      cardTopY: 0,
      R_CARD_L: 0,
      L_CARD_R: 0,
      L_CARD_L: 0,
      R_SPINE: 0,
      L_SPINE: 0,
      R_SPINE_EDGE: 0,
      L_SPINE_EDGE: 0,
      SPINE_TOP: 0,
      SPINE_BOT: 0,
    };

    let frame = 0;
    let raf = 0;
    let staticLayer: HTMLCanvasElement | null = null;

    const buildGeometry = (width: number, height: number): Geometry => {
      const CY = height * 0.5;
      const SBX = width / 2 - SOURCE_WIDTH / 2;
      const SBY = CY - SOURCE_HEIGHT / 2;
      const SB_L = SBX;
      const SB_R = SBX + SOURCE_WIDTH;
      const cardTopY = CY - (5 * CARD_HEIGHT + 4 * CARD_GAP) / 2;
      const R_CARD_L = width * 0.725;
      const L_CARD_R = width * 0.275;
      const L_CARD_L = L_CARD_R - CARD_WIDTH;
      const R_SPINE = SB_R + (R_CARD_L - SB_R) * 0.38;
      const L_SPINE = SB_L - (SB_L - L_CARD_R) * 0.38;
      const SPINE_TOP = cardTopY + CARD_HEIGHT / 2;
      const SPINE_BOT = cardTopY + 4 * (CARD_HEIGHT + CARD_GAP) + CARD_HEIGHT / 2;
      const spineTilt = Math.max(18, Math.min(28, (R_CARD_L - SB_R) * 0.18));

      return {
        W: width,
        H: height,
        CY,
        SBX,
        SBY,
        SB_L,
        SB_R,
        cardTopY,
        R_CARD_L,
        L_CARD_R,
        L_CARD_L,
        R_SPINE,
        L_SPINE,
        R_SPINE_EDGE: R_SPINE + spineTilt,
        L_SPINE_EDGE: L_SPINE - spineTilt,
        SPINE_TOP,
        SPINE_BOT,
      };
    };

    const rebuildStaticLayer = () => {
      staticLayer = document.createElement('canvas');
      staticLayer.width = geo.W;
      staticLayer.height = geo.H;
      const staticCtx = staticLayer.getContext('2d');
      if (!staticCtx) {
        staticLayer = null;
        return;
      }
      drawStaticLayer(staticCtx, geo);
    };

    const resize = () => {
      const dpr = 1;
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      geo = buildGeometry(width, height);
      rebuildStaticLayer();
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, geo.W, geo.H);
      if (staticLayer) {
        ctx.drawImage(staticLayer, 0, 0);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.fillRect(0, 0, geo.W, geo.H);
      }

      const fadeStart = T_CYCLE - T_FADE - 30;
      const cycleAlpha = frame >= fadeStart ? 1 - clamp((frame - fadeStart) / T_FADE, 0, 1) : 1;
      const trunkP = prog(frame, T_START, T_TRUNK) * cycleAlpha;
      const spineDelay = T_START + T_TRUNK;
      const spineP = prog(frame, spineDelay, T_SPINE) * cycleAlpha;
      const branchDelay = spineDelay + T_SPINE;
      const ghostAlpha = prog(frame, 10, 30) * cycleAlpha * 0.06;

      drawSourceBox(ctx, geo, prog(frame, 0, T_INTRO) * cycleAlpha);

      if (ghostAlpha > 0) {
        drawGhostLine(ctx, geo.SB_R, geo.CY, geo.R_SPINE, geo.CY, TC, ghostAlpha);
        drawGhostLine(ctx, geo.R_SPINE, geo.CY, geo.R_SPINE_EDGE, geo.SPINE_TOP, TC, ghostAlpha);
        drawGhostLine(ctx, geo.R_SPINE, geo.CY, geo.R_SPINE_EDGE, geo.SPINE_BOT, TC, ghostAlpha);
        drawGhostLine(ctx, geo.SB_L, geo.CY, geo.L_SPINE, geo.CY, TC, ghostAlpha);
        drawGhostLine(ctx, geo.L_SPINE, geo.CY, geo.L_SPINE_EDGE, geo.SPINE_TOP, TC, ghostAlpha);
        drawGhostLine(ctx, geo.L_SPINE, geo.CY, geo.L_SPINE_EDGE, geo.SPINE_BOT, TC, ghostAlpha);

        for (let i = 0; i < 5; i += 1) {
          const y = cardCY(geo, i);
          drawGhostLine(ctx, spineXAt(geo, 'R', y), y, geo.R_CARD_L, y, MODS_R[i].c, ghostAlpha);
          drawGhostLine(ctx, spineXAt(geo, 'L', y), y, geo.L_CARD_R, y, MODS_L[i].c, ghostAlpha);
        }
      }

      if (trunkP > 0) {
        drawAnimatedLine(ctx, geo.SB_R, geo.CY, geo.R_SPINE, geo.CY, TC, trunkP, trunkP);
        drawAnimatedLine(ctx, geo.SB_L, geo.CY, geo.L_SPINE, geo.CY, TC, trunkP, trunkP);
      }

      if (spineP > 0) {
        drawAnimatedLine(ctx, geo.R_SPINE, geo.CY, geo.R_SPINE_EDGE, geo.SPINE_TOP, TC, spineP, spineP);
        drawAnimatedLine(ctx, geo.R_SPINE, geo.CY, geo.R_SPINE_EDGE, geo.SPINE_BOT, TC, spineP, spineP);
        drawAnimatedLine(ctx, geo.L_SPINE, geo.CY, geo.L_SPINE_EDGE, geo.SPINE_TOP, TC, spineP, spineP);
        drawAnimatedLine(ctx, geo.L_SPINE, geo.CY, geo.L_SPINE_EDGE, geo.SPINE_BOT, TC, spineP, spineP);
      }

      for (let i = 0; i < 5; i += 1) {
        const branchFrame = branchDelay + i * T_STAGGER;
        const branchP = prog(frame, branchFrame, T_BRANCH) * cycleAlpha;
        const cardP = prog(frame, branchFrame + T_BRANCH * 0.6, T_CARD) * cycleAlpha;
        const y = cardCY(geo, i);
        const branchAlpha = clamp(branchP * 2, 0, 1);

        if (branchP > 0) {
          const rightSpineX = spineXAt(geo, 'R', y);
          const leftSpineX = spineXAt(geo, 'L', y);
          drawBranch(ctx, rightSpineX, geo.R_CARD_L, y, MODS_R[i].c, branchAlpha, branchP, frame);
          drawJunctionDot(ctx, rightSpineX, y, MODS_R[i].c, branchAlpha);
          drawBranch(ctx, leftSpineX, geo.L_CARD_R, y, MODS_L[i].c, branchAlpha, branchP, frame);
          drawJunctionDot(ctx, leftSpineX, y, MODS_L[i].c, branchAlpha);
        }

        if (cardP > 0) {
          drawCard(ctx, geo.R_CARD_L, cardTY(geo, i), MODS_R[i], cardP);
          drawCard(ctx, geo.L_CARD_L, cardTY(geo, i), MODS_L[i], cardP);
        }
      }
    };

    const loop = () => {
      frame += 1;
      if (frame >= T_CYCLE) {
        frame = 0;
      }
      drawFrame();
      raf = window.requestAnimationFrame(loop);
    };

    const restart = () => {
      if (raf) {
        window.cancelAnimationFrame(raf);
      }
      frame = 0;
      raf = window.requestAnimationFrame(loop);
    };

    const stop = (reset = false) => {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
      if (reset) {
        frame = 0;
        drawFrame();
      }
    };

    const handleResize = () => {
      resize();
      if (activeRef.current) {
        restart();
      } else {
        stop(true);
      }
    };

    startRef.current = () => {
      resize();
      restart();
    };

    stopRef.current = (reset = true) => {
      stop(reset);
    };

    resize();
    window.addEventListener('resize', handleResize);

    if (activeRef.current) {
      restart();
    } else {
      stop(true);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      stop();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setShouldAnimate(isActive);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => {
      setShouldAnimate(isActive && !document.hidden && !mediaQuery.matches);
    };

    syncMotion();
    document.addEventListener('visibilitychange', syncMotion);
    mediaQuery.addEventListener('change', syncMotion);

    return () => {
      document.removeEventListener('visibilitychange', syncMotion);
      mediaQuery.removeEventListener('change', syncMotion);
    };
  }, [isActive]);

  useEffect(() => {
    activeRef.current = shouldAnimate;

    if (shouldAnimate) {
      startRef.current();
      return;
    }

    stopRef.current(true);
  }, [shouldAnimate]);

  return (
    <div className={`absolute inset-x-0 top-1/2 h-[125vh] -translate-y-1/2 p-4 transition-opacity duration-300 sm:h-[135vh] sm:p-5 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
      <div ref={stageRef} className="h-full w-full overflow-hidden rounded-[1.6rem] border border-white/5 bg-white">
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </div>
  );
}






