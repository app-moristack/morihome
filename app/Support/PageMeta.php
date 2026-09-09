<?php

namespace App\Support;

final class PageMeta
{
    public function __construct(
        public readonly string $title,
        public readonly string $description,
        public readonly string $canonical,
        public readonly ?string $image = null,
        public readonly string $type = 'website',
        public readonly bool $indexable = true,
        public readonly ?array $structuredData = null,
        public readonly ?string $noscript = null,
    ) {}

    public function withDefaults(): self
    {
        return $this;
    }

    public function imageUrl(): string
    {
        return $this->image ?? url('/icons/social-card.png');
    }
}
