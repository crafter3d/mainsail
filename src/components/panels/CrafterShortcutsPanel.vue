<template>
    <panel
        v-if="klipperReadyForGui"
        :icon="mdiApps"
        :title="$t('Panels.CrafterShortcutsPanel.Headline')"
        :collapsible="true"
        card-class="crafter-shortcuts-panel">
        <v-card-text class="py-2">
            <v-row dense class="shortcut-grid">
                <v-col cols="4">
                    <v-btn class="shortcut-btn" block color="primary" :disabled="isPrinting" @click="doSend('G28')">
                        <span class="shortcut-content">
                            <v-icon>{{ mdiHome }}</v-icon>
                            <span class="shortcut-label">{{ $t('Panels.CrafterShortcutsPanel.Home') }}</span>
                        </span>
                    </v-btn>
                </v-col>
                <v-col cols="4">
                    <v-btn
                        class="shortcut-btn"
                        block
                        color="primary"
                        :disabled="isPrinting"
                        @click="doSend('TOGGLE_LED')">
                        <span class="shortcut-content">
                            <v-icon>{{ mdiLightbulbOutline }}</v-icon>
                            <span class="shortcut-label">{{ $t('Panels.CrafterShortcutsPanel.Light') }}</span>
                        </span>
                    </v-btn>
                </v-col>
                <v-col cols="4">
                    <v-btn
                        class="shortcut-btn"
                        block
                        color="primary"
                        :disabled="isPrinting"
                        @click="doSend('BELT_THROW')">
                        <span class="shortcut-content">
                            <v-icon>{{ mdiRotateRight }}</v-icon>
                            <span class="shortcut-label">{{ $t('Panels.CrafterShortcutsPanel.BeltThrow') }}</span>
                        </span>
                    </v-btn>
                </v-col>
                <v-col cols="4">
                    <v-btn
                        class="shortcut-btn"
                        block
                        color="primary"
                        :disabled="isPrinting"
                        @click="doSend('CUT_FILAMENT')">
                        <span class="shortcut-content">
                            <v-icon>{{ mdiContentCut }}</v-icon>
                            <span class="shortcut-label">{{ $t('Panels.CrafterShortcutsPanel.FilamentCut') }}</span>
                        </span>
                    </v-btn>
                </v-col>
                <v-col cols="4">
                    <v-btn class="shortcut-btn" block color="primary" :disabled="isPrinting" @click="doPurgeAndClean">
                        <span class="shortcut-content">
                            <v-icon>{{ mdiBroom }}</v-icon>
                            <span class="shortcut-label">{{ $t('Panels.CrafterShortcutsPanel.PurgeAndClean') }}</span>
                        </span>
                    </v-btn>
                </v-col>
                <v-col cols="4">
                    <v-btn class="shortcut-btn" block color="primary" :disabled="isPrinting" @click="doSend('Z_DROP')">
                        <span class="shortcut-content">
                            <v-icon>{{ mdiArrowCollapseDown }}</v-icon>
                            <span class="shortcut-label">{{ $t('Panels.CrafterShortcutsPanel.LowerZAxis') }}</span>
                        </span>
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import Panel from '@/components/ui/Panel.vue'
import {
    mdiApps,
    mdiArrowCollapseDown,
    mdiBroom,
    mdiContentCut,
    mdiHome,
    mdiLightbulbOutline,
    mdiRotateRight,
} from '@mdi/js'

@Component({
    components: { Panel },
})
export default class CrafterShortcutsPanel extends Mixins(BaseMixin, ControlMixin) {
    mdiApps = mdiApps
    mdiArrowCollapseDown = mdiArrowCollapseDown
    mdiBroom = mdiBroom
    mdiContentCut = mdiContentCut
    mdiHome = mdiHome
    mdiLightbulbOutline = mdiLightbulbOutline
    mdiRotateRight = mdiRotateRight

    get isPrinting(): boolean {
        return this.printer_state === 'printing'
    }

    doPurgeAndClean(): void {
        this.doSend('PURGE')
        this.doSend('CLEAN_NOZZLE')
    }
}
</script>

<style scoped>
.shortcut-btn {
    aspect-ratio: 1 / 1;
    height: auto !important;
    min-height: 5rem;
    overflow: hidden;
}

.shortcut-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    line-height: 1.15;
    gap: 0.2rem;
}

.shortcut-label {
    width: 100%;
    font-size: 0.75rem;
    line-height: 1.05;
    text-align: center;
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
    overflow: hidden;
    text-overflow: unset;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.shortcut-grid {
    margin: 0;
}

::v-deep .shortcut-grid > .col {
    padding: 4px;
}

@media (max-width: 1440px) {
    .shortcut-content {
        gap: 0.15rem;
    }

    ::v-deep .shortcut-btn .v-icon {
        font-size: 1.05rem;
    }

    .shortcut-label {
        font-size: 0.64rem;
        line-height: 1;
    }
}
</style>
