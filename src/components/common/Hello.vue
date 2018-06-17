<template>
	<div class="hello" v-if="!isHidden">
		<a href="#" @click="hide" @click.prevent.stop class="hello__close" title="close">×</a>
		<h3 v-html="message"></h3>
		<router-link :to="{ name: 'page', params: { pageSlug: 'about' } }" class="button button--action" exact>Read more about us</router-link>
		<a href="#" @click="hide" @click.prevent.stop class="button button--link">Close</a>
	</div>
</template>

<script>
	export default {
		name: 'hello',
		data() {
			return {
				message: 'Welcome to the first<br>Christmas Island tags-board!',
				isHidden: false
			}
		},
		created() {
			this.isHidden = localStorage.getItem('hidden.hello')
		},
		methods: {
			hide() {
				this.makeHidden(this.isHidden = true)
			},
			makeHidden(value) {
				localStorage.setItem('hidden.hello', value)
			}
		},
		computed: {}
	}
</script>