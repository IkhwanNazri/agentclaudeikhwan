<script setup>
import { Link } from '@inertiajs/vue3';
import BatikPhoto from './BatikPhoto.vue';

defineProps({ category: { type: Object, required: true }, index: { type: Number, default: 0 } });
const VARIANTS = [0, 1, 4, 2, 3, 2];
</script>

<template>
    <Link :href="`/teroka?kategori=${category.slug}`" class="group block">
        <BatikPhoto
            :src="category.image"
            :alt="category.name"
            :variant="VARIANTS[index % VARIANTS.length]"
            :person="index !== 1 && index !== 5"
            fade
            class="aspect-[114/140] rounded-xl transition-transform group-hover:-translate-y-1 md:aspect-[186/220] md:rounded-2xl"
        >
            <span class="absolute bottom-2.5 left-2.5 text-xs font-semibold text-white md:bottom-3 md:left-3.5 md:text-base">
                {{ category.name }}
            </span>
        </BatikPhoto>
    </Link>
</template>
