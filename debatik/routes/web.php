<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ShopController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', HomeController::class)->name('home');

Route::get('/teroka', [ProductController::class, 'index'])->name('products.index');
Route::get('/produk/{product:slug}', [ProductController::class, 'show'])->name('products.show');

Route::get('/kedai', [ShopController::class, 'index'])->name('shops.index');
Route::get('/kedai/{shop:slug}', [ShopController::class, 'show'])->name('shops.show');

// Modul yang belum dibina — paparkan halaman "Akan Datang" dulu.
foreach ([
    'live' => 'Live Shopping',
    'ai' => 'AI DeBatik',
    'login' => 'Log Masuk',
    'daftar' => 'Daftar Akaun',
    'troli' => 'Troli',
    'buka-kedai' => 'Buka Kedai',
] as $path => $title) {
    Route::get("/{$path}", fn () => Inertia::render('ComingSoon', ['title' => $title]))->name($path);
}
