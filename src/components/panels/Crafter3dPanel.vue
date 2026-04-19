<template>
    <panel
        v-if="klipperReadyForGui"
        :icon="mdiWrenchCog"
        :title="$t('Panels.Crafter3dPanel.Headline')"
        :collapsible="true"
        card-class="crafter3d-panel">
        <v-card-text class="py-2">
            <!-- Top 2x2 action section -->
            <v-row dense>
                <v-col cols="6">
                    <v-btn block class="my-1" color="primary" @click="runLedOn">
                        <v-icon left small>{{ mdiLightbulbOnOutline }}</v-icon>
                        {{ $t('Panels.Crafter3dPanel.Led') }}
                    </v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn block class="my-1" color="primary" @click="runLowerZAxis">
                        <v-icon left small>{{ mdiArrowCollapseDown }}</v-icon>
                        {{ $t('Panels.Crafter3dPanel.LowerZAxis') }}
                    </v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn block class="my-1" color="primary" @click="runCalibrate">
                        <v-icon left small>{{ mdiTune }}</v-icon>
                        {{ $t('Panels.Crafter3dPanel.Calibrate') }}
                    </v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn block class="my-1" color="primary" @click="runZOffsetCalibrate">
                        <v-icon left small>{{ mdiArrowCollapseVertical }}</v-icon>
                        {{ $t('Panels.Crafter3dPanel.ZOffsetCalibrate') }}
                    </v-btn>
                </v-col>
            </v-row>

            <v-divider class="my-2" />

            <!-- Belt control strip -->
            <div class="text-body-2 text-center mb-3">{{ $t('Panels.Crafter3dPanel.BeltControls') }}</div>
            <div class="d-flex align-center belt-controls-row mb-2">
                <!-- Start backward: -inf -->
                <div class="belt-control-item belt-control-item-direction">
                    <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                            <v-btn
                                small
                                class="belt-btn belt-btn-edge-left belt-btn-dir-left"
                                :class="{ 'belt-btn--active': isStartBackwardActive }"
                                :loading="loadings.includes(loadingBeltStartBackward)"
                                v-bind="attrs"
                                v-on="on"
                                @click="startBeltBackward">
                                <span class="belt-btn-infinite">
                                    <span class="belt-btn-sign">-</span>
                                    <v-icon class="belt-btn-icon-inf">{{ mdiInfinity }}</v-icon>
                                </span>
                            </v-btn>
                        </template>
                        <span>{{ $t('Panels.Crafter3dPanel.StartBackward') }}</span>
                    </v-tooltip>
                </div>

                <!-- Move -10 -->
                <div class="belt-control-item belt-control-item-direction">
                    <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                            <v-btn
                                small
                                class="belt-btn belt-btn-inner belt-btn-dir-left"
                                :class="{ 'belt-btn--active': isStepBackwardTenActive }"
                                :disabled="beltIsMoving"
                                :loading="loadings.includes(loadingBeltStepBackwardTen)"
                                v-bind="attrs"
                                v-on="on"
                                @click="moveBeltStepBackwardTen">
                                <span class="belt-btn-label">-10</span>
                            </v-btn>
                        </template>
                        <span>{{ $t('Panels.Crafter3dPanel.MoveBackwardTen') }}</span>
                    </v-tooltip>
                </div>

                <!-- Move -1 -->
                <div class="belt-control-item belt-control-item-direction">
                    <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                            <v-btn
                                small
                                class="belt-btn belt-btn-inner belt-btn-dir-left"
                                :class="{ 'belt-btn--active': isStepBackwardActive }"
                                :disabled="beltIsMoving"
                                :loading="loadings.includes(loadingBeltStepBackward)"
                                v-bind="attrs"
                                v-on="on"
                                @click="moveBeltStepBackward">
                                <span class="belt-btn-label">-1</span>
                            </v-btn>
                        </template>
                        <span>{{ $t('Panels.Crafter3dPanel.MoveBackward') }}</span>
                    </v-tooltip>
                </div>

                <!-- Center wheel / stop -->
                <div class="belt-control-item belt-control-item-center">
                    <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                            <v-btn
                                icon
                                :color="centerWheelColor"
                                class="belt-btn-center"
                                v-bind="attrs"
                                v-on="on"
                                @click="onCenterWheelClick">
                                <v-icon>{{ centerWheelIcon }}</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ beltIsMoving ? $t('Panels.Crafter3dPanel.Stop') : $t('Panels.Crafter3dPanel.BeltControls') }}</span>
                    </v-tooltip>
                </div>

                <!-- Move +1 -->
                <div class="belt-control-item belt-control-item-direction">
                    <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                            <v-btn
                                small
                                class="belt-btn belt-btn-inner belt-btn-dir-right"
                                :class="{ 'belt-btn--active': isStepForwardActive }"
                                :disabled="beltIsMoving"
                                :loading="loadings.includes(loadingBeltStepForward)"
                                v-bind="attrs"
                                v-on="on"
                                @click="moveBeltStepForward">
                                <span class="belt-btn-label">+1</span>
                            </v-btn>
                        </template>
                        <span>{{ $t('Panels.Crafter3dPanel.MoveForward') }}</span>
                    </v-tooltip>
                </div>

                <!-- Move +10 -->
                <div class="belt-control-item belt-control-item-direction">
                    <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                            <v-btn
                                small
                                class="belt-btn belt-btn-inner belt-btn-dir-right"
                                :class="{ 'belt-btn--active': isStepForwardTenActive }"
                                :disabled="beltIsMoving"
                                :loading="loadings.includes(loadingBeltStepForwardTen)"
                                v-bind="attrs"
                                v-on="on"
                                @click="moveBeltStepForwardTen">
                                <span class="belt-btn-label">+10</span>
                            </v-btn>
                        </template>
                        <span>{{ $t('Panels.Crafter3dPanel.MoveForwardTen') }}</span>
                    </v-tooltip>
                </div>

                <!-- Start forward: +inf -->
                <div class="belt-control-item belt-control-item-direction">
                    <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                            <v-btn
                                small
                                class="belt-btn belt-btn-edge-right belt-btn-dir-right"
                                :class="{ 'belt-btn--active': isStartForwardActive }"
                                :loading="loadings.includes(loadingBeltStartForward)"
                                v-bind="attrs"
                                v-on="on"
                                @click="startBeltForward">
                                <span class="belt-btn-infinite">
                                    <span class="belt-btn-sign">+</span>
                                    <v-icon class="belt-btn-icon-inf">{{ mdiInfinity }}</v-icon>
                                </span>
                            </v-btn>
                        </template>
                        <span>{{ $t('Panels.Crafter3dPanel.StartForward') }}</span>
                    </v-tooltip>
                </div>
            </div>

            <v-divider class="my-2" />

            <!-- Bottom 2x3 action section -->
            <v-row dense>
                <v-col cols="4">
                    <v-btn block class="my-1" color="primary" @click="runOpenDoor">
                        <v-icon left small>{{ mdiDoorOpen }}</v-icon>
                        {{ $t('Panels.Crafter3dPanel.OpenDoor') }}
                    </v-btn>
                </v-col>
                <v-col cols="4">
                    <v-btn block class="my-1" color="primary" @click="runCloseDoor">
                        <v-icon left small>{{ mdiDoorClosed }}</v-icon>
                        {{ $t('Panels.Crafter3dPanel.CloseDoor') }}
                    </v-btn>
                </v-col>
                <v-col cols="4">
                    <v-btn block class="my-1" color="error" @click="openThrowObjectDialog">
                        <v-icon left small>{{ mdiEject }}</v-icon>
                        {{ $t('Panels.Crafter3dPanel.Throw') }}
                    </v-btn>
                </v-col>
                <v-col cols="4">
                    <v-btn block class="my-1" color="primary" @click="runLoadFilament">
                        <v-icon left small>{{ mdiUpload }}</v-icon>
                        <span class="action-label-full">{{ $t('Panels.Crafter3dPanel.LoadFilament') }}</span>
                        <span class="action-label-short">{{ $t('Panels.Crafter3dPanel.LoadFilamentShort') }}</span>
                    </v-btn>
                </v-col>
                <v-col cols="4">
                    <v-btn block class="my-1" color="primary" @click="runUnloadFilament">
                        <v-icon left small>{{ mdiDownload }}</v-icon>
                        <span class="action-label-full">{{ $t('Panels.Crafter3dPanel.UnloadFilament') }}</span>
                        <span class="action-label-short">{{ $t('Panels.Crafter3dPanel.UnloadFilamentShort') }}</span>
                    </v-btn>
                </v-col>
                <v-col cols="4">
                    <v-btn block class="my-1" color="primary" @click="runPurgeAndClean">
                        <v-icon left small>{{ mdiBroom }}</v-icon>
                        <span class="action-label-full">{{ $t('Panels.Crafter3dPanel.PurgeAndClean') }}</span>
                        <span class="action-label-short">{{ $t('Panels.Crafter3dPanel.PurgeAndCleanShort') }}</span>
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-text>

        <v-dialog v-model="throwObjectDialog" max-width="420">
            <v-card>
                <v-card-title class="text-h6">{{ $t('Panels.Crafter3dPanel.ThrowObjectConfirmTitle') }}</v-card-title>
                <v-card-text>{{ $t('Panels.Crafter3dPanel.ThrowObjectConfirmText') }}</v-card-text>
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
    mdiLightbulbOnOutline,
    mdiArrowCollapseDown,
    mdiTune,
    mdiArrowCollapseVertical,
    mdiDoorOpen,
    mdiDoorClosed,
    mdiEject,
    mdiUpload,
    mdiDownload,
    mdiBroom,
    mdiCogOutline,
    mdiStopCircleOutline,
    mdiInfinity,
} from '@mdi/js'

