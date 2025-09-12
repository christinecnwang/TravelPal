import { Header, TripCard } from "components";
import {
  type LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
  useNavigate,
} from "react-router";
import { getAllTrips } from "~/appwrite/trips";
import { account } from "~/appwrite/client";
import { parseTripData } from "lib/utils";
import { type TripDetailLoaderData } from "./trip-detail";
import { useState, useEffect } from "react";
import { PagerComponent } from "@syncfusion/ej2-react-grids/src/pager/pager.component";

const PAGE_LIMIT = 8;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { allTrips } = await getAllTrips();

  return {
    allTrips: allTrips.map(({ $id, tripDetails, imageUrls, userId }) => ({
      id: $id,
      ...parseTripData(tripDetails),
      imageUrls: imageUrls ?? [],
      userId,
    })),
  };
};

const Trips = () => {
  const loaderData = useLoaderData() as TripDetailLoaderData;
  const allTrips = loaderData.allTrips;

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    account
      .get()
      .then((user) => {
        setUserId(user.$id);
        setLoading(false);
      })
      .catch(() => {
        navigate("/sign-in");
      });
  }, [navigate]);

  const [searchParams] = useSearchParams();
  const initialPage = Number(searchParams.get("page") || "1");
  const [currentPage, setCurrentPage] = useState(initialPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    navigate(`?page=${page}`);
  };

  if (loading) return <div>Loading...</div>;

  // Filter trips and paginate
  const userTrips = allTrips.filter((trip) => trip.userId === userId);
  const total = userTrips.length;
  const paginatedTrips = userTrips.slice(
    (currentPage - 1) * PAGE_LIMIT,
    currentPage * PAGE_LIMIT
  );

  return (
    <main className='all-users wrapper'>
      <Header
        title='My Trips'
        description='View and edit your AI-generated travel plans'
        ctaText='Create a trip'
        ctaUrl='/trips/create'
      />

      <section>
        <h1 className='p-24-semibold text-dark-100 mb-4'>
          Manage Created Trips
        </h1>

        <div className='trip-grid mb-4'>
          {paginatedTrips.map(
            ({
              id,
              name,
              imageUrls,
              itinerary,
              interests,
              travelStyle,
              estimatedPrice,
            }) => (
              <TripCard
                id={id}
                key={id}
                name={name}
                location={itinerary?.[0]?.location ?? ""}
                imageUrl={imageUrls[0]}
                tags={[interests, travelStyle]}
                price={estimatedPrice}
              />
            )
          )}
        </div>

        <PagerComponent
          totalRecordsCount={total}
          pageSize={PAGE_LIMIT}
          currentPage={currentPage}
          click={(args) => handlePageChange(args.currentPage)}
          cssClass='!mb-4'
        />
      </section>
    </main>
  );
};

export default Trips;
