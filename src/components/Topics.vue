<template>
	<section class="content">
		<div class="topic__container" >
			<template v-if="topicsList">
				<h2 v-if="tagActive">#{{ tagActive }}</h2>

				<template v-if="topicsList.items.length > 0">
					<topic v-for="topic in topicsList.items"
						:key="topic.id"
						:topic="topic"
						:isOpen="false" />
				</template>

				<template v-else>
					<topic-placeholder />
				</template>
			</template>

			<template v-else-if="topicActive">
				<topic :topic="topicActive" :isOpen="true" />
			</template>

			<template v-else>
				<topic-placeholder :loading="loading"/>
			</template>
		</div>

		<pagination v-if="topicsList"
			:current="topicsList.current"
			:total="topicsList.total_pages"
			:before="topicsList.before"
			:next="topicsList.next" />
	</section>
</template> 

<script>
	import { mapState } from 'vuex'
	import Topic from '@/components/common/Topic'
	import TopicPlaceholder from '@/components/common/TopicPlaceholder'
	import Pagination from '@/components/common/Pagination'

	export default {
		name: 'topics',
		components: {
			Topic,
			TopicPlaceholder,
			Pagination
		},
		data() {
			return {
				titlePage: 'Loading...'
			}
		},
		metaInfo() {
			return { title: this.titlePage }
		},
		created() { },
		computed: {
			...mapState([
				'loading',
				'topicsList',
				'topicActive',
				'tagsHidden',
				'tagActive'
			])
		},
		methods: {
			fetchBy(source) {
				if (source.params.topicId)
					this.fetchTopic(source.params.topicId)
				else
					this.fetchTopics(
						source.name,
						source.query.tag,
						this.tagsHidden.join(),
						source.query.limit,
						source.query.page
					)
			},
			fetchTopics(type, tag, except, limit, page) {
				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('FETCH_TOPICS_LIST', [ type, tag, except, limit, page ])
				.then(() => {
					this.titlePage = type
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$store.commit('SET_LOADING', false)
				})
			},
			fetchTopic(topicId) {
				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('FETCH_TOPIC_ITEM', topicId)
				.then(() => {
					this.titlePage = this.topicActive.subject
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.titlePage = "Error"
					this.$store.commit('SET_LOADING', false)
				})
			}
		},
		watch: {
			$route(to) {
				this.fetchBy(to)
			}
		},
		mounted() {
			this.fetchBy(this.$route)
		},
		beforeDestroy() {
			this.$store.commit('REMOVE_TOPIC_ACTIVE')
			this.$store.commit('REMOVE_TOPICS_LIST')
		}
	}
</script>