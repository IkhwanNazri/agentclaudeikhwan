<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Shops/Index', [
            'shops' => Shop::orderByDesc('followers_count')
                ->get(['id', 'name', 'slug', 'logo', 'rating', 'followers_count', 'is_verified']),
        ]);
    }

    public function show(Shop $shop): Response
    {
        return Inertia::render('Shops/Show', [
            'shop' => $shop->only('id', 'name', 'slug', 'description', 'logo', 'rating', 'followers_count', 'is_verified'),
            'products' => $shop->products()->latest()->paginate(12),
            'live' => $shop->liveSessions()->live()->first(['id', 'title', 'viewers_count']),
        ]);
    }
}
