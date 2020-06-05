<script>
	import Component from '%component_location%'
	const props = '%component_props%'
</script>

<div id="manual-ssr-component">
	<Component {...JSON.parse(props)} />
</div>
