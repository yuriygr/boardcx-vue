<template>
	<transition name="slide">
		<aside v-show="showTagsList">
			<div class="aside__block">
				<ul class="aside__list" v-if="tagsList.length > 0">
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
						<router-link  active-class="" exact-active-class="" :to="{ name: name, query: { tag: tag.slug } }">
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
				<span v-else>Loading...</span>
			</div>
		</aside>
	</transition>
</template>

<style>
	.slide-leave-active,
	.slide-enter-active {
		transition: .5s;
	}
	.slide-enter {
		transform: translate(-100%, 0);
	}
	.slide-leave-to {
		transform: translate(-100%, 0);
	}
</style>

<script>
	import { mapState, mapGetters } from 'vuex'

	export default {
		name: 'app-sidebar',
		computed: {
			...mapState([
				'tagsList',
				'showTagsList',
				'tagActive',
				'tagsHidden',
				'sortList'
			]),
			name() {
				return this.sortList.filter(sort => sort.slug === this.$route.name)[0] ? this.$route.name : 'hot'
			}
		},
		created() {},
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
				let query = Object.assign({}, this.$route.query)
				delete query.tag
				this.$router.push({ name: this.$route.name, query: query })
			},
			showTag(tag) {
				this.$store.commit('UNHIDE_TAG', tag)
			},
			hideTag(tag) {
				this.$store.commit('HIDE_TAG', tag)
			},
			resetTags() {
				this.resetActiveTags()
				this.$store.commit('RESET_HIDE_TAGS')
			}
		}
	}
</script>