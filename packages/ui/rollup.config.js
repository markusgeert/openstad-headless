import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

// To handle css files
import postcss from "rollup-plugin-postcss";

import image from "@rollup/plugin-image";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import { terser } from "rollup-plugin-terser";
const packageJson = require("./package.json");

export default [
	{
		input: "src/index.ts",
		output: [
			{
				file: packageJson.main,
				format: "cjs",
				sourcemap: true,
			},
			{
				file: packageJson.module,
				format: "esm",
				sourcemap: true,
			},
		],
		plugins: [
			peerDepsExternal(),
			resolve(),
			commonjs(),
			typescript({ tsconfig: "./tsconfig.json" }),
			postcss(),

			terser(),
			image(),
		],
	},
	{
		input: "dist/esm/types/index.d.ts",
		output: [{ file: "dist/index.d.ts", format: "esm" }],
		plugins: [dts()],

		external: [/\.css$/], // telling rollup anything that is .css aren't part of type exports
	},
];
