import { describe, expect, it, vi } from 'vitest'
import PrintBeltPanel from '@/components/panels/PrintBeltPanel.vue'
import DashboardMixin from '@/components/mixins/dashboard'
import { allDashboardPanels } from '@/store/variables'
import { mdiWrenchCog, mdiCogOutline, mdiStopCircleOutline } from '@mdi/js'

type MethodMap = Record<string, (...args: any[]) => any>

type ComputedMap = Record<string, { get: () => any }>

const componentOptions = (PrintBeltPanel as any).options ?? (PrintBeltPanel as any)
const methods = componentOptions.methods as MethodMap
const computed = componentOptions.computed as ComputedMap
const beforeDestroyHook = Array.isArray(componentOptions.beforeDestroy)
    ? componentOptions.beforeDestroy[0]
    : componentOptions.beforeDestroy

const dashboardOptions = (DashboardMixin as any).options ?? (DashboardMixin as any)
const dashboardMethods = dashboardOptions.methods as MethodMap

describe('PrintBeltPanel', () => {
    it('dispatches gcode and event when executeScript has no loading key', () => {
        const dispatch = vi.fn()
        const emit = vi.fn()

        const vm = {
            $store: { dispatch },
            $socket: { emit },
        }

        methods.executeScript.call(vm, 'Z_TILT_ADJUST')

        expect(dispatch).toHaveBeenCalledWith('server/addEvent', {
            message: 'Z_TILT_ADJUST',
            type: 'command',
        })
        expect(emit).toHaveBeenCalledWith('printer.gcode.script', { script: 'Z_TILT_ADJUST' })
    })

    it('dispatches loading payload when executeScript receives loading key', () => {
        const dispatch = vi.fn()
        const emit = vi.fn()

        const vm = {
            $store: { dispatch },
            $socket: { emit },
        }

        methods.executeScript.call(vm, 'MOVE_BELT ACTION=STOP', 'printBeltStop')

        expect(dispatch).toHaveBeenCalledWith('server/addEvent', {
            message: 'MOVE_BELT ACTION=STOP',
            type: 'command',
        })
        expect(emit).toHaveBeenCalledWith(
            'printer.gcode.script',
            { script: 'MOVE_BELT ACTION=STOP' },
            { loading: 'printBeltStop' }
        )
    })

    it('sends throw object command and closes dialog on confirm', () => {
        const executeScript = vi.fn()
        const closeThrowObjectDialog = vi.fn()

        const vm = {
            executeScript,
            closeThrowObjectDialog,
        }

        methods.confirmThrowObject.call(vm)

        expect(executeScript).toHaveBeenCalledWith('THROW_OBJECT')
        expect(closeThrowObjectDialog).toHaveBeenCalled()
    })

    it('updates movement state and emits correct scripts for start/stop', () => {
        const executeScript = vi.fn()

        const vm = {
            executeScript,
            beltMoving: 'off',
            loadingBeltStartForward: 'printBeltStartForward',
            loadingBeltStop: 'printBeltStop',
        }

        methods.startBeltForward.call(vm)
        expect(vm.beltMoving).toBe('forward')
        expect(executeScript).toHaveBeenCalledWith('MOVE_BELT ACTION=START DIRECTION=1', 'printBeltStartForward')

        methods.stopBeltMovement.call(vm)
        expect(vm.beltMoving).toBe('off')
        expect(executeScript).toHaveBeenCalledWith('MOVE_BELT ACTION=STOP', 'printBeltStop')
    })

    it('stops belt in beforeDestroy only when moving and connected', () => {
        const executeScript = vi.fn()

        const vmConnected = {
            executeScript,
            socketIsConnected: true,
            beltMoving: 'forward',
            loadingBeltStop: 'printBeltStop',
        }

        beforeDestroyHook.call(vmConnected)
        expect(vmConnected.beltMoving).toBe('off')
        expect(executeScript).toHaveBeenCalledWith('MOVE_BELT ACTION=STOP', 'printBeltStop')

        const vmDisconnected = {
            executeScript: vi.fn(),
            socketIsConnected: false,
            beltMoving: 'forward',
            loadingBeltStop: 'printBeltStop',
        }

        beforeDestroyHook.call(vmDisconnected)
        expect(vmDisconnected.executeScript).not.toHaveBeenCalled()
    })

    it('computes beltIsMoving from local movement state', () => {
        expect(computed.beltIsMoving.get.call({ beltMoving: 'off' })).toBe(false)
        expect(computed.beltIsMoving.get.call({ beltMoving: 'forward' })).toBe(true)
        expect(computed.beltIsMoving.get.call({ beltMoving: 'backward' })).toBe(true)
    })

    it('computes centerWheelIcon based on movement state', () => {
        const vms = {
            idle: { beltIsMoving: false, mdiCogOutline, mdiStopCircleOutline },
            moving: { beltIsMoving: true, mdiCogOutline, mdiStopCircleOutline },
        }
        expect(computed.centerWheelIcon.get.call(vms.idle)).toBe(mdiCogOutline)
        expect(computed.centerWheelIcon.get.call(vms.moving)).toBe(mdiStopCircleOutline)
    })

    it('computes centerWheelColor based on movement state', () => {
        expect(computed.centerWheelColor.get.call({ beltIsMoving: false })).toBe('grey')
        expect(computed.centerWheelColor.get.call({ beltIsMoving: true })).toBe('error')
    })

    it('onCenterWheelClick stops belt only when moving', () => {
        const stopBeltMovement = vi.fn()

        const vmIdle = { beltIsMoving: false, stopBeltMovement }
        methods.onCenterWheelClick.call(vmIdle)
        expect(stopBeltMovement).not.toHaveBeenCalled()

        const vmMoving = { beltIsMoving: true, stopBeltMovement }
        methods.onCenterWheelClick.call(vmMoving)
        expect(stopBeltMovement).toHaveBeenCalled()
    })
})

describe('PrintBelt dashboard integration', () => {
    it('registers print-belt in dashboard panel list', () => {
        expect(allDashboardPanels).toContain('print-belt')
    })

    it('maps print-belt to wrench icon in dashboard mixin', () => {
        const icon = dashboardMethods.convertPanelnameToIcon.call({}, 'print-belt')
        expect(icon).toBe(mdiWrenchCog)
    })
})
