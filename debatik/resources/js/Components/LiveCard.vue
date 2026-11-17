<script setup>
import { Link } from '@inertiajs/vue3';
import BatikPhoto from './BatikPhoto.vue';
import Icon from './Icon.vue';
import { compact } from '../format.js';

defineProps({ live: { type: Object, required: true }, index: { type: Number, default: 0 } });
const VARIANTS = [2, 3, 1];
</script>

<template>
    <Link :href="`/live`" class="group block">
        <BatikPhoto
            :src="live.cover"
            :alt="live.title"
            :variant="VARIANTS[index % VARIANTS.length]"
            fade
            class="aspect-[175/190] rounded-2xl md:aspect-[280/250]"
        >
            <div class="absolute top-2.5 left-2.5 flex gap-1.5 md:top-3 md:left-3">
                <span class="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white md:text-xs">LIVE</span>
                <span class="flex items-center gap-1 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white md:text-xs">
                    <Icon name="user" :size="12" :stroke="2.2" /> {{ compact(live.viewers_count) }}
                </span>
            </div>
            <span class="absolute bottom-3 left-3 text-sm font-semibold text-white md:bottom-4 md:left-4 md:text-lg">
                {{ live.shop?.name }}
            </span>
            <span
                class="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full border-2 border-white bg-black/35 text-white transition group-hover:scale-110 md:size-11"
            >
                <Icon name="play" :size="18" />
            </span>
        </BatikPhoto>
    </Link>
</template>
