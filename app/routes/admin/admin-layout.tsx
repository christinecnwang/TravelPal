import { Outlet, redirect } from "react-router";
import { SidebarComponent } from "@syncfusion/ej2-react-navigations";
import MobileSidebar from "components/MobileSidebar";
import NavItems from "components/NavItems";
import { account } from "~/appwrite/client";
import { getExistingUser, storeUserData } from "~/appwrite/auth";

export async function clientLoader({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);

    const publicPages = ["/explore", "/trips"];
    if (publicPages.some((page) => url.pathname.startsWith(page))) {
      return null;
    }

    const user = await account.get();
    if (!user.$id) return redirect("/sign-in");

    const existingUser = await getExistingUser(user.$id);

    return existingUser?.$id ? existingUser : await storeUserData();
  } catch (error) {
    console.log("Error in clientLoader", error);
    return redirect("/sign-in");
  }
}

const AdminLayout = () => {
  return (
    <div className='admin-layout'>
      <MobileSidebar />

      <aside className='w-full max-w-[270px] hidden lg:block'>
        {" "}
        Sidebar
        <SidebarComponent width={270} enableGestures={false}>
          <NavItems />
        </SidebarComponent>
      </aside>

      <aside className='children'>
        <Outlet />
      </aside>
    </div>
  );
};

export default AdminLayout;
