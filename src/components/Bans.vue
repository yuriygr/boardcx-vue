<template>
	<main class="content">
		<div class="container">
			<h1>Bans</h1>
			<div class="page__content">
				<p>If you came here consciously, then you are a bad person. Or not? Let's check!</p>
				<p>Click on this magic button and you will know the whole truth!</p>
				<button
					class="button button--action"
					@click="checkBan"
					@click.prevent.stop>Check ban</button>
			</div>
		</div>
	</main>
</template>

<script>
	import BusEvents from 'bus-events'

	export default {
		name: 'bans',
		data() {
			return {
				titlePage: 'Bans'
			}
		},
		metaInfo() {
			return { title: this.titlePage }
		},
		created() { },
		computed: {},
		methods: {
			checkBan() {
				this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'You are not banned')
			}
		}
	}
</script>