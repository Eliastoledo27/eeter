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
					active: '#00E5FF'
				},
				border: '#262626',
				primary: {
					DEFAULT: '#00E5FF',
					foreground: '#000000',
					hover: '#00B8D4'
				},
				accent: {
					blue: '#0EA5E9',
					purple: '#D946EF',
					cyan: '#00E5FF',
					teal: '#14B8A6',
					rose: '#F43F5E',
					DEFAULT: '#00E5FF',
					foreground: '#000000'
				},
				'background-dark': '#050505',
				'hud-black': '#050505',
				'hud-gray': '#0D0D0D',
				content: {
					heading: '#FFFFFF',
					body: '#D1D1D6',
					muted: '#8E8E93'
				},
				success: '#00FF94',
				warning: '#FFB800',
				error: '#FF3B30',
				'accent-cyan': '#00E5FF',
				cyan: {
					DEFAULT: '#00E5FF',
					dim: '#008394',
					light: '#80F2FF',
				},
				'electric-blue': '#00E5FF',
				'slate-panel': 'rgba(10, 10, 10, 0.7)',
				foreground: '#FFFFFF',
				card: {
					DEFAULT: 'rgba(15, 15, 15, 0.5)',
					foreground: '#FFFFFF'
				},
				popover: {
					DEFAULT: '#0D0D0D',
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: '#121212',
					foreground: '#FFFFFF'
				},
				muted: {
					DEFAULT: '#121212',
					foreground: '#8E8E93'
				},
				destructive: {
					DEFAULT: '#FF3B30',
					foreground: '#FFFFFF'
				},
				input: '#0D0D0D',
				ring: '#00E5FF',
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
				'gradient-glow': 'conic-gradient(from 180deg at 50% 50%, #00E5FF 0deg, #0EA5E9 180deg, #00FF94 360deg)',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
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
			boxShadow: {
				'glow': '0 0 20px rgba(0, 229, 255, 0.3)',
				'cyan-glow': '0 0 25px rgba(0, 229, 255, 0.2)',
				'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
			},
			animation: {
				'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'float': 'float 6s ease-in-out infinite',
			},
			keyframes: {
				pulse: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-20px)' },
				}
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function ({ addUtilities }: any) {
			addUtilities({
				'.text-shadow-glow': {
					'text-shadow': '0 0 20px rgba(0, 229, 255, 0.4)',
				},
				'.text-shadow-cyan': {
					'text-shadow': '0 0 10px rgba(0, 229, 255, 0.5)',
				},
				'.backdrop-blur-20': {
					'backdrop-filter': 'blur(20px)',
				}
			})
		}
	],
};
export default config;
