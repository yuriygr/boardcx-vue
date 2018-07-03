<template>
	<section class="content">
		<h1 class="page__title">Bans</h1>
		<div class="page__content">
			<p>If you came here consciously, then you are a bad person. Or not? Let's check!</p>
			<p>Click on this magic button and you will know the whole truth!</p>
			<p v-if="status">{{ status }}</p>
			<button
				class="button button--action"
				@click="checkBan"
				@click.prevent.stop>Check ban</button>
		</div>
	</section>
</template>

<script>
	import api from 'board-api'
	import BusEvents from 'bus-events'

	export default {
		name: 'page-bans',
		data() {
			return {
				titlePage: 'Bans',

				status: false
			}
		},
		metaInfo() {
			return { title: this.titlePage }
		},
		created() {},
		computed: {},
		methods: {
			checkBan() {
				api.bans.check()
				.then((ban) => {
					if (ban.banned) {
						this.status = ban.status
						this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'You are banned!')
					} else {
						this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'You are not banned')
					}
				})
				.catch((error) => {
					this.$bus.emit(BusEvents.ALERTS_ERROR, 'Error: ' + error)
				})
			}
		}
	}
</script>