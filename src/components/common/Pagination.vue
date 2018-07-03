<template>
	<div>
		<ul class="pagination" v-if="total > 1">
			<li>
				<router-link
					class="button"
					:class="{ 'button--disabled': !hasBefore() }"
					active-class=""
					exact-active-class=""
					:to="{ name: name, query: getQuery(before) }" exact>Before</router-link>
			</li>
			<li v-for="(page, index) in total" :key="index">
				<router-link
					class="button"
					active-class="button--action"
					exact-active-class=""
					:to="{ name: name, query: getQuery(page) }" exact>{{ page }}</router-link>
			</li>
			<li>
				<router-link
					class="button"
					:class="{ 'button--disabled': !hasNext() }"
					active-class=""
					exact-active-class=""
					:to="{ name: name, query: getQuery(next) }" exact>Next</router-link>
			</li>
		</ul>
	</div>
</template>

<script>
	export default {
		name: 'pagination',
		props: {
			'current': {
				type: Number,
				default: 1
			},
			'total': {
				type: Number,
				default: 0
			},
			'before': {
				type: Number,
				default: 0
			},
			'next': {
				type: Number,
				default: 1
			}
		},
		computed: {
			name() {
				return this.$route.name
			}
		},
		methods: {
			hasBefore() {
				return this.current > this.before
			},
			hasNext() {
				return this.current < this.next
			},
			getQuery(type) {
				let copy = Object.assign({}, this.$route.query)
				return Object.assign(copy, { page: type })
			}
		}
	}
</script>