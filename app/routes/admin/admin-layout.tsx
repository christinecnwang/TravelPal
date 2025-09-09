import { Outlet } from "react-router"
import {SidebarComponent} from "@syncfusion/ej2-react-navigations"
import MobileSidebar from "components/MobileSidebar"
import NavItems from "components/NavItems"

const AdminLayout = () => {
  return (
    <div className='admin-layout'>
        <MobileSidebar/>
        <aside className="w-full max-w-[270px] hidden lg:block"> Sidebar
            <SidebarComponent width={270} enableGestures={false}> 
                <NavItems />

            </SidebarComponent>
        </aside>
        <aside className="children"> 
            <Outlet />
        </aside>
    </div>
  )
}

export default AdminLayout