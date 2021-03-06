import Vue from 'vue'
import VueBus from 'vue-bus';
import Meta from 'vue-meta'
import { sync } from 'vuex-router-sync'

import App from '@/components/App'

import router from '@/app/router'
import store from '@/app/store'
import filters from '@/app/filters'
import directives from '@/app/directives'
import settings from 'board-settings'
import moderation from 'board-moderation'
import hiding from 'board-hiding'

// some styles
import 'reset-css/reset.css'
import 'assets/style.css'

// register whatever
Vue.use(VueBus)
Vue.use(Meta)

// register global utility filters
Object.keys(filters).forEach((key) =>
	Vue.filter(key, filters[key])
)

// load apps directives
Object.keys(directives).forEach((key) =>
	Vue.directive(key, directives[key])
)

// sync the router with the vuex store.
// this registers `store.state.route`
sync(store, router)

// Скажем спасибо ЕФГ за идею
Vue.mixin({
	mounted() {
		for (let [ event, callback ] of Object.entries(this.busEvents || {})) {
			this.$bus.on(event, callback)
		}
	},
	beforeDestroy() {
		for (let [ event, callback ] of Object.entries(this.busEvents || {})) {
			this.$bus.off(event, callback)
		}
	}
})

// Services
console.time('Loading services')

!settings.loaded &&
settings.sync('read', _ => {
	console.info('[status] Settings loaded')
})

!moderation.loaded &&
moderation.sync('read', _ => {
	console.info('[status] Moderator permissions loaded')
})

!hiding.loaded &&
hiding.sync('read', _ => {
	console.info('[status] Hiding rules loaded')
})

console.timeEnd('Loading services')

// create the app instance.
// here we inject the router and store to all child components,
// making them available everywhere as `this.$router` and `this.$store`.
const app = new Vue({
	router,
	store,
	...App
})

// expose the app, the router and the store.
// note we are not mounting the app here, since bootstrapping will be
// different depending on whether we are in a browser or on the server.
export { app, router, store }