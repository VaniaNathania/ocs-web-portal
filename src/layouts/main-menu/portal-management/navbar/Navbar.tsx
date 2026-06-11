import { Container } from "@/components/container";
import { NavbarMenu } from "./NavbarMenu";
import { NavBtn } from "./navButton";

const Navbar = () => {
  return (
    <div className="border-b border-gray-200 bg-white">
      <Container className="flex flex-wrap justify-between items-center gap-2">
        <NavBtn />
      </Container>
    </div>
  );
};

export { Navbar };
