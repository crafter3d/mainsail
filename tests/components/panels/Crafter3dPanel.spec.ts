import { describe, expect, it, vi } from 'vitest'
import Crafter3dPanel from '@/components/panels/Crafter3dPanel.vue'
import DashboardMixin from '@/components/mixins/dashboard'
import { allDashboardPanels } from '@/store/variables'
import { mdiWrenchCog, mdiCogOutline, mdiStopCircleOutline } from '@mdi/js'

type MethodMap = Record<string, (...args: any[]) => any>

type ComputedMap = Record<string, { get: () => any }>

const componentOptions = (Crafter3dPanel as any).options ?? (Crafter3dPanel as any)
const methods = componentOptions.methods as MethodMap
const computed = componentOptions.computed as ComputedMap
const beforeDestroyHook = Array.isArray(componentOptions.beforeDestroy)
    ? componentOptions.beforeDestroy[0]
    : componentOptions.beforeDestroy

const dashboardOptions = (DashboardMixin as any).options ?? (DashboardMixin as any)
const dashboardMethods = dashboardOptions.methods as MethodMap

describe('Crafter3dPanel', () => {
    it('dispatches gcode and event when executeScript has no loading key', () => {
        const dispatch = vi.fn()
        const emit = vi.fn()

        const vm = {
            $store: { dispatch },
            $socket: { emit },
        }

        methods.executeScript.call(vm, 'CALIBRATE')

        expect(dispatch).toHaveBeenCalledWith('server/addEvent', {
            message: 'CALIBRATE',
            type: 'command',
        })
        expect(emit).toHaveBeenCalledWith('printer.gcode.script', { script: 'CALIBRATE' })
    })

    it('dispatches loading payload when executeScript receives loading key', () => {
        const dispatch = vi.fn()
        const emit = vi.fn()

        const vm = {
            $store: { dispatch },
            $socket: { emit },
        }

        methods.executeScript.call(vm, 'BELT_OFF', 'crafter3dBeltStop')

        expect(dispatch).toHaveBeenCalledWith('server/addEvent', {
            message: 'BELT_OFF',
            type: 'command',
        })
        expect(emit).toHaveBeenCalledWith('printer.gcode.script', { script: 'BELT_OFF' }, { loading: 'crafter3dBeltStop' })
    })

    it('runs top section commands with expected scripts', () => {
        const executeScript = vi.fn()

        const vm = {
            executeScript,
        }

        methods.runLedOn.call(vm)
        methods.runLowerZAxis.call(vm)
        methods.runCalibrate.call(vm)
        methods.runZOffsetCalibrate.call(vm)

        expect(executeScript.mock.calls.map((call) => call[0])).toEqual([
            'TOGGLE_LED',
            'Z_DROP',
            'CALIBRATE',
            'PROBE_CALIBRATE',
        ])
    })

    it('runs purge and clean workflow in required order', () => {
        const executeScript = vi.fn()

        const vm = {
            executeScript,
        }

        methods.runPurgeAndClean.call(vm)

        expect(executeScript.mock.calls.map((call) => call[0])).toEqual([
            'PARK_POS',
            'CLEAN_NOZZLE',
            'PURGE',
            'CLEAN_NOZZLE',
        ])
    })

    it('sends belt throw command and closes dialog on confirm', () => {
        const executeScript = vi.fn()
        const closeThrowObjectDialog = vi.fn()

        const vm = {
            executeScript,
            closeThrowObjectDialog,
        }

        methods.confirmThrowObject.call(vm)

        expect(executeScript).toHaveBeenCalledWith('BELT_THROW')
        expect(closeThrowObjectDialog).toHaveBeenCalled()
    })

    it('emits all step movement commands with correct distances', () => {
        const executeScript = vi.fn()

        const vm = {
            executeScript,
            loadingBeltStepForward: 'crafter3dBeltStepForward',
            loadingBeltStepBackward: 'crafter3dBeltStepBackward',
            loadingBeltStepForwardTen: 'crafter3dBeltStepForwardTen',
            loadingBeltStepBackwardTen: 'crafter3dBeltStepBackwardTen',
        }

        methods.moveBeltStepBackward.call(vm)
        methods.moveBeltStepBackwardTen.call(vm)
        methods.moveBeltStepForward.call(vm)
        methods.moveBeltStepForwardTen.call(vm)

        expect(executeScript.mock.calls).toEqual([
            ['BELT_MOVE DIST=-10', 'crafter3dBeltStepBackward'],
            ['BELT_MOVE DIST=-100', 'crafter3dBeltStepBackwardTen'],
            ['BELT_MOVE DIST=10', 'crafter3dBeltStepForward'],
            ['BELT_MOVE DIST=100', 'crafter3dBeltStepForwardTen'],
        ])
    })

    it('updates movement state and emits correct scripts for start/stop', () => {
        const executeScript = vi.fn()

        const vm = {
            executeScript,
            beltMoving: 'off',
            loadingBeltStartForward: 'crafter3dBeltStartForward',
            loadingBeltStop: 'crafter3dBeltStop',
        }

        methods.startBeltForward.call(vm)
        expect(vm.beltMoving).toBe('forward')
        expect(executeScript).toHaveBeenCalledWith('BELT_ON', 'crafter3dBeltStartForward')

        methods.stopBeltMovement.call(vm)
        expect(vm.beltMoving).toBe('off')
        expect(executeScript).toHaveBeenCalledWith('BELT_OFF', 'crafter3dBeltStop')
    })

    it('stops belt in beforeDestroy only when moving and connected', () => {
        const executeScript = vi.fn()

        const vmConnected = {
            executeScript,
            socketIsConnected: true,
            beltMoving: 'forward',
            loadingBeltStop: 'crafter3dBeltStop',
        }

        beforeDestroyHook.call(vmConnected)
        expect(vmConnected.beltMoving).toBe('off')
        expect(executeScript).toHaveBeenCalledWith('BELT_OFF', 'crafter3dBeltStop')

        const vmDisconnected = {
            executeScript: vi.fn(),
            socketIsConnected: false,
            beltMoving: 'forward',
            loadingBeltStop: 'crafter3dBeltStop',
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

describe('Crafter3d dashboard integration', () => {
    it('registers only unified panel id in dashboard panel list', () => {
        expect(allDashboardPanels).toContain('crafter3d')
        expect(allDashboardPanels).not.toContain('crafter-shortcuts')
    })

    it('maps crafter3d to wrench icon in dashboard mixin', () => {
        const icon = dashboardMethods.convertPanelnameToIcon.call({}, 'crafter3d')
        expect(icon).toBe(mdiWrenchCog)
    })
})

