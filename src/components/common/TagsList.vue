<template>
	<div class="tags-list" v-if="showTagsList">
		<div class="container">
			<router-link
				v-for="tag in tagsList"
				:key="tag.slug"
				:class="[ 'button', 'button--' + tag.slug, 'button--small', { 'button--action': isActiveTag(tag) } ]"
				active-class=""
				exact-active-class=""
				:to="{ name: $route.name, query: { tag: tag.slug } }"
			>{{ tag.title }}</router-link>
			<a href="#" class="button button--small button--link" @click="resetTags" @click.prevent.stop>Reset</a>
		</div>
	</div>
	<h1 v-else-if="getTagActive" class="topic__title" v-text="getTagActive.title" />
</template>

<script>
	import { mapState, mapGetters } from 'vuex'

	export default {
		name: 'tags-list',
		computed: {
			...mapState([
				'tagsList',
				'showTagsList',
				'tagActive',
				'sortList'
			]),
			...mapGetters([
				'getTagActive'
			])
		},
		created() {},
		methods: {
			isActiveTag(tag) {
				return tag.slug === this.tagActive
			},
			resetTags() {
				let query = Object.assign({}, this.$route.query)
				delete query.tag
				this.$router.push({ name: this.$route.name, query: query })
			}
		}
	}
</script>