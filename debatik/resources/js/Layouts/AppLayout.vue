<script setup>
import { computed } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';
import Logo from '../Components/Logo.vue';
import Icon from '../Components/Icon.vue';

const page = usePage();
const user = computed(() => page.props.auth?.user);
const cartCount = computed(() => page.props.cartCount ?? 0);

const NAV = [
    { label: 'Utama', href: '/' },
    { label: 'Teroka', href: '/teroka' },
    { label: 'Kedai', href: '/kedai' },
    { label: 'Live', href: '/live' },
    { label: 'AI DeBatik', href: '/ai' },
];

const isActive = (href) => (href === '/' ? page.url === '/' : page.url.startsWith(href));

const TRUST = [
    { icon: 'shield', text: ['Pembayaran Selamat', '& Dipercayai'] },
    { icon: 'truck', text: ['Penghantaran', 'Seluruh Malaysia'] },
    { icon: 'headset', text: ['Sokongan', 'Pelanggan'] },
    { icon: 'shield', text: ['Jaminan', 'Kualiti Produk'] },
];

const FOOTER = [
    { title: 'Tentang DeBatik', links: ['Mengenai Kami', 'Pengusaha Tempatan', 'Kerjaya'] },
    { title: 'Bantuan', links: ['Soalan Lazim', 'Hubungi Kami', 'Panduan Pembeli'] },
    { title: 'Penjual', links: ['Daftar Sebagai Penjual', 'Pusat Penjual', 'Polisi Penjual'] },
];
</script>

<template>
    <div class="min-h-screen pb-20 md:pb-0">
        <!-- Header -->
        <header class="sticky top-0 z-40 bg-hijau-gelap">
            <div class="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 md:gap-11 md:px-12 md:py-4">
                <button class="text-white md:hidden" aria-label="Menu"><Icon name="menu" :stroke="2" /></button>
                <Logo class="max-md:hidden" />
                <Logo size="sm" class="md:hidden" />

                <nav class="hidden items-center gap-8 md:flex" aria-label="Navigasi utama">
                    <Link
                        v-for="item in NAV"
                        :key="item.href"
                        :href="item.href"
                        class="relative pb-1.5 text-[15px] text-white transition hover:text-emas"
                        :class="isActive(item.href) ? 'font-semibold' : 'font-medium'"
                    >
                        {{ item.label }}
                        <span v-if="isActive(item.href)" class="absolute inset-x-0 bottom-0 mx-auto h-0.5 w-10 bg-emas" />
                    </Link>
                </nav>

                <div class="ml-auto flex items-center gap-4 md:gap-5">
                    <Link href="/teroka" class="text-white hover:text-emas" aria-label="Cari"><Icon name="search" :size="22" :stroke="2" /></Link>
                    <Link href="/troli" class="relative text-white hover:text-emas" aria-label="Troli">
                        <Icon name="cart" :stroke="2" />
                        <span
                            v-if="cartCount"
                            class="absolute -top-1.5 -right-2 rounded-full bg-emas px-1.5 text-[10px] font-bold text-hijau-gelap"
                            >{{ cartCount }}</span
                        >
                    </Link>
                    <template v-if="!user">
                        <Link
                            href="/login"
                            class="hidden rounded-full border border-white px-[18px] py-2 text-sm font-semibold text-white hover:bg-white/10 md:block"
                            >Log Masuk</Link
                        >
                        <Link
                            href="/daftar"
                            class="hidden rounded-full bg-emas px-[22px] py-2 text-sm font-semibold text-hijau-gelap hover:brightness-105 md:block"
                            >Daftar</Link
                        >
                    </template>
                    <span v-else class="hidden text-sm font-semibold text-white md:block">Hai, {{ user.name }}</span>
                </div>
            </div>
        </header>

        <main>
            <slot />
        </main>

        <!-- Jaminan -->
        <section class="bg-pasir">
            <div class="mx-auto grid max-w-[1440px] grid-cols-2 gap-5 px-4 py-6 md:flex md:justify-between md:px-[120px] md:py-7">
                <div v-for="item in TRUST" :key="item.text[0]" class="flex items-center gap-3">
                    <Icon :name="item.icon" :size="32" :stroke="1.6" class="shrink-0 text-hijau" />
                    <p class="text-[13px] leading-snug font-semibold md:text-[15px]">{{ item.text[0] }}<br />{{ item.text[1] }}</p>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-hijau-gelap text-white">
            <div class="mx-auto max-w-[1440px] px-4 py-10 md:px-[120px] md:py-14">
                <div class="flex flex-col justify-between gap-10 md:flex-row">
                    <Logo size="lg" />
                    <div class="grid grid-cols-2 gap-8 md:flex md:gap-[72px]">
                        <div v-for="col in FOOTER" :key="col.title">
                            <h3 class="mb-2.5 text-[15px] font-semibold">{{ col.title }}</h3>
                            <ul class="space-y-2.5 text-[13px] text-white/70">
                                <li v-for="link in col.links" :key="link"><a href="#" class="hover:text-emas">{{ link }}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 class="mb-3 text-[15px] font-semibold">Ikuti Kami</h3>
                            <div class="flex gap-2.5">
                                <a
                                    v-for="s in ['f', 'IG', 'TT', 'YT']"
                                    :key="s"
                                    href="#"
                                    class="grid size-[30px] place-items-center rounded-full bg-white text-[10px] font-bold text-hijau-gelap hover:bg-emas"
                                    >{{ s }}</a
                                >
                            </div>
                        </div>
                    </div>
                </div>
                <hr class="my-8 border-white/15" />
                <p class="text-center text-[13px] text-white/60">© {{ new Date().getFullYear() }} DeBatik. Semua Hak Cipta Terpelihara.</p>
            </div>
        </footer>

        <!-- Bottom nav (mobile) -->
        <nav class="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between bg-hijau-gelap px-5 py-2 md:hidden" aria-label="Navigasi bawah">
            <Link
                v-for="item in [
                    { label: 'Utama', href: '/', icon: 'home' },
                    { label: 'Kedai', href: '/kedai', icon: 'store' },
                ]"
                :key="item.href"
                :href="item.href"
                class="flex w-14 flex-col items-center gap-1 text-[11px] font-semibold"
                :class="isActive(item.href) ? 'text-emas' : 'text-white'"
            >
                <Icon :name="item.icon" />{{ item.label }}
            </Link>
            <Link
                href="/live"
                class="-mt-7 grid size-16 place-items-center rounded-full border-[3px] border-emas bg-hijau-gelap text-emas"
                aria-label="Live"
            >
                <span class="flex flex-col items-center text-[10px] font-bold"><Icon name="video" :size="22" />LIVE</span>
            </Link>
            <Link
                v-for="item in [
                    { label: 'Favorit', href: '/favorit', icon: 'heart' },
                    { label: 'Akaun', href: '/login', icon: 'user' },
                ]"
                :key="item.href"
                :href="item.href"
                class="flex w-14 flex-col items-center gap-1 text-[11px] font-semibold"
                :class="isActive(item.href) ? 'text-emas' : 'text-white'"
            >
                <Icon :name="item.icon" />{{ item.label }}
            </Link>
        </nav>
    </div>
</template>