const BELT_START_FORWARD_SCRIPT = 'BELT_ON'
const BELT_START_BACKWARD_SCRIPT = 'BELT_ON DIR=-1'
const BELT_STEP_FORWARD_SCRIPT = 'BELT_MOVE DIST=10'
const BELT_STEP_BACKWARD_SCRIPT = 'BELT_MOVE DIST=-10'
const BELT_STEP_FORWARD_TEN_SCRIPT = 'BELT_MOVE DIST=100'
const BELT_STEP_BACKWARD_TEN_SCRIPT = 'BELT_MOVE DIST=-100'
const BELT_STOP_SCRIPT = 'BELT_OFF'
const BELT_THROW_SCRIPT = 'BELT_THROW'

const LOADING_BELT_STEP_FORWARD = 'crafter3dBeltStepForward'
const LOADING_BELT_STEP_BACKWARD = 'crafter3dBeltStepBackward'
const LOADING_BELT_STEP_FORWARD_TEN = 'crafter3dBeltStepForwardTen'
const LOADING_BELT_STEP_BACKWARD_TEN = 'crafter3dBeltStepBackwardTen'
const LOADING_BELT_START_FORWARD = 'crafter3dBeltStartForward'
const LOADING_BELT_START_BACKWARD = 'crafter3dBeltStartBackward'
const LOADING_BELT_STOP = 'crafter3dBeltStop'

