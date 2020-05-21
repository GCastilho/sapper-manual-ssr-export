<script>
	/**
	 * O CSS do componente será exportado em um CSS separado, tem que pegar ele
	 * no script hack pq qdo tiver no PHP tem que ser colocado no head
	 */
	import Component from '%component_location%'
	const props = '%component_props%'
</script>

<div id="manual-ssr-component">
	<Component {...JSON.parse(props)} />
</div>
