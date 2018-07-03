<template>
	<section class="content">
		<template v-if="pageActive">
			<h1 class="page__title" v-html="pageActive.name"></h1>
			<div class="page__content" v-html="pageActive.text"></div>
		</template>
		<template v-else>
			<h1 class="page__title">Loading page</h1>
			<div class="page__content">
				<p>Please wait...</p>
			</div>
		</template>
	</section>
</template>

<script>
	import { mapState } from 'vuex'

	export default {
		name: 'page',
		data() {
			return {
				titlePage: 'Loading...'
			}
		},
		metaInfo() {
			return { title: this.titlePage }
		},
		computed: {
			...mapState([
				'pageActive'
			])
		},
		methods: {
			fetchPage(pageSlug) {
				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('FETCH_PAGE', pageSlug)
				.then((page_data) => {
					this.titlePage = this.pageActive.name
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
				this.fetchPage(to.params.pageSlug)
			}
		},
		mounted() {
			this.fetchPage(this.$route.params.pageSlug)
		},
		beforeDestroy() {
			this.$store.commit('REMOVE_PAGE_ACTIVE')
		}
	}
</script>