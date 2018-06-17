<template>
	<main class="content">
		<div class="container">
			<hello />
			
			<h2 v-if="tagActive">#{{tagActive}}</h2>

			<div class="topic__container" >
				<template v-if="topicsList">
					<template v-if="topicsList.items.length > 0">
						<topic
							v-for="topic in topicsList.items"
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
						<comment
							slot="comments"
							v-for="(comment, index) in topicActive.comments"
							:key="comment.id"
							:comment="comment"
							:index="++index" />
						<comment-form slot="form"/>
					</topic>
				</template>

				<template v-else>
					<topic-placeholder :loading="loading"/>
				</template>
			</div>

			<pagination
				:current="topicsList.current"
				:total="topicsList.total_pages"
				:before="topicsList.before"
				:next="topicsList.next" />
			<div class="preview"></div>
		</div>
	</main>
</template>

<script>
	import { mapState } from 'vuex'
	import Hello from './common/Hello'
	import Topic from './common/Topic'
	import TopicPlaceholder from './common/TopicPlaceholder'
	import Comment from './common/Comment'
	import CommentForm from './common/CommentForm'
	import Pagination from './common/Pagination'

	export default {
		name: 'topics',
		components: {
			Hello,
			Topic,
			TopicPlaceholder,
			Comment,
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
				'sortList',
				'topicsList',
				'topicActive',
				'tagsHidden',
				'tagActive'
			])
		},
		methods: {
			fetchTopics(type, tag, except, limit, page) {
				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('FETCH_TOPICS', [ type, tag, except, limit, page ])
				.then(() => {
					let typeNormal = this.sortList.filter(sort => sort.slug === type)[0]
					this.titlePage = typeNormal.label

					this.$store.commit('REMOVE_TOPIC')
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$router.replace({ name: 'page-error', params: { error } })
					this.$store.commit('SET_LOADING', false)
				})
			},
			fetchTopic(topicId) {
				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('FETCH_TOPIC', topicId)
				.then(() => {
					this.titlePage = this.topicActive.subject

					this.$store.commit('REMOVE_TOPICS')
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
			this.$store.commit('REMOVE_TOPICS')
			this.$store.commit('REMOVE_TOPIC')
			this.$store.commit('REMOVE_TAG_ACTIVE')
		}
	}
</script>