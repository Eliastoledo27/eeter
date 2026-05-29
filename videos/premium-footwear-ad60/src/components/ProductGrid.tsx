import React from "react";
import { ProductShot } from "./ProductShot";
import { categories } from "../config/products";

export const ProductGrid: React.FC = () => (
  <>
    {categories.flatMap((category) =>
      category.products.map((product, index) => (
        <ProductShot
          key={product.id}
          product={product}
          accent={category.accent}
          variant="lineup"
          index={index}
        />
      )),
    )}
  </>
);
