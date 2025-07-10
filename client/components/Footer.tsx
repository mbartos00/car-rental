import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-primary-0 p-6 lg:p-14 shadow-[0px_-2px_7px_-7px]">
      <div className="grid grid-cols-4 gap-6 lg:grid-cols-5">
        <div className="col-span-full text-center lg:col-span-2 lg:text-left">
          <Link
            href={"/"}
            className="font-bold text-2xl text-primary-500 lg:text-3xl"
          >
            MORENT
          </Link>
          <p className="font-medium text-xs text-secondary-300 lg:text-base lg:mt-4 lg:max-w-[25ch]">
            Our vision is to provide convenience and help increase your sales
            business.
          </p>
        </div>

        <div className="flex flex-col col-span-2 font-medium text-base text-secondary-300 text-center lg:text-left lg:gap-4 lg:col-span-1 lg:col-start-3">
          <p className="font-semibold text-xl text-secondary-500 lg:text-xl">
            About
          </p>
          <Link href={"/"}>How it works</Link>
          <Link href={"/"}>Featured</Link>
          <Link href={"/"}>Partnership</Link>
          <Link href={"/"}>Bussiness Relation</Link>
        </div>

        <div className="flex flex-col col-span-2 font-medium text-base text-secondary-300 text-center lg:text-left lg:gap-4 lg:col-span-1">
          <p className="font-semibold text-xl text-secondary-500 lg:text-xl">
            Socials
          </p>
          <Link href={"/"}>Discord</Link>
          <Link href={"/"}>Instagram</Link>
          <Link href={"/"}>Twitter</Link>
          <Link href={"/"}>Facebook</Link>
        </div>

        <div className="flex flex-col col-span-full justify-self-center font-medium text-base text-secondary-300 text-center lg:text-left lg:gap-4 lg:col-span-1 lg:justify-self-start">
          <p className="font-semibold text-xl text-secondary-500 lg:text-xl">
            Community
          </p>
          <Link href={"/"}>Events</Link>
          <Link href={"/"}>Blog</Link>
          <Link href={"/"}>Podcast</Link>
          <Link href={"/"}>Invite a friend</Link>
        </div>
      </div>

      <hr className="my-4 lg:my-8" />

      <div className="grid grid-cols-4 gap-4 font-semibold text-xs text-center text-secondary-500 lg:text-base">
        <Link
          href={"/privacy"}
          className="col-span-2 lg:col-span-1 lg:text-right"
        >
          Privacy & Policy
        </Link>
        <Link
          href={"/terms"}
          className="col-start-3 col-span-2 lg:col-span-1 lg:text-right"
        >
          Terms & Condition
        </Link>
        <p className="row-start-2 col-start-1 col-span-full lg:row-start-1 lg:col-span-2 lg:text-left">
          ©2022 MORENT. All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
