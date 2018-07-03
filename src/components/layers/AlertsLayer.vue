<template>
	<div class="alerts-wrapper" v-if="visible">
		<transition-group name="alerts-list" tag="div">
		<div v-for="(alert, index) in alerts"
			 class="alerts-item"
			 :key="index"
			 :class="{ 'alert': true,
					   'alert--success': alert.type == 'success',
					   'alert--info':    alert.type == 'info',
					   'alert--danger':  alert.type == 'error'
			}">
			<span style="white-space: pre-wrap">{{ alert.text }}</span>
		</div>
		</transition-group>
	</div>
</template>

<script>
	import BusEvents from 'bus-events'

	const TIMEOUT_DEFAULT = 3500

	export default {
		data() {
			return {
				alerts: [],
			}
		},
		computed: {
			visible() { return this.alerts.length > 0 }
		},
		created() {
			this.$bus.on(BusEvents.ALERTS_SUCCESS, this.success)
			this.$bus.on(BusEvents.ALERTS_INFO, this.info)
			this.$bus.on(BusEvents.ALERTS_ERROR, this.error)
		},
		methods: {
			success(text, timeout) {
				this.addAlert('success', text, timeout)
			},
			info(text, timeout) {
				this.addAlert('info', text, timeout)
			},
			error(text, timeout) {
				this.addAlert('error', text, timeout)
			},
			addAlert(type, text, timeout) {
				const alert = { type, text }
				this.alerts.unshift(alert)
				setTimeout(() => { this.closeAlert(alert) }, (timeout || TIMEOUT_DEFAULT))
			},
			closeAlert(alert) {
				const idx = this.alerts.indexOf(alert)
				if (idx > -1)
					this.alerts.splice(idx, 1)
			}
		},
		beforeDestroy() {
			this.$bus.off(BusEvents.ALERTS_SUCCESS)
			this.$bus.off(BusEvents.ALERTS_INFO)
			this.$bus.off(BusEvents.ALERTS_ERROR)
		}
	}
</script>

<style>
	.alerts-wrapper {
		z-index: 105;
		position: fixed;
		top: 1rem;
        right: 1rem;
    }
    .alerts-wrapper > div {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
	}

	.alerts-item {
		padding: 1rem;
		background: #fff;
		border: 1px solid;
		margin-bottom: .5rem;
		border-radius: 5px;
		position: relative;
		transition: all 0.2s;
		display: inline-block;
		max-width: 80vw;
	}
	.alert--success {
		background: #effaed;
		border-color: #afd4a9;
	}
	.alert--info {
		background: #f0f2f5;
		border-color: #c1c9d9;
	}
	.alert--danger {
		background: #ffefe9;
		border-color: #f2ab99;
	}
	.alerts-list-enter, .alerts-list-leave-to {
		opacity: 0;
		transform: translateX(50px);
	}
</style>
