<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\LiveSession;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Data contoh untuk demo — semua nama kedai & produk adalah rekaan.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin DeBatik',
            'email' => 'admin@debatik.test',
            'role' => 'admin',
        ]);

        $categories = collect([
            'Batik Moden', 'Batik Tradisional', 'Batik Korporat',
            'Batik Wanita', 'Batik Lelaki', 'Aksesori Batik',
        ])->map(fn ($name, $i) => Category::create([
            'name' => $name,
            'slug' => Str::slug($name),
            'sort' => $i,
        ]));

        $shops = collect([
            ['Batik Citra', 4.9, 12500, 1240],
            ['Batik Nusantara', 4.8, 9200, 846],
            ['Kedai Batik Aziz', 4.9, 7600, 439],
        ])->map(function ($data) {
            [$name, $rating, $followers, $viewers] = $data;
            $seller = User::factory()->create(['name' => "Pemilik {$name}", 'role' => 'seller']);

            $shop = Shop::create([
                'user_id' => $seller->id,
                'name' => $name,
                'slug' => Str::slug($name),
                'description' => "Kedai {$name} — batik tempatan buatan tangan.",
                'rating' => $rating,
                'followers_count' => $followers,
                'is_verified' => true,
            ]);

            LiveSession::create([
                'shop_id' => $shop->id,
                'title' => "Live {$name}: koleksi terbaru",
                'status' => 'live',
                'viewers_count' => $viewers,
                'started_at' => now()->subMinutes(20),
            ]);

            return $shop;
        });

        $products = [
            ['Kebaya Batik Premium Motif Sakura', 'batik-wanita', 189, 229],
            ['Baju Kurung Batik Moden', 'batik-moden', 189, null],
            ['Kemeja Batik Lelaki Premium', 'batik-lelaki', 159, null],
            ['Kain Batik Canting Coklat 2 Meter', 'batik-tradisional', 85, 99],
            ['Kemeja Batik Korporat Biru', 'batik-korporat', 139, null],
            ['Beg Tangan Batik Ungu', 'aksesori-batik', 75, 89],
            ['Selendang Batik Sutera Hijau', 'batik-wanita', 120, null],
            ['Kemeja Batik Lengan Pendek Emas', 'batik-lelaki', 129, 149],
            ['Dress Batik Moden Bunga Raya', 'batik-moden', 210, 250],
        ];

        foreach ($products as $i => [$name, $catSlug, $price, $compare]) {
            Product::create([
                'shop_id' => $shops[$i % 3]->id,
                'category_id' => $categories->firstWhere('slug', $catSlug)->id,
                'name' => $name,
                'slug' => Str::slug($name),
                'description' => "{$name}. Kain selesa, jahitan kemas, sesuai untuk majlis rasmi dan harian.",
                'price' => $price,
                'compare_price' => $compare,
                'stock' => rand(5, 40),
                'sold_count' => rand(50, 1500),
                'rating' => [4.9, 4.8, 4.7][$i % 3],
                'reviews_count' => rand(20, 300),
                'is_featured' => $i < 4,
            ]);
        }
    }
}
