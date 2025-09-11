import { Header, TripCard } from "components";
import {
  type LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
  useNavigate,
} from "react-router";
import { getAllTrips } from "~/appwrite/trips";
import { parseTripData } from "lib/utils";
import { type TripDetailLoaderData } from "./trip-detail";
import { useState } from "react";
import { PagerComponent } from "@syncfusion/ej2-react-grids/src/pager/pager.component";

const PAGE_LIMIT = 8;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const offset = (page - 1) * PAGE_LIMIT;

  const { allTrips, total } = await getAllTrips(PAGE_LIMIT, offset);

  return {
    allTrips: allTrips.map(({ $id, tripDetails, imageUrls, userId }) => ({
      id: $id,
      ...parseTripData(tripDetails),
      imageUrls: imageUrls ?? [],
      userId,
    })),
    total,
  };
};

const Explore = () => {
  const loaderData = useLoaderData() as TripDetailLoaderData;
  const trips = loaderData.allTrips;
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const initialPage = Number(searchParams.get("page") || "1");

  const [currentPage, setCurrentPage] = useState(initialPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    navigate(`?page=${page}`, { replace: false });
  };

  return (
    <main className='all-users wrapper'>
      <Header
        title='Explore Trips'
        description='View AI-generated travel plans created by all users'
      />

      <section>
        <h1 className='p-24-semibold text-dark-100 mb-4'>
          Community-Created Trips
        </h1>

        <div className='trip-grid mb-4'>
          {trips.map(
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
          totalRecordsCount={loaderData.total}
          pageSize={PAGE_LIMIT}
          currentPage={currentPage}
          click={(args) => handlePageChange(args.currentPage)}
          cssClass='!mb-4'
        />
      </section>
    </main>
  );
};

export default Explore;
