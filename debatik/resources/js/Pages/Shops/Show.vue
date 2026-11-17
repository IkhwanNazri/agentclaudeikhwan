<script setup>
import { Head, Link } from '@inertiajs/vue3';
import Icon from '../../Components/Icon.vue';
import BatikPhoto from '../../Components/BatikPhoto.vue';
import ProductCard from '../../Components/ProductCard.vue';
import { compact } from '../../format.js';

defineProps({
    shop: { type: Object, required: true },
    products: { type: Object, required: true },
    live: { type: Object, default: null },
});
</script>

<template>
    <Head :title="shop.name" />
    <BatikPhoto :variant="shop.id" :person="false" class="h-40 md:h-56" />
    <div class="mx-auto max-w-[1200px] px-4">
        <div class="-mt-12 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] md:flex-row md:items-center md:p-7">
            <span class="grid size-20 shrink-0 place-items-center rounded-full bg-hijau-gelap">
                <Icon name="sparkle" :size="40" class="text-emas" />
            </span>
            <div class="flex-1">
                <h1 class="flex items-center gap-2 font-serif text-2xl font-bold md:text-3xl">
                    {{ shop.name }}
                    <span v-if="shop.is_verified" class="grid size-5 place-items-center rounded-full bg-blue-600 text-white"><Icon name="check" :size="14" :stroke="3" /></span>
                </h1>
                <p class="mt-1 flex items-center gap-1.5 text-sm">
                    <Icon name="star" :size="15" class="text-emas" /> <b>{{ shop.rating }}</b>
                    <span class="text-kelabu">· {{ compact(shop.followers_count) }} pengikut</span>
                </p>
                <p class="mt-2 text-sm text-kelabu">{{ shop.description }}</p>
            </div>
            <div class="flex gap-2">
                <Link v-if="live" href="/live" class="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2.5 text-sm font-bold text-white">
                    <Icon name="radio" :size="18" :stroke="2" /> Sedang LIVE
                </Link>
                <button class="rounded-full bg-emas px-5 py-2.5 text-sm font-semibold text-hijau-gelap">+ Ikut</button>
            </div>
        </div>

        <h2 class="mt-10 mb-4 font-serif text-2xl font-bold text-hijau-gelap">Produk ({{ products.total }})</h2>
        <div class="grid grid-cols-2 gap-3 pb-12 md:grid-cols-4 md:gap-5">
            <ProductCard v-for="p in products.data" :key="p.id" :product="p" />
        </div>
    </div>
</template>
