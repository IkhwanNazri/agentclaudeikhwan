<script setup>
import { computed, useAttrs } from 'vue';

// Gambar produk/kategori. Kalau tiada `src`, papar latar batik placeholder (ikut Figma).
const props = defineProps({
    src: { type: String, default: null },
    alt: { type: String, default: '' },
    variant: { type: Number, default: 0 },
    person: { type: Boolean, default: true },
    fade: { type: Boolean, default: false },
});

// Kalau pemanggil beri `absolute`, jangan timpa dengan `relative`.
const attrs = useAttrs();
const positioned = computed(() => /\b(absolute|fixed)\b/.test(String(attrs.class ?? '')));

const PALETTES = [
    ['#025A42', '#063B2D'],
    ['#9A611F', '#40210D'],
    ['#80386F', '#381433'],
    ['#3866A6', '#0F244D'],
    ['#D9AD52', '#6B471A'],
];

const bg = computed(() => {
    const [a, b] = PALETTES[Math.abs(props.variant) % PALETTES.length];
    return `linear-gradient(135deg, ${a}, ${b})`;
});
</script>

<template>
    <div class="overflow-hidden" :class="{ relative: !positioned }" :style="{ background: bg }">
        <img v-if="src" :src="src" :alt="alt" class="absolute inset-0 size-full object-cover" loading="lazy" />
        <template v-else>
            <svg class="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <g fill="none" stroke="#D4AF37" stroke-opacity=".4" stroke-width="1.2" stroke-dasharray="2 1.5">
                    <circle cx="15" cy="20" r="17" />
                    <circle cx="85" cy="75" r="22" />
                    <circle cx="90" cy="10" r="11" />
                    <circle cx="10" cy="90" r="12" />
                </g>
                <g v-if="person" fill="#fff">
                    <circle cx="50" cy="31" r="11" fill-opacity=".2" />
                    <rect x="25" y="46" width="50" height="80" rx="25" fill-opacity=".15" />
                </g>
            </svg>
            <span class="sr-only">{{ alt }}</span>
        </template>
        <div v-if="fade" class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
        <slot />
    </div>
</template>
