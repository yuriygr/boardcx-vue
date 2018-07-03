<template>
	<div class="topic__comments">
		<a name="comments" id="comments"></a>
		<h6 class="topic__comments__title">{{ count | ommited }}</h6>
		<div class="topic__comments__container">
			<template v-for="(comment, index) in comments">
				<comment
					:key="comment.id"
					:comment="comment"
					:index="++index"
					:canModerate="canModerate"/>
			</template>
		</div>
	</div>

</template>

<script>
	import Comment from '@/components/common/Comment'

	export default {
		name: 'topic-comments',
		props: ['comments', 'count', 'canModerate'],
		components: {
			Comment
		}
	}
</script>