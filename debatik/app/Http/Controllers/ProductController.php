<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'kategori' => ['nullable', 'string', 'max:100'],
            'susun' => ['nullable', 'in:popular,terbaru,harga_rendah,harga_tinggi'],
        ]);

        $products = Product::query()
            ->with('shop:id,name,slug')
            ->when($filters['q'] ?? null, fn ($q, $term) => $q->where('name', 'like', "%{$term}%"))
            ->when($filters['kategori'] ?? null, fn ($q, $slug) => $q->whereHas('category', fn ($c) => $c->where('slug', $slug)))
            ->when($filters['susun'] ?? 'popular', fn ($q, $sort) => match ($sort) {
                'terbaru' => $q->latest(),
                'harga_rendah' => $q->orderBy('price'),
                'harga_tinggi' => $q->orderByDesc('price'),
                default => $q->orderByDesc('sold_count'),
            })
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => Category::orderBy('sort')->get(['id', 'name', 'slug']),
            'filters' => $filters,
        ]);
    }

    public function show(Product $product): Response
    {
        $product->load('shop:id,name,slug,logo,rating,followers_count,is_verified', 'category:id,name,slug');

        return Inertia::render('Products/Show', [
            'product' => $product,
            'related' => Product::where('shop_id', $product->shop_id)
                ->whereKeyNot($product->id)
                ->take(4)
                ->get(['id', 'name', 'slug', 'price', 'compare_price', 'image', 'rating', 'reviews_count']),
        ]);
    }
}
