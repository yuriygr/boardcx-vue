<template>
	<div id="app" :class="[
		{ 'app--loading': loading },
		{ 'app--nsfw': settings.hide_files },
		'app--' + settings.theme
	]">

		<NavigationBar />
		<AppSidebar />
		<router-view></router-view>
		<AppFooter />

		<template v-if="!settings.hide_scrollbutton">
			<div class="nav-arrow nav-arrow__top" @click="scrollUp" @click.prevent.stop>🔺</div>
			<div class="nav-arrow nav-arrow__bottom" @click="scrollDown" @click.prevent.stop>🔻</div>
		</template>

		<AlertsLayer />
		<ModalsLayer />
		<Loading :show="loading" />
	</div>
</template>

<script>
	import { mapState, mapGetters } from 'vuex'
	import AlertsLayer from './common/AlertsLayer'
	import ModalsLayer from './common/ModalsLayer'
	import NavigationBar from './common/NavigationBar'
	import AppSidebar from './common/AppSidebar'
	import AppFooter from './common/AppFooter'
	import Loading from './common/Loading'

	export default {
		name: 'app',
		components: {
			AlertsLayer,
			ModalsLayer,
			NavigationBar,
			AppSidebar,
			AppFooter,
			Loading
		},
		computed: {
			...mapState([
				'loading',
			]),
			...mapGetters([
				'settings'
			])
		},
		methods: {
			scrollUp() {
				window.scrollTo(0, 0)
			},
			scrollDown() {
				window.scrollTo(0, document.body.scrollHeight)
			}
		},
		mounted() {
			this.$store.dispatch('FETCH_TAGS')
		}
	}
</script>