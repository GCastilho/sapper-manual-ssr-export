# sapper-manual-ssr-export

This is a command line script to manually export your svelte/sapper components to allow manual SSR by a third party

It was design to export sapper components to be used with this module (not yet developed) that will be a compatibility layer between sapper and wordpress, allowing sapper to have SSR on wordpress

## How to use

In your sapper project, add a entry "manual-ssr-export" (or any other name) to the package.json that calls "sapper-manual-ssr-export". The binary is called "sapper-manual-ssr-export"

## How it works

Once called, the script will look for a .json file with an array of configs for the components that will be extracted (see more bellow). It will then create an entry point in your routes directory using svelte files with instructions to mount your component inside a div with id "manual-ssr-component"

It will then call a "export" script from *your* package.json to trigger sapper export with your components in it

It will then crawl the exported files and gather the html inside the div (your component) and extract it to a JSON file, alongside with a link to the component's CSS, custom CSS and the components name

# What does it generate

The script you generate one .json file for each of the compoennts specified in the config file (using the name config to name the file) with the following:

	{
		"name": "<component's name>"
		"html": "<compoennt's html>"
		"css": "<an array of URLs of your component's CSS>"
	}

You can then use that output to hydrate your component manually on the server with any third party software

## Configuration example

Suppose you have a component located in src/components/Component.svelte that has

	export let title = ''
	export let link = ''
	export let author = { name: '', link: '' }

in its script tag (you don't have to specify it's type or content), then the config file will be the following:

	{
		"name": "Component",
		"location": "src/components/Component.svelte",
		"css": [ "css/stylesheet.css" ]
		"props": {
			"title": "__wordpress.title__",
			"link": "__wordpress.permalink__",
			"author": {
				"name": "__wordpress.author__",
				"link": "__wordpress.author_posts_link__"
			}
		}
	}

Name, location and props are required, the css array is optional, but the properties (and it's placeholders) inside "props" are specific to your component
The script will search for a JSON array with those configs objects in it on "src/components/manual-ssr.json" (you can specify another folder using the flag "--components") and use the placeholders to mount the component

Note: The CSS array is an array of URLs of extra stylesheets (not generated by sapper)
Note 2: the location config also accepts paths relative to itself, not just the project root

## Options

	--components -> Specify a JSON array with configs of the components to export
		[default: "src/components/manual-ssr.json"]
	--routes -> Sapper routes directory [default: "src/routes"]
	--entry -> Components base URL [default: "/manual-ssr-components"]
	--output -> Components output directory
		[default: "__sapper__/manual-ssr-components"]
	--export -> Sapper export directory [default: "__sapper__/export"]
