#!/usr/bin/env node

const npm = require('npm')
const { argv, setup, extract, cleanup } = require('./index')

/**
 * Runs a npm script and resolve or reject when it's done
 * @param {string} script Npm script to run
 * @param {...string} args Args for the script
 */
function run(script, ...args) {
	return new Promise((resolve, reject) => {
		npm.load(() => {
			npm.run(script, ...args, (err, res) => {
				if (err) return reject(err)
				resolve(res)
			})
		})
	})
}

;(async function() {
	try {
		const componenets = await setup()
		await run('export', argv.export, '--entry', argv.entry)
		await extract(componenets)
	} catch (err) {
		console.error('Error:', err)
		if (typeof err === 'string' && err.replace(/\'.*?\'./, '') == 'The entry folder already exists')
			return
	}
	await cleanup()
})()
