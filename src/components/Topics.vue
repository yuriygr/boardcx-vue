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
					<topic-placeholder :loading="loading"/>
				</template>
			</template>

			<template v-else-if="topicActive">
				<topic :topic="topicActive" :isOpen="true">
					<topic-comments
						slot="topic-comments"
						slot-scope="slotProps"
						:canModerate="slotProps.canModerate"
						:comments="topicActive.comments"
						:count="topicActive.countComments"/>
					<comment-form slot="topic-form"/>
				</topic>
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
	import TopicComments from '@/components/common/TopicComments'
	import TopicPlaceholder from '@/components/common/TopicPlaceholder'
	import CommentForm from '@/components/common/CommentForm'
	import Pagination from '@/components/common/Pagination'

	export default {
		name: 'topics',
		components: {
			Topic,
			TopicComments,
			TopicPlaceholder,
			CommentForm,
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
			fetchTopics(type, tag, except, limit, page) {
				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('FETCH_TOPICS_LIST', [ type, tag, except, limit, page ])
				.then(() => {
					this.titlePage = type
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$router.replace({ name: 'page-error', params: { error } })
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
					this.$router.replace({ name: 'page-error', params: { error } })
					this.$store.commit('SET_LOADING', false)
				})
			}
		},
		watch: {
			$route(to) {
				if (to.params.topicId)
					this.fetchTopic(to.params.topicId)
				else
					this.fetchTopics(
						to.name,
						to.query.tag,
						this.tagsHidden.join(),
						to.query.limit,
						to.query.page
					)
			}
		},
		mounted() {
			if (this.$route.params.topicId)
				this.fetchTopic(this.$route.params.topicId)
			else
				this.fetchTopics(
					this.$route.name,
					this.$route.query.tag,
					this.tagsHidden.join(),
					this.$route.query.limit,
					this.$route.query.page
				)
		},
		beforeDestroy() {
			this.$store.commit('REMOVE_TOPIC_ACTIVE')
			this.$store.commit('REMOVE_TOPICS_LIST')
		}
	}
</script>