import React from "react";

/**
 * Base skeleton block with shimmer. Use className for size (e.g. w-full h-4).
 */
export function Skeleton({ className = "", rounded = "default" }) {
  const roundedClass =
    rounded === "none"
      ? ""
      : rounded === "full"
        ? "rounded-full"
        : "rounded";
  return (
    <div
      className={`bg-gray-200 animate-skeleton-shimmer ${roundedClass} ${className}`}
      aria-hidden
    />
  );
}

/**
 * Product card placeholder: image + title line + price line.
 * Responsive to match ProductItem (aspect-square image, then text).
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col w-full">
      <Skeleton className="w-full aspect-square max-w-[280px] mx-auto sm:max-w-none sm:mx-0 rounded-lg" rounded="default" />
      <Skeleton className="mt-3 h-3 sm:h-4 w-full max-w-[200px] rounded" rounded="default" />
      <Skeleton className="mt-2 h-3 sm:h-4 w-16 sm:w-20 rounded" rounded="default" />
    </div>
  );
}

/**
 * Grid of product card skeletons. Pass count for number of cards.
 */
export function ProductGridSkeleton({ count = 8, columns = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4", gapClass = "gap-4 gap-y-6" }) {
  return (
    <div className={`grid ${columns} ${gapClass}`} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Product detail page: image gallery left, title, price, description, color/size blocks, CTA.
 */
export function ProductDetailSkeleton() {
  return (
    <div className="pt-10">
      <div className="flex gap-12 flex-col sm:flex-row">
        {/* Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col gap-3 sm:w-[18.7%] w-full">
            <Skeleton className="w-full aspect-square max-w-[80px] sm:max-w-none rounded" rounded="default" />
            <Skeleton className="w-full aspect-square max-w-[80px] sm:max-w-none rounded hidden sm:block" rounded="default" />
            <Skeleton className="w-full aspect-square max-w-[80px] sm:max-w-none rounded hidden sm:block" rounded="default" />
          </div>
          <div className="w-full sm:w-[80%]">
            <Skeleton className="w-full aspect-[4/5] rounded" rounded="default" />
          </div>
        </div>
        {/* Info */}
        <div className="flex-1">
          <Skeleton className="h-8 w-3/4 rounded" rounded="default" />
          <Skeleton className="mt-5 h-9 w-28 rounded" rounded="default" />
          <Skeleton className="mt-5 h-4 w-full rounded" rounded="default" />
          <Skeleton className="mt-2 h-4 w-full rounded" rounded="default" />
          <Skeleton className="mt-2 h-4 w-4/5 rounded" rounded="default" />
          <div className="flex flex-col gap-4 my-4">
            <Skeleton className="h-4 w-24 rounded" rounded="default" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-16 rounded" rounded="default" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 my-4">
            <Skeleton className="h-4 w-20 rounded" rounded="default" />
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-14 rounded" rounded="default" />
              ))}
            </div>
          </div>
          <Skeleton className="mt-4 h-12 w-36 rounded" rounded="default" />
        </div>
      </div>
      <div className="mt-20">
        <Skeleton className="h-10 w-28 rounded-none" rounded="none" />
        <div className="border border-gray-200 px-6 py-5 mt-0">
          <Skeleton className="h-4 w-full rounded" rounded="default" />
          <Skeleton className="mt-2 h-4 w-full rounded" rounded="default" />
        </div>
      </div>
    </div>
  );
}

/**
 * Cart page: CheckoutSteps area + title + cart rows (image + lines + quantity) + checkout block.
 */
export function CartPageSkeleton() {
  return (
    <div className="pt-14">
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
        <Skeleton className="w-6 h-6 rounded-full" rounded="full" />
        <Skeleton className="w-10 h-0.5 rounded" rounded="default" />
        <Skeleton className="w-6 h-6 rounded-full" rounded="full" />
      </div>
      <div className="mb-3">
        <Skeleton className="h-8 w-48 rounded" rounded="default" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="py-4 border-t border-gray-200 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
          >
            <div className="flex items-start gap-6">
              <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded flex-shrink-0" rounded="default" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-3/4 rounded" rounded="default" />
                <div className="flex gap-5 mt-2">
                  <Skeleton className="h-4 w-20 rounded" rounded="default" />
                  <Skeleton className="h-6 w-24 rounded" rounded="default" />
                </div>
              </div>
            </div>
            <Skeleton className="h-8 max-w-16 sm:max-w-20 rounded" rounded="default" />
            <Skeleton className="w-4 h-4 sm:w-5 sm:h-5 rounded" rounded="default" />
          </div>
        ))}
      </div>
      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <Skeleton className="h-24 w-full rounded mb-4" rounded="default" />
          <Skeleton className="h-12 w-full rounded" rounded="default" />
        </div>
      </div>
    </div>
  );
}

/**
 * Single order row: image + name/meta lines + status.
 */
export function OrderRowSkeleton() {
  return (
    <div className="py-4 border-t border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-start gap-6 text-sm">
        <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded flex-shrink-0" rounded="default" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-5 w-40 rounded" rounded="default" />
          <div className="flex items-center gap-3 mt-2">
            <Skeleton className="h-4 w-16 rounded" rounded="default" />
            <Skeleton className="h-4 w-12 rounded" rounded="default" />
            <Skeleton className="h-4 w-14 rounded" rounded="default" />
          </div>
          <Skeleton className="mt-2 h-4 w-24 rounded" rounded="default" />
        </div>
      </div>
      <div className="md:w-1/2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="w-2 h-2 rounded-full" rounded="full" />
          <Skeleton className="h-4 w-20 rounded" rounded="default" />
        </div>
        <Skeleton className="h-9 w-20 rounded" rounded="default" />
      </div>
    </div>
  );
}

/**
 * Orders page: title + list of order row skeletons.
 */
export function OrdersPageSkeleton({ rowCount = 5 }) {
  return (
    <div className="border-t pt-16">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 rounded" rounded="default" />
      </div>
      <div className="space-y-0">
        {Array.from({ length: rowCount }, (_, i) => (
          <OrderRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
