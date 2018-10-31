<template>
	<aside v-if="forWhat">
		<div class="aside__block" :class="[
			{ 'aside__block--loading': tagsList.length <= 0 }
			]" v-if="forWhat == 'topic'">
			<ul class="aside__list">
				<li :class="[
					'list__item',
					'list__item--all',
					{ 'list__item--active': !hasActiveTag() },
				]">
					<a href="#" @click="resetActiveTags" @click.prevent.stop>All topics</a>
				</li>
				<li class="list__item list__item--divide"></li>
				<li
					v-for="tag in tagsList"
					:key="tag.slug"
					:class="[
						'list__item',
						{ 'list__item--active': isActiveTag(tag) },
						{ 'list__item--disabled': isHiddenTag(tag) }
					]">
					<router-link active-class="" exact-active-class="" :to="{ name: name, query: { tag: tag.slug } }">
						{{ tag.title }}
					</router-link>
					<span class="list__item__meta" v-if="isHiddenTag(tag)" @click="showTag(tag)" @click.prevent.stop>+</span>
					<span class="list__item__meta" v-else @click="hideTag(tag)" @click.prevent.stop>×</span>
				</li>
				<li class="list__item list__item--divide"></li>
				<li class="list__item list__item--reset">
					<a href="#" @click="resetTags" @click.prevent.stop>Reset</a>
				</li>
			</ul>
		</div>

		<div class="aside__block" v-if="forWhat == 'page'">
			<ul class="aside__list">
				<router-link
					tag="li"
					class="list__item"
					active-class="list__item--active"
					exact-active-class=""
					:to="{ name: 'page-settings' }" exact><a>Settings</a></router-link>
				<router-link
					tag="li"
					class="list__item"
					active-class="list__item--active"
					exact-active-class=""
					:to="{ name: 'page-bans' }" exact><a>Bans</a></router-link>
				<router-link
					tag="li"
					class="list__item"
					active-class="list__item--active"
					exact-active-class=""
					:to="{ name: 'page-stats' }" exact><a>Stats</a></router-link>
				<li class="list__item list__item--divide"></li>
				<router-link
					tag="li"
					class="list__item"
					active-class="list__item--active"
					exact-active-class=""
					:to="{ name: 'page', params: { pageSlug: 'about' } }" exact><a>About</a></router-link>
				<router-link
					tag="li"
					class="list__item"
					active-class="list__item--active"
					exact-active-class=""
					:to="{ name: 'page', params: { pageSlug: 'help' } }" exact><a>Help</a></router-link>
				<router-link
					tag="li"
					class="list__item"
					active-class="list__item--active"
					exact-active-class=""
					:to="{ name: 'page', params: { pageSlug: 'donate' } }" exact><a>Donate</a></router-link>
				<li class="list__item list__item--divide"></li>
				<router-link
					tag="li"
					class="list__item"
					active-class="list__item--active"
					exact-active-class=""
					:to="{ name: 'page', params: { pageSlug: 'user-agreement' } }" exact><a>User Agreement</a></router-link>
				<router-link
					tag="li"
					class="list__item"
					active-class="list__item--active"
					exact-active-class=""
					:to="{ name: 'page', params: { pageSlug: 'privacy-policy' } }" exact><a>Privacy Policy</a></router-link>
			</ul>
		</div>
		<div class="aside__block aside__block--button" @click="scrollTop">
			↑ Ascend
		</div>
	</aside>
</template>

<script>
	import { mapState } from 'vuex'
	import hiding from 'board-hiding'
	import BusEvents from 'bus-events'

	export default {
		name: 'app-sidebar',
		computed: {
			...mapState([
				'tagsList',
				'showTagsList',
				'tagActive',
				'tagsHidden',
				'sortList',
				'topicsList',
				'topicActive',
			]),
			name() {
				return this.sortList.filter(sort => sort.slug === this.$route.name)[0] ? this.$route.name : 'hot'
			},
			forWhat() {
				return this.$route.meta.aside
			}
		},
		created() {},
		mounted() {
			this.$store.dispatch('FETCH_TAGS_LIST')
		},
		methods: {
			hasActiveTag() {
				return this.tagActive
			},
			isActiveTag(tag) {
				return this.tagActive === tag.slug
			},
			isHiddenTag(tag) {
				return this.tagsHidden.indexOf(tag.slug) != -1
			},
			resetActiveTags() {
				this.$store.commit('REMOVE_TAG_ACTIVE')
				let query = Object.assign({}, this.$route.query)
				delete query.tag
				this.$router.push({ name: this.$route.name, query: query })
			},
			showTag(tag) {
				hiding.toggle({ tag_slug: tag.slug, hide: false }, _ => {
					this.$store.commit('UNHIDE_TAG', tag)
					this.$bus.emit(BusEvents.ALERTS_INFO, 'Need to refresh page')	
				})
			},
			hideTag(tag) {
				hiding.toggle({ tag_slug: tag.slug, hide: true }, _ => {
					this.$store.commit('HIDE_TAG', tag)
					this.$bus.emit(BusEvents.ALERTS_INFO, 'Need to refresh page')	
				})
			},
			resetTags() {
				hiding.reset('tags', _ => {
					this.resetActiveTags()
					this.$store.commit('RESET_HIDE_TAGS')
					this.$bus.emit(BusEvents.ALERTS_INFO, 'Need to refresh page')	
				})
			},
			scrollTop() {
				window.scrollTo(0, 0)
			}
		}
	}
</script>