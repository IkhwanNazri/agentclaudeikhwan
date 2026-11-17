<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\LiveSession;
use App\Models\Shop;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Home', [
            'categories' => Category::orderBy('sort')->take(6)->get(['id', 'name', 'slug', 'image']),
            'lives' => LiveSession::live()
                ->with('shop:id,name,slug,logo')
                ->orderByDesc('viewers_count')
                ->take(3)
                ->get(['id', 'shop_id', 'title', 'cover', 'viewers_count']),
            'shops' => Shop::orderByDesc('followers_count')
                ->take(3)
                ->get(['id', 'name', 'slug', 'logo', 'rating', 'followers_count', 'is_verified']),
        ]);
    }
}
