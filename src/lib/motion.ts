// Motion tokens shared by every animated component (seconds, for Motion).
// Feedback on buttons, inputs and menus is 150-250ms. Decorative reveals are
// 400-600ms and never delay an interaction.
export const duration = {
  fast: 0.15,
  base: 0.2,
  reveal: 0.5,
} as const;

export const ease = {
  soft: [0.22, 1, 0.36, 1],
} as const;
