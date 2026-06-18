import Address from '../models/address.js';
export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
};
export const createAddress = async (req, res, next) => {
  try {
    const { fullName, addressLine, city, postalCode, country, phone, isDefault } = req.body;
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }
    const address = await Address.create({
      user: req.user._id,
      fullName,
      addressLine,
      city,
      postalCode,
      country,
      phone,
      isDefault: isDefault || false
    });
    res.status(201).json({ success: true, address });
  } catch (error) {
    next(error);
  }
};
export const updateAddress = async (req, res, next) => {
  try {
    const { fullName, addressLine, city, postalCode, country, phone, isDefault } = req.body;
    let address = await Address.findById(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }
    address = await Address.findByIdAndUpdate(
      req.params.id,
      { fullName, addressLine, city, postalCode, country, phone, isDefault },
      { new: true }
    );
    res.status(200).json({ success: true, address });
  } catch (error) {
    next(error);
  }
};
export const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);
   if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await address.deleteOne();
    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
};