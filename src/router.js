import Vue from 'vue'
import Router from 'vue-router'

import Topics from '@/components/Topics'
import TopicsAdd from '@/components/TopicsAdd'
import Page from '@/components/Page'
import Gallery from '@/components/Gallery'
import Settings from '@/components/Settings'
import Bans from '@/components/Bans'
import PageError from '@/components/PageError'

Vue.use(Router)

const routes = [
	{ path: '/', name: 'home', redirect: 'hot' },

	{ path: '/page/error', name: 'page-error', component: PageError },
	{ path: '/page/:pageSlug', name: 'page', component: Page },

	{ path: '/new', name: 'new', component: Topics },
	{ path: '/top', name: 'top', component: Topics },
	{ path: '/hot', name: 'hot', component: Topics },
	{ path: '/best', name: 'best', component: Topics },
	{ path: '/topic/:topicId', name: 'topic', component: Topics },

	{ path: '/gallery', component: Gallery, name: 'gallery' },
	{ path: '/add', component: TopicsAdd, name: 'add' },
	{ path: '/settings', component: Settings, name: 'settings' },
	{ path: '/bans', component: Bans, name: 'bans' },

	{ path: '*', redirect: { name: 'page-error' } }
]

const router = new Router({
	routes,
	mode: 'history',
	scrollBehavior (to, from, savedPosition) {
		if (savedPosition)
			return savedPosition
		else if (to.hash)
			return { selector: document.getElementById(to.hash) }
		else
			return { x: 0, y: 0 }
	}
})

export default router