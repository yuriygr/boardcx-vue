import Vue from 'vue'
import Router from 'vue-router'

import Topics from '@/components/Topics'
import TopicNew from '@/components/TopicNew'
import Gallery from '@/components/Gallery'
import Page from '@/components/Page'
import PageBans from '@/components/PageBans'
import PageError from '@/components/PageError'
import PageSettings from '@/components/PageSettings'
import PageStats from '@/components/PageStats'

Vue.use(Router)

const routes = [
	{ path: '/', name: 'home', redirect: 'hot' },

	{ path: '/page/settings', name: 'page-settings', component: PageSettings, meta: { aside: 'page' } },
	{ path: '/page/bans', name: 'page-bans', component: PageBans, meta: { aside: 'page' } },
	{ path: '/page/stats', name: 'page-stats', component: PageStats, meta: { aside: 'page' } },
	{ path: '/page/error', name: 'page-error', component: PageError, meta: { aside: false } },
	{ path: '/page/:pageSlug', name: 'page', component: Page, meta: { aside: 'page' } },

	{ path: '/new', name: 'new', component: Topics, meta: { aside: 'topic' } },
	{ path: '/top', name: 'top', component: Topics, meta: { aside: 'topic' } },
	{ path: '/hot', name: 'hot', component: Topics, meta: { aside: 'topic' } },
	{ path: '/best', name: 'best', component: Topics, meta: { aside: 'topic' } },

	{ path: '/gallery', name: 'gallery', component: Gallery, meta: { aside: 'topic' } },

	{ path: '/topic/new', name: 'topic-new', component: TopicNew, meta: { aside: 'topic' } },
	{ path: '/topic/:topicId', name: 'topic', component: Topics, meta: { aside: 'topic' } },

	{ path: '*', redirect: { name: 'page-error' } }
]

const router = new Router({
	routes,
	mode: 'history',
	scrollBehavior (to, from, savedPosition) {
		if (to.hash)
			return { selector: to.hash }
		else if (savedPosition)
			return savedPosition
		else 
			return { x: 0, y: 0 }
	}
})

router.beforeEach((to, from, next) => {
	next()
})

export default router