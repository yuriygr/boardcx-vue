<template>
	<div class="modal--file" v-if="file.origin">
		<img class="" :src="file.origin" :alt="file.type">
	</div>
</template>

<script>
	import BusEvents from 'bus-events'

	export default {
		name: 'file-modal',
		props: ['file']
	}
</script>