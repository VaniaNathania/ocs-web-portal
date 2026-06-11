import { Container } from '@/components/container';
import { NavbarMenu } from './NavbarMenu';
import { NavbarMenuContextProvider } from './NavbarContext';
import { DetailDialog } from './blocks/DetailPricePlan';
import { Outlet } from 'react-router';

const Navbar = () => {
  return (
    <NavbarMenuContextProvider>
      <div className="border-b border-gray-200 pb-5 lg:pb-0 mb-5 lg:mb-5">
        <Container className="flex flex-wrap justify-between items-center gap-2">
          <NavbarMenu />
          {/* <DetailDialog /> */}
            <main className="grow" role="content">
          {/* <Toolbar>
            <ToolbarHeading />
          </Toolbar> */}
        
          {/* <Outlet /> */}
        </main>
        </Container>
      </div>
    </NavbarMenuContextProvider>
  );
};

export { Navbar };