import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: '#0A0A0A',
				surface: {
					DEFAULT: '#1a1a1a',
					hover: '#262626',
					active: '#c88a04'
				},
				border: '#262626',
				primary: {
					DEFAULT: '#c88a04',
					foreground: '#FFFFFF',
					hover: '#eab308'
				},
				accent: {
					blue: '#0EA5E9',
					purple: '#D946EF',
					gold: '#c88a04',
					teal: '#14B8A6',
					rose: '#F43F5E',
					DEFAULT: '#c88a04',
					foreground: '#FFFFFF'
				},
				'background-dark': '#0A0A0A',
				'hud-black': '#0A0A0A',
				'hud-gray': '#1a1a1a',
				content: {
					heading: '#FFFFFF',
					body: '#A1A1AA',
					muted: '#52525B'
				},
				success: '#10B981',
				warning: '#F59E0B',
				error: '#EF4444',
				'accent-gold': '#c88a04',
				gold: {
					DEFAULT: '#ffd900',
					dim: '#c88a04',
					light: '#ffe033',
				},
				'electric-blue': '#0EA5E9',
				'slate-panel': 'rgba(20, 20, 20, 0.6)',
				foreground: '#FFFFFF',
				card: {
					DEFAULT: 'rgba(20, 20, 20, 0.6)',
					foreground: '#FFFFFF'
				},
				popover: {
					DEFAULT: '#1a1a1a',
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: '#262626',
					foreground: '#FFFFFF'
				},
				muted: {
					DEFAULT: '#262626',
					foreground: '#A1A1AA'
				},
				destructive: {
					DEFAULT: '#EF4444',
					foreground: '#FFFFFF'
				},
				input: '#1a1a1a',
				ring: '#c88a04',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-glow': 'conic-gradient(from 180deg at 50% 50%, #F59E0B 0deg, #F43F5E 180deg, #EA580C 360deg)',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
			},
			fontFamily: {
				heading: [
					'Space Grotesk',
					'Manrope',
					'sans-serif'
				],
				body: [
					'Inter',
					'Manrope',
					'sans-serif'
				],
				display: [
					'Space Grotesk',
					'Manrope',
					'sans-serif'
				],
				mono: [
					'ui-monospace',
					'SFMono-Regular',
					'Menlo',
					'Monaco',
					'Consolas',
					'Liberation Mono',
					'Courier New',
					'monospace'
				]
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			animation: {
				'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			},
			keyframes: {
				pulse: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
export default config;
