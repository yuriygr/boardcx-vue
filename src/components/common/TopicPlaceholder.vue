<template>
	<div class="topic topic--placeholder">
		<div class="topic__meta">
			<span class="time" :title="'Last comment time: ' + $options.filters.timeFormat(topic.bump)">
				{{ topic.timestamp | timeFormat }}
			</span>
			<span class="tags" v-if="topic.tags.length > 0">
				<template v-for="(tag, index) in topic.tags">
					<a :key="index" href="#">#{{ tag }}</a><template v-if="index != topic.tags.length - 1">, </template>
				</template>
			</span>
			<span class="options">
				<span>&middot;&middot;&middot;</span>
			</span>
		</div>

		<h4 class="topic__title">{{ topic.subject }}</h4>

		<div class="topic__message" v-html="topic.message"></div>

		<div class="u-clearfix"></div>
		<div class="topic__info">
			<span class="comments">
				<router-link :to="{ name: 'topic', params: { topicId: 0 } }">
					{{ 12 | ommited }}
				</router-link>
			</span>
			<span class="views">32 views</span>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'topic-placeholder',
		props: ['loading'],
		computed: {
			topic() {
				if (this.loading)
					return {
						subject: 'Let\'s load the topics?',
						bump: 1430754300,
						timestamp: 1430754300,
						tags: ['JustPlaceholder', 'Loading'],
						message: 'Let\'s search all together topics and add them here?'
					}

				else
					return {
						subject: 'There are no topics',
						bump: 1430754300,
						timestamp: 1430754300,
						tags: ['JustPlaceholder', 'Error'],
						message: 'Surprisingly, but this is possible. You can correct the situation... whatever.'
					}
			}
		}
	}
</script>