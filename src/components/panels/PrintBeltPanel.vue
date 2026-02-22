<template>
    <panel
        v-if="klipperReadyForGui"
        :icon="mdiWrenchCog"
        :title="$t('Panels.PrintBeltPanel.Headline')"
        :collapsible="true"
        card-class="print-belt-panel">
        <v-card-text class="py-2">
            <v-row>
                <v-col class="text-center">
                    <v-btn class="mx-1 my-1" color="primary" @click="runZTiltAdjust">
                        {{ $t('Panels.PrintBeltPanel.ZTiltAdjust') }}
                    </v-btn>
                    <v-btn class="mx-1 my-1" color="primary" @click="runBedMeshCalibrate">
                        {{ $t('Panels.PrintBeltPanel.BedMeshCalibrate') }}
                    </v-btn>
                    <v-btn class="mx-1 my-1" color="primary" @click="runBedCooldown">
                        {{ $t('Panels.PrintBeltPanel.BedCooldown') }}
                    </v-btn>
                    <v-btn class="mx-1 my-1" color="primary" @click="runOpenDoor">
                        {{ $t('Panels.PrintBeltPanel.OpenDoor') }}
                    </v-btn>
                    <v-btn class="mx-1 my-1" color="primary" @click="runCloseDoor">
                        {{ $t('Panels.PrintBeltPanel.CloseDoor') }}
                    </v-btn>
                    <v-btn class="mx-1 my-1" color="error" @click="openThrowObjectDialog">
                        {{ $t('Panels.PrintBeltPanel.ThrowObject') }}
                    </v-btn>
                </v-col>
            </v-row>

            <v-divider class="my-2" />

            <v-row>
                <v-col class="text-center">
                    <div class="text-body-2 mb-2">{{ $t('Panels.PrintBeltPanel.BeltControls') }}</div>
                    <v-btn
                        class="mx-1 my-1"
                        color="primary"
                        :disabled="beltIsMoving"
                        :loading="loadings.includes(loadingBeltStepForward)"
                        @click="moveBeltStepForward">
                        {{ $t('Panels.PrintBeltPanel.MoveForward') }}
                    </v-btn>
                    <v-btn
                        class="mx-1 my-1"
                        color="primary"
                        :disabled="beltIsMoving"
                        :loading="loadings.includes(loadingBeltStepBackward)"
                        @click="moveBeltStepBackward">
                        {{ $t('Panels.PrintBeltPanel.MoveBackward') }}
                    </v-btn>
                    <v-btn
                        class="mx-1 my-1"
                        color="success"
                        :disabled="beltMoving === 'forward'"
                        :loading="loadings.includes(loadingBeltStartForward)"
                        @click="startBeltForward">
                        {{ $t('Panels.PrintBeltPanel.StartForward') }}
                    </v-btn>
                    <v-btn
                        class="mx-1 my-1"
                        color="success"
                        :disabled="beltMoving === 'backward'"
                        :loading="loadings.includes(loadingBeltStartBackward)"
                        @click="startBeltBackward">
                        {{ $t('Panels.PrintBeltPanel.StartBackward') }}
                    </v-btn>
                    <v-btn
                        class="mx-1 my-1"
                        color="error"
                        :disabled="!beltIsMoving"
                        :loading="loadings.includes(loadingBeltStop)"
                        @click="stopBeltMovement">
                        {{ $t('Panels.PrintBeltPanel.Stop') }}
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-text>

        <v-dialog v-model="throwObjectDialog" max-width="420">
            <v-card>
                <v-card-title class="text-h6">{{ $t('Panels.PrintBeltPanel.ThrowObjectConfirmTitle') }}</v-card-title>
                <v-card-text>{{ $t('Panels.PrintBeltPanel.ThrowObjectConfirmText') }}</v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="closeThrowObjectDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                    <v-btn color="error" text @click="confirmThrowObject">{{ $t('Buttons.Confirm') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiWrenchCog } from '@mdi/js'

