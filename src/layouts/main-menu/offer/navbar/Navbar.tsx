import { Container } from "@/components/container";
import { NavbarMenu } from "./NavbarMenu";

const Navbar = () => {
  return (
    <div className="border-b border-gray-200 pb-5 lg:pb-0 mb-5 lg:mb-5">
      <Container className="flex flex-wrap justify-between items-center gap-2">
        <NavbarMenu />
      </Container>
    </div>
  );
};

export { Navbar };
