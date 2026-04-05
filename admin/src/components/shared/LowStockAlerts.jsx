import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { HiOutlineExclamationTriangle, HiOutlineNoSymbol, HiOutlinePlus, HiOutlineArrowPath } from 'react-icons/hi2';
import { authDataContext } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import Card from '../ui/Card';

const StockRow = ({ product, onRestock, severity }) => {
    const [adjust, setAdjust] = useState(10);
    const stock = product.stock ?? 0;
    const threshold = product.lowStockThreshold ?? 5;

    const colors = severity === 'out'
        ? 'border-red-300 bg-red-50/50'
        : 'border-orange-300 bg-orange-50/50';
    const pillColors = severity === 'out'
        ? 'bg-red-600 text-white'
        : 'bg-orange-500 text-white';

    return (
        <div className={`flex items-center gap-4 p-3 rounded-soft border ${colors}`}>
            <img src={product.image1} alt={product.name} className="w-14 h-14 rounded-soft object-cover border border-[var(--border-base)] shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{product.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{product.category} / {product.subCategory}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${pillColors}`}>
                        {severity === 'out' ? 'Out of Stock' : `${stock} left`}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">alert at ≤{threshold}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <input
                    type="number"
                    value={adjust}
                    onChange={(e) => setAdjust(Number(e.target.value) || 0)}
                    min="1"
                    className="w-16 px-2 py-1.5 bg-white border border-[var(--border-base)] rounded-soft text-sm text-center focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)]"
                />
                <button
                    type="button"
                    onClick={() => onRestock(product._id, adjust)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--brand-primary)] text-[var(--background-base)] text-xs font-bold rounded-soft hover:opacity-90 transition-opacity"
                    title="Restock"
                >
                    <HiOutlinePlus className="w-3.5 h-3.5" /> Restock
                </button>
            </div>
        </div>
    );
};

const LowStockAlerts = ({ compact = false }) => {
    const { serverUrl } = useContext(authDataContext);
    const { showAlert } = useModal();
    const [data, setData] = useState({ outOfStock: [], lowStock: [], summary: { totalAlerts: 0, outOfStockCount: 0, lowStockCount: 0 } });
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${serverUrl}/api/inventory/low-stock`, { withCredentials: true });
            if (data.success) setData(data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const restock = async (productId, delta) => {
        try {
            const { data: res } = await axios.put(
                `${serverUrl}/api/inventory/stock/${productId}`,
                { delta },
                { withCredentials: true }
            );
            if (res.success) {
                showAlert('Restocked', `Added ${delta} units. New stock: ${res.product.stock}.`, 'success');
                load();
            }
        } catch (err) {
            showAlert('Error', 'Failed to update stock.', 'error');
        }
    };

    if (loading) {
        return (
            <Card className="animate-pulse h-40" />
        );
    }

    const { outOfStock, lowStock, summary } = data;

    if (summary.totalAlerts === 0) {
        return (
            <Card className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-green-50 text-green-600">
                            <HiOutlineExclamationTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Inventory Health</h3>
                            <p className="text-xs text-[var(--text-muted)]">All products well stocked ✓</p>
                        </div>
                    </div>
                    <button onClick={load} className="p-2 text-[var(--text-muted)] hover:text-[var(--brand-primary)]" title="Refresh">
                        <HiOutlineArrowPath className="w-4 h-4" />
                    </button>
                </div>
            </Card>
        );
    }

    const visibleOut = compact ? outOfStock.slice(0, 3) : outOfStock;
    const visibleLow = compact ? lowStock.slice(0, 5) : lowStock;

    return (
        <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                        <HiOutlineExclamationTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base">Inventory Alerts</h3>
                        <p className="text-xs text-[var(--text-muted)]">
                            {summary.outOfStockCount > 0 && <span className="text-red-600 font-bold">{summary.outOfStockCount} out of stock</span>}
                            {summary.outOfStockCount > 0 && summary.lowStockCount > 0 && ' • '}
                            {summary.lowStockCount > 0 && <span className="text-orange-600 font-bold">{summary.lowStockCount} running low</span>}
                        </p>
                    </div>
                </div>
                <button onClick={load} className="p-2 text-[var(--text-muted)] hover:text-[var(--brand-primary)]" title="Refresh">
                    <HiOutlineArrowPath className="w-4 h-4" />
                </button>
            </div>

            {visibleOut.length > 0 && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 mt-1">
                        <HiOutlineNoSymbol className="w-4 h-4 text-red-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-red-700">Out of Stock</h4>
                    </div>
                    {visibleOut.map(p => (
                        <StockRow key={p._id} product={p} onRestock={restock} severity="out" />
                    ))}
                </div>
            )}

            {visibleLow.length > 0 && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 mt-1">
                        <HiOutlineExclamationTriangle className="w-4 h-4 text-orange-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-orange-700">Running Low</h4>
                    </div>
                    {visibleLow.map(p => (
                        <StockRow key={p._id} product={p} onRestock={restock} severity="low" />
                    ))}
                </div>
            )}

            {compact && (outOfStock.length > visibleOut.length || lowStock.length > visibleLow.length) && (
                <p className="text-xs text-center text-[var(--text-muted)] mt-2">
                    + {(outOfStock.length - visibleOut.length) + (lowStock.length - visibleLow.length)} more alerts
                </p>
            )}
        </Card>
    );
};

export default LowStockAlerts;
