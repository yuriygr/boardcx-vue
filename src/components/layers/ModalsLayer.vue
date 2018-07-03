<template>
	<div class="modals-wrapper1" v-if="visible" @click="closeTopModal">
		<div v-for="(modal, index) in modals" :key="index" class="modals-wrapper2">
			<div class="modals-wrapper3">
				<button @click="closeModal(modal)" class="close"><i class="fa fa-fw fa-times"></i></button>
				<component
				:is="modal.component"
				v-bind="modal.props"
				@close="closeModal(modal)"
				class="modals-content"></component>
			</div>
		</div>
	</div>
</template>

<script>
	import BusEvents from 'bus-events'

	export default {
		data() {
			return {
				modals: []
			}
		},
		computed: {
			visible() { return this.modals.length > 0 }
		},
		watch: {
			/*visible(isVisible) {
				this.$bus.emit(BusEvents.SET_BLUR, isVisible);
			}*/
		},
		created() {
			this.$bus.on(BusEvents.MODAL_SHOW, this.show)
		},
		methods: {
			show(component, props) {
				this.modals.unshift({ component, props })
			},
			closeModal(modal) {
				const idx = this.modals.indexOf(modal)
				if (idx > -1) {
					this.modals.splice(idx, 1)
				}
			},
			closeTopModal(event) {
				this.modals.splice(-1)
			}
		}
	}
</script>

<style>
	.modals-wrapper1 {
		overflow: auto;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 500;
		position: fixed;
		display: table;
	}

	.modals-wrapper2 {
		position: relative;
		margin: 0 auto;
		width: 560px;
		min-height: 500px;
		display: table-cell;
		vertical-align: middle;
		text-align: center;
	}

	.modals-wrapper3 {
		position: relative;
		display: inline-block;
		margin-left: auto;
		margin-right: auto;
		text-align: start;
	}

	.modals-wrapper3 > button.close {
		position: absolute;
		right: 10px;
		top: 10px;
	}
</style>
