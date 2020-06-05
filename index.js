const { existsSync, readFileSync } = require('fs')
const fs = require('fs').promises
const path = require('path')
const argv = require('yargs')
	.config()
	.options({
		components: {
			describe: 'Specify a JSON array with configs of the components to export',
			default: 'src/components/manual-ssr.json'
		},
		routes: {
			describe: 'Sapper routes directory',
			default: 'src/routes'
		},
		entry: {
			describe: 'Components base URL',
			default: '/manual-ssr-components'
		},
		output: {
			describe: 'Components output directory',
			default: '__sapper__/manual-ssr-components'
		},
		export: {
			describe: 'Sapper export directory',
			default: '__sapper__/export'
		}
	})
	.argv

const components = JSON.parse(readFileSync(argv.components))
const domParser = new (require('dom-parser'))

const routesDir = argv.routes
const exportDir = argv.export
const buildFolder = argv.output
const componentsUrl = argv.entry
const componentsDir = path.join(routesDir, componentsUrl)

async function setup() {
	if (existsSync(componentsDir))
		throw `The entry folder '${componentsDir}' already exists`
	await fs.mkdir(componentsDir)

	const frame = await fs.readFile(`${__dirname}/Frame.svelte`, { encoding: 'utf-8' })

	const build = components.map(config => {
		const url = componentsUrl + '/' + config.name
		const props = JSON.stringify(config.props)
		const location = path.posix.relative(
			path.posix.join(routesDir, componentsUrl),
			existsSync(path.join(argv.components.replace(/[^\/]+$/, ''), config.location))
				? path.posix.join(argv.components.replace(/[^\/]+$/, ''), config.location)
				: path.posix.join(config.location)
		)
		const component = frame
			.replace('%component_props%', props)
			.replace('%component_location%', location)

		return { name: config.name, css: config.css, url, component }
	})

	const layout = build
		.map(({ url }) => `<a href=${url}>${url}</a>`)
		.join('')
		.concat('<slot></slot>')

	for (const { component, name } of build) {
		await fs.writeFile(`${componentsDir}/${name}.svelte`, component, { encoding: 'utf-8' })
	}
	await fs.writeFile(`${componentsDir}/_layout.svelte`, layout, { encoding: 'utf-8' })
	await fs.writeFile(`${componentsDir}/index.svelte`, '<h1>Why is his head so big?</h1>', { encoding: 'utf-8' })

	return build.map(({ name, url, css }) => ({ name, url, css }))
}

/**
 * Extract the SSR components from exported sapper
 * @param {{name:string, url:string, css:string[]}[]} components The
 * componenets that will be extracted
 */
async function extract(components) {
	const builds = await Promise.all(components.map(async component => {
		const htmlString = (await fs.readFile(
			`${exportDir}/${component.url}/index.html`,
			{ encoding: 'utf-8' }
		)).replace('id=manual-ssr-component', 'id="manual-ssr-component"')
		const dom = domParser.parseFromString(htmlString, 'utf8')
		const head = htmlString.match(/<head>.+<\/head>/)[0]
			.match(/<.+?>/g)
			.filter(v => v.includes(component.name))
		const css = head.filter(v => v.includes('stylesheet'))
			.map(v => v.match(/(?<=href=).[^\s]+/).toString())
		if (typeof component.css == 'string')
			css.push(component.css)
		return {
			name: component.name,
			html: dom.getElementById('manual-ssr-component').innerHTML,
			css
		}
	}))

	if (!existsSync(buildFolder))
		await fs.mkdir(buildFolder)

	builds.forEach(async build => {
		await fs.writeFile(
			`${buildFolder}/${build.name}.json`,
			JSON.stringify(build, null, 2),
			{ encoding: 'utf-8' }
		)
	})
}

async function cleanup() {
	await fs.rmdir(componentsDir, { recursive: true })
}

module.exports = {
	argv,
	setup,
	extract,
	cleanup
}
