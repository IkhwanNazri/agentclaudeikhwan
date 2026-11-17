<script setup>
import { Head, Link } from '@inertiajs/vue3';
import Icon from '../Components/Icon.vue';
import BatikPhoto from '../Components/BatikPhoto.vue';
import SectionHeader from '../Components/SectionHeader.vue';
import CategoryCard from '../Components/CategoryCard.vue';
import LiveCard from '../Components/LiveCard.vue';
import ShopCard from '../Components/ShopCard.vue';

defineProps({
    categories: { type: Array, default: () => [] },
    lives: { type: Array, default: () => [] },
    shops: { type: Array, default: () => [] },
});

const FEATURES = [
    { icon: 'store', label: ['Buka Kedai', 'Sendiri'] },
    { icon: 'live', label: ['Jual Secara', 'Live'] },
    { icon: 'bag', label: ['Ribuan', 'Produk Batik'] },
    { icon: 'shield', label: ['Sokong', 'Pengusaha Tempatan'] },
];
</script>

<template>
    <Head title="Pasaraya Batik Malaysia" />

    <!-- Hero -->
    <section class="relative">
        <div class="relative h-[400px] overflow-hidden bg-gradient-to-br from-hijau-gelap to-hijau md:h-[600px]">
            <!-- daun emas -->
            <span class="absolute top-[250px] -left-12 h-[70px] w-[150px] rotate-[35deg] rounded-full bg-emas/30 md:top-[330px] md:-left-20 md:h-[120px] md:w-[260px]" />
            <span class="absolute right-[-40px] bottom-6 h-[70px] w-[160px] -rotate-[25deg] rounded-full bg-emas/35 md:h-[120px] md:w-[280px]" />

            <BatikPhoto
                :variant="0"
                alt="Model berbaju batik"
                class="absolute inset-y-0 right-0 w-[64%] md:w-[54%]"
                style="background: linear-gradient(135deg, #0f5c45, #063b2d)"
            >
                <div class="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-hijau-gelap to-transparent" />
            </BatikPhoto>

            <div class="relative mx-auto h-full max-w-[1440px] px-6 pt-12 md:px-[120px] md:pt-[92px]">
                <p class="text-xs font-semibold tracking-[0.45em] text-emas md:text-lg">PASARAYA</p>
                <h1 class="mt-3 font-serif text-[46px] leading-[0.95] font-bold text-white md:mt-5 md:text-8xl">Batik<br />Malaysia</h1>
                <p class="mt-3 text-sm leading-relaxed text-white md:mt-5 md:text-[22px]">Temui, Beli &amp; Sokong<br />Karya Batik Tempatan</p>
                <Link
                    href="/teroka"
                    class="mt-5 inline-flex items-center gap-2 rounded-full bg-emas px-5 py-3 text-sm font-semibold text-hijau-gelap shadow-lg transition hover:brightness-105 md:mt-7 md:px-[30px] md:py-4 md:text-lg"
                >
                    Beli Sekarang <Icon name="arrow" :size="20" :stroke="2" />
                </Link>
            </div>
        </div>

        <!-- Kelebihan -->
        <div class="relative z-10 mx-auto -mt-11 max-w-[1200px] px-4 md:-mt-16 md:px-0">
            <div class="grid grid-cols-4 rounded-[18px] bg-white px-2 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)] md:rounded-[22px] md:px-6 md:py-6">
                <div
                    v-for="(f, i) in FEATURES"
                    :key="f.icon"
                    class="flex flex-col items-center gap-2 text-center md:gap-2.5"
                    :class="{ 'md:border-l md:border-pasir': i > 0 }"
                >
                    <span
                        v-if="f.icon === 'live'"
                        class="flex items-center gap-1 rounded-md bg-hijau-gelap px-1.5 py-0.5 text-[9px] font-bold text-white md:px-2 md:py-1 md:text-[13px]"
                    >
                        LIVE <Icon name="play" :size="12" />
                    </span>
                    <Icon v-else :name="f.icon" :size="34" :stroke="1.6" class="size-[26px] text-hijau-gelap md:size-9" />
                    <span class="text-[11px] leading-tight font-semibold md:text-base">{{ f.label[0] }}<br />{{ f.label[1] }}</span>
                </div>
            </div>
        </div>
    </section>

    <div class="mx-auto max-w-[1440px] space-y-8 px-4 py-7 md:space-y-14 md:px-[120px] md:py-14">
        <!-- Koleksi Pilihan -->
        <section>
            <SectionHeader title="Koleksi Pilihan" href="/teroka" />
            <div class="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-6 md:gap-4 md:px-0">
                <CategoryCard
                    v-for="(c, i) in categories"
                    :key="c.id"
                    :category="c"
                    :index="i"
                    class="w-[31%] shrink-0 snap-start md:w-auto"
                />
            </div>
        </section>

        <!-- Sedang LIVE -->
        <section>
            <SectionHeader title="Sedang LIVE Sekarang" icon="radio" href="/live" :line="false" />
            <div class="grid grid-cols-2 gap-2 md:grid-cols-[repeat(3,280px)_1fr] md:gap-5">
                <LiveCard v-for="(l, i) in lives" :key="l.id" :live="l" :index="i" :class="{ 'max-md:hidden': i > 1 }" />
                <div
                    class="relative hidden overflow-hidden rounded-2xl bg-gradient-to-br from-hijau-gelap to-hijau p-6 md:block"
                >
                    <span class="absolute top-36 left-40 h-20 w-52 -rotate-[35deg] rounded-full bg-emas/55" />
                    <span class="absolute top-16 left-52 h-14 w-40 -rotate-[35deg] rounded-full bg-emas/55" />
                    <h3 class="relative font-serif text-[28px] leading-tight font-bold text-white">Sokong<br />Pengusaha<br />Batik Tempatan</h3>
                    <p class="relative mt-3 text-xs leading-relaxed text-white/80">Bersama Memartabatkan<br />Warisan Budaya Malaysia</p>
                </div>
            </div>
            <p v-if="!lives.length" class="text-sm text-kelabu">Tiada live buat masa ini.</p>
        </section>

        <!-- Kedai Popular -->
        <section>
            <SectionHeader title="Kedai Popular" icon="store" href="/kedai" />
            <div class="grid gap-4 md:grid-cols-3">
                <ShopCard v-for="(s, i) in shops" :key="s.id" :shop="s" :index="i" :class="{ 'max-md:hidden': i > 0 }" />
            </div>
        </section>
    </div>
</template>
