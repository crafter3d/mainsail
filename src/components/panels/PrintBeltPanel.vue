<template>
    <panel
        v-if="klipperReadyForGui"
        :icon="mdiWrenchCog"
        :title="$t('Panels.PrintBeltPanel.Headline')"
        :collapsible="true"
        card-class="print-belt-panel">
        <v-card-text class="py-2">
            <!-- 2×3 action button grid -->
            <v-row dense>
                <v-col cols="6" class="d-flex flex-column">
                    <v-btn block class="my-1" color="primary" @click="runZTiltAdjust">
                        <v-icon left small>{{ mdiAdjust }}</v-icon>
                        {{ $t('Panels.PrintBeltPanel.ZTiltAdjust') }}
                    </v-btn>
                    <v-btn block class="my-1" color="primary" @click="runBedMeshCalibrate">
                        <v-icon left small>{{ mdiGrid }}</v-icon>
                        {{ $t('Panels.PrintBeltPanel.BedMeshCalibrate') }}
                    </v-btn>
                    <v-btn block class="my-1" color="primary" @click="runBedCooldown">
                        <v-icon left small>{{ mdiSnowflake }}</v-icon>
                        {{ $t('Panels.PrintBeltPanel.BedCooldown') }}
                    </v-btn>
                </v-col>
                <v-col cols="6" class="d-flex flex-column">
                    <v-btn block class="my-1" color="primary" @click="runOpenDoor">
                        <v-icon left small>{{ mdiDoorOpen }}</v-icon>
                        {{ $t('Panels.PrintBeltPanel.OpenDoor') }}
                    </v-btn>
                    <v-btn block class="my-1" color="error" @click="openThrowObjectDialog">
                        <v-icon left small>{{ mdiEject }}</v-icon>
                        {{ $t('Panels.PrintBeltPanel.ThrowObject') }}
                    </v-btn>
                    <v-btn block class="my-1" color="primary" @click="runCloseDoor">
                        <v-icon left small>{{ mdiDoorClosed }}</v-icon>
                        {{ $t('Panels.PrintBeltPanel.CloseDoor') }}
                    </v-btn>
                </v-col>
            </v-row>

            <v-divider class="my-2" />

            <!-- Belt control strip -->
            <div class="text-body-2 text-center mb-3">{{ $t('Panels.PrintBeltPanel.BeltControls') }}</div>
            <div class="d-flex justify-center align-center mb-2">
                <!-- Start Backward: ←∞ -->
                <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                        <v-btn
                            icon
                            color="primary"
                            :disabled="beltMoving === 'backward'"
                            :loading="loadings.includes(loadingBeltStartBackward)"
                            v-bind="attrs"
                            v-on="on"
                            @click="startBeltBackward">
                            <span class="belt-btn-continuous belt-btn-continuous--backward">
                                <v-icon small>{{ mdiArrowLeft }}</v-icon>
                                <span class="belt-btn-infinity">∞</span>
                            </span>
                        </v-btn>
                    </template>
                    <span>{{ $t('Panels.PrintBeltPanel.StartBackward') }}</span>
                </v-tooltip>

                <!-- Move -1 -->
                <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                        <v-btn
                            icon
                            color="primary"
                            :disabled="beltIsMoving"
                            :loading="loadings.includes(loadingBeltStepBackward)"
                            v-bind="attrs"
                            v-on="on"
                            @click="moveBeltStepBackward">
                            <v-icon>{{ mdiChevronLeft }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('Panels.PrintBeltPanel.MoveBackward') }}</span>
                </v-tooltip>

                <!-- Center wheel / stop -->
                <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                        <v-btn icon :color="centerWheelColor" v-bind="attrs" v-on="on" @click="onCenterWheelClick">
                            <v-icon large>{{ centerWheelIcon }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ beltIsMoving ? $t('Panels.PrintBeltPanel.Stop') : $t('Panels.PrintBeltPanel.BeltControls') }}</span>
                </v-tooltip>

                <!-- Move +1 -->
                <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                        <v-btn
                            icon
                            color="primary"
                            :disabled="beltIsMoving"
                            :loading="loadings.includes(loadingBeltStepForward)"
                            v-bind="attrs"
                            v-on="on"
                            @click="moveBeltStepForward">
                            <v-icon>{{ mdiChevronRight }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('Panels.PrintBeltPanel.MoveForward') }}</span>
                </v-tooltip>

                <!-- Start Forward: ∞→ -->
                <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                        <v-btn
                            icon
                            color="primary"
                            :disabled="beltMoving === 'forward'"
                            :loading="loadings.includes(loadingBeltStartForward)"
                            v-bind="attrs"
                            v-on="on"
                            @click="startBeltForward">
                            <span class="belt-btn-continuous belt-btn-continuous--forward">
                                <span class="belt-btn-infinity">∞</span>
                                <v-icon small>{{ mdiArrowRight }}</v-icon>
                            </span>
                        </v-btn>
                    </template>
                    <span>{{ $t('Panels.PrintBeltPanel.StartForward') }}</span>
                </v-tooltip>
            </div>
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
import {
    mdiWrenchCog,
    mdiAdjust,
    mdiGrid,
    mdiSnowflake,
    mdiDoorOpen,
    mdiDoorClosed,
    mdiEject,
    mdiCogOutline,
    mdiStopCircleOutline,
    mdiChevronLeft,
    mdiChevronRight,
    mdiArrowLeft,
    mdiArrowRight,
} from '@mdi/js'

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
    mdiAdjust = mdiAdjust
    mdiGrid = mdiGrid
    mdiSnowflake = mdiSnowflake
    mdiDoorOpen = mdiDoorOpen
    mdiDoorClosed = mdiDoorClosed
    mdiEject = mdiEject
    mdiCogOutline = mdiCogOutline
    mdiStopCircleOutline = mdiStopCircleOutline
    mdiChevronLeft = mdiChevronLeft
    mdiChevronRight = mdiChevronRight
    mdiArrowLeft = mdiArrowLeft
    mdiArrowRight = mdiArrowRight

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

    get centerWheelIcon(): string {
        return this.beltIsMoving ? this.mdiStopCircleOutline : this.mdiCogOutline
    }

    get centerWheelColor(): string {
        return this.beltIsMoving ? 'error' : 'grey'
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

    onCenterWheelClick(): void {
        if (!this.beltIsMoving) return

        this.stopBeltMovement()
    }
}
</script>

<style scoped>
.belt-btn-continuous {
    display: flex;
    align-items: center;
    line-height: 1;
}

.belt-btn-infinity {
    font-size: 0.85rem;
    font-weight: bold;
    line-height: 1;
}
</style>
