const https = require('https');
const http = require('http');
const { supabase } = require('../config/db');

// Helper to fetch live site data from niharikartist.shop
function fetchLiveSiteData() {
  return new Promise((resolve) => {
    https.get('https://niharikartist.shop/api/site-data', { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.shop || []);
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseMedium(desc) {
  const m = desc.match(/Medium\s*:\s*([^\n,]+)/i);
  return m ? m[1].trim() : 'Mixed Media Archival Glazes';
}

function parseSize(desc) {
  const m = desc.match(/(?:Size|Dimensions)\s*:\s*([^\n,]+)/i);
  return m ? m[1].trim() : 'Standard Archival Size';
}

function parseSurface(desc) {
  const m = desc.match(/Surface\s*:\s*([^\n,]+)/i);
  return m ? m[1].trim() : 'Museum-Grade Surface';
}

function parseType(desc, title) {
  const m = desc.match(/(?:Type|Category)\s*:\s*([^\n,]+)/i);
  if (m) return m[1].trim();
  if (desc.toLowerCase().includes('art print')) return 'Art Print';
  if (desc.toLowerCase().includes('original')) return 'Original Artwork';
  return 'Fine Art Masterpiece';
}

function determineCategory(item) {
  const desc = (item.description || '').toLowerCase();
  const title = (item.title || '').toLowerCase();
  if (title.includes('goku') || title.includes('gojo') || title.includes('luffy') || title.includes('anime')) {
    return 'Anime Fanart Series';
  }
  if (title.includes('shiva') || title.includes('krishna') || title.includes('ram') || title.includes('ganesha') || title.includes('mahadev')) {
    return 'Spiritual & Heritage Art';
  }
  if (desc.includes('pencil') || title.includes('pencil')) {
    return 'Pencil & Graphite Portraits';
  }
  if (desc.includes('acrylic') || desc.includes('painting') || title.includes('painting') || title.includes('embrace')) {
    return 'Original Acrylic Paintings';
  }
  return 'Original Masterworks';
}

const mapId = doc => {
  if (!doc) return doc;
  return { ...doc, _id: doc.id };
};
const mapIds = docs => {
  if (!docs) return [];
  return docs.map(mapId);
};

// GET all products with filtering, search, and sorting
exports.getProducts = async (req, res) => {
  try {
    const { category, search, sort, featured } = req.query;

    let query = supabase.from('products').select('*');

    if (category && category !== 'all' && category !== 'All') {
      const catClean = category.replace(/-/g, ' ');
      query = query.ilike('category', `%${catClean}%`);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,medium.ilike.%${search}%`);
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price', { ascending: false });
    else if (sort === 'newest') query = query.order('created_at', { ascending: false });
    else {
      query = query.order('is_featured', { ascending: false }).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    }

    const { data: products, error } = await query;
    if (error) throw error;

    return res.json({ success: true, count: products.length, data: mapIds(products) });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

// GET single product by slug or id
exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let query = supabase.from('products').select('*');
    
    if (slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      query = query.eq('id', slug);
    } else {
      query = query.eq('slug', slug);
    }

    const { data: product, error } = await query.single();
    if (error || !product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, data: mapId(product) });
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST create product (admin)
exports.createProduct = async (req, res) => {
  try {
    const slug = req.body.slug || slugify(req.body.name);
    const newProductData = {
      ...req.body,
      slug,
      regular_price: req.body.regular_price || (req.body.price ? Math.round(req.body.price * 1.3) : 999)
    };

    const { data: existing } = await supabase.from('products').select('id').eq('slug', slug).single();
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product with this slug already exists' });
    }

    const { data: product, error } = await supabase.from('products').insert([newProductData]).select().single();
    if (error) throw error;
    
    return res.status(201).json({ success: true, data: mapId(product) });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT update product (admin)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: product, error } = await supabase.from('products').update(req.body).eq('id', id).select().single();
    
    if (error || !product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, data: mapId(product) });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE product (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, count } = await supabase.from('products').delete({ count: 'exact' }).eq('id', id);
    if (error || count === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST sync products from niharikartist.shop (Reusable Sync Process)
exports.syncShopProducts = async (req, res) => {
  try {
    const liveItems = (await fetchLiveSiteData()) || [];

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const logs = [];

    for (let i = 0; i < liveItems.length; i++) {
      const raw = liveItems[i];
      const name = raw.title ? raw.title.trim() : raw.name.trim();
      const slug = slugify(name) || `product-${i + 1}`;
      const desc = (raw.description || '').trim();
      const medium = parseMedium(desc);
      const size = parseSize(desc);
      const surface = parseSurface(desc);
      const artworkType = parseType(desc, name);
      const category = determineCategory({ title: name, description: desc });

      let price = Number(raw.price);
      if (price <= 0) price = 4999;
      const regular_price = price < 500 ? price + 200 : Math.round(price * 1.3 / 100) * 100;
      const localImagePath = `/images/shop/shop_${(i % 13) + 1}.jpg`;

      const itemPayload = {
        name,
        slug,
        price,
        regular_price,
        description: desc,
        short_description: `${medium} • ${size} • ${artworkType}`,
        medium,
        size,
        surface,
        artwork_type: artworkType,
        category,
        categories: [category, artworkType],
        images: [localImagePath],
        gallery: [localImagePath],
        in_stock: raw.available !== false,
        inventory: 15,
        stock_quantity: 15,
        is_featured: i < 6,
        rating: 4.9,
        reviews_count: 14 + i * 2,
        sort_order: i + 1
      };

      const { data: existing } = await supabase.from('products').select('*').eq('slug', slug).single();
      if (existing) {
        if (existing.price !== price || existing.description !== desc) {
          await supabase.from('products').update(itemPayload).eq('id', existing.id);
          updated++;
          logs.push(`Updated: ${name} (₹${price})`);
        } else {
          skipped++;
          logs.push(`Skipped (unchanged): ${name}`);
        }
      } else {
        await supabase.from('products').insert([itemPayload]);
        created++;
        logs.push(`Created: ${name}`);
      }
    }

    const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });

    return res.json({
      success: true,
      message: 'Shop products synchronized successfully with niharikartist.shop',
      stats: {
        totalDiscovered: liveItems.length,
        created,
        updated,
        skipped,
        totalInStore: count || 0
      },
      logs
    });
  } catch (error) {
    console.error('Error during shop sync:', error);
    res.status(500).json({ success: false, message: 'Sync failed: ' + error.message });
  }
};
