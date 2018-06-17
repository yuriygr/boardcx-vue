<template>
	<figure :class="[ 'file', 'file--' + file.type ]">
		<a @click="expandFile" @click.prevent.stop class="file__link" :href="file.origin" target="_blank">
			<img class="file__thumb" :src="file.thumb" :alt="file.type">
			<figcaption class="file__info">({{ file.resolution }}) {{ file.type }}</figcaption>
		</a>
	</figure>
</template>

<script>
	import BusEvents from 'bus-events'
	import FileModal from './FileModal'

	export default {
		name: 'file-block',
		props: ['file'],
		methods: {
			expandFile(e) {
				if (e.ctrlKey || e.metaKey)
					return window.open(this.file.origin, '_blank')
				this.$bus.emit(BusEvents.MODAL_SHOW, FileModal, { file: this.file })
			}
		}
	}
</script>