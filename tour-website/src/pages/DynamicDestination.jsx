import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { DetailSkeleton } from '../components/Skeleton';
import DestinationDetailsTemplate from '../components/destination/DestinationDetailsTemplate';
import { normalizeDestinationDetail } from '../utils/destinationDetails';
import { toast } from 'react-hot-toast';

const DynamicDestination = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const rawQuery = (searchParams.get('q') || slug.replace(/-/g, ' ')).trim();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDestinationData = async () => {
      setLoading(true);
      try {
        let rawData = null;

        try {
          rawData = await api.searchPlace(rawQuery);
        } catch (searchErr) {
          console.warn('Primary destination lookup failed, falling back to AI search:', searchErr);
        }

        const hasUsefulShape =
          rawData &&
          rawData.success !== false &&
          (rawData.name || rawData.place || rawData.title || rawData.heroImage || rawData.images?.length);

        if (!hasUsefulShape) {
          const generated = await api.aiSearchDestination(rawQuery);
          rawData = generated?.data || generated;
        }

        if (!isMounted) return;

        const normalized = normalizeDestinationDetail(rawData || {}, {
          detailPath: `/dynamic-destination/${slug}?q=${encodeURIComponent(rawQuery)}`,
          source: 'dynamic',
          fallbackName: rawQuery || 'Dynamic Destination',
        });

        setData(normalized);
      } catch (err) {
        if (!isMounted) return;
        console.error('Dynamic destination load failed:', err);
        toast.error('Failed to fetch destination data. Please try another place.');
        setData(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDestinationData();

    return () => {
      isMounted = false;
    };
  }, [rawQuery, slug]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="text-2xl font-bold">Oops!</h2>
        <p className="max-w-md text-slate-500">Destination not found.</p>
        <Link
          to="/destinations"
          className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Go Back
        </Link>
      </div>
    );
  }

  return <DestinationDetailsTemplate destination={data} backLink="/destinations" />;
};

export default DynamicDestination;
