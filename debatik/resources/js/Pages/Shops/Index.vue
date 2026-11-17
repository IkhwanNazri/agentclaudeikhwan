<script setup>
import { Head } from '@inertiajs/vue3';
import ShopCard from '../../Components/ShopCard.vue';

defineProps({ shops: { type: Array, default: () => [] } });
</script>

<template>
    <Head title="Kedai" />
    <div class="mx-auto max-w-[1440px] px-4 py-6 md:px-[120px] md:py-10">
        <h1 class="mb-6 font-serif text-3xl font-bold text-hijau-gelap md:text-4xl">Semua Kedai</h1>
        <div class="grid gap-4 md:grid-cols-3">
            <ShopCard v-for="(s, i) in shops" :key="s.id" :shop="s" :index="i" />
        </div>
    </div>
</template>
