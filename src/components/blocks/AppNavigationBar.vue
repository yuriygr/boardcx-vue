<template>
	<header>
		<div class="container">
			<div class="header__block">
				<router-link
					v-for="item in sortList"
					:key="item.slug"
					:class="[ 'header__item', 'header__item--' + item.slug ]"
					active-class="header__item--active"
					exact-active-class=""
					:title="item.description"
					:to="{ name: item.slug, query: getQuery() }"
				>{{ item.label }}</router-link>
			</div>
			<div class="header__block">
				<a
					:class="[ 'header__item', 'header__item--add', { 'header__item--active': showTagsList } ]"
					@click="toggleTags"
					@click.prevent.stop
					href="#"
				>📜 Tags</a>
				<router-link
					:class="[ 'header__item', 'header__item--add' ]"
					active-class="header__item--active"
					exact-active-class=""
					:to="{ name: 'add' }"
				>✏️ Add topic</router-link>
				<router-link
					:class="[ 'header__item', 'header__item--settings' ]"
					active-class="header__item--active"
					exact-active-class=""
					:to="{ name: 'settings' }"
				>⚙️ Settings</router-link>
			</div>
		</div>
	</header>
</template>

<script>
	import { mapState } from 'vuex'

	export default {
		name: 'app-navigation-bar',
		computed: {
			...mapState([
				'sortList',
				'showTagsList'
			])
		},
		methods: {
			toggleTags() {
				this.$store.commit('TOGGLE_TAGS_LIST')
			},
			getQuery() {
				let copy = Object.assign({}, this.$route.query)
				delete copy.page
				return Object.assign(copy)
			}
		},
	}
</script>