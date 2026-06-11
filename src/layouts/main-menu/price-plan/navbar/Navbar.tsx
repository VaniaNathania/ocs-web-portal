import { Container } from "@/components/container";

const NavbarMenu = () => {
  // NavbarMenu tidak lagi menampilkan dynamic menu karena sudah diganti dengan tabs
  // Bisa dikosongkan atau dihapus jika tidak diperlukan
  return (
    <div className="grid mt-3">
      <div className="scrollable-x-auto">
        {/* Menu navbar bisa ditambahkan di sini jika diperlukan untuk navigasi lain */}
      </div>
    </div>
  );
};

const Navbar = () => {
  return (
    <div className="bg-[--tw-page-bg] dark:bg-[--tw-page-bg-dark] pt-5">
      <Container>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <NavbarMenu />
        </div>
      </Container>
    </div>
  );
};

export { Navbar, NavbarMenu };