<template>
	<div class="topic topic--placeholder">

		<h5 class="topic__title">{{ topic.subject }}</h5>

		<div class="topic__message" v-html="topic.message"></div>

		<div class="u-clearfix"></div>
		<div class="topic__info">
			<span class="time">09 May 1900 10:09</span>
			<span class="comments">
				<router-link :to="{ name: 'topic', params: { topicId: 0 } }">
					{{ 1 | ommited }}
				</router-link>
			</span>
			<span class="views">3 views</span>
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
						message: 'Let\'s search all together topics and add them here?'
					}

				else
					return {
						subject: 'There are no topics',
						message: 'Surprisingly, but this is possible. You can correct the situation... whatever.'
					}
			}
		}
	}
</script>