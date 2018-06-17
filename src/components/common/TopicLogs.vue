<template>
	<div class="topic__logs" v-if="logs.length > 0">
		<div class="logs__item" v-for="logs in logs" :key="logs.id">
			<span class="logs__item__info"> {{ logs.info }}</span>
			<span class="logs__item__time">
				{{ logs.timestamp | timeFormat }}
			</span>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'topic-logs',
		props: ['logs']
	}
</script>