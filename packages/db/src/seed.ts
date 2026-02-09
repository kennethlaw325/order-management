import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default store
  const store = await prisma.store.create({
    data: {
      name: "Main Store",
      address: "123 Main Street",
      phone: "12345678",
    },
  });

  // Create admin user (password: admin123)
  const hashedPassword = await hash("admin123", 12);
  await prisma.user.create({
    data: {
      email: "admin@pos.local",
      name: "Admin",
      password: hashedPassword,
      role: "admin",
      storeId: store.id,
    },
  });

  // Create categories
  const food = await prisma.category.create({
    data: { name: "Food" },
  });
  const drinks = await prisma.category.create({
    data: { name: "Drinks" },
  });

  // Create sample products with inventory
  const products = [
    { name: "Hamburger", price: 45, cost: 20, sku: "FOOD-001", categoryId: food.id },
    { name: "Fries", price: 25, cost: 8, sku: "FOOD-002", categoryId: food.id },
    { name: "Chicken Wings", price: 55, cost: 25, sku: "FOOD-003", categoryId: food.id },
    { name: "Cola", price: 15, cost: 5, sku: "DRK-001", categoryId: drinks.id },
    { name: "Lemon Tea", price: 18, cost: 6, sku: "DRK-002", categoryId: drinks.id },
    { name: "Water", price: 10, cost: 3, sku: "DRK-003", categoryId: drinks.id },
  ];

  for (const p of products) {
    const product = await prisma.product.create({ data: p });
    await prisma.inventory.create({
      data: {
        productId: product.id,
        storeId: store.id,
        quantity: 100,
        lowStockThreshold: 10,
      },
    });
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
