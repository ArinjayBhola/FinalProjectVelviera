import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * EmbeddingStore — disk-persisted vector cache.
 *
 * Stores per-product:
 *   - text embedding (MiniLM, 384-d) built from name+desc+category+subCategory
 *   - image embeddings (CLIP, 512-d) — one per product image URL
 *
 * Entries are keyed by productId + a "signature" (hash of source text / image URL).
 * When the source changes, the signature changes, and the cache entry is regenerated.
 *
 * Persistence path: backend/public/.embedding-cache.json
 * We save to disk on every update (debounced) so restarts are warm.
 */
class EmbeddingStore {
    constructor() {
        this.filePath = path.join(__dirname, '..', 'public', '.embedding-cache.json');
        // Map<productId, { textSig, textVec, images: { [url]: imgVec } }>
        this.cache = new Map();
        this.dirty = false;
        this.saveTimer = null;
        this._loaded = false;
    }

    load() {
        if (this._loaded) return;
        try {
            if (fs.existsSync(this.filePath)) {
                const raw = fs.readFileSync(this.filePath, 'utf8');
                const obj = JSON.parse(raw);
                for (const [pid, entry] of Object.entries(obj)) {
                    this.cache.set(pid, entry);
                }
                console.log(`[EmbeddingStore] Loaded ${this.cache.size} cached product embeddings from disk.`);
            } else {
                console.log('[EmbeddingStore] No on-disk cache found; starting fresh.');
            }
        } catch (e) {
            console.log('[EmbeddingStore] Failed to load cache:', e.message);
            this.cache = new Map();
        }
        this._loaded = true;
    }

    _scheduleSave() {
        this.dirty = true;
        if (this.saveTimer) return;
        this.saveTimer = setTimeout(() => {
            this.saveTimer = null;
            this._flush();
        }, 2000);
    }

    _flush() {
        if (!this.dirty) return;
        try {
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const obj = Object.fromEntries(this.cache);
            fs.writeFileSync(this.filePath, JSON.stringify(obj));
            this.dirty = false;
        } catch (e) {
            console.log('[EmbeddingStore] Save failed:', e.message);
        }
    }

    flushSync() {
        if (this.saveTimer) { clearTimeout(this.saveTimer); this.saveTimer = null; }
        this._flush();
    }

    // Simple, fast hash (FNV-1a) for strings — used as signature
    hash(s) {
        let h = 2166136261;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = (h * 16777619) >>> 0;
        }
        return h.toString(16);
    }

    getTextVec(productId) {
        const entry = this.cache.get(productId);
        return entry?.textVec || null;
    }

    getTextSig(productId) {
        return this.cache.get(productId)?.textSig || null;
    }

    setTextVec(productId, textSig, vec) {
        const entry = this.cache.get(productId) || { images: {} };
        entry.textSig = textSig;
        entry.textVec = vec;
        this.cache.set(productId, entry);
        this._scheduleSave();
    }

    getImageVec(productId, url) {
        const entry = this.cache.get(productId);
        return entry?.images?.[url] || null;
    }

    setImageVec(productId, url, vec) {
        const entry = this.cache.get(productId) || { images: {} };
        if (!entry.images) entry.images = {};
        entry.images[url] = vec;
        this.cache.set(productId, entry);
        this._scheduleSave();
    }

    // Prune entries for products that no longer exist
    pruneMissing(existingIds) {
        const existing = new Set(existingIds.map(String));
        let removed = 0;
        for (const pid of this.cache.keys()) {
            if (!existing.has(pid)) {
                this.cache.delete(pid);
                removed++;
            }
        }
        if (removed > 0) {
            this._scheduleSave();
            console.log(`[EmbeddingStore] Pruned ${removed} stale entries.`);
        }
    }

    stats() {
        let imgCount = 0;
        for (const entry of this.cache.values()) {
            imgCount += Object.keys(entry.images || {}).length;
        }
        return { products: this.cache.size, imageVectors: imgCount };
    }
}

const embeddingStore = new EmbeddingStore();
export default embeddingStore;
