<script setup>
defineProps({
    size: { type: String, default: 'md' }, // sm | md | lg
});

// Bintang 8 bucu emas (logo DeBatik)
const points = Array.from({ length: 16 }, (_, i) => {
    const r = i % 2 === 0 ? 20 : 12;
    const a = (Math.PI / 8) * i - Math.PI / 2;
    return `${20 + r * Math.cos(a)},${20 + r * Math.sin(a)}`;
}).join(' ');
</script>

<template>
    <a href="/" class="flex items-center gap-2.5 text-white" aria-label="DeBatik — Utama">
        <svg
            viewBox="0 0 40 40"
            :class="{ 'size-8': size === 'sm', 'size-10': size === 'md', 'size-12': size === 'lg' }"
            aria-hidden="true"
        >
            <polygon :points="points" class="fill-emas" />
            <circle cx="20" cy="20" r="6" class="fill-hijau-gelap" />
        </svg>
        <span class="leading-none">
            <span
                class="block font-serif font-bold"
                :class="{ 'text-[22px]': size === 'sm', 'text-[28px]': size === 'md', 'text-[34px]': size === 'lg' }"
                >DeBatik</span
            >
            <span class="mt-0.5 block text-[8px] font-semibold tracking-[0.18em]">PASARAYA BATIK MALAYSIA</span>
        </span>
    </a>
</template>
