import AppHeader from "../Header/Header";
import AppFooter from "../Footer/Footer";

export default function UserLayout({ children }) {
  return (
    <>
      <AppHeader />
      {children}
      <AppFooter />
    </>
  );
}
