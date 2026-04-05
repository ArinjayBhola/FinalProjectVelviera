import User from "../model/userModel.js";

// Get all saved addresses for current user
export const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("addresses");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user.addresses || []);
    } catch (error) {
        console.log("getAddresses error", error);
        return res.status(500).json({ message: `getAddresses error ${error.message}` });
    }
};

// Add a new address. If it's marked default OR labelled Home OR it's the first address,
// make it the default and unset default on all others.
export const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const {
            label = "Home", firstName, lastName = "", email = "",
            street, city, state, zipcode, country, phone,
            isDefault = false
        } = req.body;

        if (!firstName || !street || !city || !state || !zipcode || !country || !phone) {
            return res.status(400).json({ message: "Missing required address fields" });
        }

        const isFirstAddress = user.addresses.length === 0;
        const shouldBeDefault = isDefault || isFirstAddress || label.toLowerCase() === "home";

        if (shouldBeDefault) {
            user.addresses.forEach(a => { a.isDefault = false; });
        }

        user.addresses.push({
            label, firstName, lastName, email,
            street, city, state, zipcode, country, phone,
            isDefault: shouldBeDefault
        });

        await user.save();
        return res.status(201).json(user.addresses);
    } catch (error) {
        console.log("addAddress error", error);
        return res.status(500).json({ message: `addAddress error ${error.message}` });
    }
};

// Update an existing address
export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const address = user.addresses.id(addressId);
        if (!address) return res.status(404).json({ message: "Address not found" });

        const fields = ["label", "firstName", "lastName", "email", "street", "city", "state", "zipcode", "country", "phone"];
        fields.forEach(f => {
            if (req.body[f] !== undefined) address[f] = req.body[f];
        });

        await user.save();
        return res.status(200).json(user.addresses);
    } catch (error) {
        console.log("updateAddress error", error);
        return res.status(500).json({ message: `updateAddress error ${error.message}` });
    }
};

// Delete an address. If it was the default, promote another (prefer Home label) to default.
export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const address = user.addresses.id(addressId);
        if (!address) return res.status(404).json({ message: "Address not found" });

        const wasDefault = address.isDefault;
        user.addresses.pull(addressId);

        if (wasDefault && user.addresses.length > 0) {
            const home = user.addresses.find(a => a.label.toLowerCase() === "home");
            (home || user.addresses[0]).isDefault = true;
        }

        await user.save();
        return res.status(200).json(user.addresses);
    } catch (error) {
        console.log("deleteAddress error", error);
        return res.status(500).json({ message: `deleteAddress error ${error.message}` });
    }
};

// Set a specific address as default
export const setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        let found = false;
        user.addresses.forEach(a => {
            if (a._id.toString() === addressId) {
                a.isDefault = true;
                found = true;
            } else {
                a.isDefault = false;
            }
        });

        if (!found) return res.status(404).json({ message: "Address not found" });

        await user.save();
        return res.status(200).json(user.addresses);
    } catch (error) {
        console.log("setDefaultAddress error", error);
        return res.status(500).json({ message: `setDefaultAddress error ${error.message}` });
    }
};
