import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { prefix } from "../lib/prefix";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
	// When running in dev mode, use the React plugin
	if (command === "serve") {
		return {
			plugins: [react()],
			css: prefix(),
		};
		// During build, use the classic runtime and build as an IIFE so we can deliver it to the browser
	}
	return {
		plugins: [react({ jsxRuntime: "classic" })],
		css: prefix(),
		build: {
			outDir: "./dist/resource-overview-map",
			lib: {
				formats: ["iife"],
				entry: "src/resource-overview-map.tsx",
				name: "OpenstadHeadlessResourceOverviewMap",
				fileName: "resource-overview-map",
			},
			rollupOptions: {
				external: ["react", "react-dom", "remixicon/fonts/remixicon.css"],
				output: {
					globals: {
						react: "React",
						"react-dom": "ReactDOM",
					},
				},
			},
		},
	};
});
