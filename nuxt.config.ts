import { fileURLToPath, URL } from 'node:url'
// import { defineNuxtConfig } from 'nuxt'
import eslintPlugin from 'vite-plugin-eslint'
const prefix = 'monaco-editor/esm/vs'

export default {
	ssr: false,
	target: 'static',
	head: {
		title: 'Traq',
		htmlAttrs: { lang: 'en' },
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ name: 'format-detection', content: 'telephone=no' }
		],
		link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }]
	},
	alias: {
		'@': './src'
	},

	css: ['/src/assets/css/main.css'],
	components: [
		'@/components',
		{ path: '@/components/core', extensions: ['vue'] }
	],

	build: {
		postcss: {
			postcssOptions: require('./postcss.config.js')
		}
	},
	dir: {
		layouts: './src/layouts',
		pages: './src/pages',
		middleware: './src/middleware'
	},
	vite: {
			build: {
			rollupOptions: {
				output: {
					manualChunks: {
						jsonWorker: [`${prefix}/language/json/json.worker`],
						cssWorker: [`${prefix}/language/css/css.worker`],
						htmlWorker: [`${prefix}/language/html/html.worker`],
						tsWorker: [`${prefix}/language/typescript/ts.worker`],
						editorWorker: [`${prefix}/editor/editor.worker`]
					}
				}
			}
		},
		plugins: [eslintPlugin({
			useEslintrc: true
		})],
				resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	}
	}
}
