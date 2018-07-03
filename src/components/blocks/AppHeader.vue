<template>
	<header>
		<div class="container container--header">
			<div class="header__block">
				<div class="header__navigation header__navigation--left">
					<router-link
						class="navigation__item navigation__item--logo"
						active-class=""
						exact-active-class=""
						:to="{ name: 'home' }">Board<span>.cx</span></router-link>
				<template v-for="item in sortList">
					<router-link
						:key="item.slug"
						:class="[ 'navigation__item', 'navigation__item--' + item.slug ]"
						active-class="navigation__item--active"
						exact-active-class=""
						:title="item.description"
						:to="{ name: item.slug, query: getQuery() }"
					>{{ item.label }}</router-link> 
				</template>
				</div>
			</div>
			<div class="header__block">
				<div class="header__navigation header__navigation--right">
					<router-link
						class="navigation__item navigation__item--add"
						active-class="navigation__item--active"
						exact-active-class=""
						:to="{ name: 'topic-new' }">Start discussion</router-link>
					<router-link
						class="navigation__item navigation__item--settings"
						active-class="navigation__item--active"
						exact-active-class=""
						:to="{ name: 'page-settings' }">Settings</router-link>
				</div>
			</div>
		</div>
	</header>
</template>

<script>
	export default {
		name: 'app-header',
		computed: {
			sortList() {
				return this.$store.state.sortList
			},
			tagActive() {
				return this.$store.state.tagActive
			}
		},
		methods: {
			getQuery() {
				let copy = Object.assign({}, this.$route.query)
				delete copy.page
				if (this.tagActive)
					copy.tag = this.tagActive
				return Object.assign(copy)
			}
		}
	}
</script>