<template>
	<section class="content">
		<h2 v-if="tagActive">#{{ tagActive }}</h2>

		<pagination
			:current="galleryList.current"
			:total="galleryList.total_pages"
			:before="galleryList.before"
			:next="galleryList.next" />

		<div class="gallery__container">
			<template v-if="galleryList">
				<template v-if="galleryList.items.length > 0">
					<div class="comment__files">
						<file-block
							v-for="(file, index) in galleryList.items"
							:file="file"
							:key="index"/>
					</div>
				</template>
				<template v-else>
					<topic-placeholder :loading="loading" />
				</template>
			</template>

			<template v-else>
				<topic-placeholder :loading="loading" />
			</template>
		</div>
	</section>
</template>


<script>
	import { mapState } from 'vuex'
	import FileBlock from '@/components/common/FileBlock'
	import TopicPlaceholder from '@/components/common/TopicPlaceholder'
	import Pagination from '@/components/common/Pagination'

	export default {
		name: 'gallery',
		components: {
			FileBlock,
			TopicPlaceholder,
			Pagination
		},
		data() {
			return {
				titlePage: 'Loading...'
			}
		},
		metaInfo() {
			return { title: this.titlePage }
		},
		created() { },
		computed: {
			...mapState([
				'loading',
				'galleryList',
				'tagsHidden',
				'tagActive'
			])
		},
		methods: {
			fetchGallery(tag, except, limit, page) {
				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('FETCH_GALLERY', [ tag, except, limit, page ])
				.then(() => {
					this.titlePage = 'Gallery'
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$router.replace({ name: 'page-error', params: { error } })
					this.$store.commit('SET_LOADING', false)
				})
			}
		},
		watch: {
			$route(to) {
				this.fetchGallery(
					this.$route.query.tag,
					this.tagsHidden.join(),
					this.$route.query.limit,
					this.$route.query.page
				)
			}
		},
		mounted() {
			this.fetchGallery(
				this.$route.query.tag,
				this.tagsHidden.join(),
				this.$route.query.limit,
				this.$route.query.page
			)
		},
		beforeDestroy() {
			this.$store.commit('REMOVE_GALLERY_LIST')
			this.$store.commit('REMOVE_TAG_ACTIVE')
		}
	}
</script>