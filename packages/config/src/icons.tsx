"use client";

import {
    FacebookLogoIcon,
    HouseSimpleIcon,
    InstagramLogoIcon,
    EyeIcon,
    EyeClosedIcon,
    InfoIcon,
    BookIcon,
    UsersIcon,
    PhoneIcon,
    XLogoIcon,
    YoutubeLogoIcon,
    LinkedinLogoIcon,
    BellIcon,
    SunIcon,
    MoonIcon,
    CaretRightIcon,
    CaretLeftIcon,
    SignOutIcon,
} from "@phosphor-icons/react";

export const Icons = {
    SignOut: SignOutIcon,
    CaretLeft: CaretLeftIcon,
    CaretRight: CaretRightIcon,
    Sun: SunIcon,
    Moon: MoonIcon,
    Bell: BellIcon,
    LinkedIn: LinkedinLogoIcon,
    YouTube: YoutubeLogoIcon,
    X: XLogoIcon,
    Phone: PhoneIcon,
    Users: UsersIcon,
    Book: BookIcon,
    Info: InfoIcon,
    Eye: EyeIcon,
    EyeOff: EyeClosedIcon,
    House: HouseSimpleIcon,
    Facebook: FacebookLogoIcon,
    Instagram: InstagramLogoIcon,
};

export type IconName = keyof typeof Icons;
