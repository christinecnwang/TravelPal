import { Header, StatsCard, TripCard } from "../../../components";
import { getAllUsers, getUser } from "~/appwrite/auth";
import type { Route } from "./+types/dashboard";
import {
  getTripsByTravelStyle,
  getUserGrowthPerDay,
  getUsersAndTripsStats,
} from "~/appwrite/dashboard";
import { getAllTrips } from "~/appwrite/trips";
import {
  Category,
  ChartComponent,
  ColumnSeries,
  DataLabel,
  SeriesCollectionDirective,
  SeriesDirective,
  SplineAreaSeries,
  Tooltip,
} from "@syncfusion/ej2-react-charts";
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
  Inject,
} from "@syncfusion/ej2-react-grids";
import { tripXAxis, tripyAxis, userXAxis, useryAxis } from "~/constants";
import { parseTripData } from "lib/utils";

export const clientLoader = async () => {
  const [
    user,
    dashboardStats,
    trips,
    userGrowth,
    tripsByTravelStyle,
    allUsers,
  ] = await Promise.all([
    await getUser(),
    await getUsersAndTripsStats(),
    await getAllTrips(),
    await getUserGrowthPerDay(),
    await getTripsByTravelStyle(),
    await getAllUsers(),
  ]);

  // Map trips by userId for quick lookup
  const tripsByUserId = trips.allTrips.reduce(
    (acc: { [key: string]: number }, trip) => {
      acc[trip.userId] = (acc[trip.userId] || 0) + 1;
      return acc;
    },
    {}
  );

  const latestUsers = allUsers.users.sort(
    (a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
  );

  // Map users with their trip counts
  const mappedUsers: UsersItineraryCount[] = latestUsers.map((user) => ({
    imageUrl: user.imageUrl,
    name: user.name,
    count: tripsByUserId[user.accountId] || 0,
  }));

  const allTrips = trips.allTrips.map(({ $id, tripDetails, imageUrls }) => ({
    id: $id,
    ...parseTripData(tripDetails),
    imageUrls: imageUrls ?? [],
  }));

  return {
    user,
    dashboardStats,
    allTrips: allTrips,
    userGrowth,
    tripsByTravelStyle,
    allUsers: mappedUsers,
  };
};

const Dashboard = ({ loaderData }: Route.ComponentProps) => {
  const user = loaderData.user as User | null;
  const { dashboardStats, allTrips, userGrowth, tripsByTravelStyle, allUsers } =
    loaderData;

  const createdTrips = allTrips.slice(0, 4);

  const tripsByUniqueInterests = Object.values(
    allTrips.reduce(
      (
        acc: Record<
          string,
          { imageUrl: string; name: string; interest: string }
        >,
        trip
      ) => {
        if (trip.interests) {
          if (!acc[trip.interests]) {
            acc[trip.interests] = {
              imageUrl: trip.imageUrls[0],
              name: trip.name || "Unknown Trip",
              interest: trip.interests,
            };
          }
        }
        return acc;
      },
      {}
    )
  );

  const usersAndTrips = [
    {
      title: "Latest user signups",
      dataSource: allUsers,
      field: "count",
      headerText: "Trips created",
    },
    {
      title: "Trips based on interests",
      dataSource: tripsByUniqueInterests,
      field: "interest",
      headerText: "Interests",
    },
  ];

  return (
    <main className='dashboard wrapper'>
      <Header
        title={`Welcome ${user?.name ?? "Guest"} 👋`}
        description='Track activity, trends and popular destinations in real time'
      />

      <section className='flex flex-col gap-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full'>
          <StatsCard
            headerTitle='Total Users'
            total={dashboardStats.totalUsers}
            currentMonthCount={dashboardStats.usersJoined.currentMonth}
            lastMonthCount={dashboardStats.usersJoined.lastMonth}
          />
          <StatsCard
            headerTitle='Active Users'
            total={dashboardStats.userRole.total}
            currentMonthCount={dashboardStats.userRole.currentMonth}
            lastMonthCount={dashboardStats.userRole.lastMonth}
          />
          <StatsCard
            headerTitle='Total Trips'
            total={dashboardStats.totalTrips}
            currentMonthCount={dashboardStats.tripsCreated.currentMonth}
            lastMonthCount={dashboardStats.tripsCreated.lastMonth}
          />
        </div>
      </section>
      <section className='container'>
        <h1 className='text-xl font-semibold text-dark-100'>
          Recently Created Trips
        </h1>

        <div className='trip-grid'>
          {createdTrips.map((trip) => (
            <TripCard
              key={trip.id}
              id={trip.id.toString()}
              name={trip.name!}
              imageUrl={trip.imageUrls[0]}
              location={trip.itinerary?.[0]?.location ?? ""}
              tags={[trip.interests!, trip.travelStyle!]}
              price={trip.estimatedPrice!}
            />
          ))}
        </div>
      </section>

      <section className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
        <ChartComponent
          id='chart-1'
          primaryXAxis={userXAxis}
          primaryYAxis={useryAxis}
          title='User Growth'
          tooltip={{ enable: true }}
        >
          <Inject
            services={[
              ColumnSeries,
              SplineAreaSeries,
              Category,
              DataLabel,
              Tooltip,
            ]}
          />

          <SeriesCollectionDirective>
            <SeriesDirective
              dataSource={userGrowth}
              xName='day'
              yName='count'
              type='Column'
              name='User Count'
              columnWidth={0.3}
              cornerRadius={{ topLeft: 10, topRight: 10 }}
              fill='#4784EE'
            />

            <SeriesDirective
              dataSource={userGrowth}
              xName='day'
              yName='count'
              type='SplineArea'
              name='Wave'
              fill='none'
              border={{ width: 2, color: "#4784EE" }}
            />
          </SeriesCollectionDirective>
        </ChartComponent>

        <ChartComponent
          id='chart-2'
          primaryXAxis={{
            ...tripXAxis,
            labelRotation: 20,
          }}
          primaryYAxis={tripyAxis}
          title='Trip Trends'
          tooltip={{ enable: true }}
        >
          <Inject
            services={[
              ColumnSeries,
              SplineAreaSeries,
              Category,
              DataLabel,
              Tooltip,
            ]}
          />

          <SeriesCollectionDirective>
            <SeriesDirective
              dataSource={tripsByTravelStyle}
              xName='interest'
              yName='count'
              type='Column'
              name='Trip Count'
              columnWidth={0.3}
              cornerRadius={{ topLeft: 10, topRight: 10 }}
              fill='#4784EE'
            />
          </SeriesCollectionDirective>
        </ChartComponent>
      </section>

      <section className='user-trip wrapper'>
        {usersAndTrips.map(({ title, dataSource, field, headerText }, i) => (
          <div key={i} className='flex flex-col max-h-[400px] rounded-lg p-4'>
            <div className='sticky top-0 z-10 px-4 pb-3 border-b border-gray-300'>
              <h3 className='p-20-semibold text-dark-100'>{title}</h3>
            </div>

            <GridComponent
              dataSource={dataSource}
              gridLines='None'
              className='overflow-y-auto'
            >
              <ColumnsDirective>
                <ColumnDirective
                  field='name'
                  headerText='Name'
                  width='200'
                  textAlign='Left'
                  template={(props: UserData) => (
                    <div className='flex items-center gap-1.5 px-4'>
                      <img
                        src={props.imageUrl}
                        alt='user'
                        className='rounded-full size-8 aspect-square'
                        referrerPolicy='no-referrer'
                      />
                      <span>{props.name}</span>
                    </div>
                  )}
                />

                <ColumnDirective
                  field={field}
                  headerText={headerText}
                  width='150'
                  textAlign='Left'
                />
              </ColumnsDirective>
            </GridComponent>
          </div>
        ))}
      </section>
    </main>
  );
};
export default Dashboard;
