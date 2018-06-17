<template>
	<main class="content">
		<div class="container">
			<template v-if="pageActive">
				<h1 v-html="pageActive.name"></h1>
				<div class="page__content" v-html="pageActive.text"></div>
			</template>
			<template v-else>
				<h1>Loading page</h1>
				<p>Please wait...</p>
			</template>
		</div>
	</main>
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
				'name',
				'pageActive'
			])
		},
		methods: {
			fetchPage(params) {
				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('FETCH_PAGE', params.pageSlug)
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
				this.fetchPage(to.params)
			}
		},
		mounted() {
			this.fetchPage(this.$route.params)
		},
		beforeDestroy() {
			this.$store.commit('REMOVE_PAGE_ACTIVE')
		}
	}
</script>