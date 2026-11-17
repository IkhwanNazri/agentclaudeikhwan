<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StorefrontTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    public function test_home_shows_categories_lives_and_shops(): void
    {
        $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Home', false)
            ->has('categories', 6)
            ->has('lives', 3)
            ->has('shops', 3));
    }

    public function test_explore_filters_by_category(): void
    {
        $this->get('/teroka?kategori=batik-lelaki')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Products/Index', false)
            ->has('products.data', 2));
    }

    public function test_product_and_shop_pages_load(): void
    {
        $this->get('/produk/kebaya-batik-premium-motif-sakura')->assertOk();
        $this->get('/kedai/batik-citra')->assertOk();
        $this->get('/produk/tiada')->assertNotFound();
    }
}
