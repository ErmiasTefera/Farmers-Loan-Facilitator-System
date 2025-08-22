import path from "path";
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss() as PluginOption,
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@features": path.resolve(__dirname, "./src/features"),
			"@core": path.resolve(__dirname, "./src/core"),
			"@ui": path.resolve(__dirname, "./src/components/ui"),
		},
	},
});
