<script setup>
import { Link } from '@inertiajs/vue3';
import BatikPhoto from './BatikPhoto.vue';
import Icon from './Icon.vue';
import { rm } from '../format.js';

defineProps({ product: { type: Object, required: true } });
</script>

<template>
    <Link :href="`/produk/${product.slug}`" class="group block overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <BatikPhoto :src="product.image" :alt="product.name" :variant="product.id" class="aspect-square">
            <span class="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-white/90 text-hijau-gelap">
                <Icon name="heart" :size="17" />
            </span>
            <span
                v-if="product.compare_price"
                class="absolute top-2.5 left-2.5 rounded-md bg-red-600 px-1.5 py-0.5 text-[11px] font-bold text-white"
            >
                -{{ Math.round((1 - product.price / product.compare_price) * 100) }}%
            </span>
        </BatikPhoto>
        <div class="p-3">
            <h3 class="line-clamp-2 min-h-10 text-sm font-semibold group-hover:text-hijau">{{ product.name }}</h3>
            <p class="mt-1 font-bold text-hijau-gelap">{{ rm(product.price) }}</p>
            <p class="mt-1 flex items-center gap-1 text-xs text-kelabu">
                <Icon name="star" :size="13" class="text-emas" /> {{ product.rating }} ({{ product.reviews_count }})
            </p>
        </div>
    </Link>
</template>
