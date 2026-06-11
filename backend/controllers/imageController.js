import { getDestinationImages, getHotelImages } from '../services/imageService.js';

export const resolveSmartImages = async (req, res) => {
  try {
    const input = {
      ...req.query,
      ...req.body,
    };

    const images = input.type === 'hotel' || input.entityType === 'hotel'
      ? await getHotelImages(input)
      : await getDestinationImages(input);
    res.json({
      success: true,
      data: images,
      message: 'Smart images resolved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to resolve smart images',
      error: error.message,
    });
  }
};
