# Bazl — Visual Asset Prompt Library
## Complete Image Generation Prompts for Every Visual Surface

> **Brand Summary for AI Image Generators:**
> Bazl is a premium Indian multi-vendor marketplace. Aesthetic: Kinfolk magazine meets Indian craft heritage. Palette: warm parchment (#FDFAF5), saffron-red (#C84B0F), deep warm black (#1C1917). Photography style: warm, soft natural light, artisanal objects, intimate framing, editorial composition. Never clinical, never e-commerce generic. Every image should feel like it belongs in a slow-living, culturally-aware magazine spread.

---

## STYLE REFERENCE TOKENS
Use these modifiers consistently across ALL prompts:

```
[BAZL_STYLE] = "warm natural light, artisanal aesthetic, editorial photography style, 
                muted warm color grading, soft bokeh, Indian craft heritage, 
                parchment and ochre tones, intimate composition, Kinfolk magazine aesthetic, 
                no harsh shadows, golden hour warmth, analog film feel"

[COLOR_TEMP] = "warm golden tones, amber highlights, cream and ivory palette, 
                saffron-red accents only as small pops of color"

[MOOD]       = "calm, confident, curated, unhurried, trustworthy, artisanal, handcrafted warmth"
```

---

## 1. HOMEPAGE (`/`)

### 1.1 Hero Section — Main Background Texture

**Asset ID:** `hero-bg-texture`
**Dimensions:** 1920x1080px (desktop), 768x900px (mobile variant)
**File format:** WebP
**Usage:** Full-width hero background behind editorial headline

```
Prompt:
Close-up macro photograph of handmade Indian khadi cotton fabric, 
natural undyed cream-white linen weave texture filling the entire frame. 
The threads are irregular, natural, artisanal — clearly hand-woven. 
Soft diffused natural light from a north-facing window creates gentle 
shadow depth without harsh contrast. Color temperature: warm 5500K, 
slight golden tint. The fabric has very subtle visible grain and natural 
imperfections that speak to handcraft. No pattern — pure texture. 
Ultra-high resolution, intimate photography, magazine-quality still life.
[BAZL_STYLE] [COLOR_TEMP]
Aspect ratio: 16:9, shot for use as a full-bleed background
```

---

### 1.2 Hero Section — 2x2 Product Mosaic (Primary)

**Asset ID:** `hero-mosaic-01`
**Dimensions:** 600x600px (each tile ~290x290px)
**File format:** WebP
**Usage:** Right side of hero split layout — editorial product showcase

```
Prompt:
A 2x2 editorial grid mosaic of four small, intimate product photographs 
arranged on a warm cream linen surface. 
Top-left: A hand-thrown terracotta clay pot with a matte natural glaze, 
          seen from slightly above. 
Top-right: A neatly folded block-printed fabric in deep indigo with white 
           geometric motifs, corner visible.
Bottom-left: A small glass jar of golden turmeric spice powder with a 
             cork lid, shot against a warm cream background.
Bottom-right: A hand-carved brass diya (oil lamp) on a wooden surface, 
              unlit, warm afternoon light catching its surface.
Each quadrant has equal spacing. Color palette across all four: 
warm ochre, terracotta, deep indigo, cream. 
Soft natural window light, editorial still-life photography, 
clean negative space, Kinfolk magazine aesthetic.
[BAZL_STYLE] [COLOR_TEMP] [MOOD]
```

---

### 1.3 Hero Section — 2x2 Product Mosaic (Alternate)

**Asset ID:** `hero-mosaic-02`
**Dimensions:** 600x600px
**File format:** WebP
**Usage:** Alternate mosaic for hero (A/B test or seasonal swap)

```
Prompt:
Four-quadrant editorial product photograph mosaic for an Indian artisan marketplace.
Top-left: Traditional Kashmiri embroidered cushion cover with silk thread 
          floral patterns in muted rose and sage, folded gently on wood.
Top-right: A ceramic mug with a hand-painted peacock motif in indigo and 
           gold, steaming chai visible inside, warm morning light.
Bottom-left: A hand-woven jute basket with natural leather handle, 
             slightly open, artisan quality.
Bottom-right: A small silver anklet with traditional bells, arranged 
              loosely on dark wood, macro focus.
Warm cream and terracotta color temperature. Each frame independently lit 
with soft diffused light. Editorial, unhurried, curated composition.
[BAZL_STYLE] [COLOR_TEMP]
```

---

### 1.4 Trust Bar — Background Texture Strip

**Asset ID:** `trust-bar-bg`
**Dimensions:** 1920x120px
**File format:** WebP
**Usage:** Thin warm strip behind the four trust icons below the hero

```
Prompt:
An extremely subtle, barely-visible texture of fine handmade paper grain. 
Warm cream with the faintest linen-weave pattern underneath. 
Must be extremely low contrast — this is a background, not a feature. 
Color: #F2EDE4 warm off-white parchment. Completely uniform, no focal point, 
no hard edges. The grain should be visible only when zoomed in. 
Suitable for use as a repeating horizontal strip background.
[COLOR_TEMP]
```

---

### 1.5 Featured Categories — Category Tile Images

**Asset ID:** `category-handcrafted`
**Dimensions:** 400x400px | **File format:** WebP

```
Prompt:
Top-down flat lay photograph of assorted Indian handcrafted objects 
arranged artistically on a warm wooden surface. 
Objects include: a small block-printed cotton pouch, hand-painted wooden 
coaster with floral motif, terracotta incense holder, embroidered coin purse. 
Warm golden afternoon light from the left, creating gentle shadows. 
High contrast between the earthy-toned objects and the honey-colored wood. 
Editorial still-life composition, no single object dominates. 
The bottom third of the image is darker/shadowed for text legibility.
[BAZL_STYLE] [COLOR_TEMP] [MOOD]
Category name to overlay in code (not in image): "HANDCRAFTED"
```

---

**Asset ID:** `category-apparel`
**Dimensions:** 400x400px | **File format:** WebP

```
Prompt:
Close editorial photograph of traditional Indian handloom fabric draped 
loosely over a wooden hanger or mannequin bust. 
The fabric is a warm rust-orange silk with a subtle woven texture. 
Natural window light from the left, warm afternoon tone. 
The background is blurred warm cream bokeh. 
Intimate, fashion-editorial feel. 
Only fabric visible — no face, no hands.
Bottom portion slightly darker for text legibility.
[BAZL_STYLE] [COLOR_TEMP]
Category overlay text: "APPAREL"
```

---

**Asset ID:** `category-home-decor`
**Dimensions:** 400x400px | **File format:** WebP

```
Prompt:
Editorial interior vignette photograph of a corner of a beautifully 
styled Indian-contemporary living space. 
Visible: a hand-thrown ceramic vase with dried pampas grass, a small 
brass incense burner, a stack of linen-covered books, a terracotta 
bowl with smooth river stones. 
Warm afternoon light, long shadows, editorial interior photography. 
Colors: cream, terracotta, warm beige, muted sage. 
The bottom quarter is shadowed for text overlay.
[BAZL_STYLE] [COLOR_TEMP] [MOOD]
Category overlay text: "HOME DECOR"
```

---

**Asset ID:** `category-food-spices`
**Dimensions:** 400x400px | **File format:** WebP

```
Prompt:
Overhead flat lay of an array of Indian spices and dry ingredients 
in small terracotta bowls and vintage brass measuring cups. 
Spices visible: whole cardamom pods, turmeric powder (golden), 
cumin seeds, dried red chillies (deep crimson), saffron strands, 
star anise. Arranged artfully on a warm off-white linen cloth. 
Warm directional light from upper-left, creating shadows that define 
each bowl. Color palette: golden, crimson, warm beige, terracotta.
The composition bleeds to the edges. Bottom third darker for text.
[BAZL_STYLE] [COLOR_TEMP]
Category overlay text: "FOOD & SPICES"
```

---

**Asset ID:** `category-beauty`
**Dimensions:** 400x400px | **File format:** WebP

```
Prompt:
Intimate editorial flat lay of Indian natural beauty and skincare products 
on a warm marble or alabaster surface. 
Products: a small amber glass vial of face oil, raw organic rose petals 
scattered loosely, a wooden kansa gua-sha tool, a chunk of raw turmeric 
root, a small clay pot of Multani mitti paste. 
Warm natural light, very soft shadows. Color palette: amber, rose, cream, 
dusty terracotta. Clean, slow-beauty editorial aesthetic.
Bottom third subtly vignette-darkened.
[BAZL_STYLE] [COLOR_TEMP] [MOOD]
Category overlay text: "BEAUTY"
```

---

**Asset ID:** `category-jewelry`
**Dimensions:** 400x400px | **File format:** WebP

```
Prompt:
Close-up macro photograph of traditional Indian silver jewelry pieces 
arranged on a dark warm-toned wooden surface. 
Pieces include: a filigree silver ring, oxidized silver jhumka earrings 
(bell earrings), a delicate silver chain with a pendant. 
Extreme close-up, macro depth of field with soft bokeh background. 
Warm window light from the left, catching the silver's warm shimmer.
Deep warm background with bright foreground focus.
Bottom portion naturally dark for text legibility.
[BAZL_STYLE] [COLOR_TEMP]
Category overlay text: "JEWELLERY"
```

---

**Asset ID:** `category-wellness`
**Dimensions:** 400x400px | **File format:** WebP

```
Prompt:
Serene editorial photograph of an Ayurvedic and wellness flat lay. 
Objects: a brass singing bowl, dried neem leaves on a clay dish, 
small wooden bowl with ashwagandha powder, a glass bottle of ayurvedic 
hair oil with a cork stopper, loose dried chamomile flowers scattered. 
Arranged on a warm cream linen cloth. Diffused natural light, 
deeply serene, spa-like warmth. Color palette: gold, sage green, 
cream, warm amber. No clinical look — this is ancient wisdom.
Bottom third subtly darker.
[BAZL_STYLE] [COLOR_TEMP] [MOOD]
Category overlay text: "WELLNESS"
```

---

**Asset ID:** `category-stationery`
**Dimensions:** 400x400px | **File format:** WebP

```
Prompt:
Editorial flat lay photograph of handmade Indian stationery and paper goods 
on a warm wooden desk surface. 
Objects: a handmade cotton-rag paper journal with a wax seal, 
a calligraphy ink pot, a handmade envelope with a block-printed pattern, 
loose parchment sheets with faint handwritten script. 
Arranged with generous negative space. Warm afternoon window light, 
long soft shadows. Cream, buff, warm walnut color palette.
Bottom third for category name overlay.
[BAZL_STYLE] [COLOR_TEMP]
Category overlay text: "STATIONERY"
```

---

### 1.6 Featured Vendor Spotlight — Banner Background

**Asset ID:** `vendor-spotlight-bg`
**Dimensions:** 1200x420px
**File format:** WebP
**Usage:** Editorial wide banner for weekly vendor feature section

```
Prompt:
Wide panoramic editorial photograph of an Indian artisan at work in 
their natural studio/workshop. 
A woman potter at a clay wheel, hands shaping wet terracotta clay, 
workshop behind her shows shelves of finished pots. 
Shot from a slightly elevated angle, the entire workshop visible in soft 
warm bokeh. Afternoon golden light streaming through a single window. 
Subject occupies the right third — left two-thirds has the out-of-focus 
warm terracotta and ochre workshop interior, perfect for text overlay.
No face clearly visible — shot at medium distance. 
Warm, honest, celebratory of craft. 
[BAZL_STYLE] [COLOR_TEMP] [MOOD]
Text space needed on the LEFT for: Vendor Name, short bio, rating.
```

---

### 1.7 Section Divider Motif

**Asset ID:** `section-divider-motif`
**Dimensions:** 1920x80px | **File format:** SVG/PNG

```
Prompt:
A simple, elegant hand-drawn single-line border motif inspired by 
traditional Indian rangoli or mehndi pattern. 
A single horizontal line of repeating lotus buds and small leaf shapes, 
drawn in a very thin continuous line (no fill). 
Color: #C4BAB0 (warm gray). The motif tiles horizontally. 
The drawing style is loose, like a calligrapher's idle sketch — 
not mechanical, not clipart. Width of one repeat: ~120px, height: ~40px.
Warm, artisanal, editorial.
```

---

## 2. BROWSE / SHOP PAGE (`/shop`)

### 2.1 Browse Page — Hero Banner

**Asset ID:** `browse-banner-default`
**Dimensions:** 1200x280px | **File format:** WebP

```
Prompt:
Wide editorial banner photograph, very horizontal format. 
Left side: a beautifully lit arrangement of diverse Indian artisan products — 
a clay bowl, folded fabric, brass spoon — on a warm cream surface. 
Right side: warm negative space in parchment (#FDFAF5) for text overlay. 
Soft natural light, the products blend warmly into the cream background. 
No hard shadows. The transition from product to negative space is smooth.
The banner should have a 60/40 split: 60% image, 40% cream-fade.
[BAZL_STYLE] [COLOR_TEMP]
Text overlay in code: "BROWSE ALL PRODUCTS"
```

---

### 2.2 Filter Sidebar — No-Results Illustration

**Asset ID:** `empty-no-results`
**Dimensions:** 320x280px | **File format:** SVG/PNG

```
Prompt:
Minimal, warm single-color line illustration (not 3D, not photorealistic). 
Style: thin single-weight SVG line art, like a calligraphic sketch. 
Subject: a small Indian market stall (chaat stall scale) that is empty — 
no goods on the shelves, a single tray turned upside down. 
A small banner above the empty stall hangs with nothing written. 
The overall composition is centered, charming, with a gentle melancholy 
but not sad. Color: single warm saffron tone (#C84B0F) on cream. 
Proportions: portrait, illustration occupies top 65% of frame.
Caption below in code: "No products match your filters."
```

---

### 2.3 Product Card Placeholder (Loading / Missing Image)

**Asset ID:** `product-card-placeholder`
**Dimensions:** 400x500px (4:5 ratio)
**File format:** WebP/PNG
**Usage:** Shown before product image loads; fallback for missing product images

```
Prompt:
An extremely minimal, elegant placeholder image in the style of a 
watercolor wash. 
A very soft, barely-visible abstract wash of warm cream and the lightest 
blush terracotta — like a watercolor primer. 
In the center, an ultra-faint outline of a lotus flower, 
drawn with a single thin warm-gray line. 
No text. No hard edges. Feels like handmade paper that something 
beautiful will be placed upon. 
Aspect ratio 4:5 (portrait). Colors: warm cream, faint terracotta wash.
[BAZL_STYLE] [COLOR_TEMP]
This is a FALLBACK PLACEHOLDER — must feel elegant, not like an error.
```

---

## 3. PRODUCT DETAIL PAGE (`/products/[slug]`)

### 3.1 PDP — Default Product Image Gallery Placeholder

**Asset ID:** `pdp-image-placeholder-main`
**Dimensions:** 800x960px (5:6 ratio) | **File format:** WebP

```
Prompt:
A warm, elegant product photography placeholder in portrait orientation. 
A softly lit expanse of warm cream handmade paper or linen, 
with the ghost/outline of an undefined object in the center — 
barely visible, like the impression left by an object removed from paper. 
The surface has subtle handmade texture. Warm natural light from upper left. 
No text. Feels like a gallery wall before art is hung.
Colors: warm cream, faint warm gray. Ratio: 5:6 portrait.
[BAZL_STYLE] [COLOR_TEMP]
```

---

**Asset ID:** `pdp-image-placeholder-thumb`
**Dimensions:** 160x160px | **File format:** WebP

```
Prompt:
Tiny square thumbnail placeholder. 
A warm cream square with a single very faint thin-line circle in the center 
and the Bazl brand letter B in the lightest warm-gray tone, 
barely visible watermark style. 
Soft warm tone, minimal, dignified fallback.
Colors: #F2EDE4 background, #C4BAB0 faint mark.
```

---

### 3.2 PDP — Vendor Trust Block Mini Illustration

**Asset ID:** `vendor-verified-illustration`
**Dimensions:** 80x80px | **File format:** SVG/PNG

```
Prompt:
Minimal single-line SVG icon illustration, 80x80px. 
A simplified shop front / stall facade drawn in thin single lines — 
like a hand-drawn doodle. Includes a small door, a simple awning, 
and a tiny star above. 
Color: #C84B0F (saffron-red), single weight stroke, no fill. 
Style: architectural line art sketch, warm, friendly.
Clean white/transparent background. No text.
```

---

### 3.3 PDP — Recommendations Section Divider

**Asset ID:** `pdp-recommendations-divider`
**Dimensions:** 1200x60px | **File format:** SVG/WebP

```
Prompt:
A delicate hand-drawn horizontal decorative line with a small central 
diamond or lotus motif — like a chapter heading ornament from an Indian 
vintage book. Single thin line, warm gray tone #9C9289. 
Drawn in pen-and-ink style. The line extends to full width with the 
central motif acting as a focal point. 
Purely decorative. No text.
```

---

## 4. CHECKOUT PAGE (`/checkout`)

### 4.1 Checkout — Secure Payment Trust Badge

**Asset ID:** `checkout-security-badge`
**Dimensions:** 200x48px | **File format:** SVG/PNG

```
Prompt:
Minimal, clean trust badge graphic. 
A simple padlock icon (thin line, not filled) on the left side, 
followed by "256-bit SSL" text in a clean monospace-style font. 
Color: #2E6B4F (success green). White background. 
The padlock uses a thin single-weight outline style consistent with 
editorial line art. The overall badge is small, unobtrusive, credible. 
No gradients. Flat, simple, trustworthy.
```

---

### 4.2 Checkout — Razorpay Partnership Lockup

**Asset ID:** `checkout-razorpay-badge`
**Dimensions:** 180x32px | **File format:** PNG

```
Prompt:
A simple co-brand lockup: the text "Secured by" in very small warm-gray 
DM Sans font, followed by the Razorpay wordmark in their brand blue. 
Horizontal layout, one line. Clean white background. 
The lockup is minimal and would not distract from the checkout flow. 
Flat design, no shadow, no border.
NOTE: Use official Razorpay SVG logo when available.
```

---

## 5. ORDER CONFIRMATION PAGE (`/orders/[id]`)

### 5.1 Order Confirmed — Success Illustration

**Asset ID:** `order-success-illustration`
**Dimensions:** 480x360px | **File format:** SVG/PNG

```
Prompt:
Warm, celebratory but restrained editorial illustration for an order 
confirmation screen. 
Style: flat, minimalist, single-weight line art (like Kinfolk magazine illustrations). 
Subject: a beautifully wrapped parcel package — brown kraft paper with 
a warm twine bow — sitting on a wooden surface. 
A small sprig of greenery tucked under the bow. 
Soft warm glow radiating very subtly from behind the package.
Color palette: warm ochre, terracotta, cream, muted green. 
No confetti, no balloons, no party elements. 
This is quiet confidence, not celebration overload.
Mood: "Done. Beautiful things are coming to you."
[BAZL_STYLE] [COLOR_TEMP] [MOOD]
```

---

### 5.2 Order Confirmation — Timeline Step Icons (3 icons)

**Asset IDs:** `order-step-01-confirmed`, `order-step-02-shipped`, `order-step-03-delivered`
**Dimensions:** 48x48px each | **File format:** SVG

```
Icon 1 — Confirmed:
48x48 SVG. A vendor's hands carefully placing an item into a box — 
represented as minimal line art. Single-weight outline, no fill. 
Color: #C84B0F. Transparent background.

Icon 2 — Shipped:
48x48 SVG. A small truck/van in profile, moving to the right. 
Minimal line art, single thin stroke, no fill.
Color: #C84B0F. Transparent background.

Icon 3 — Delivered:
48x48 SVG. A package at a doorstep — box on a step, 
door handle visible behind it. Minimal single-weight line art. 
Color: #C84B0F. Transparent background.
```

---

## 6. AUTHENTICATION PAGE (`/auth`)

### 6.1 Auth — Full-Page Background Texture

**Asset ID:** `auth-bg-pattern`
**Dimensions:** 1920x1080px | **File format:** WebP

```
Prompt:
A very subtle, warm repeating pattern texture for use as a webpage 
full-bleed background. 
Pattern: an extremely faint geometric grid of fine diamond shapes, 
inspired by traditional Indian jaali (lattice) work. 
The pattern is almost invisible — 95% transparent over the warm parchment 
background color #FDFAF5. 
The lines are hairline-thin, color #E0D9CF (warm border color). 
The effect should be barely perceptible — like watermarked paper. 
Completely flat, no 3D depth, no shadows. 
Must NOT distract from the centered sign-in form above it.
```

---

### 6.2 Auth — Decorative Side Panel Illustration

**Asset ID:** `auth-side-illustration`
**Dimensions:** 600x800px | **File format:** WebP

```
Prompt:
A tall portrait editorial photograph with generous negative space. 
Subject: a woman's hands (brown skin tones, warm and natural) 
carefully wrapping a small Indian artisan product in tissue paper, 
about to seal it with a wax stamp. 
The surface is a warm-toned wooden table. 
The background is deeply blurred warm terracotta/cream studio. 
Shot from slightly above and to the side. 
Mood: care, craftsmanship, trust. 
Bottom quarter of image fades to a slightly darker warm tone.
Color temperature: warm, golden, 5200K equivalent.
[BAZL_STYLE] [COLOR_TEMP] [MOOD]
```

---

## 7. VENDOR DASHBOARD (`/vendor/*`)

### 7.1 Vendor Dashboard — Header Banner

**Asset ID:** `vendor-dashboard-header-bg`
**Dimensions:** 1440x180px | **File format:** WebP

```
Prompt:
A very dark, warm photographic texture for a vendor management dashboard header. 
Color palette: deep warm black (#1C1917) with very subtle warm undertones. 
A very faint, blurred image of artisan workshop tools in the extreme 
background — barely visible at ~10-15% opacity. 
The foreground is completely solid dark for text readability.
Text will be placed over this in warm white/cream.
Mood: professional, behind-the-scenes, empowered.
```

---

### 7.2 Vendor Dashboard — Revenue Chart Background

**Asset ID:** `vendor-chart-area-bg`
**Dimensions:** 800x300px | **File format:** WebP/PNG

```
Prompt:
An ultra-minimal abstract warm texture for a dark chart card background.
A field of deep warm charcoal (#252220) with a very faint grid of extremely 
thin horizontal lines at equal intervals — like graph paper in the dark. 
The lines are barely visible, just 5% lighter than the background. 
No content, no labels, no icons. 
Purely atmospheric. Conveys data and organization without being cold.
```

---

### 7.3 Vendor Dashboard — Empty Orders State

**Asset ID:** `vendor-empty-orders`
**Dimensions:** 400x300px | **File format:** SVG/PNG

```
Prompt:
Warm, encouraging editorial illustration for an empty vendor orders screen.
Style: flat single-weight line art, hand-drawn feel.
Subject: an empty market stall counter — a simple wooden counter with 
a bare tray, a small "OPEN" sign, and a cheerful small potted plant on the corner. 
The stall is ready and waiting, not sad and abandoned. 
Color: warm saffron-red (#C84B0F) line art on cream background.
Mood: anticipation, readiness. 
Caption in code: "Orders will appear here once buyers start purchasing."
```

---

### 7.4 Vendor Dashboard — Low Stock Alert Badge Icon

**Asset ID:** `vendor-low-stock-icon`
**Dimensions:** 24x24px | **File format:** SVG

```
Prompt:
A tiny 24px SVG icon: a simple outlined warning triangle (no fill) 
with a small box/cube shape inside instead of the traditional "!" symbol. 
Communicates "inventory warning" rather than generic danger. 
Color: #B97A1A (warning amber). 
Single-weight hairline stroke. Clean transparent background.
```

---

### 7.5 Vendor Product Upload — Image Dropzone Illustration

**Asset ID:** `vendor-image-dropzone`
**Dimensions:** 360x220px | **File format:** SVG/PNG

```
Prompt:
Simple editorial line illustration for a file upload dropzone. 
Style: minimal single-line sketch, not technical/generic. 
Subject: a camera lens (vintage style) with a subtle upward arrow above it 
and three small sparkles. Composition is centered within a dashed-border rectangle. 
Color: #9C9289 (muted warm gray). 
The dashed border rectangle is drawn in a slightly rounded style.
Caption text in code: "Drop product images here, or click to browse"
Warm, approachable, not technical.
```

---

### 7.6 Vendor Settings — Store Profile Banner Placeholder

**Asset ID:** `vendor-store-banner-placeholder`
**Dimensions:** 1200x300px | **File format:** WebP

```
Prompt:
A beautiful, warm editorial default banner for an artisan vendor store page. 
A wide horizontal photograph of a craft studio or workspace aesthetic — 
wooden shelves with neatly arranged handmade goods, warm afternoon light, 
slightly out of focus so it reads as atmospheric rather than specific. 
Color palette: warm honey, terracotta, cream, wood tones. 
Left 40% of the image is slightly darker for potential text overlay.
Mood: this is a place of craft and care. 
The image reads beautifully on its own without any text.
[BAZL_STYLE] [COLOR_TEMP] [MOOD]
```

---

### 7.7 Vendor Store — Avatar Placeholder

**Asset ID:** `vendor-avatar-placeholder`
**Dimensions:** 160x160px (square, displayed as circle) | **File format:** WebP/PNG

```
Prompt:
A warm, editorial placeholder avatar photograph for an artisan vendor. 
A soft close-up of a single artisan object as a stand-in for a portrait — 
specifically: the whorls of a freshly turned wooden bowl seen from above, 
filling the square frame, lit with warm directional light. 
The image feels like a craftsperson's signature — unique, warm, artisanal. 
No face. No text. Square format with circular display in mind.
Color: warm wood tones, cream. Deep but soft lighting.
[BAZL_STYLE]
```

---

## 8. ADMIN PANEL (`/admin/*`)

### 8.1 Admin Panel — Sidebar Background Texture

**Asset ID:** `admin-sidebar-bg`
**Dimensions:** 280x1000px (repeating vertical) | **File format:** WebP/PNG

```
Prompt:
An extremely subtle dark vertical texture for a sidebar navigation panel. 
Color: #1C1917 (deep warm black) with the faintest hint of a woven 
textile pattern at ~5% opacity. 
The texture references coarse linen or burlap weave. 
Completely dark, the pattern is only a suggestion of depth. 
No bright areas, no focal point. Solid flat dark surface with micro-texture.
```

---

### 8.2 Admin Panel — Vendor Approval Queue — Status Badges

**Asset ID:** `admin-pending-badge`
**Dimensions:** 80x28px | **File format:** SVG/PNG

```
Prompt:
A small pill-shaped status badge: "PENDING" in Syne typeface, 
all-caps, 11px equivalent. 
Background: warm muted gray #C4BAB0. Text: #1C1917. 
Pill shape with full border radius. 
Very flat, no shadow, no gradient. Clean and readable at small sizes.
```

---

### 8.3 Admin Panel — Platform Overview Empty State

**Asset ID:** `admin-empty-dashboard`
**Dimensions:** 400x320px | **File format:** SVG/PNG

```
Prompt:
Editorial line illustration for an admin platform overview empty state. 
Style: minimal, single-weight outline sketch.
Subject: a birds-eye-view simple market map — 
small stalls arranged in a bazaar grid from above, 
each stall is an empty simplified rectangle. 
A single entrance archway is visible. 
No people, no goods — the bazaar is ready but not yet filled.
Color: #C84B0F saffron-red lines on cream background. 
Mood: this is potential, not emptiness.
Caption in code: "The platform is ready. Start by approving your first vendor."
```

---

## 9. EMPTY STATES (All Pages)

### 9.1 Empty Cart

**Asset ID:** `empty-cart-illustration`
**Dimensions:** 360x280px | **File format:** SVG/PNG

```
Prompt:
Charming, warm editorial line illustration for an empty shopping cart screen.
Style: flat, single-weight SVG line art, hand-drawn, slightly whimsical.
Subject: a beautiful traditional Indian wicker/cane basket 
(the kind used in bazaars, not a supermarket cart), 
sitting empty on a warm wooden surface. 
A single dried flower has fallen into the empty basket. 
Color: saffron-red #C84B0F single-color illustration on cream background.
Mood: "Your basket is quiet. Let's make some noise."
The basket takes up ~70% of the frame, centered.
```

---

### 9.2 Empty Wishlist

**Asset ID:** `empty-wishlist-illustration`
**Dimensions:** 360x280px | **File format:** SVG/PNG

```
Prompt:
Warm editorial line illustration for an empty wishlist screen.
Style: flat, single-weight SVG line art, poetic, Indian-heritage influenced.
Subject: a string of jasmine flowers (gajra) — the traditional Indian 
flower garland — half-threaded, with loose blooms scattered around the needle. 
The idea: beautiful things are waiting to be gathered.
Color: saffron-red #C84B0F outline illustration on cream background.
A single outline heart is very faintly visible behind the flowers.
Mood: "Nothing saved yet. Heart any product to save it here."
```

---

### 9.3 Empty Order History

**Asset ID:** `empty-orders-illustration`
**Dimensions:** 360x280px | **File format:** SVG/PNG

```
Prompt:
Editorial line illustration for an empty order history screen.
Style: flat, single-weight SVG line art, minimalist, warm.
Subject: a blank shipping label — a simple rectangular tag 
with a tied string, hanging from nothing. 
On the label, faint lines suggest blank fields. 
A small postage stamp outline in the corner.
Color: #C84B0F saffron-red illustration on cream background.
Mood: anticipatory, not sad. 
Caption in code: "Your order history is empty — let's fix that."
```

---

### 9.4 Empty Search Results

**Asset ID:** `empty-search-illustration`
**Dimensions:** 360x280px | **File format:** SVG/PNG

```
Prompt:
Editorial line illustration for a "no search results" screen.
Style: flat, single-weight line art, slightly playful.
Subject: a traditional Indian market stall with a large magnifying glass 
leaning against its counter, and the stall shelf completely bare. 
A small dust swirl in the corner of the shelf. 
Color: #C84B0F saffron-red line art on cream background.
Mood: "No products match your filters. Try broadening your search."
```

---

### 9.5 Vendor Empty Products List

**Asset ID:** `vendor-empty-products-illustration`
**Dimensions:** 360x280px | **File format:** SVG/PNG

```
Prompt:
Encouraging editorial line illustration for a vendor with no products.
Style: flat, single-weight SVG line art.
Subject: an empty market display stand with tiered shelves — 
elegant, like a jewelry display or bakery case — beautifully 
empty, ready to be filled. 
A single tag/label hangs from the top shelf hook.
Color: #C84B0F saffron-red line art on cream background.
Caption in code: "Your store is ready. List your first product to get started."
```

---

## 10. EMAIL TEMPLATES

### 10.1 Email Header — Order Confirmation

**Asset ID:** `email-header-order-confirmation`
**Dimensions:** 600x200px | **File format:** PNG (email-safe)

```
Prompt:
A horizontal email header banner image, 600px wide x 200px tall. 
Left section: the BAZL wordmark in Cormorant display font, 
dark warm black (#1C1917) on parchment (#FDFAF5) background. 
Center/right section: a small photographic vignette of a beautifully 
wrapped package tied with twine, very warm and intimate lighting. 
The transition from left (text area) to right (photo) is a soft warm gradient. 
Color palette: warm cream, warm black, tiny saffron-red accent on the twine. 
This MUST render cleanly in email clients — no transparency, flat background.
```

---

### 10.2 Email Header — Order Shipped

**Asset ID:** `email-header-order-shipped`
**Dimensions:** 600x200px | **File format:** PNG (email-safe)

```
Prompt:
Horizontal email header banner, 600x200px.
Left: BAZL wordmark in warm black on cream parchment.
Right: A small, warm, minimal flat illustration of a delivery vehicle 
on a simple Indian road, suggestive of journey. 
Simple line art style, terracotta/ochre palette.
The right illustration is colorful but minimal — 3-4 flat colors maximum.
Background: warm parchment #FDFAF5. No transparency. Email-safe PNG.
```

---

### 10.3 Email Header — Review Request

**Asset ID:** `email-header-review-request`
**Dimensions:** 600x200px | **File format:** PNG (email-safe)

```
Prompt:
Horizontal email header banner, 600x200px.
Left: BAZL wordmark on warm cream.
Right: A minimalist illustration of five empty star outlines 
in a gentle curve, with a small pencil/writing quill above them. 
Stars are drawn in the Bazl saffron-red #C84B0F as outlined (not filled), 
the quill tip touches the first star as if about to fill it in.
Background: warm parchment. Warm and inviting, not cold.
No transparency. Email-safe PNG.
```

---

### 10.4 Email Header — Vendor Application Approved

**Asset ID:** `email-header-vendor-approved`
**Dimensions:** 600x200px | **File format:** PNG (email-safe)

```
Prompt:
Horizontal email header banner, 600x200px.
Left: BAZL wordmark on warm cream.
Right: A warm, celebratory but restrained illustration — 
a small "OPEN" sign hanging from a simple shop awning, 
drawn in flat minimal line art style. 
The sign is slightly tilted as if just hung. 
Saffron-red and warm green (#2E6B4F) accents.
Background: warm parchment. 
Mood: "Your store is now open. Welcome to Bazl."
No transparency. Email-safe PNG.
```

---

### 10.5 Email Header — Welcome / Onboarding

**Asset ID:** `email-header-welcome`
**Dimensions:** 600x200px | **File format:** PNG (email-safe)

```
Prompt:
Horizontal email header banner, 600x200px.
Left: BAZL wordmark on warm cream parchment.
Right: A tiny illustrated Indian bazaar archway entrance — 
a simple arched gateway with lanterns hanging from both sides. 
Through the arch, a hint of colorful market stalls. 
Very flat, 4-color maximum, editorial illustration style.
Palette: cream, terracotta, saffron-red, warm black.
Background: warm parchment. No transparency. Email-safe PNG.
Mood: "Welcome. Something extraordinary is inside."
```

---

## 11. ERROR PAGES

### 11.1 404 Not Found Page

**Asset ID:** `error-404-illustration`
**Dimensions:** 480x400px | **File format:** SVG/PNG

```
Prompt:
Warm, on-brand editorial illustration for a 404 page.
Style: flat, single-weight SVG line art with subtle warm fills.
Subject: A beautiful Indian signboard/direction sign — 
the style of old painted wooden direction signs at Indian hill stations — 
but all arrows are pointing in comically different directions, 
each arrow blank or pointing to question marks. 
One arrow clearly has fallen off the post and lies on the ground.
Color palette: terracotta, warm ochre, cream, a pop of saffron-red 
on the detached arrow. 
Mood: "We've lost our way — but here's how to find yours."
Not sad, slightly charming, still on-brand.
```

---

### 11.2 500 Server Error Page

**Asset ID:** `error-500-illustration`
**Dimensions:** 480x400px | **File format:** SVG/PNG

```
Prompt:
Warm, honest editorial illustration for a server error (500) page.
Style: flat, single-weight SVG line art.
Subject: A clay pot on a potter's wheel that has gone slightly 
off-center — it's wobbling, and the potter's hands (represented as 
abstract mitten-shapes, not realistic) are steadying it. 
The pot is imperfect but being handled with care.
Color: warm saffron-red #C84B0F and warm ochre on cream background.
Mood: "Something went wrong — we're on it." 
Honest, not apologetic. The artisan is fixing it.
```

---

### 11.3 Maintenance Page

**Asset ID:** `maintenance-illustration`
**Dimensions:** 480x400px | **File format:** SVG/PNG

```
Prompt:
Editorial line illustration for a maintenance/downtime page.
Style: flat, minimal SVG line art.
Subject: A market stall with a "Back Soon" sign — 
a simply painted wooden sign (text added in code). 
The stall is covered with a decorative cloth/tarpaulin. 
A broom leans against the side — cleaning in progress.
Color: warm saffron-red and terracotta on cream background.
Mood: "The bazaar is being prepared. Back soon."
```

---

## 12. MOBILE UI ASSETS

### 12.1 Mobile Splash Screen

**Asset ID:** `mobile-splash-screen`
**Dimensions:** 390x844px (iPhone 14 Pro) | **File format:** PNG

```
Prompt:
A simple, elegant mobile app splash screen for Bazl marketplace.
Full portrait: warm parchment (#FDFAF5) background.
Dead center: the BAZL wordmark in Cormorant display, 
deep warm black (#1C1917), letter-spacing +80. 
Beneath it, very finely, a single thin line of DM Sans: 
"India's curated marketplace."
Below that: a single tiny saffron-red dot — like a bindi — 
as a period/full-stop punctuation.
No other elements. Generous white space above and below.
This splash screen should feel like the cover of a design magazine.
Resolution: 390x844px, 3x retina quality.
```

---

### 12.2 Mobile — Product Swipe Card Background

**Asset ID:** `mobile-product-swipe-bg`
**Dimensions:** 390x480px | **File format:** WebP

```
Prompt:
A warm, atmospheric background texture for a mobile product card hero section. 
Very subtle warm cream texture — handmade paper grain visible at close range. 
No pattern, no focal point. Pure ambient warmth. 
Color: #FDFAF5 with very faint warm grain.
Suitable to sit behind product photography cards on mobile. 
No objects, no text.
```

---

## 13. TRUST & CREDIBILITY ICONS

### 13.1 Trust Bar Icons (4 icons for homepage)

**Asset IDs:** `trust-secure-payment`, `trust-verified-vendors`, `trust-easy-returns`, `trust-pan-india`
**Dimensions:** 32x32px each | **File format:** SVG

```
trust-secure-payment:
32x32 SVG icon: a simple padlock shape drawn in a single continuous 
thin line (outline only, no fill), with a subtle waveform inside the lock body. 
Color: #C84B0F saffron-red. Transparent background. Reads well at 32px.

trust-verified-vendors:
32x32 SVG icon: a simplified market stall with a checkmark/tick 
overlaid at the top-right corner in a small circle. 
The market stall is drawn as a minimal 2-line sketch (roof + counter). 
Color: #C84B0F. Transparent background.

trust-easy-returns:
32x32 SVG icon: a simplified parcel box with a circular arrow 
around it, indicating return/cycle. 
The arrow circles around 270 degrees. The box has a small X mark on it. 
Single thin line weight. Color: #C84B0F. Transparent background.

trust-pan-india:
32x32 SVG icon: a simplified outline of India's map with a small 
location pin dropped in the center. 
The map outline is very simplified (recognizable silhouette at 32px). 
Color: #C84B0F. Transparent background.
```

---

### 13.2 Rating Stars (3 states)

**Asset IDs:** `star-filled`, `star-empty`, `star-half`
**Dimensions:** 16x16px each | **File format:** SVG

```
All three 16x16 SVG star icons using a 5-point star shape. 
star-filled: solid fill, color #B97A1A (warning amber).
star-empty: outline only, stroke #B97A1A, no fill.
star-half: left half filled #B97A1A, right half outline only.
The star shape is the standard proportional 5-pointed star, 
slightly rounded to feel less sharp. Clean transparent background.
```

---

### 13.3 Vendor Dashboard — KPI Icon Set

**Asset IDs:** `kpi-revenue`, `kpi-orders`, `kpi-pending`, `kpi-rating`
**Dimensions:** 24x24px each | **File format:** SVG
**Usage:** Small icons on KPI stat tiles in vendor dashboard

```
kpi-revenue (Rupee icon):
24x24 SVG: the Indian Rupee symbol drawn as a thin single-stroke 
outline. Color: #FDFAF5 (cream, for use on dark dashboard). Transparent bg.

kpi-orders (box icon):
24x24 SVG: an open cardboard box top view, flaps open. 
Thin single stroke outline. Color: #FDFAF5. Transparent background.

kpi-pending (clock icon):
24x24 SVG: a simple circular clock face with hands at ~3pm. 
Thin single stroke. Color: #FDFAF5. Transparent background.

kpi-rating (star icon):
Same as star-filled but 24x24 and color #FDFAF5 for dark background.
```

---

## 14. SEASONAL & PROMOTIONAL ASSETS

### 14.1 Diwali Sale Banner

**Asset ID:** `promo-diwali-banner`
**Dimensions:** 1200x400px | **File format:** WebP

```
Prompt:
A rich, warm editorial banner photograph for a Diwali marketplace promotion. 
Multiple lit diyas (oil lamps) arranged in a decorative rangoli pattern 
on a dark terracotta floor. 
The diyas cast dancing warm golden and amber light. 
Marigold petals (yellow, deep crimson) are scattered in the rangoli. 
Background is very dark, the flames are the primary light source. 
Left third of the image is darker for text overlay.
Color: deep warm black, golden amber, orange-crimson.
Mood: festive but editorial — not garish. 
Kinfolk's Diwali, not a fireworks display.
[BAZL_STYLE]
No text in the image itself.
```

---

### 14.2 New Arrivals Promotional Strip

**Asset ID:** `promo-new-arrivals-strip`
**Dimensions:** 1200x180px | **File format:** WebP

```
Prompt:
A slim, horizontal promotional editorial strip. 
A row of freshly unwrapped artisan goods, still in their parchment paper 
wrapping, some open, some still sealed with wax. 
Overhead flat-lay shot, wooden surface, very warm directional light. 
Color palette: cream, warm ochre, kraft paper brown, small pops of 
terracotta. The image is extremely horizontal (6.6:1 ratio).
Left portion slightly darker for "NEW ARRIVALS" text overlay.
[BAZL_STYLE] [COLOR_TEMP]
```

---

## 15. SOCIAL MEDIA & OG IMAGES

### 15.1 Open Graph / Social Share Default Image

**Asset ID:** `og-default`
**Dimensions:** 1200x630px | **File format:** PNG/WebP

```
Prompt:
A beautiful, editorial Open Graph social share image for Bazl marketplace. 
1200x630px (standard OG size, 1.91:1 ratio).
Left 40%: Warm parchment background with BAZL wordmark centered vertically, 
Cormorant font, large. Below the wordmark, tagline in DM Sans: 
"Independent sellers. Extraordinary finds." Smallest: "bazl.in"
Right 60%: A beautiful editorial flat-lay of 4-5 artisan Indian products 
arranged artfully — ceramic, fabric, spice jar, brass item. 
Warm photography, transitioning to parchment on the left edge.
Color palette: warm parchment, deep black, saffron-red accent.
Must read clearly when shared on WhatsApp, Twitter/X, LinkedIn.
```

---

### 15.2 Product OG Image Template

**Asset ID:** `og-product-template`
**Dimensions:** 1200x630px | **File format:** PNG

```
Prompt:
An OG image template frame for individual product pages. 
Background: warm parchment #FDFAF5.
Left side (40% width): 
  - Product image area (square, hard edges, no border radius)
  - BAZL wordmark very small at bottom-left.
Right side (60% width): 
  - Product title in Cormorant (large)
  - Vendor name below in DM Sans small
  - Price in DM Sans bold
  - A small star rating line
  - Saffron-red horizontal rule divider
Border: a very thin 1px warm border #E0D9CF around the entire image.
Color palette: warm cream, warm black, saffron-red accents.
NOTE: Variables for title/price/image will be injected server-side.
```

---

## 16. FAVICON & APP ICON

### 16.1 Favicon

**Asset ID:** `favicon`
**Dimensions:** 32x32px, 16x16px | **File format:** ICO / SVG

```
Prompt:
A 32x32 favicon for Bazl marketplace. 
The letter "B" rendered in Cormorant display style — 
elegant, with calligraphic contrast between thick and thin strokes. 
The "B" fills most of the square frame with generous padding.
Color: #C84B0F saffron-red "B" on #1C1917 deep warm black background.
The "B" curves subtly reference a woven loop or knot — not a geometric circle.
Must read clearly at 16x16 and 32x32.
```

---

### 16.2 App Icon (PWA / 512px)

**Asset ID:** `app-icon-512`
**Dimensions:** 512x512px | **File format:** PNG

```
Prompt:
A 512x512 Progressive Web App icon for Bazl marketplace.
Background: rich warm black #1C1917.
Center element: the BAZL wordmark or stylized "B" monogram in 
warm parchment #FDFAF5, Cormorant-style calligraphic letterform.
The icon should feel like a wax seal or a premium stamp — 
solid, confident, brand-owned. 
Optional: a very faint geometric jaali (lattice) pattern 
in the background at ~10% opacity.
Must look excellent on iOS home screen and Android launcher.
Rounded corners will be applied by the OS — design as a square.
```

---

## GENERATION PRIORITY QUEUE

| Priority | Asset ID | Reason |
|---|---|---|
| P0 CRITICAL | `hero-mosaic-01` | First thing users see — homepage hero |
| P0 CRITICAL | `product-card-placeholder` | Used on every product card site-wide |
| P0 CRITICAL | `category-handcrafted` | Featured category tile in homepage grid |
| P1 HIGH | `empty-cart-illustration` | High-traffic empty state |
| P1 HIGH | `vendor-spotlight-bg` | Homepage featured vendor section |
| P1 HIGH | `auth-side-illustration` | Every login/signup impression |
| P1 HIGH | `order-success-illustration` | Post-purchase confidence signal |
| P1 HIGH | `email-header-order-confirmation` | Sent to every buyer |
| P2 MEDIUM | `error-404-illustration` | Branded error page |
| P2 MEDIUM | `og-default` | Social sharing default |
| P2 MEDIUM | `vendor-dashboard-header-bg` | Vendor dashboard experience |
| P2 MEDIUM | `admin-sidebar-bg` | Admin experience polish |
| P3 STANDARD | All remaining category tiles (x6) | Browse page category grid |
| P3 STANDARD | All remaining email headers (x4) | Email notification set |
| P3 STANDARD | All remaining empty states | Polish layer |
| P3 STANDARD | Seasonal promotional assets | Nice-to-have |

---

## FILE NAMING CONVENTION

```
/public/assets/
├── hero/
│   ├── hero-bg-texture.webp
│   ├── hero-mosaic-01.webp
│   └── hero-mosaic-02.webp
├── categories/
│   ├── category-handcrafted.webp
│   ├── category-apparel.webp
│   ├── category-home-decor.webp
│   ├── category-food-spices.webp
│   ├── category-beauty.webp
│   ├── category-jewelry.webp
│   ├── category-wellness.webp
│   └── category-stationery.webp
├── placeholders/
│   ├── product-card-placeholder.webp
│   ├── pdp-image-placeholder-main.webp
│   ├── pdp-image-placeholder-thumb.webp
│   └── vendor-store-banner-placeholder.webp
├── empty-states/
│   ├── empty-cart-illustration.svg
│   ├── empty-wishlist-illustration.svg
│   ├── empty-orders-illustration.svg
│   ├── empty-search-illustration.svg
│   ├── vendor-empty-orders.svg
│   ├── vendor-empty-products-illustration.svg
│   └── admin-empty-dashboard.svg
├── vendor/
│   ├── vendor-spotlight-bg.webp
│   ├── vendor-dashboard-header-bg.webp
│   ├── vendor-avatar-placeholder.webp
│   ├── vendor-image-dropzone.svg
│   └── vendor-chart-area-bg.webp
├── auth/
│   ├── auth-bg-pattern.webp
│   └── auth-side-illustration.webp
├── email/
│   ├── email-header-order-confirmation.png
│   ├── email-header-order-shipped.png
│   ├── email-header-review-request.png
│   ├── email-header-vendor-approved.png
│   └── email-header-welcome.png
├── errors/
│   ├── error-404-illustration.svg
│   ├── error-500-illustration.svg
│   └── maintenance-illustration.svg
├── icons/
│   ├── trust-secure-payment.svg
│   ├── trust-verified-vendors.svg
│   ├── trust-easy-returns.svg
│   ├── trust-pan-india.svg
│   ├── star-filled.svg
│   ├── star-empty.svg
│   ├── star-half.svg
│   ├── kpi-revenue.svg
│   ├── kpi-orders.svg
│   ├── kpi-pending.svg
│   ├── kpi-rating.svg
│   ├── vendor-low-stock-icon.svg
│   ├── vendor-verified-illustration.svg
│   ├── order-step-01-confirmed.svg
│   ├── order-step-02-shipped.svg
│   └── order-step-03-delivered.svg
├── mobile/
│   ├── mobile-splash-screen.png
│   └── mobile-product-swipe-bg.webp
├── social/
│   ├── og-default.png
│   └── og-product-template.png
├── promo/
│   ├── promo-diwali-banner.webp
│   └── promo-new-arrivals-strip.webp
├── brand/
│   ├── favicon.svg
│   ├── favicon-32.png
│   ├── favicon-16.png
│   ├── app-icon-512.png
│   └── section-divider-motif.svg
└── asset-prompts.md  (this file)
```

---

## TECHNICAL IMPLEMENTATION NOTES

### Image Optimization (Next.js)
- All WebP images served with `next/image` for automatic optimization
- Use `placeholder="blur"` with base64 blurDataURL for all hero/feature images
- Category tiles: `sizes="(max-width: 768px) 50vw, 16vw"` for responsive loading
- Set explicit `width` and `height` attributes to prevent Cumulative Layout Shift (CLS)

### SVG Usage
- All SVG icons inlined as React components for `currentColor` support
- Decorative SVGs: `aria-hidden="true"` | Meaningful SVGs: `aria-label` required
- Run all SVGs through SVGO for production optimization

### Color Accuracy
- Always include hex codes in AI generation prompts
- Post-process: verify warm-tone consistency across the asset set
- Brand parchment: #FDFAF5 — reject any image reading as pure white or cold

### Accessibility
- Product placeholder images: meaningful `alt` text set in code
- Decorative textures and backgrounds: `alt=""` (intentionally empty)
- All empty-state illustrations: descriptive `alt` text describing the situation

---

*Document Version: 1.0*  
*Prepared for: Bazl Multi-Vendor Marketplace*  
*Brand aesthetic: Warm, editorial, artisanal — Kinfolk magazine meets Indian craft heritage*  
*Last updated: 2026-06-17*
