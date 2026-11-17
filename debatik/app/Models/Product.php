<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    protected $fillable = [
        'shop_id', 'category_id', 'name', 'slug', 'description', 'price', 'compare_price',
        'stock', 'image', 'sold_count', 'rating', 'reviews_count', 'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'compare_price' => 'float',
            'rating' => 'float',
            'is_featured' => 'boolean',
        ];
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
