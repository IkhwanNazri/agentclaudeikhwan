<script setup>
import { computed } from 'vue';

const props = defineProps({
    name: { type: String, required: true },
    size: { type: [Number, String], default: 24 },
    stroke: { type: [Number, String], default: 1.8 },
});

// Ikon 24x24 garis (ikut fail Figma). Ikon dalam FILLED diisi warna.
const PATHS = {
    store: 'M3 9l1.5-5h15L21 9M3 9h18M4 9v11h16V9M9 20v-6h6v6',
    bag: 'M5 8h14l-1 13H6L5 8zM9 8V6c0-3 6-3 6 0v2',
    shield: 'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3zM8.5 12l2.5 2.5 4.5-5',
    search: 'M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM15.5 15.5L20 20',
    cart: 'M3 4h3l2 11h10l2-8H7M9 19.5h.1M17 19.5h.1',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    back: 'M19 12H5M11 6l-6 6 6 6',
    truck: 'M2 6h12v10H2zM14 10h4l3 3v3h-7M6 18.5h.1M17 18.5h.1',
    headset: 'M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v5H4zM20 14h-3v5h3z',
    play: 'M8 6l10 6-10 6z',
    radio: 'M12 12h.1M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.5 5.5a9.2 9.2 0 0 0 0 13M18.5 5.5a9.2 9.2 0 0 1 0 13',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5',
    check: 'M6 12.5l4 4 8-8.5',
    home: 'M3 11l9-8 9 8M5 9.5V21h14V9.5M10 21v-6h4v6',
    heart: 'M12 20s-9-5.5-9-11.5C3 6 5 4 7.5 4c2 0 3.5 1 4.5 2.5C13 5 14.5 4 16.5 4 19 4 21 6 21 8.5 21 14.5 12 20 12 20z',
    menu: 'M4 7h16M4 12h16M4 17h16',
    video: 'M3 6h13v12H3zM16 10l5-3v10l-5-3',
    star: 'M12 3l2.6 5.8 6.4.6-4.8 4.3 1.4 6.3L12 16.8 6.4 20l1.4-6.3L3 9.4l6.4-.6z',
    filter: 'M4 6h16M7 12h10M10 18h4',
    sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
    minus: 'M5 12h14',
    plus: 'M12 5v14M5 12h14',
};
const FILLED = ['play', 'star'];

const d = computed(() => PATHS[props.name] ?? '');
const filled = computed(() => FILLED.includes(props.name));
</script>

<template>
    <svg
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        :fill="filled ? 'currentColor' : 'none'"
        :stroke="filled ? 'none' : 'currentColor'"
        :stroke-width="stroke"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path :d="d" />
    </svg>
</template>
