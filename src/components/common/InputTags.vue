<template>
	<div class="input-tags" name="tags">
		<button
			v-for="tag in tagsList"
			:class="[
				'button button--small',
				{ 'button--action': isSelecedTag(tag) },
				{ 'button--disabled': !isSelecedTag(tag) && cantSelectTags }
			]"
			:key="tag.id"
			:disabled="!isSelecedTag(tag) && cantSelectTags"
			@click="toggleSelectTag(tag)"
			@click.prevent.stop>{{ tag.title }}</button>
	</div>
</template>

<script>
	export default {
		name: 'input-tags',
		props: ['tags', 'tagsList'],
		computed: {
			cantSelectTags() {
				return this.tags.length >= 4
			},
			list: {
				get() {
					return this.tags
				},
				set(val) {
					this.$emit('update:tags', val)
				}
			}
		},
		methods: {
			toggleSelectTag(tag) {
				if (!this.isSelecedTag(tag))
					this.list.push(tag.id)
				else
					this.list = this.list.filter(e => e !== tag.id)
			},
			isSelecedTag(tag) {
				return (this.list).indexOf(tag.id) != -1
			}
		}
	}
</script>

<style>
	.input-tags {
		display: flex;
		flex-wrap: wrap;
		align-content: space-between;
	}
	.input-tags .button {
		margin: .2rem;
	}
</style>