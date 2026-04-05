import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { HiOutlineHome, HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiCheckCircle } from 'react-icons/hi2';
import { authDataContext } from '../../context/authContext';
import { useModal } from '../../context/ModalContext';
import Button from '../ui/Button';
import Input from '../ui/Input';

const emptyForm = {
    label: 'Home', firstName: '', lastName: '', email: '',
    street: '', city: '', state: '', zipcode: '', country: '', phone: ''
};

const SavedAddresses = ({ selectedId, onSelect }) => {
    const { serverUrl } = useContext(authDataContext);
    const { showAlert } = useModal();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${serverUrl}/api/address/list`, { withCredentials: true });
            setAddresses(data);
            // Auto-select default (home) address
            const def = data.find(a => a.isDefault);
            if (def && onSelect) onSelect(def);
            else if (data.length > 0 && onSelect && !selectedId) onSelect(data[0]);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAddresses(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (addr) => {
        setEditingId(addr._id);
        setForm({
            label: addr.label, firstName: addr.firstName, lastName: addr.lastName || '',
            email: addr.email || '', street: addr.street, city: addr.city, state: addr.state,
            zipcode: addr.zipcode, country: addr.country, phone: addr.phone
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const { data } = await axios.put(`${serverUrl}/api/address/update/${editingId}`, form, { withCredentials: true });
                setAddresses(data);
                showAlert('Address Updated', 'Your address has been updated.', 'success');
            } else {
                const { data } = await axios.post(`${serverUrl}/api/address/add`, form, { withCredentials: true });
                setAddresses(data);
                const def = data.find(a => a.isDefault);
                if (def && onSelect) onSelect(def);
                showAlert('Address Saved', 'Your address has been saved.', 'success');
            }
            setShowForm(false);
            setForm(emptyForm);
            setEditingId(null);
        } catch (err) {
            showAlert('Error', err.response?.data?.message || 'Failed to save address.', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            const { data } = await axios.delete(`${serverUrl}/api/address/delete/${id}`, { withCredentials: true });
            setAddresses(data);
            if (selectedId === id) {
                const def = data.find(a => a.isDefault) || data[0];
                if (def && onSelect) onSelect(def);
                else if (onSelect) onSelect(null);
            }
            showAlert('Deleted', 'Address removed.', 'success');
        } catch (err) {
            showAlert('Error', 'Failed to delete address.', 'error');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            const { data } = await axios.put(`${serverUrl}/api/address/default/${id}`, {}, { withCredentials: true });
            setAddresses(data);
            const def = data.find(a => a.isDefault);
            if (def && onSelect) onSelect(def);
        } catch (err) {
            showAlert('Error', 'Failed to set default.', 'error');
        }
    };

    if (loading) return <p className="text-sm text-[var(--text-muted)]">Loading saved addresses...</p>;

    return (
        <div className="flex flex-col gap-4">
            {addresses.length > 0 && (
                <div className="flex flex-col gap-3">
                    {addresses.map((addr) => {
                        const isSelected = selectedId === addr._id;
                        return (
                            <div
                                key={addr._id}
                                onClick={() => onSelect && onSelect(addr)}
                                className={`p-4 rounded-soft border cursor-pointer transition-all ${
                                    isSelected
                                        ? 'border-[var(--brand-primary)] bg-[var(--background-base)] ring-2 ring-[var(--brand-primary)]/10'
                                        : 'border-[var(--border-base)] hover:border-[var(--brand-secondary)]'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            {addr.label.toLowerCase() === 'home' && <HiOutlineHome className="w-4 h-4 text-[var(--brand-primary)]" />}
                                            <span className="text-sm font-bold">{addr.label}</span>
                                            {addr.isDefault && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[var(--brand-primary)] text-[var(--background-base)] rounded-full flex items-center gap-1">
                                                    <HiCheckCircle className="w-3 h-3" /> Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium">{addr.firstName} {addr.lastName}</p>
                                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                            {addr.street}, {addr.city}, {addr.state} {addr.zipcode}, {addr.country}
                                        </p>
                                        <p className="text-xs text-[var(--text-muted)] mt-1">📞 {addr.phone}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <button type="button" onClick={() => openEdit(addr)} className="p-1.5 hover:bg-[var(--background-subtle)] rounded-soft" title="Edit">
                                            <HiOutlinePencil className="w-4 h-4 text-[var(--text-muted)]" />
                                        </button>
                                        <button type="button" onClick={() => handleDelete(addr._id)} className="p-1.5 hover:bg-red-50 rounded-soft" title="Delete">
                                            <HiOutlineTrash className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                                {!addr.isDefault && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleSetDefault(addr._id); }}
                                        className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)] hover:underline mt-2"
                                    >
                                        Set as Default
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {!showForm && (
                <button
                    type="button"
                    onClick={openAdd}
                    className="flex items-center justify-center gap-2 p-4 rounded-soft border border-dashed border-[var(--border-base)] text-sm font-medium text-[var(--text-muted)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all"
                >
                    <HiOutlinePlus className="w-4 h-4" /> Add New Address
                </button>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 bg-[var(--background-subtle)]/50 rounded-soft border border-[var(--border-base)]">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold uppercase tracking-wider">{editingId ? 'Edit Address' : 'New Address'}</h4>
                        <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-xs text-[var(--text-muted)] hover:underline">Cancel</button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium">Label</label>
                        <select name="label" value={form.label} onChange={handleChange} className="px-3 py-2 bg-[var(--background-base)] border border-[var(--border-base)] rounded-soft text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)]">
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
                        <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} />
                    </div>
                    <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} />
                    <Input label="Street" name="street" value={form.street} onChange={handleChange} required />
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="City" name="city" value={form.city} onChange={handleChange} required />
                        <Input label="State" name="state" value={form.state} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Zipcode" name="zipcode" value={form.zipcode} onChange={handleChange} required />
                        <Input label="Country" name="country" value={form.country} onChange={handleChange} required />
                    </div>
                    <Input label="Phone" type="tel" name="phone" value={form.phone} onChange={handleChange} required />
                    <Button type="submit" className="mt-2">{editingId ? 'Update Address' : 'Save Address'}</Button>
                </form>
            )}
        </div>
    );
};

export default SavedAddresses;
