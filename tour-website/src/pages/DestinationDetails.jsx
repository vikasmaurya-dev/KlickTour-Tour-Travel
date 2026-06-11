import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { DetailSkeleton } from '../components/Skeleton';
import DestinationDetailsTemplate from '../components/destination/DestinationDetailsTemplate';
import { normalizeDestinationDetail } from '../utils/destinationDetails';
import { toast } from 'react-hot-toast';

const DestinationDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const destData = await api.getDestinationById(id);
        if (!isMounted) return;

        if (destData) {
          setData(
            normalizeDestinationDetail(destData, {
              detailPath: `/destination/${id}`,
              source: 'database',
            })
          );
        } else {
          setData(null);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching destination details:', error);
        toast.error('Failed to load destination details');
        setData(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetails();
    window.scrollTo(0, 0);

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="text-2xl font-bold">Destination Not Found</h2>
        <p className="max-w-md text-slate-500">
          The destination you requested could not be loaded. Please return to the destinations list and try again.
        </p>
        <Link
          to="/destinations"
          className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Back to Destinations
        </Link>
      </div>
    );
  }

  return <DestinationDetailsTemplate destination={data} backLink="/destinations" />;
};

export default DestinationDetails;