type BeltMovingState = 'off' | 'forward' | 'backward'

@Component({
    components: { Panel },
})
export default class Crafter3dPanel extends Mixins(BaseMixin) {
    mdiWrenchCog = mdiWrenchCog
    mdiLightbulbOnOutline = mdiLightbulbOnOutline
    mdiArrowCollapseDown = mdiArrowCollapseDown
    mdiTune = mdiTune
    mdiArrowCollapseVertical = mdiArrowCollapseVertical
    mdiDoorOpen = mdiDoorOpen
    mdiDoorClosed = mdiDoorClosed
    mdiEject = mdiEject
    mdiUpload = mdiUpload
    mdiDownload = mdiDownload
    mdiBroom = mdiBroom
    mdiCogOutline = mdiCogOutline
    mdiStopCircleOutline = mdiStopCircleOutline
    mdiInfinity = mdiInfinity

    beltMoving: BeltMovingState = 'off'
    throwObjectDialog = false
    loadingBeltStepForward = LOADING_BELT_STEP_FORWARD
    loadingBeltStepBackward = LOADING_BELT_STEP_BACKWARD
    loadingBeltStepForwardTen = LOADING_BELT_STEP_FORWARD_TEN
    loadingBeltStepBackwardTen = LOADING_BELT_STEP_BACKWARD_TEN
    loadingBeltStartForward = LOADING_BELT_START_FORWARD
    loadingBeltStartBackward = LOADING_BELT_START_BACKWARD
    loadingBeltStop = LOADING_BELT_STOP

    get beltIsMoving(): boolean {
        return this.beltMoving !== 'off'
    }

    get isStepBackwardActive(): boolean {
        return this.loadings.includes(this.loadingBeltStepBackward)
    }

    get isStepForwardActive(): boolean {
        return this.loadings.includes(this.loadingBeltStepForward)
    }

    get isStepBackwardTenActive(): boolean {
        return this.loadings.includes(this.loadingBeltStepBackwardTen)
    }

    get isStepForwardTenActive(): boolean {
        return this.loadings.includes(this.loadingBeltStepForwardTen)
    }

    get isStartBackwardActive(): boolean {
        return this.beltMoving === 'backward' || this.loadings.includes(this.loadingBeltStartBackward)
    }

