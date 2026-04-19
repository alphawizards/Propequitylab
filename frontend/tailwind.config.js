/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
	darkMode: ["class"],
	content: [
		"./src/**/*.{js,jsx,ts,tsx}",
		"./public/index.html"
	],
	theme: {
		extend: {
			fontFamily: {
				sans:  ['Inter', ...defaultTheme.fontFamily.sans],
				serif: ['Instrument Serif', ...defaultTheme.fontFamily.serif],
				mono:  ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
			},
			borderRadius: {
				lg:   'var(--radius)',
				md:   'calc(var(--radius) - 2px)',
				sm:   'var(--radius-sm)',
				xl:   'var(--radius-lg)',
			},
			boxShadow: {
				'haven':      'var(--shadow)',
				'card':       '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
				'card-hover': '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)',
				'modal':      '0 8px 32px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.06)',
				'dropdown':   '0 2px 8px rgba(0,0,0,0.08)',
			},
			transitionDuration: {
				DEFAULT: '150ms',
			},
			colors: {
				// ── shadcn semantic tokens (OKLCH-wrapped) ──────────────────────────
				background: 'oklch(var(--background))',
				foreground: 'oklch(var(--foreground))',
				card: {
					DEFAULT:    'oklch(var(--card))',
					foreground: 'oklch(var(--card-foreground))'
				},
				popover: {
					DEFAULT:    'oklch(var(--popover))',
					foreground: 'oklch(var(--popover-foreground))'
				},
				primary: {
					DEFAULT:    'oklch(var(--primary))',
					foreground: 'oklch(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT:    'oklch(var(--secondary))',
					foreground: 'oklch(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT:    'oklch(var(--muted))',
					foreground: 'oklch(var(--muted-foreground))'
				},
				accent: {
					DEFAULT:    'oklch(var(--accent))',
					foreground: 'oklch(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT:    'oklch(var(--destructive))',
					foreground: 'oklch(var(--destructive-foreground))'
				},
				border: 'oklch(var(--border))',
				input:  'oklch(var(--input))',
				ring:   'oklch(var(--ring))',
				chart: {
					'1': 'oklch(var(--chart-1))',
					'2': 'oklch(var(--chart-2))',
					'3': 'oklch(var(--chart-3))',
					'4': 'oklch(var(--chart-4))',
					'5': 'oklch(var(--chart-5))'
				},

				// ── Haven semantic palette (for page migration phases 3-7) ──────────
				sage: {
					DEFAULT: 'oklch(var(--sage))',
					soft:    'oklch(var(--sage-soft))',
				},
				terra: {
					DEFAULT: 'oklch(var(--terra))',
					soft:    'oklch(var(--terra-soft))',
				},
				gold: {
					DEFAULT: 'oklch(var(--gold))',
					soft:    'oklch(var(--gold-soft))',
				},
				ocean: {
					DEFAULT: 'oklch(var(--ocean))',
					soft:    'oklch(var(--ocean-soft))',
				},
				plum: {
					DEFAULT: 'oklch(var(--plum))',
					soft:    'oklch(var(--plum-soft))',
				},
				ink: {
					DEFAULT: 'oklch(var(--ink))',
					'2':     'oklch(var(--ink-2))',
					'3':     'oklch(var(--ink-3))',
				},
				'bg-surface': {
					DEFAULT: 'oklch(var(--bg))',
					'2':     'oklch(var(--bg-2))',
				},
				line: {
					DEFAULT: 'oklch(var(--line))',
					'2':     'oklch(var(--line-2))',
				},

			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to:   { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to:   { height: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up':   'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
