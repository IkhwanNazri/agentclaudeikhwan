<script setup>
import { ref, watch } from 'vue';
import { Head, Link, router } from '@inertiajs/vue3';
import Icon from '../../Components/Icon.vue';
import ProductCard from '../../Components/ProductCard.vue';

const props = defineProps({
    products: { type: Object, required: true },
    categories: { type: Array, default: () => [] },
    filters: { type: Object, default: () => ({}) },
});

const q = ref(props.filters.q ?? '');
const sort = ref(props.filters.susun ?? 'popular');

const apply = (extra = {}) =>
    router.get(
        '/teroka',
        { q: q.value || undefined, kategori: props.filters.kategori, susun: sort.value, ...extra },
        { preserveState: true, preserveScroll: true, replace: true },
    );

let timer;
watch(q, () => {
    clearTimeout(timer);
    timer = setTimeout(() => apply(), 350);
});
watch(sort, () => apply());
</script>

<template>
    <Head title="Teroka" />
    <div class="mx-auto max-w-[1440px] px-4 py-6 md:px-[120px] md:py-10">
        <h1 class="mb-4 font-serif text-3xl font-bold text-hijau-gelap md:text-4xl">Teroka</h1>

        <label class="flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-sm">
            <Icon name="search" :size="18" class="text-kelabu" />
            <input v-model="q" type="search" placeholder="Cari produk, kedai atau koleksi..." class="w-full bg-transparent text-sm outline-none" />
        </label>

        <div class="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button
                class="shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold"
                :class="!filters.kategori ? 'bg-hijau-gelap text-white' : 'bg-white'"
                @click="apply({ kategori: undefined })"
            >
                Semua
            </button>
            <button
                v-for="c in categories"
                :key="c.id"
                class="shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold"
                :class="filters.kategori === c.slug ? 'bg-hijau-gelap text-white' : 'bg-white'"
                @click="apply({ kategori: c.slug })"
            >
                {{ c.name }}
            </button>
        </div>

        <div class="mt-4 flex items-center justify-between text-sm">
            <span class="flex items-center gap-1.5 font-semibold"><Icon name="filter" :size="16" /> {{ products.total }} produk</span>
            <label class="flex items-center gap-2">
                Susun:
                <select v-model="sort" class="rounded-lg bg-white px-2 py-1 font-semibold">
                    <option value="popular">Popular</option>
                    <option value="terbaru">Terbaru</option>
                    <option value="harga_rendah">Harga: Rendah → Tinggi</option>
                    <option value="harga_tinggi">Harga: Tinggi → Rendah</option>
                </select>
            </label>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            <ProductCard v-for="p in products.data" :key="p.id" :product="p" />
        </div>
        <p v-if="!products.data.length" class="py-16 text-center text-kelabu">Tiada produk dijumpai.</p>

        <nav v-if="products.last_page > 1" class="mt-8 flex flex-wrap justify-center gap-1.5">
            <Link
                v-for="link in products.links"
                :key="link.label"
                :href="link.url ?? ''"
                preserve-scroll
                class="rounded-lg px-3 py-1.5 text-sm"
                :class="[link.active ? 'bg-hijau-gelap text-white' : 'bg-white', !link.url && 'pointer-events-none opacity-40']"
                v-html="link.label"
            />
        </nav>
    </div>
</template>
