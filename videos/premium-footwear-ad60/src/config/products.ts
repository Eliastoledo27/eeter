export type CategoryKey = "urban" | "formal" | "casual" | "boots";

export type ProductAsset = {
  id: string;
  src: string;
  crop: "hero" | "macro" | "grid";
};

export type Category = {
  key: CategoryKey;
  label: string;
  title: string;
  subtitle: string;
  detail: string;
  accent: string;
  secondary: string;
  surface: "cement" | "wood" | "marble" | "leather";
  products: ProductAsset[];
};

export const categories: Category[] = [
  {
    key: "urban",
    label: "Urbanas",
    title: "Diseño con presencia",
    subtitle: "Comodidad diaria",
    detail: "Siluetas urbanas, materiales mixtos y lectura premium para uso real.",
    accent: "#D8BE7B",
    secondary: "#0E4A56",
    surface: "cement",
    products: [
      { id: "urban-01", src: "/assets/products/urban-01.png", crop: "hero" },
      { id: "urban-02", src: "/assets/products/urban-02.png", crop: "macro" },
    ],
  },
  {
    key: "formal",
    label: "Formal",
    title: "Detalles premium",
    subtitle: "Elegancia sin esfuerzo",
    detail: "Acabados sobrios para reuniones, eventos y salidas con presencia.",
    accent: "#C99D58",
    secondary: "#4A1717",
    surface: "wood",
    products: [
      { id: "formal-01", src: "/assets/products/formal-01.png", crop: "hero" },
      { id: "formal-02", src: "/assets/products/formal-02.png", crop: "macro" },
    ],
  },
  {
    key: "casual",
    label: "Casual",
    title: "Versatilidad real",
    subtitle: "Para todos los días",
    detail: "Modelos livianos, combinables y limpios para moverse sin esfuerzo.",
    accent: "#F6EFE2",
    secondary: "#0C332A",
    surface: "marble",
    products: [
      { id: "casual-01", src: "/assets/products/casual-01.png", crop: "hero" },
      { id: "casual-02", src: "/assets/products/casual-02.png", crop: "macro" },
    ],
  },
  {
    key: "boots",
    label: "Botas",
    title: "Carácter y resistencia",
    subtitle: "Preparadas para destacar",
    detail: "Volumen, textura y suela con presencia para looks fuertes.",
    accent: "#D8BE7B",
    secondary: "#2A211A",
    surface: "leather",
    products: [
      { id: "boots-01", src: "/assets/products/boots-01.png", crop: "hero" },
      { id: "boots-02", src: "/assets/products/boots-02.png", crop: "macro" },
    ],
  },
];
