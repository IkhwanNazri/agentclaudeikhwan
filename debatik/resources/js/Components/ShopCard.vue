<script setup>
import { Link } from '@inertiajs/vue3';
import BatikPhoto from './BatikPhoto.vue';
import Icon from './Icon.vue';
import { compact } from '../format.js';

defineProps({ shop: { type: Object, required: true }, index: { type: Number, default: 0 } });
const LOGO_BG = ['bg-hijau-gelap', 'bg-[#142663]', 'bg-[#4d2e0d]'];
</script>

<template>
    <Link
        :href="`/kedai/${shop.slug}`"
        class="relative flex items-center gap-4 overflow-hidden rounded-[18px] bg-white p-4 pr-24 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 md:p-5 md:pr-24"
    >
        <span class="grid size-14 shrink-0 place-items-center rounded-full md:size-16" :class="LOGO_BG[index % 3]">
            <img v-if="shop.logo" :src="shop.logo" :alt="shop.name" class="size-full rounded-full object-cover" />
            <Icon v-else name="sparkle" :size="30" class="text-emas" />
        </span>
        <span class="min-w-0 flex-1">
            <span class="flex items-center gap-1.5">
                <span class="truncate text-lg font-bold md:text-xl">{{ shop.name }}</span>
                <span v-if="shop.is_verified" class="grid size-4 shrink-0 place-items-center rounded-full bg-blue-600 text-white" title="Disahkan">
                    <Icon name="check" :size="12" :stroke="3" />
                </span>
            </span>
            <span class="mt-1 flex items-center gap-1.5 text-xs md:text-[13px]">
                <Icon name="star" :size="14" class="text-emas" />
                <span class="font-semibold">{{ shop.rating }}</span>
                <span class="whitespace-nowrap text-kelabu">· {{ compact(shop.followers_count) }} pengikut</span>
            </span>
        </span>
        <BatikPhoto :variant="[0, 3, 1][index % 3]" :person="false" class="absolute inset-y-0 right-0 w-20 rounded-l-full" />
    </Link>
</template>
