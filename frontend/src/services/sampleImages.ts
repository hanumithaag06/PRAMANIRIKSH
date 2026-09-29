// Helper function to create canvas-based sample test card images dynamically in browser memory
export function generateTestSampleCanvas(
  resultType: 'PURPLE_OPIATE' | 'BLUE_COCAINE' | 'VIOLET_CANNAV' | 'CLEAR_NEGATIVE' | 'BLURRY_FAIL' | 'GLARE_FAIL'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background field desk / mat
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 400, 400);

  // Draw Reference Calibration Card (Top Area)
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.fillRect(40, 30, 320, 60);
  ctx.strokeRect(40, 30, 320, 60);

  // Label Reference Card
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.fillText('NCB REF CARD STD-2026', 50, 45);

  // 4 Color Calibration Patches
  // White Patch
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(50, 52, 60, 30);
  // Gray Patch
  ctx.fillStyle = '#808080';
  ctx.fillRect(125, 52, 60, 30);
  // Cyan Patch
  ctx.fillStyle = '#00b4d8';
  ctx.fillRect(200, 52, 60, 30);
  // Yellow Patch
  ctx.fillStyle = '#eab308';
  ctx.fillRect(275, 52, 60, 30);

  // Draw Test Kit Porcelain Reaction Well (Center Area)
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.arc(200, 240, 100, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Draw Specific Chemical Color Reaction Liquid Spot inside well
  ctx.beginPath();
  ctx.arc(200, 240, 65, 0, 2 * Math.PI);

  if (resultType === 'PURPLE_OPIATE') {
    // Marquis Heroin/Morphine Reaction (Deep Purple / Violet)
    const grad = ctx.createRadialGradient(200, 240, 10, 200, 240, 65);
    grad.addColorStop(0, '#5b21b6');
    grad.addColorStop(0.7, '#4c1d95');
    grad.addColorStop(1, '#311075');
    ctx.fillStyle = grad;
  } else if (resultType === 'BLUE_COCAINE') {
    // Cobalt Thiocyanate Cocaine Reaction (Turquoise / Cobalt Blue)
    const grad = ctx.createRadialGradient(200, 240, 10, 200, 240, 65);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.7, '#0369a1');
    grad.addColorStop(1, '#075985');
    ctx.fillStyle = grad;
  } else if (resultType === 'VIOLET_CANNAV') {
    // Duquenois Cannabis Reaction (Deep Violet)
    const grad = ctx.createRadialGradient(200, 240, 10, 200, 240, 65);
    grad.addColorStop(0, '#7e22ce');
    grad.addColorStop(0.8, '#6b21a8');
    grad.addColorStop(1, '#581c87');
    ctx.fillStyle = grad;
  } else if (resultType === 'CLEAR_NEGATIVE') {
    // Clear / Pale Amber Reagent Unreacted
    const grad = ctx.createRadialGradient(200, 240, 10, 200, 240, 65);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.7, '#fef9c3');
    grad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = grad;
  } else if (resultType === 'BLURRY_FAIL') {
    // Blurry sample - low contrast gray
    ctx.fillStyle = '#94a3b8';
  } else if (resultType === 'GLARE_FAIL') {
    // Specular Glare Overexposure
    ctx.fillStyle = '#ffffff';
  }

  ctx.fill();

  // Add Specular Glare Ring if Glare Fail
  if (resultType === 'GLARE_FAIL') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(100, 100, 220, 220);
  }

  // Label Test Well
  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.fillText('REACTION SPOT ROI', 150, 360);

  return canvas.toDataURL('image/png');
}

export const SAMPLE_TEST_CASES = [
  {
    id: 'sample-marquis-positive',
    title: 'Marquis Reagent — Morphine/Heroin (Positive)',
    kitCode: 'KIT-MARQUIS-V1',
    type: 'PURPLE_OPIATE' as const,
    description: 'Expected reaction: Intense Deep Purple/Violet. Calibrated CV detects hue ~262° with 94% confidence.'
  },
  {
    id: 'sample-cobalt-positive',
    title: 'Cobalt Thiocyanate — Cocaine (Positive)',
    kitCode: 'KIT-COBALT-V2',
    type: 'BLUE_COCAINE' as const,
    description: 'Expected reaction: Intense Cobalt Turquoise Blue. Calibrated CV detects hue ~210° with 95% confidence.'
  },
  {
    id: 'sample-duquenois-positive',
    title: 'Duquenois-Levine — Cannabis (Positive)',
    kitCode: 'KIT-DUQUENOIS-V1',
    type: 'VIOLET_CANNAV' as const,
    description: 'Expected reaction: Violet-Purple in chloroform layer. Calibrated CV detects hue ~275° with 93% confidence.'
  },
  {
    id: 'sample-negative-control',
    title: 'Marquis Reagent — Unreacted Control (Negative)',
    kitCode: 'KIT-MARQUIS-V1',
    type: 'CLEAR_NEGATIVE' as const,
    description: 'Expected reaction: Clear pale amber reagent. Calibrated CV confirms negative unreacted control.'
  },
  {
    id: 'sample-blurry-quality-fail',
    title: 'Image Quality Gate Test — Blurry Frame (Retake Required)',
    kitCode: 'KIT-MARQUIS-V1',
    type: 'BLURRY_FAIL' as const,
    description: 'Triggers Image Quality Gate rejection. Laplacian blur score fails threshold, demanding image retake.'
  },
  {
    id: 'sample-glare-quality-fail',
    title: 'Image Quality Gate Test — Specular Glare (Retake Required)',
    kitCode: 'KIT-MARQUIS-V1',
    type: 'GLARE_FAIL' as const,
    description: 'Triggers Glare Gate rejection. Extreme specular reflection area blocks color analysis.'
  }
];
