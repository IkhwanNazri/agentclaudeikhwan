<script setup>
import { Link } from '@inertiajs/vue3';
import Icon from './Icon.vue';

defineProps({
    title: { type: String, required: true },
    href: { type: String, default: null },
    icon: { type: String, default: null },
    line: { type: Boolean, default: true },
});
</script>

<template>
    <div class="mb-4 flex items-center gap-3 md:mb-6">
        <Icon v-if="icon" :name="icon" :size="26" :stroke="2" :class="icon === 'radio' ? 'text-red-600' : 'text-hijau-gelap'" />
        <h2 class="font-serif text-xl font-bold whitespace-nowrap text-hijau-gelap md:text-[34px]">{{ title }}</h2>
        <span v-if="line" class="hidden h-0.5 w-14 bg-emas md:block" />
        <Link v-if="href" :href="href" class="ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold hover:text-hijau md:text-sm">
            Lihat Semua <Icon name="arrow" :size="15" :stroke="2" />
        </Link>
    </div>
</template>
