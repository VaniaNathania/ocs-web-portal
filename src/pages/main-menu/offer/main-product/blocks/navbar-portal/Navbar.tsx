import { Container } from "@/components/container";
import { NavbarPortal } from "./NavbarPortal";
import { PricePlanDetail, PricePlaneProps } from "@/pages/main-menu/types";

interface NavbarProps {
  pricePlanDetail: PricePlanDetail;
}

const Navbar = ({ pricePlanDetail }: NavbarProps) => {
  return (
    <div className="border-b border-gray-200 pb-5 lg:pb-0 mb-5 lg:mb-5">
      <Container className="flex flex-wrap justify-between items-center gap-2">
        <NavbarPortal pricePlanDetail={pricePlanDetail} />
      </Container>
    </div>
  );
};

export { Navbar };
