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
} from "@phosphor-icons/react";

export const Icons = {
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
