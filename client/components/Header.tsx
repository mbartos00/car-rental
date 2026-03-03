import { getSession } from "@/api/session";
import { ROUTES } from "@/constants/routes";
import { Heart, User } from "lucide-react";
import Link from "next/link";
import LoginLink from "./LoginLink";
import LogoutButton from "./LogoutButton";
import Searchbar from "./Searchbar";
import { Button } from "./ui/button";

const Header = async () => {
  const session = await getSession();
  const isLoggedIn = !!session;

  return (
    <header className="bg-primary-0 px-6 py-8 shadow-[0px_2px_7px_-7px]">
      <div className="grid grid-cols-3 items-center gap-6 lg:grid-cols-7">
        <Link href={ROUTES.HOME} className="font-bold text-2xl text-primary-500">
          MORENT
        </Link>

        <Searchbar className="col-start-1 row-start-2 col-span-5 lg:col-start-2 lg:row-start-1 lg:col-span-5" />

        <div className="w-fit col-start-3 col-span-3 justify-self-end lg:col-start-7 lg:row-start-1">
          {isLoggedIn && (
            <Button variant="ghost" asChild className="size-10 group lg:mr-4">
              <Link href={ROUTES.FAVOURITES}>
                <Heart className="stroke-secondary-400 fill-secondary-400 size-6 group-hover:fill-red-500 group-hover:stroke-red-500" />
              </Link>
            </Button>
          )}
          {isLoggedIn ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                asChild
                className="size-10 group"
              >
                <Link href={ROUTES.USER}>
                  <User className="stroke-secondary-400 size-7 group-hover:stroke-primary-500" />
                </Link>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <LoginLink />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
