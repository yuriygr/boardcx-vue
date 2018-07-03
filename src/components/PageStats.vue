<template>
	<section class="content">
		<h1 class="page__title">Stats</h1>
		<div class="page__content">
			<p>On this page you can see your private statistics: Count of moderated topics, hidden topics/comments/trees.</p>
			<p>Moderated topics: {{ moderation }}</p>
			<p>Hidden: topics - {{ hiding.topics }}; comments - {{ hiding.comments }}; trees - {{ hiding.trees }}; tags - {{ hiding.tags }};</p>
		</div>
	</section>
</template>

<script>
	import hiding from 'board-hiding'
	import moderation from 'board-moderation'
	import BusEvents from 'bus-events'

	export default {
		name: 'page-stats',
		data() {
			return {
				titlePage: 'Stats',

				hiding: hiding.stats(),
				moderation: moderation.stats()
			}
		},
		metaInfo() {
			return { title: this.titlePage }
		},
		methods: {

		}
	}
</script>