    get isStartForwardActive(): boolean {
        return this.beltMoving === 'forward' || this.loadings.includes(this.loadingBeltStartForward)
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

    runLedOn(): void {
        this.executeScript('TOGGLE_LED')
    }

    runLowerZAxis(): void {
        this.executeScript('Z_DROP')
    }

    runCalibrate(): void {
        this.executeScript('CALIBRATE')
    }

    runZOffsetCalibrate(): void {
        this.executeScript('PROBE_CALIBRATE')
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
        this.executeScript(BELT_THROW_SCRIPT)
        this.closeThrowObjectDialog()
    }

    runLoadFilament(): void {
        this.executeScript('LOAD_FILAMENT')
    }

    runUnloadFilament(): void {
        this.executeScript('UNLOAD_FILAMENT')
    }

    runPurgeAndClean(): void {
        this.executeScript('PARK_POS')
        this.executeScript('CLEAN_NOZZLE')
        this.executeScript('PURGE')
        this.executeScript('CLEAN_NOZZLE')
    }

    moveBeltStepForward(): void {
        this.executeScript(BELT_STEP_FORWARD_SCRIPT, this.loadingBeltStepForward)
    }

    moveBeltStepBackward(): void {
        this.executeScript(BELT_STEP_BACKWARD_SCRIPT, this.loadingBeltStepBackward)
    }

    moveBeltStepForwardTen(): void {
        this.executeScript(BELT_STEP_FORWARD_TEN_SCRIPT, this.loadingBeltStepForwardTen)
    }

    moveBeltStepBackwardTen(): void {
        this.executeScript(BELT_STEP_BACKWARD_TEN_SCRIPT, this.loadingBeltStepBackwardTen)
    }

    startBeltForward(): void {
        if (this.beltMoving === 'forward') return

        if (this.beltIsMoving) this.executeScript(BELT_STOP_SCRIPT)

        this.beltMoving = 'forward'
        this.executeScript(BELT_START_FORWARD_SCRIPT, this.loadingBeltStartForward)
    }

    startBeltBackward(): void {
        if (this.beltMoving === 'backward') return

        if (this.beltIsMoving) this.executeScript(BELT_STOP_SCRIPT)

        this.beltMoving = 'backward'
        this.executeScript(BELT_START_BACKWARD_SCRIPT, this.loadingBeltStartBackward)
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
/* Belt control strip: single unified row with blue top/bottom borders. */
.belt-controls-row {
    border-top: 2px solid var(--v-primary-base);
    border-bottom: 2px solid var(--v-primary-base);
    border-radius: 6px;
    width: 100%;
    justify-content: center;
    gap: 6px;
    padding: 2px 4px;
    overflow-x: auto;
}

.belt-control-item-direction {
    flex: 1 1 0;
    min-width: 0;
}

.belt-control-item-direction ::v-deep .v-btn {
    width: 100% !important;
}

.belt-control-item-center {
    flex: 0 0 auto;
}

.belt-btn {
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
    color: var(--v-primary-base) !important;
    min-width: 0 !important;
    padding: 0 12px !important;
    border-radius: 0 !important;
    height: 40px !important;
}

.belt-btn-center {
    margin: 0;
}

.belt-btn-edge-left {
    border-radius: 4px 0 0 4px !important;
}

.belt-btn-edge-right {
    border-radius: 0 4px 4px 0 !important;
}

.belt-btn-inner {
    border-radius: 0 !important;
}

.belt-btn--active {
    background-color: var(--v-primary-base) !important;
    color: white !important;
    --belt-dir-accent-color: white;
}

.belt-btn-dir-left,
.belt-btn-dir-right {
    --belt-dir-accent-color: var(--v-primary-base);
}

.belt-btn-dir-left {
    border-left: 2px solid var(--belt-dir-accent-color) !important;
    border-radius: 8px 0 0 8px !important;
}

.belt-btn-dir-right {
    border-right: 2px solid var(--belt-dir-accent-color) !important;
    border-radius: 0 8px 8px 0 !important;
}

.belt-btn--active .belt-btn-label {
    color: white !important;
}

.belt-btn--active .belt-btn-icon-inf {
    color: white !important;
}

.belt-btn--active .belt-btn-sign {
    color: white !important;
}

.belt-btn-infinite {
    display: flex;
    align-items: center;
    line-height: 1;
    gap: 2px;
}

.belt-btn-sign {
    font-size: 0.9rem;
    font-weight: 700;
    line-height: 1;
}

.belt-btn-icon-inf {
    font-size: 1rem !important;
}

.belt-btn-label {
    font-size: 0.85rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.01em;
}

.action-label-short {
    display: none;
}

@media (max-width: 650px) {
    .belt-btn {
        padding: 0 8px !important;
    }

    .belt-controls-row {
        gap: 4px;
    }

    .belt-btn-label {
        font-size: 0.78rem;
    }
}

@media (max-width: 760px) {
    .action-label-full {
        display: none;
    }

    .action-label-short {
        display: inline;
    }
}
</style>