const BELT_DIRECTION_FORWARD = 1
const BELT_DIRECTION_BACKWARD = -1
const BELT_COMMAND_BASE = 'MOVE_BELT'
const BELT_STOP_SCRIPT = `${BELT_COMMAND_BASE} ACTION=STOP`

const LOADING_BELT_STEP_FORWARD = 'printBeltStepForward'
const LOADING_BELT_STEP_BACKWARD = 'printBeltStepBackward'
const LOADING_BELT_START_FORWARD = 'printBeltStartForward'
const LOADING_BELT_START_BACKWARD = 'printBeltStartBackward'
const LOADING_BELT_STOP = 'printBeltStop'

type BeltMovingState = 'off' | 'forward' | 'backward'

@Component({
    components: { Panel },
})
export default class PrintBeltPanel extends Mixins(BaseMixin) {
    mdiWrenchCog = mdiWrenchCog
    beltMoving: BeltMovingState = 'off'
    throwObjectDialog = false
    loadingBeltStepForward = LOADING_BELT_STEP_FORWARD
    loadingBeltStepBackward = LOADING_BELT_STEP_BACKWARD
    loadingBeltStartForward = LOADING_BELT_START_FORWARD
    loadingBeltStartBackward = LOADING_BELT_START_BACKWARD
    loadingBeltStop = LOADING_BELT_STOP

    get beltIsMoving(): boolean {
        return this.beltMoving !== 'off'
    }

    beforeDestroy(): void {
        if (!this.socketIsConnected || this.beltMoving === 'off') return

        this.executeScript(BELT_STOP_SCRIPT, this.loadingBeltStop)
        this.beltMoving = 'off'
    }

    executeScript(script: string, loading: string | null = null): void {
        this.$store.dispatch('server/addEvent', { message: script, type: 'command' })

        if (loading === null) {
            this.$socket.emit('printer.gcode.script', { script })
            return
        }

        this.$socket.emit('printer.gcode.script', { script }, { loading })
    }

    runZTiltAdjust(): void {
        this.executeScript('Z_TILT_ADJUST')
    }

    runBedMeshCalibrate(): void {
        this.executeScript('BED_MESH_CALIBRATE')
    }

    runBedCooldown(): void {
        this.executeScript('BED_COOLDOWN')
    }

    runOpenDoor(): void {
        this.executeScript('OPEN_DOOR')
    }

    runCloseDoor(): void {
        this.executeScript('CLOSE_DOOR')
    }

    openThrowObjectDialog(): void {
        this.throwObjectDialog = true
    }

    closeThrowObjectDialog(): void {
        this.throwObjectDialog = false
    }

    confirmThrowObject(): void {
        this.executeScript('THROW_OBJECT')
        this.closeThrowObjectDialog()
    }

    moveBeltStepForward(): void {
        const script = `${BELT_COMMAND_BASE} DIRECTION=${BELT_DIRECTION_FORWARD}`

        this.executeScript(script, this.loadingBeltStepForward)
    }

    moveBeltStepBackward(): void {
        const script = `${BELT_COMMAND_BASE} DIRECTION=${BELT_DIRECTION_BACKWARD}`

        this.executeScript(script, this.loadingBeltStepBackward)
    }

    startBeltForward(): void {
        this.beltMoving = 'forward'
        const script = `${BELT_COMMAND_BASE} ACTION=START DIRECTION=${BELT_DIRECTION_FORWARD}`

        this.executeScript(script, this.loadingBeltStartForward)
    }

    startBeltBackward(): void {
        this.beltMoving = 'backward'
        const script = `${BELT_COMMAND_BASE} ACTION=START DIRECTION=${BELT_DIRECTION_BACKWARD}`

        this.executeScript(script, this.loadingBeltStartBackward)
    }

    stopBeltMovement(): void {
        this.executeScript(BELT_STOP_SCRIPT, this.loadingBeltStop)
        this.beltMoving = 'off'
    }
}
</script>
