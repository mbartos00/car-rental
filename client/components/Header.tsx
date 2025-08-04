import { Heart, User } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import Searchbar from "./Searchbar";

const Header = () => {
  const isLoggedIn = false; //TODO: Replace with auth logic

  return (
    <header className="bg-primary-0 px-6 py-8 shadow-[0px_2px_7px_-7px]">
      <div className="grid grid-cols-3 items-center gap-6 lg:grid-cols-7">
        <Link href={"/"} className="font-bold text-2xl text-primary-500">
          MORENT
        </Link>

        <Searchbar className="col-start-1 row-start-2 col-span-5 lg:col-start-2 lg:row-start-1 lg:col-span-5" />

        <div className="w-fit col-start-3 col-span-3 justify-self-end lg:col-start-7 lg:row-start-1">
          {isLoggedIn && (
            <Button variant="ghost" asChild className="size-10 group lg:mr-4">
              <Link href={"/favourites"}>
                <Heart className="stroke-secondary-400 fill-secondary-400 size-6 group-hover:fill-red-500 group-hover:stroke-red-500" />
              </Link>
            </Button>
          )}
          {isLoggedIn ? (
            <Button size="sm" variant="ghost" asChild className="size-10 group">
              <Link href={"/user"}>
                <User className="stroke-secondary-400 size-7 group-hover:stroke-primary-500" />
              </Link>
            </Button>
          ) : (
            <Button size="sm" asChild>
              <Link href={"/login"}>Log In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
