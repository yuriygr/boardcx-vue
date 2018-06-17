<template>
	<footer>
		<div class="container">
			<p>Using this site means that you accept the <router-link :to="{ name: 'page', params: { pageSlug: 'user-agreement' } }" exact>User Agreement</router-link> and <router-link :to="{ name: 'page', params: { pageSlug: 'privacy-policy' } }" exact>Privacy Policy</router-link>. &copy; {{ date }} {{ name }}. All rights reserved. All comments on this site belong to their authors. Version: {{ version }}</p>
			<ul class="inline">
				<li>
					<router-link :to="{ name: 'page', params: { pageSlug: 'about' } }" exact>About</router-link>
				</li>
				<li>
					<router-link :to="{ name: 'page', params: { pageSlug: 'help' } }" exact>Help</router-link>
				</li>
				<li>
					<router-link :to="{ name: 'page', params: { pageSlug: 'donate' } }" exact>Donate</router-link>
				</li>
				<li>|</li>
				<li>
					<router-link :to="{ name: 'bans' }" exact>Bans</router-link>
				</li>
			</ul>
		</div>
	</footer>
</template>

<script>
	import { mapState } from 'vuex'

	export default {
		name: 'app-footer',
		computed: {
			date() {
				return new Date().getFullYear()
			},
			...mapState([
				'name',
				'version'
			])
		}
	}
</script>