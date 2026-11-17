<script setup>
import { ref } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import Icon from '../../Components/Icon.vue';
import BatikPhoto from '../../Components/BatikPhoto.vue';
import ShopCard from '../../Components/ShopCard.vue';
import ProductCard from '../../Components/ProductCard.vue';
import { rm } from '../../format.js';

const props = defineProps({
    product: { type: Object, required: true },
    related: { type: Array, default: () => [] },
});

const SIZES = ['S', 'M', 'L', 'XL'];
const size = ref('M');
const variant = ref(0);
const qty = ref(1);
const discount = props.product.compare_price
    ? Math.round((1 - props.product.price / props.product.compare_price) * 100)
    : 0;
</script>

<template>
    <Head :title="product.name" />
    <div class="mx-auto max-w-[1200px] px-4 py-6 md:py-10">
        <Link href="/teroka" class="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:text-hijau">
            <Icon name="back" :size="18" /> Kembali
        </Link>

        <div class="grid gap-6 md:grid-cols-2 md:gap-12">
            <BatikPhoto :src="product.image" :alt="product.name" :variant="product.id + variant" class="aspect-square rounded-3xl" />

            <div>
                <p v-if="product.category" class="text-sm font-semibold text-hijau">{{ product.category.name }}</p>
                <h1 class="mt-1 font-serif text-2xl font-bold md:text-4xl">{{ product.name }}</h1>
                <p class="mt-2 flex items-center gap-1.5 text-sm">
                    <Icon name="star" :size="16" class="text-emas" />
                    <b>{{ product.rating }}</b>
                    <span class="text-kelabu">({{ product.reviews_count }} ulasan) · {{ product.sold_count }} terjual</span>
                </p>

                <div class="mt-4 flex items-center gap-3">
                    <span class="text-3xl font-bold text-red-700">{{ rm(product.price) }}</span>
                    <template v-if="discount">
                        <span class="text-kelabu line-through">{{ rm(product.compare_price) }}</span>
                        <span class="rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white">-{{ discount }}%</span>
                    </template>
                </div>

                <h2 class="mt-6 text-sm font-semibold">Variasi Warna</h2>
                <div class="mt-2 flex gap-2">
                    <button
                        v-for="v in 4"
                        :key="v"
                        class="rounded-xl ring-2 ring-offset-2 ring-offset-krim"
                        :class="variant === v - 1 ? 'ring-hijau' : 'ring-transparent'"
                        :aria-label="`Warna ${v}`"
                        @click="variant = v - 1"
                    >
                        <BatikPhoto :variant="product.id + v - 1" :person="false" class="size-14 rounded-xl" />
                    </button>
                </div>

                <h2 class="mt-5 text-sm font-semibold">Saiz</h2>
                <div class="mt-2 flex gap-2">
                    <button
                        v-for="s in SIZES"
                        :key="s"
                        class="h-10 w-12 rounded-xl border text-sm font-semibold"
                        :class="size === s ? 'border-hijau bg-hijau text-white' : 'border-pasir bg-white'"
                        @click="size = s"
                    >
                        {{ s }}
                    </button>
                </div>

                <h2 class="mt-5 text-sm font-semibold">Kuantiti <span class="font-normal text-kelabu">(stok {{ product.stock }})</span></h2>
                <div class="mt-2 inline-flex items-center rounded-full bg-white">
                    <button class="grid size-10 place-items-center" aria-label="Kurang" @click="qty = Math.max(1, qty - 1)"><Icon name="minus" :size="16" /></button>
                    <span class="w-8 text-center font-semibold">{{ qty }}</span>
                    <button class="grid size-10 place-items-center" aria-label="Tambah" @click="qty = Math.min(product.stock, qty + 1)"><Icon name="plus" :size="16" /></button>
                </div>

                <div class="mt-6 flex gap-3">
                    <Link href="/troli" class="grid size-12 place-items-center rounded-full border-2 border-hijau text-hijau" aria-label="Tambah ke troli">
                        <Icon name="cart" :stroke="2" />
                    </Link>
                    <Link href="/troli" class="flex-1 rounded-full bg-hijau py-3 text-center font-semibold text-white hover:bg-hijau-gelap">Beli Sekarang</Link>
                </div>

                <p class="mt-6 text-sm leading-relaxed text-kelabu">{{ product.description }}</p>

                <ShopCard :shop="product.shop" class="mt-6" />
            </div>
        </div>

        <section v-if="related.length" class="mt-12">
            <h2 class="mb-4 font-serif text-2xl font-bold text-hijau-gelap">Lagi dari kedai ini</h2>
            <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
                <ProductCard v-for="p in related" :key="p.id" :product="p" />
            </div>
        </section>
    </div>
</template>
