<script setup>
import { Head, Link } from '@inertiajs/vue3';
import Icon from '../Components/Icon.vue';

defineProps({ title: { type: String, required: true } });
</script>

<template>
    <Head :title="title" />
    <div class="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
        <span class="grid size-20 place-items-center rounded-full bg-hijau-gelap text-emas"><Icon name="sparkle" :size="38" /></span>
        <h1 class="mt-6 font-serif text-3xl font-bold text-hijau-gelap">{{ title }}</h1>
        <p class="mt-2 text-kelabu">Modul ini sedang dibina. Nantikan!</p>
        <Link href="/" class="mt-6 rounded-full bg-emas px-6 py-3 font-semibold text-hijau-gelap">Kembali ke Utama</Link>
    </div>
</template>
