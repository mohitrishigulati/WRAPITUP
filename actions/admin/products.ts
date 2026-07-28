"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { slugify } from "@/lib/utils/slug";
import {
  parseImageList,
  productFormSchema,
  productUpdateSchema,
} from "@/lib/validators/admin";
import type { ActionResult } from "@/types/actions";

function fieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

function parseProductForm(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug") || slugify(String(formData.get("name") ?? "")),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    basePrice: formData.get("basePrice"),
    isPublished: formData.get("isPublished") === "on",
    images: formData.get("images"),
    defaultSku: formData.get("defaultSku"),
    defaultVariantName: formData.get("defaultVariantName") || "Default",
    stock: formData.get("stock"),
  };
}

export async function createProductAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin("/admin/products/new");
  const parsed = productFormSchema.safeParse(parseProductForm(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  const images = parseImageList(parsed.data.images);
  const slug = parsed.data.slug || slugify(parsed.data.name);

  const existingSlug = await db.product.findUnique({ where: { slug } });
  if (existingSlug) {
    return { ok: false, fieldErrors: { slug: ["Slug is already taken"] } };
  }

  const product = await db.product.create({
    data: {
      name: parsed.data.name,
      slug,
      categoryId: parsed.data.categoryId,
      description: parsed.data.description ?? null,
      basePrice: parsed.data.basePrice,
      isPublished: parsed.data.isPublished,
      images,
      variants: {
        create: {
          sku: parsed.data.defaultSku,
          name: parsed.data.defaultVariantName,
          stock: parsed.data.stock,
        },
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect(`/admin/products/${product.id}/edit`);
}

export async function updateProductAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin("/admin/products");
  const raw = {
    ...parseProductForm(formData),
    productId: formData.get("productId"),
  };
  const parsed = productUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  const images = parseImageList(parsed.data.images);
  const variantId = String(formData.get("variantId") ?? "");

  await db.product.update({
    where: { id: parsed.data.productId },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      categoryId: parsed.data.categoryId,
      description: parsed.data.description ?? null,
      basePrice: parsed.data.basePrice,
      isPublished: parsed.data.isPublished,
      images,
    },
  });

  if (variantId) {
    await db.productVariant.update({
      where: { id: variantId },
      data: {
        sku: parsed.data.defaultSku,
        name: parsed.data.defaultVariantName,
        stock: parsed.data.stock,
      },
    });
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${parsed.data.productId}/edit`);
  revalidatePath("/products");
  return { ok: true, message: "Product updated" };
}

export async function deleteProductByIdAction(productId: string) {
  "use server";
  await requireAdmin("/admin/products");

  const variants = await db.productVariant.findMany({
    where: { productId },
    select: { id: true },
  });
  const variantIds = variants.map((v) => v.id);
  const ordered = await db.orderItem.count({
    where: { productVariantId: { in: variantIds } },
  });
  if (ordered > 0) {
    throw new Error("Cannot delete a product that has order history");
  }

  await db.product.delete({ where: { id: productId } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}
