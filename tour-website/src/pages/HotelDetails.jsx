import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { hotelService } from '../services/hotelService';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DetailSkeleton } from '../components/Skeleton';
import HotelDetailsTemplate from '../components/hotel/HotelDetailsTemplate';
import { normalizeHotelDetails } from '../utils/hotelDetails';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hotelRaw, setHotelRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState({ reviews: [], count: 0, averageRating: 0 });
  const [similarHotels, setSimilarHotels] = useState([]);
  const [wishlistSaved, setWishlistSaved] = useState(false);

  const hotel = useMemo(() => normalizeHotelDetails(hotelRaw || {}), [hotelRaw]);

  useEffect(() => {
    let active = true;

    const loadHotel = async () => {
      try {
        setLoading(true);

        const [hotelData, reviewData] = await Promise.all([
          hotelService.getHotelById(id),
          api.getReviews('hotel', id),
        ]);

        if (!active) return;

        setHotelRaw(hotelData);
        setReviews(reviewData || { reviews: [], count: 0, averageRating: 0 });

        const locationQuery = hotelData?.location || hotelData?.city || hotelData?.name || '';
        const matchedHotels = locationQuery
          ? await hotelService.getHotels({ destination: locationQuery, limit: 4 })
          : [];

        if (!active) return;

        const currentId = String(hotelData?._id || hotelData?.id || id);
        setSimilarHotels(
          (Array.isArray(matchedHotels) ? matchedHotels : [])
            .filter((item) => String(item._id || item.id) !== currentId)
            .slice(0, 4)
        );

        if (user) {
          const wishlist = await api.getWishlist();
          if (!active) return;
          setWishlistSaved(
            Array.isArray(wishlist) &&
              wishlist.some((item) => item.itemType === 'hotel' && String(item.itemId) === currentId)
          );
        }
      } catch (err) {
        console.error('Hotel not found', err);
        navigate('/hotels');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadHotel();

    return () => {
      active = false;
    };
  }, [id, navigate, user]);

  const handleWishlist = useCallback(async () => {
    if (!user) {
      alert('Please login to save this hotel.');
      return;
    }

    try {
      const result = await api.toggleWishlist({
        itemType: 'hotel',
        itemId: String(hotelRaw?._id || hotelRaw?.id || id),
        title: hotel.name,
        image: hotel.heroImage || hotel.imagePool?.[0] || hotel.gallery?.[0],
        price: hotel.pricePerNight,
        meta: hotel.location,
      });

      setWishlistSaved(Boolean(result?.saved));
    } catch (err) {
      alert(err.message);
    }
  }, [hotel, hotelRaw, id, user]);

  if (loading) return <DetailSkeleton />;
  if (!hotelRaw) return null;

  return (
    <HotelDetailsTemplate
      key={hotel.id || hotel.name}
      hotel={hotel}
      reviewsData={reviews}
      similarHotels={similarHotels}
      wishlistSaved={wishlistSaved}
      onToggleWishlist={handleWishlist}
    />
  );
};

export default HotelDetails;
