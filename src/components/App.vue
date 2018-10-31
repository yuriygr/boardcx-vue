<template>
	<div id="app" :class="[
		'app--' + settings.get('theme'),
		{ 'app--loading': loading },
		{ 'app--nsfw': settings.get('hide_files') },
		{ 'app--ihateroundedborders': settings.get('i_hate_rounded_borders') },
		{ 'app-fixed-header': settings.get('fixed_header') },
		{ 'app--remove-hidden': settings.get('remove_hidden') }
	]">
		<app-header />
		<app-main>
			<router-view />
			<app-sidebar />
		</app-main>
		<app-footer />

		<alerts-layer />
		<modals-layer />
		<loading-layer :show="loading" />
	</div>
</template>

<style>
	.app--loading .content { opacity: .4; }

	.app--nsfw .file__thumb { opacity: .1; }
	.app--nsfw .file__thumb:hover { opacity: 1; }

	.app--ihateroundedborders .topic,
	.app--ihateroundedborders .topic__comments,
	.app--ihateroundedborders .page__content,
	.app--ihateroundedborders .aside__block,
	.app--ihateroundedborders .comment { border-radius: 0; }

	.app--remove-hidden .topic--hidden { display: none; }

	.app-fixed-header header {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		box-shadow: 0 0.0005rem 0.1rem 0 rgba(149, 156, 163, 0.15),
					0 2px 15px 0 rgba(149, 156, 163, 0.15);
	}
	.app-fixed-header header:hover {
		box-shadow: 0 0.0005rem 0.1rem 0 rgba(149, 156, 163, 0.2),
					0 2px 15px 0 rgba(149, 156, 163, 0.2);
	}
	.app-fixed-header main {
		margin-top: 54px;
	}
	#app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		margin: 0;
	}
</style>

<script>
	import { mapState } from 'vuex'
	import settings from 'board-settings'

	import AppHeader from 'components/blocks/AppHeader'
	import AppMain from 'components/blocks/AppMain'
	import AppSidebar from 'components/blocks/AppSidebar'
	import AppFooter from 'components/blocks/AppFooter'

	import AlertsLayer from 'components/layers/AlertsLayer'
	import ModalsLayer from 'components/layers/ModalsLayer'
	import LoadingLayer from 'components/layers/LoadingLayer'

	export default {
		name: 'app',
		components: {
			AlertsLayer,
			ModalsLayer,
			LoadingLayer,

			AppHeader,
			AppMain,
			AppSidebar,
			AppFooter
		},
		data() {
			return {
				settings: settings
			}
		},
		computed: {
			...mapState([
				'loading',
			])
		}
	}
</script>