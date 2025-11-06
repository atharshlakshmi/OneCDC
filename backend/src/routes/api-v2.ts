import express from "express";

const router = express.Router();

console.log("[API-V2] Router file loaded!");

router.get("/", (_req, res) => {
  res.json({ ok: true, message: "API root from routes/index.ts" });
});
router.get("/health", (_req, res) => {
  console.log("[API-V2] Health endpoint hit!");
  res.status(200).json({
    success: true,
    message: "API-V2 Router Works!",
    timestamp: new Date().toISOString(),
  });
});

router.get("/shops", async (_req, res) => {
  console.log("[API-V2] Shops endpoint hit!");
  try {
    const { Shop, Catalogue } = await import("../models");
    const shops = await Shop.find({ isActive: true }).lean();

    const formattedShops = await Promise.all(
      shops.map(async (shop: any) => {
        const catalogue = await Catalogue.findOne({ shop: shop._id }).lean();

        return {
          id: shop._id.toString(),
          name: shop.name,
          details: shop.description,
          address: shop.address,
          contact_number: shop.phone,
          operating_hours: "9 AM - 9 PM",
          items: catalogue
            ? catalogue.items.map((item: any) => ({
                id: item._id.toString(),
                name: item.name,
                price: `$${item.price || 0}`,
              }))
            : [],
        };
      })
    );

    res.status(200).json(formattedShops);
  } catch (error) {
    console.error("[API-V2] Error:", error);
    res.status(500).json({ error: "Failed to fetch shops" });
  }
});

router.get("/shops/:id", async (req, res) => {
  console.log("[API-V2] Shop by ID endpoint hit:", req.params.id);
  try {
    const { Shop, Catalogue } = await import("../models");
    const { id } = req.params;
    const shop = await Shop.findOne({ _id: id, isActive: true }).lean();

    if (!shop) {
      res.status(404).json({ error: "Shop not found" });
      return;
    }

    // Populate the items in the catalogue
    const catalogue = await Catalogue.findOne({ shop: shop._id }).populate("items").lean();

    const formattedShop = {
      id: (shop._id as any).toString(),
      name: shop.name,
      details: shop.description,
      address: shop.address,
      contact_number: shop.phone,
      operating_hours: "9 AM - 9 PM",
      ownerId: (shop.owner as any).toString(), // Add owner ID for authorization checks
      ownerVerified: shop.verifiedByOwner,
      items:
        catalogue && (catalogue as any).items
          ? (catalogue as any).items.map((item: any) => ({
              id: item._id.toString(),
              name: item.name,
              price: `$${item.price !== undefined ? item.price.toFixed(2) : "0.00"}`,
              status: item.availability ? "Available" : "Not available",
            }))
          : [],
    };

    res.status(200).json(formattedShop);
  } catch (error) {
    console.error("[API-V2] Error:", error);
    res.status(500).json({ error: "Failed to fetch shop" });
  }
});

router.get("/items/:id", async (req, res) => {
  console.log("[API-V2] Item by ID endpoint hit:", req.params.id);
  try {
    const { Catalogue } = await import("../models");
    const { id } = req.params;
    const catalogue = await Catalogue.findOne({ "items._id": id }).lean();

    if (!catalogue) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const item = (catalogue as any).items.find((i: any) => i._id.toString() === id);

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const formattedItem = {
      id: item._id.toString(),
      name: item.name,
      price: `$${item.price || 0}`,
    };

    res.status(200).json(formattedItem);
  } catch (error) {
    console.error("[API-V2] Error:", error);
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

router.get("/items/:id/reviews", async (req, res) => {
  console.log("[API-V2] Item reviews endpoint hit:", req.params.id);
  try {
    const { Catalogue } = await import("../models");
    const { id } = req.params;
    const catalogue = await Catalogue.findOne({ "items._id": id }).populate("items.reviews.shopper", "name").lean();

    if (!catalogue) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const item = (catalogue as any).items.find((i: any) => i._id.toString() === id);

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const formattedReviews = item.reviews
      .filter((review: any) => review.isActive)
      .map((review: any) => ({
        id: review._id.toString(),
        itemId: id,
        rating: review.rating,
        comment: review.comment,
      }));

    res.status(200).json(formattedReviews);
  } catch (error) {
    console.error("[API-V2] Error:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

console.log("[API-V2] Router exported!");

export default router;
