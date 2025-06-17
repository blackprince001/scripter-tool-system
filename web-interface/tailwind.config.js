/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'hsl(210, 60%, 98%)', // soft blue-gray
				foreground: 'hsl(220, 20%, 20%)', // dark gray for text
				card: {
					DEFAULT: 'hsl(0, 0%, 100%)', // white
					foreground: 'hsl(220, 20%, 20%)'
				},
				popover: {
					DEFAULT: 'hsl(210, 60%, 98%)',
					foreground: 'hsl(220, 20%, 20%)'
				},
				primary: {
					DEFAULT: 'hsl(220, 90%, 56%)', // friendly blue
					foreground: 'hsl(0, 0%, 100%)' // white text
				},
				secondary: {
					DEFAULT: 'hsl(160, 60%, 60%)', // soft green
					foreground: 'hsl(0, 0%, 100%)'
				},
				muted: {
					DEFAULT: 'hsl(210, 16%, 93%)', // light gray
					foreground: 'hsl(220, 10%, 40%)'
				},
				accent: {
					DEFAULT: 'hsl(45, 100%, 60%)', // friendly yellow
					foreground: 'hsl(220, 20%, 20%)'
				},
				destructive: {
					DEFAULT: 'hsl(0, 80%, 60%)', // friendly red
					foreground: 'hsl(0, 0%, 100%)'
				},
				border: 'hsl(210, 16%, 82%)',
				input: 'hsl(210, 16%, 93%)',
				ring: 'hsl(220, 90%, 56%)',
				chart: {
					'1': 'hsl(220, 90%, 56%)',
					'2': 'hsl(160, 60%, 60%)',
					'3': 'hsl(45, 100%, 60%)',
					'4': 'hsl(340, 82%, 67%)', // pink
					'5': 'hsl(280, 70%, 60%)'  // purple
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}
