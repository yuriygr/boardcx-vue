<template>
	<main class="content">
		<div class="container">
			<h1>Error</h1>
			<div class="page__content" v-html="errorType"></div>
		</div>
	</main>
</template>

<script>
	export default {
		name: 'page-error',
		data() {
			return {
				titlePage: 'Error'
			}
		},
		metaInfo() {
			return { title: this.titlePage }
		},
		computed: {
			errorType() {
				if (this.$route.params.error)
					return this.$route.params.error.error_message || 'ooops'
				else
					return 'The requested page can not be displayed because of the lack thereof!'
			}
		}
	}
</script>